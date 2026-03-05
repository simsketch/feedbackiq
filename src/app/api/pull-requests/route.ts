import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projectId = request.nextUrl.searchParams.get("projectId");

  const pullRequests = await prisma.pullRequest.findMany({
    where: {
      feedback: {
        project: { companyId: (session.user as any).companyId },
        ...(projectId ? { projectId } : {}),
      },
    },
    include: {
      feedback: {
        select: {
          content: true,
          project: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(pullRequests);
}
