import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getInstallationOctokit } from "@/lib/github";
import { getWorkflowRunStatus } from "@/lib/workflow";
import { maybeGenerateChangelogEntry } from "@/lib/changelog";

const STALE_MINUTES = 20;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const feedback = await prisma.feedback.findFirst({
    where: { id, project: { companyId: user.companyId } },
    include: {
      project: { include: { company: true } },
      pullRequests: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!feedback) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { project } = feedback;
  const { company } = project;

  const pendingPrs = feedback.pullRequests.filter(
    (pr) => pr.status === "pending"
  );
  const openPrs = feedback.pullRequests.filter((pr) => pr.status === "open");

  let flippedToTerminal = false;
  let flippedToShipped = false;
  const mergedPrIds: string[] = [];

  if (
    (pendingPrs.length > 0 || openPrs.length > 0) &&
    company.githubInstallationId
  ) {
    const [owner, repo] = project.githubRepo.split("/");
    if (owner && repo) {
      try {
        const octokit = await getInstallationOctokit(
          company.githubInstallationId
        );

        for (const pr of openPrs) {
          if (!pr.githubPrNumber) continue;
          try {
            const { data: ghPr } = await octokit.request(
              "GET /repos/{owner}/{repo}/pulls/{pull_number}",
              { owner, repo, pull_number: pr.githubPrNumber }
            );
            const newStatus =
              ghPr.state === "closed"
                ? ghPr.merged_at
                  ? "merged"
                  : "closed"
                : "open";
            if (newStatus !== "open") {
              await prisma.pullRequest.update({
                where: { id: pr.id },
                data: { status: newStatus },
              });
              if (newStatus === "merged") {
                mergedPrIds.push(pr.id);
              }
              flippedToShipped = true;
            }
          } catch (err) {
            console.error("open pr poll failed", pr.id, err);
          }
        }

        for (const pr of pendingPrs) {
          if (!pr.workflowRunId) {
            const ageMs = Date.now() - pr.createdAt.getTime();
            if (ageMs > STALE_MINUTES * 60 * 1000) {
              await prisma.pullRequest.update({
                where: { id: pr.id },
                data: {
                  status: "failed",
                  agentLog:
                    (pr.agentLog || "") +
                    "\n[auto] No workflow run detected after " +
                    STALE_MINUTES +
                    " minutes.",
                },
              });
              flippedToTerminal = true;
            }
            continue;
          }

          const run = await getWorkflowRunStatus(
            octokit,
            owner,
            repo,
            Number(pr.workflowRunId)
          );

          if (!run) continue;

          const isTerminal =
            run.status === "completed" ||
            run.conclusion === "failure" ||
            run.conclusion === "cancelled" ||
            run.conclusion === "timed_out";

          if (isTerminal && run.conclusion && run.conclusion !== "success") {
            const newStatus =
              run.conclusion === "cancelled" ? "canceled" : "failed";
            await prisma.pullRequest.update({
              where: { id: pr.id },
              data: {
                status: newStatus,
                agentLog:
                  (pr.agentLog || "") +
                  "\n[auto] Workflow run " +
                  run.conclusion +
                  ".",
              },
            });
            flippedToTerminal = true;
          } else if (isTerminal && run.conclusion === "success") {
            const { data: prs } = await octokit.request(
              "GET /repos/{owner}/{repo}/pulls",
              {
                owner,
                repo,
                head: `${owner}:${pr.branchName}`,
                state: "all",
                per_page: 1,
              }
            );
            const foundPr = prs?.[0];
            if (foundPr) {
              await prisma.pullRequest.update({
                where: { id: pr.id },
                data: {
                  status:
                    foundPr.state === "closed"
                      ? foundPr.merged_at
                        ? "merged"
                        : "closed"
                      : "open",
                  githubPrUrl: foundPr.html_url,
                  githubPrNumber: foundPr.number,
                },
              });
              await prisma.feedback.update({
                where: { id: feedback.id },
                data: { status: "pr_created" },
              });
            } else {
              await prisma.pullRequest.update({
                where: { id: pr.id },
                data: {
                  status: "closed",
                  agentLog:
                    (pr.agentLog || "") +
                    "\n[auto] Workflow succeeded but no PR was created (agent made no changes).",
                },
              });
              flippedToTerminal = true;
            }
          }
        }
      } catch (err) {
        console.error("sync failed", err);
      }
    }
  }

  const openPrExists = await prisma.pullRequest.findFirst({
    where: {
      feedbackId: feedback.id,
      status: { in: ["pending", "open", "merged"] },
    },
  });

  const generatingAgeMs = Date.now() - feedback.updatedAt.getTime();
  const isStaleGenerating = generatingAgeMs > STALE_MINUTES * 60 * 1000;

  if (
    feedback.status === "generating" &&
    !openPrExists &&
    (flippedToTerminal || isStaleGenerating)
  ) {
    await prisma.feedback.update({
      where: { id: feedback.id },
      data: { status: "closed" },
    });
  } else if (
    flippedToShipped &&
    feedback.status !== "closed"
  ) {
    await prisma.feedback.update({
      where: { id: feedback.id },
      data: { status: "closed" },
    });
  }

  for (const prId of mergedPrIds) {
    try {
      await maybeGenerateChangelogEntry(prId);
    } catch (err) {
      console.error("changelog generation failed", prId, err);
    }
  }

  const fresh = await prisma.feedback.findUnique({
    where: { id: feedback.id },
    include: { pullRequests: { orderBy: { createdAt: "desc" } } },
  });

  return NextResponse.json({
    status: fresh?.status,
    pullRequests: fresh?.pullRequests.map((pr) => ({
      id: pr.id,
      status: pr.status,
      branchName: pr.branchName,
      githubPrUrl: pr.githubPrUrl,
      githubPrNumber: pr.githubPrNumber,
      workflowRunUrl: pr.workflowRunUrl,
      createdAt: pr.createdAt,
    })),
  });
}
