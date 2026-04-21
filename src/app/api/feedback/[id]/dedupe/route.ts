import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Action = "confirm" | "reject" | "unmerge";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as { action?: Action };

  const feedback = await prisma.feedback.findUnique({
    where: { id },
    select: {
      id: true,
      projectId: true,
      upvoteCount: true,
      duplicateOfId: true,
      duplicateConfirmed: true,
      project: { select: { companyId: true } },
    },
  });

  if (!feedback || feedback.project.companyId !== user.companyId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (body.action === "confirm") {
    if (!feedback.duplicateOfId) {
      return NextResponse.json(
        { error: "No duplicate link to confirm" },
        { status: 400 }
      );
    }
    if (feedback.duplicateConfirmed) {
      return NextResponse.json({ ok: true, already: true });
    }
    const transfer = feedback.upvoteCount + 1;
    await prisma.$transaction([
      prisma.feedback.update({
        where: { id: feedback.id },
        data: { duplicateConfirmed: true },
      }),
      prisma.feedback.update({
        where: { id: feedback.duplicateOfId },
        data: { upvoteCount: { increment: transfer } },
      }),
    ]);
    return NextResponse.json({ ok: true });
  }

  if (body.action === "reject") {
    if (!feedback.duplicateOfId) {
      return NextResponse.json({ ok: true, already: true });
    }
    if (feedback.duplicateConfirmed) {
      return NextResponse.json(
        { error: "Use unmerge to undo a confirmed duplicate" },
        { status: 400 }
      );
    }
    await prisma.feedback.update({
      where: { id: feedback.id },
      data: {
        duplicateOfId: null,
        duplicateSimilarity: null,
      },
    });
    return NextResponse.json({ ok: true });
  }

  if (body.action === "unmerge") {
    if (!feedback.duplicateOfId || !feedback.duplicateConfirmed) {
      return NextResponse.json({ error: "Not merged" }, { status: 400 });
    }
    const refund = feedback.upvoteCount + 1;
    const parent = await prisma.feedback.findUnique({
      where: { id: feedback.duplicateOfId },
      select: { upvoteCount: true },
    });
    const newParentCount = Math.max(0, (parent?.upvoteCount ?? 0) - refund);
    await prisma.$transaction([
      prisma.feedback.update({
        where: { id: feedback.duplicateOfId },
        data: { upvoteCount: newParentCount },
      }),
      prisma.feedback.update({
        where: { id: feedback.id },
        data: {
          duplicateOfId: null,
          duplicateSimilarity: null,
          duplicateConfirmed: false,
        },
      }),
    ]);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json(
    { error: "Invalid action" },
    { status: 400 }
  );
}
