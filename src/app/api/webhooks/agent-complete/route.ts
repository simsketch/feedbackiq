import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { timingSafeEqual } from "crypto";

export async function POST(request: NextRequest) {
  const secret = request.headers.get("X-FeedbackIQ-Secret");
  const expectedSecret = process.env.GITHUB_APP_WEBHOOK_SECRET;

  if (!secret || !expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const valid = timingSafeEqual(
      Buffer.from(secret),
      Buffer.from(expectedSecret)
    );
    if (!valid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    feedback_id,
    status,
    pr_url,
    pr_number,
    branch_name,
    agent_log,
    error,
  } = body;

  if (!feedback_id || !status) {
    return NextResponse.json(
      { error: "feedback_id and status are required" },
      { status: 400 }
    );
  }

  const feedback = await prisma.feedback.findUnique({
    where: { id: feedback_id },
  });

  if (!feedback) {
    return NextResponse.json(
      { error: "Feedback not found" },
      { status: 404 }
    );
  }

  const pendingPr = await prisma.pullRequest.findFirst({
    where: { feedbackId: feedback_id, status: "pending" },
    orderBy: { createdAt: "desc" },
  });

  if (status === "pr_created" && pr_url) {
    if (pendingPr) {
      await prisma.pullRequest.update({
        where: { id: pendingPr.id },
        data: {
          githubPrUrl: pr_url,
          githubPrNumber: pr_number || null,
          branchName: branch_name || pendingPr.branchName,
          status: "open",
          agentLog: agent_log || null,
        },
      });
    } else {
      await prisma.pullRequest.create({
        data: {
          feedbackId: feedback_id,
          githubPrUrl: pr_url,
          githubPrNumber: pr_number || null,
          branchName: branch_name || "",
          status: "open",
          agentLog: agent_log || null,
        },
      });
    }

    await prisma.feedback.update({
      where: { id: feedback_id },
      data: { status: "pr_created" },
    });
  } else {
    const combinedLog = agent_log
      ? agent_log + (error ? "\nError: " + error : "")
      : error || null;

    if (pendingPr) {
      await prisma.pullRequest.update({
        where: { id: pendingPr.id },
        data: {
          branchName: branch_name || pendingPr.branchName,
          status: "closed",
          agentLog: combinedLog,
        },
      });
    } else {
      await prisma.pullRequest.create({
        data: {
          feedbackId: feedback_id,
          branchName: branch_name || "",
          status: "closed",
          agentLog: combinedLog,
        },
      });
    }

    await prisma.feedback.update({
      where: { id: feedback_id },
      data: { status: "closed" },
    });
  }

  return NextResponse.json({ ok: true });
}
