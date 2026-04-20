import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { publishChangelogEntry } from "@/lib/changelog";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ entryId: string }> }
) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { entryId } = await params;
  const existing = await prisma.changelogEntry.findFirst({
    where: { id: entryId, project: { companyId: user.companyId } },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const result = await publishChangelogEntry(entryId);
  if (!result.ok) {
    return NextResponse.json({ error: result.reason }, { status: 400 });
  }

  const entry = await prisma.changelogEntry.findUnique({ where: { id: entryId } });
  return NextResponse.json(entry);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ entryId: string }> }
) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { entryId } = await params;
  const existing = await prisma.changelogEntry.findFirst({
    where: { id: entryId, project: { companyId: user.companyId } },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const entry = await prisma.changelogEntry.update({
    where: { id: entryId },
    data: { status: "draft" },
  });
  return NextResponse.json(entry);
}
