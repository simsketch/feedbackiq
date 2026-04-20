import { prisma } from "@/lib/prisma";

function baseSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 7);
}

export async function generateProjectSlug(name: string): Promise<string> {
  const base = baseSlug(name) || "project";
  const existing = await prisma.project.findUnique({
    where: { publicSlug: base },
    select: { id: true },
  });
  if (!existing) return base;

  for (let i = 0; i < 5; i++) {
    const candidate = `${base}-${randomSuffix()}`;
    const hit = await prisma.project.findUnique({
      where: { publicSlug: candidate },
      select: { id: true },
    });
    if (!hit) return candidate;
  }
  return `${base}-${Date.now().toString(36)}`;
}
