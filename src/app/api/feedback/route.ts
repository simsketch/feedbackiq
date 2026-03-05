import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projectId = request.nextUrl.searchParams.get("projectId");

  const feedback = await prisma.feedback.findMany({
    where: {
      project: { companyId: user.companyId },
      ...(projectId ? { projectId } : {}),
    },
    include: {
      project: { select: { name: true } },
      pullRequests: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(feedback);
}
