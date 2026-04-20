import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function loadEntry(entryId: string, companyId: string) {
  return prisma.changelogEntry.findFirst({
    where: { id: entryId, project: { companyId } },
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ entryId: string }> }
) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { entryId } = await params;
  const existing = await loadEntry(entryId, user.companyId);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const data: Record<string, unknown> = {};
  if (typeof body.title === "string") data.title = body.title.trim().slice(0, 120);
  if (typeof body.body === "string") data.body = body.body.trim().slice(0, 800);

  const updated = await prisma.changelogEntry.update({
    where: { id: entryId },
    data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ entryId: string }> }
) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { entryId } = await params;
  const existing = await loadEntry(entryId, user.companyId);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.changelogEntry.delete({ where: { id: entryId } });
  return NextResponse.json({ ok: true });
}
