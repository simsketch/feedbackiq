import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

const ALLOWED_ORIGINS = new Set([
  "https://www.feedbackiq.app",
  "https://feedbackiq.app",
  "http://localhost:3000",
]);

function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = origin && ALLOWED_ORIGINS.has(origin) ? origin : "";
  const headers: Record<string, string> = {
    Vary: "Origin",
    "Cache-Control": "private, no-store",
  };
  if (allowed) {
    headers["Access-Control-Allow-Origin"] = allowed;
    headers["Access-Control-Allow-Credentials"] = "true";
    headers["Access-Control-Allow-Methods"] = "GET, OPTIONS";
    headers["Access-Control-Allow-Headers"] = "Content-Type";
  }
  return headers;
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(request.headers.get("origin")),
  });
}

export async function GET(request: Request) {
  const { userId } = await auth();
  return NextResponse.json(
    { signedIn: !!userId },
    { headers: corsHeaders(request.headers.get("origin")) }
  );
}
