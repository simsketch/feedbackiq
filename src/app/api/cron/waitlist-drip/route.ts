import { NextResponse } from "next/server";
import { runWaitlistDrip } from "@/lib/waitlist-drip";
import { unauthorizedIfNotCron } from "@/lib/cron-auth";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const unauthorized = unauthorizedIfNotCron(request);
  if (unauthorized) return unauthorized;

  const result = await runWaitlistDrip();
  return NextResponse.json({ ok: true, ...result });
}
