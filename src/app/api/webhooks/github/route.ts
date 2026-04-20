import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { maybeGenerateChangelogEntry } from "@/lib/changelog";
import { createHmac, timingSafeEqual } from "crypto";

async function verifySignature(
  payload: string,
  signature: string | null
): Promise<boolean> {
  if (!signature) return false;

  const secret = process.env.GITHUB_APP_WEBHOOK_SECRET!;
  const expected =
    "sha256=" +
    createHmac("sha256", secret).update(payload).digest("hex");

  try {
    return timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected)
    );
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("x-hub-signature-256");
  const event = request.headers.get("x-github-event");

  const valid = await verifySignature(body, signature);
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  if (event !== "pull_request") {
    return NextResponse.json({ ok: true });
  }

  const payload = JSON.parse(body);
  const action = payload.action;
  const prNumber = payload.pull_request?.number;
  const merged = payload.pull_request?.merged;
  const repoFullName = payload.repository?.full_name;

  if (!prNumber || !repoFullName) {
    return NextResponse.json({ ok: true });
  }

  // Determine new PR status
  let newPrStatus: "merged" | "closed" | null = null;
  if (action === "closed" && merged) {
    newPrStatus = "merged";
  } else if (action === "closed") {
    newPrStatus = "closed";
  }

  if (!newPrStatus) {
    return NextResponse.json({ ok: true });
  }

  // Find and update matching pull requests
  const pullRequests = await prisma.pullRequest.findMany({
    where: { githubPrNumber: prNumber },
    include: {
      feedback: {
        include: {
          project: { select: { githubRepo: true } },
        },
      },
    },
  });

  for (const pr of pullRequests) {
    if (pr.feedback.project.githubRepo !== repoFullName) continue;

    await prisma.pullRequest.update({
      where: { id: pr.id },
      data: { status: newPrStatus },
    });

    await prisma.feedback.update({
      where: { id: pr.feedbackId },
      data: { status: "closed" },
    });

    if (newPrStatus === "merged") {
      await maybeGenerateChangelogEntry(pr.id);
    }
  }

  return NextResponse.json({ ok: true });
}
