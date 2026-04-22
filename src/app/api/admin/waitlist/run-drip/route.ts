import { NextResponse } from "next/server";
import { runWaitlistDrip } from "@/lib/waitlist-drip";
import { isCurrentUserOwner } from "@/lib/owner";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function POST() {
  if (!(await isCurrentUserOwner())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const result = await runWaitlistDrip();
  return NextResponse.json({ ok: true, ...result });
}
