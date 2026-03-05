import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await prisma.project.findMany({
    where: { companyId: (session.user as any).companyId },
    include: { _count: { select: { feedback: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(projects);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, githubRepo, defaultBranch } = await request.json();

  if (!name || !githubRepo) {
    return NextResponse.json(
      { error: "Name and githubRepo are required" },
      { status: 400 }
    );
  }

  const project = await prisma.project.create({
    data: {
      companyId: (session.user as any).companyId,
      name,
      githubRepo,
      defaultBranch: defaultBranch || "main",
    },
  });

  return NextResponse.json(project, { status: 201 });
}
