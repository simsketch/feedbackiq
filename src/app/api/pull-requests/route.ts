import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projectId = request.nextUrl.searchParams.get("projectId");

  const pullRequests = await prisma.pullRequest.findMany({
    where: {
      feedback: {
        project: { companyId: user.companyId },
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
