import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";

function voterHash(request: Request): string {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const ua = request.headers.get("user-agent") || "unknown";
  return createHash("sha256").update(`${ip}|${ua}`).digest("hex");
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const feedback = await prisma.feedback.findUnique({
    where: { id },
    select: {
      id: true,
      isPublic: true,
      project: { select: { publicRoadmap: true } },
    },
  });

  if (!feedback || !feedback.isPublic || !feedback.project.publicRoadmap) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const hash = voterHash(request);

  try {
    await prisma.feedbackUpvote.create({
      data: { feedbackId: id, voterHash: hash },
    });
  } catch (err: unknown) {
    const code = (err as { code?: string }).code;
    if (code === "P2002") {
      const current = await prisma.feedback.findUnique({
        where: { id },
        select: { upvoteCount: true },
      });
      return NextResponse.json({
        count: current?.upvoteCount ?? 0,
        already: true,
      });
    }
    throw err;
  }

  const updated = await prisma.feedback.update({
    where: { id },
    data: { upvoteCount: { increment: 1 } },
    select: { upvoteCount: true },
  });

  return NextResponse.json({ count: updated.upvoteCount });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const feedback = await prisma.feedback.findUnique({
    where: { id },
    select: {
      id: true,
      isPublic: true,
      project: { select: { publicRoadmap: true } },
    },
  });

  if (!feedback || !feedback.isPublic || !feedback.project.publicRoadmap) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const hash = voterHash(request);

  const deleted = await prisma.feedbackUpvote.deleteMany({
    where: { feedbackId: id, voterHash: hash },
  });

  if (deleted.count === 0) {
    const current = await prisma.feedback.findUnique({
      where: { id },
      select: { upvoteCount: true },
    });
    return NextResponse.json({
      count: current?.upvoteCount ?? 0,
      missing: true,
    });
  }

  const updated = await prisma.feedback.update({
    where: { id },
    data: { upvoteCount: { decrement: 1 } },
    select: { upvoteCount: true },
  });

  return NextResponse.json({ count: Math.max(0, updated.upvoteCount) });
}
