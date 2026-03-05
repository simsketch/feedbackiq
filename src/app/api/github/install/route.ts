import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const slug = process.env.GITHUB_APP_SLUG || "feedbackiq";
  const installUrl = `https://github.com/apps/${slug}/installations/new`;

  return NextResponse.redirect(installUrl);
}
