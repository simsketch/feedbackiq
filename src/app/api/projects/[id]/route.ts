import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateProjectSlug } from "@/lib/slug";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const project = await prisma.project.findFirst({
    where: { id, companyId: user.companyId },
    include: { _count: { select: { feedback: true } } },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json(project);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.project.findFirst({
    where: { id, companyId: user.companyId },
  });

  if (!existing) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const body = await request.json();
  const data: Record<string, unknown> = {};

  if (body.name !== undefined) data.name = body.name;
  if (body.autoGeneratePrs !== undefined) data.autoGeneratePrs = body.autoGeneratePrs;
  if (body.defaultBranch !== undefined) data.defaultBranch = body.defaultBranch;
  if (body.websiteUrl !== undefined) data.websiteUrl = body.websiteUrl || null;

  const VALID_POSITIONS = [
    "bottom-right",
    "bottom-left",
    "top-right",
    "top-left",
    "right-middle",
    "left-middle",
  ];
  if (
    body.widgetPosition !== undefined &&
    VALID_POSITIONS.includes(body.widgetPosition)
  ) {
    data.widgetPosition = body.widgetPosition;
  }
  if (body.widgetLabel !== undefined) {
    const trimmed =
      typeof body.widgetLabel === "string"
        ? body.widgetLabel.trim().slice(0, 24)
        : "";
    data.widgetLabel = trimmed || null;
  }
  if (body.widgetSize !== undefined) {
    data.widgetSize =
      body.widgetSize === "compact" ? "compact" : "default";
  }

  if (body.publicRoadmap !== undefined) {
    data.publicRoadmap = !!body.publicRoadmap;
    if (body.publicRoadmap && !existing.publicSlug) {
      data.publicSlug = await generateProjectSlug(existing.name);
    }
  }

  if (body.publicChangelog !== undefined) {
    data.publicChangelog = !!body.publicChangelog;
    if (body.publicChangelog && !existing.publicSlug && !data.publicSlug) {
      data.publicSlug = await generateProjectSlug(existing.name);
    }
  }

  const project = await prisma.project.update({
    where: { id },
    data,
  });

  return NextResponse.json(project);
}
