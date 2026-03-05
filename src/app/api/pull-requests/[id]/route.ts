import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const pullRequest = await prisma.pullRequest.findFirst({
    where: {
      id,
      feedback: {
        project: { companyId: (session.user as any).companyId },
      },
    },
    include: {
      feedback: {
        select: {
          content: true,
          sourceUrl: true,
          project: { select: { name: true, githubRepo: true } },
        },
      },
    },
  });

  if (!pullRequest) {
    return NextResponse.json(
      { error: "Pull request not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(pullRequest);
}
