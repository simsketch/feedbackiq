import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const feedback = await prisma.feedback.findFirst({
    where: {
      id,
      project: { companyId: (session.user as any).companyId },
    },
    include: {
      project: { select: { name: true, githubRepo: true } },
      pullRequests: true,
    },
  });

  if (!feedback) {
    return NextResponse.json({ error: "Feedback not found" }, { status: 404 });
  }

  return NextResponse.json(feedback);
}
