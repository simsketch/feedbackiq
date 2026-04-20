import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);

function corsHeaders(origin: string | null) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Site-Key",
  };
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const headers = corsHeaders(origin);

  const siteKey = request.headers.get("X-Site-Key");
  if (!siteKey) {
    return NextResponse.json(
      { error: "X-Site-Key header required" },
      { status: 400, headers }
    );
  }

  const project = await prisma.project.findUnique({
    where: { siteKey },
    select: { id: true },
  });
  if (!project) {
    return NextResponse.json(
      { error: "Invalid site key" },
      { status: 401, headers }
    );
  }

  const contentType = request.headers.get("content-type") || "";
  if (!ALLOWED_TYPES.has(contentType)) {
    return NextResponse.json(
      { error: "Unsupported content type" },
      { status: 415, headers }
    );
  }

  const body = await request.arrayBuffer();
  if (body.byteLength > MAX_BYTES) {
    return NextResponse.json(
      { error: "File too large (max 8MB)" },
      { status: 413, headers }
    );
  }

  const ext = contentType.split("/")[1] || "bin";
  const pathname = `feedback/${project.id}/${crypto.randomUUID()}.${ext}`;

  const blob = await put(pathname, body, {
    access: "public",
    contentType,
    addRandomSuffix: false,
  });

  return NextResponse.json({ url: blob.url }, { status: 201, headers });
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get("origin");
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}
