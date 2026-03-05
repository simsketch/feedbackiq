import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
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
  });

  if (!feedback) {
    return NextResponse.json({ error: "Feedback not found" }, { status: 404 });
  }

  if (feedback.status !== "new" && feedback.status !== "reviewing") {
    return NextResponse.json(
      { error: "Feedback is not in a valid state for PR generation" },
      { status: 400 }
    );
  }

  await prisma.feedback.update({
    where: { id },
    data: { status: "generating" },
  });

  // Agent will be wired up in Task 10
  return NextResponse.json({ status: "generating" });
}
