import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyUnsubscribeToken } from "@/lib/unsubscribe";

export const dynamic = "force-dynamic";

async function unsubscribe(email: string | null, token: string | null) {
  if (!email || !token) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }
  if (!verifyUnsubscribeToken(email, token)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  const normalized = email.trim().toLowerCase();
  const updated = await prisma.waitlistSignup.updateMany({
    where: { email: normalized, unsubscribed: false },
    data: { unsubscribed: true, unsubscribedAt: new Date() },
  });

  return new Response(successHtml(normalized, updated.count > 0), {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  return unsubscribe(url.searchParams.get("email"), url.searchParams.get("token"));
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  return unsubscribe(url.searchParams.get("email"), url.searchParams.get("token"));
}

function escape(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function successHtml(email: string, changed: boolean): string {
  const msg = changed
    ? "You've been unsubscribed."
    : "You were already unsubscribed.";
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Unsubscribed · FeedbackIQ</title>
  <meta name="robots" content="noindex" />
  <style>
    body { background: #09090b; color: #fafafa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 24px; }
    .card { max-width: 440px; padding: 40px 32px; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; background: rgba(24,24,27,0.6); text-align: center; }
    .check { width: 48px; height: 48px; margin: 0 auto 16px; border-radius: 999px; background: rgba(34,211,238,0.1); color: #22d3ee; display: grid; place-items: center; font-size: 24px; }
    h1 { margin: 0 0 8px; font-size: 22px; font-weight: 600; letter-spacing: -0.01em; }
    p { margin: 0 0 20px; color: #a1a1aa; line-height: 1.6; font-size: 15px; }
    .email { color: #e4e4e7; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; }
    a { color: #22d3ee; text-decoration: none; font-size: 14px; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="card">
    <div class="check">✓</div>
    <h1>${msg}</h1>
    <p>We won't send any more emails to <span class="email">${escape(email)}</span>.</p>
    <p>Changed your mind? Just reply to any past email and we'll resubscribe you.</p>
    <a href="https://feedbackiq.app">← Back to FeedbackIQ</a>
  </div>
</body>
</html>`;
}
