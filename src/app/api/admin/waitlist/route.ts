import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isCurrentUserOwner } from "@/lib/owner";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isCurrentUserOwner())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const signups = await prisma.waitlistSignup.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      source: true,
      referrer: true,
      userAgent: true,
      createdAt: true,
    },
  });

  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  const last24h = signups.filter(
    (s) => now - s.createdAt.getTime() < dayMs
  ).length;
  const last7d = signups.filter(
    (s) => now - s.createdAt.getTime() < 7 * dayMs
  ).length;
  const sourceSet = new Set(signups.map((s) => s.source ?? "unknown"));

  return NextResponse.json({
    summary: {
      total: signups.length,
      last24h,
      last7d,
      uniqueSources: sourceSet.size,
    },
    signups: signups.map((s) => ({
      id: s.id,
      email: s.email,
      source: s.source,
      referrer: s.referrer,
      userAgent: s.userAgent,
      createdAt: s.createdAt.toISOString(),
    })),
  });
}
