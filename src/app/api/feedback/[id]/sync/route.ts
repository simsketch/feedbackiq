import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getInstallationOctokit } from "@/lib/github";
import { getWorkflowRunStatus } from "@/lib/workflow";

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

  let flippedToTerminal = false;

  if (pendingPrs.length > 0 && company.githubInstallationId) {
    const [owner, repo] = project.githubRepo.split("/");
    if (owner && repo) {
      try {
        const octokit = await getInstallationOctokit(
          company.githubInstallationId
        );

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

          if (
            isTerminal &&
            run.conclusion &&
            run.conclusion !== "success"
          ) {
            await prisma.pullRequest.update({
              where: { id: pr.id },
              data: {
                status: "failed",
                agentLog:
                  (pr.agentLog || "") +
                  "\n[auto] Workflow run " +
                  run.conclusion +
                  ".",
              },
            });
            flippedToTerminal = true;
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
