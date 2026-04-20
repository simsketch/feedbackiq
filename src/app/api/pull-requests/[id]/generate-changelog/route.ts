import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { maybeGenerateChangelogEntry } from "@/lib/changelog";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const pr = await prisma.pullRequest.findFirst({
    where: { id, feedback: { project: { companyId: user.companyId } } },
    select: { id: true },
  });
  if (!pr) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const force = body?.force === true;

  const result = await maybeGenerateChangelogEntry(pr.id, { force });
  if (!result.entryId) {
    return NextResponse.json({ error: result.reason || "failed" }, { status: 400 });
  }

  const entry = await prisma.changelogEntry.findUnique({
    where: { id: result.entryId },
  });
  return NextResponse.json(entry);
}
