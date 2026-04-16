import { NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { runAgent } from "@/lib/agent";

export const maxDuration = 300;

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const feedback = await prisma.feedback.findFirst({
    where: {
      id,
      project: { companyId: user.companyId },
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

  waitUntil(
    runAgent(id).catch(async (err) => {
      console.error("Agent error:", err);
      await prisma.feedback.update({
        where: { id },
        data: { status: "new" },
      });
    })
  );

  return NextResponse.json({ status: "generating" });
}
