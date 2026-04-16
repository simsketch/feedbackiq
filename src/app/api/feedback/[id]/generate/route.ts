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

  if (feedback.status !== "new" && feedback.status !== "reviewing") {
    return NextResponse.json(
      { error: "Feedback is not in a valid state for PR generation" },
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

  try {
    await ensureWorkflowInstalled(octokit, owner, repo, project.defaultBranch);
    await ensureSecretSet(octokit, owner, repo);

    await prisma.feedback.update({
      where: { id },
      data: { status: "generating" },
    });

    const callbackUrl = "https://app.feedbackiq.app/api/webhooks/agent-complete";

    await triggerWorkflow(
      octokit,
      owner,
      repo,
      id,
      feedback.content,
      feedback.sourceUrl,
      project.defaultBranch,
      callbackUrl
    );
  } catch (err) {
    console.error("Failed to trigger workflow:", err);
    await prisma.feedback.update({
      where: { id },
      data: { status: "new" },
    });
    return NextResponse.json(
      { error: "Failed to trigger PR generation workflow" },
      { status: 500 }
    );
  }

  return NextResponse.json({ status: "generating" });
}
