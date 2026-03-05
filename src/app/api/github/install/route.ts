import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const slug = process.env.GITHUB_APP_SLUG || "feedbackiq";
  const installUrl = `https://github.com/apps/${slug}/installations/new`;

  return NextResponse.redirect(installUrl);
}
