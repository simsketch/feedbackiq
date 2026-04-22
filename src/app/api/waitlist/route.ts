import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { sendWaitlistWelcome } from "@/lib/email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email, source } = (body ?? {}) as {
    email?: string;
    source?: string;
  };

  if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 }
    );
  }

  const normalized = email.trim().toLowerCase();
  const referrer = request.headers.get("referer") ?? null;
  const userAgent = request.headers.get("user-agent") ?? null;
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    null;
  const ipHash = ip ? createHash("sha256").update(ip).digest("hex") : null;

  const created = await prisma.waitlistSignup.upsert({
    where: { email: normalized },
    create: {
      email: normalized,
      source: typeof source === "string" ? source.slice(0, 64) : "homepage",
      referrer: referrer?.slice(0, 512) ?? null,
      userAgent: userAgent?.slice(0, 512) ?? null,
      ipHash,
    },
    update: {},
  });

  const isNew =
    Math.abs(Date.now() - created.createdAt.getTime()) < 5_000;

  if (isNew) {
    sendWaitlistWelcome(normalized).catch((err) => {
      console.error("[waitlist] welcome email failed", err);
    });
  }

  return NextResponse.json({ ok: true, alreadyOnList: !isNew });
}
