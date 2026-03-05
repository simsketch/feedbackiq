import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projectId = request.nextUrl.searchParams.get("projectId");

  const feedback = await prisma.feedback.findMany({
    where: {
      project: { companyId: (session.user as any).companyId },
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
