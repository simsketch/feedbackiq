import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { extractTheme } from "@/lib/theme-extractor";

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await prisma.project.findMany({
    where: { companyId: user.companyId },
    include: { _count: { select: { feedback: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(projects);
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, githubRepo, defaultBranch, websiteUrl } = await request.json();

  if (!name || !githubRepo) {
    return NextResponse.json(
      { error: "Name and githubRepo are required" },
      { status: 400 }
    );
  }

  const project = await prisma.project.create({
    data: {
      companyId: user.companyId,
      name,
      githubRepo,
      defaultBranch: defaultBranch || "main",
      websiteUrl: websiteUrl || null,
    },
  });

  if (websiteUrl) {
    extractTheme(websiteUrl)
      .then((theme) =>
        prisma.project.update({
          where: { id: project.id },
          data: {
            themePrimary: theme.primary,
            themeBackground: theme.background,
            themeForeground: theme.foreground,
            themeFontFamily: theme.fontFamily,
            themeBorderRadius: theme.borderRadius,
            themeUpdatedAt: new Date(),
          },
        })
      )
      .catch((err) => console.error("theme extract failed", err));
  }

  return NextResponse.json(project, { status: 201 });
}
