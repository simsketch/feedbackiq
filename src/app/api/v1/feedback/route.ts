import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const origin = request.headers.get("origin") || "*";

  const headers = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  const { site_key, content, email, source_url } = await request.json();

  if (!site_key || !content) {
    return NextResponse.json(
      { error: "site_key and content are required" },
      { status: 400, headers }
    );
  }

  if (content.length > 5000) {
    return NextResponse.json(
      { error: "Content must be under 5000 characters" },
      { status: 400, headers }
    );
  }

  const project = await prisma.project.findUnique({
    where: { siteKey: site_key },
  });

  if (!project) {
    return NextResponse.json(
      { error: "Invalid site key" },
      { status: 401, headers }
    );
  }

  const feedback = await prisma.feedback.create({
    data: {
      projectId: project.id,
      content,
      submitterEmail: email || null,
      sourceUrl: source_url || null,
      status: project.autoGeneratePrs ? "generating" : "new",
    },
  });

  // TODO: If auto-generate is on, trigger agent worker (Task 10)

  return NextResponse.json(
    { id: feedback.id, status: feedback.status },
    { status: 201, headers }
  );
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get("origin") || "*";

  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
