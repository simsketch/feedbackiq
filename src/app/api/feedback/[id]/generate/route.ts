import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getInstallationOctokit } from "@/lib/github";
import {
  ensureWorkflowInstalled,
  ensureSecretSet,
  triggerWorkflow,
} from "@/lib/workflow";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const feedback = await prisma.feedback.findFirst({
    where: {
      id,
      project: { companyId: user.companyId },
    },
    include: {
      project: {
        include: { company: true },
      },
    },
  });

  if (!feedback) {
    return NextResponse.json({ error: "Feedback not found" }, { status: 404 });
  }

  const STALE_MS = 20 * 60 * 1000;
  const isStaleGenerating =
    feedback.status === "generating" &&
    Date.now() - feedback.updatedAt.getTime() > STALE_MS;

  const canDispatch =
    feedback.status === "new" ||
    feedback.status === "reviewing" ||
    feedback.status === "closed" ||
    feedback.status === "pr_created" ||
    isStaleGenerating;

  if (!canDispatch) {
    return NextResponse.json(
      {
        error:
          "A generation is already in progress. Wait for it to finish before retrying.",
      },
      { status: 400 }
    );
  }

  const { project } = feedback;
  const { company } = project;

  if (!company.githubInstallationId) {
    return NextResponse.json(
      { error: "GitHub is not connected for this company" },
      { status: 400 }
    );
  }

  const octokit = await getInstallationOctokit(company.githubInstallationId);
  const [owner, repo] = project.githubRepo.split("/");
  if (!owner || !repo) {
    return NextResponse.json(
      { error: `Invalid githubRepo format: ${project.githubRepo}` },
      { status: 400 }
    );
  }

  let pendingPrId: string | null = null;
  try {
    const justCreated = await ensureWorkflowInstalled(octokit, owner, repo, project.defaultBranch);
    await ensureSecretSet(octokit, owner, repo);

    const pendingPr = await prisma.pullRequest.create({
      data: {
        feedbackId: id,
        branchName: `feedbackiq/feedback-${id.slice(0, 8)}`,
        status: "pending",
      },
    });
    pendingPrId = pendingPr.id;

    await prisma.feedback.update({
      where: { id },
      data: { status: "generating" },
    });

    const callbackUrl = "https://app.feedbackiq.app/api/webhooks/agent-complete";

    const dispatch = await triggerWorkflow(
      octokit,
      owner,
      repo,
      id,
      feedback.content,
      feedback.sourceUrl,
      project.defaultBranch,
      callbackUrl,
      justCreated
    );

    await prisma.pullRequest.update({
      where: { id: pendingPr.id },
      data: {
        workflowRunId: dispatch.runId ? BigInt(dispatch.runId) : null,
        workflowRunUrl: dispatch.runUrl,
      },
    });
  } catch (err) {
    console.error("Failed to trigger workflow:", err);
    if (pendingPrId) {
      await prisma.pullRequest.update({
        where: { id: pendingPrId },
        data: {
          status: "closed",
          agentLog: `[auto] Dispatch failed: ${err instanceof Error ? err.message : String(err)}`,
        },
      });
    }
    await prisma.feedback.update({
      where: { id },
      data: { status: "new" },
    });
    return NextResponse.json(
      { error: `Failed to trigger PR generation workflow: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ status: "generating" });
}
