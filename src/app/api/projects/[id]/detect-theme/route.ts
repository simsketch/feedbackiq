import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { extractTheme } from "@/lib/theme-extractor";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const project = await prisma.project.findFirst({
    where: { id, companyId: user.companyId },
  });
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const targetUrl: string | null = body?.url || project.websiteUrl || null;

  if (!targetUrl) {
    return NextResponse.json(
      { error: "No website URL configured" },
      { status: 400 }
    );
  }

  try {
    new URL(targetUrl);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const theme = await extractTheme(targetUrl);

  const updated = await prisma.project.update({
    where: { id },
    data: {
      themePrimary: theme.primary,
      themeBackground: theme.background,
      themeForeground: theme.foreground,
      themeFontFamily: theme.fontFamily,
      themeBorderRadius: theme.borderRadius,
      themeUpdatedAt: new Date(),
      ...(body?.url && !project.websiteUrl ? { websiteUrl: body.url } : {}),
    },
  });

  return NextResponse.json({
    theme: {
      primary: updated.themePrimary,
      background: updated.themeBackground,
      foreground: updated.themeForeground,
      fontFamily: updated.themeFontFamily,
      borderRadius: updated.themeBorderRadius,
      updatedAt: updated.themeUpdatedAt,
    },
  });
}
