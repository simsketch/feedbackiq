import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getInstallationOctokit, mintInstallationToken } from "@/lib/github";
import {
  ensureWorkflowInstalled,
  ensureSecretSet,
  triggerWorkflow,
} from "@/lib/workflow";
import { autoTagFeedback } from "@/lib/autotag";

export async function POST(request: Request) {
  const origin = request.headers.get("origin") || "*";

  const headers = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  const {
    site_key,
    content,
    email,
    source_url,
    screenshot_url,
    page_title,
    user_agent,
  } = await request.json();

  if (!site_key || !content) {
    return NextResponse.json(
      { error: "site_key and content are required" },
      { status: 400, headers }
    );
  }

  if (content.length > 5000) {
    return NextResponse.json(
      { error: "Content must be under 5000 characters" },
      { status: 400, headers }
    );
  }

  const project = await prisma.project.findUnique({
    where: { siteKey: site_key },
    include: { company: true },
  });

  if (!project) {
    return NextResponse.json(
      { error: "Invalid site key" },
      { status: 401, headers }
    );
  }

  const screenshotUrl =
    typeof screenshot_url === "string" &&
    screenshot_url.startsWith("https://")
      ? screenshot_url
      : null;

  const feedback = await prisma.feedback.create({
    data: {
      projectId: project.id,
      content,
      submitterEmail: email || null,
      sourceUrl: source_url || null,
      screenshotUrl,
      pageTitle:
        typeof page_title === "string" ? page_title.slice(0, 500) : null,
      userAgent:
        typeof user_agent === "string" ? user_agent.slice(0, 500) : null,
      status: project.autoGeneratePrs ? "generating" : "new",
    },
  });

  autoTagFeedback(feedback.id).catch((err) => {
    console.error("autoTagFeedback failed:", err);
  });

  if (project.autoGeneratePrs && project.company.githubInstallationId) {
    const octokit = await getInstallationOctokit(
      project.company.githubInstallationId
    );
    const [owner, repo] = project.githubRepo.split("/");

    if (owner && repo) {
      let pendingPrId: string | null = null;
      try {
        await ensureWorkflowInstalled(
          octokit,
          owner,
          repo,
          project.defaultBranch
        );
        await ensureSecretSet(octokit, owner, repo);

        const pendingPr = await prisma.pullRequest.create({
          data: {
            feedbackId: feedback.id,
            branchName: `feedbackiq/feedback-${feedback.id.slice(0, 8)}`,
            status: "pending",
          },
        });
        pendingPrId = pendingPr.id;

        const callbackUrl =
          "https://app.feedbackiq.app/api/webhooks/agent-complete";

        const installationToken = await mintInstallationToken(
          project.company.githubInstallationId
        );

        const dispatch = await triggerWorkflow(
          octokit,
          owner,
          repo,
          feedback.id,
          content,
          source_url || null,
          project.defaultBranch,
          callbackUrl,
          installationToken,
          screenshotUrl
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
          where: { id: feedback.id },
          data: { status: "new" },
        });
      }
    }
  }

  return NextResponse.json(
    { id: feedback.id, status: feedback.status },
    { status: 201, headers }
  );
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get("origin") || "*";

  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
