import { NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { prisma } from "@/lib/prisma";
import { runAgent } from "@/lib/agent";

export const maxDuration = 300;

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

  if (project.autoGeneratePrs) {
    waitUntil(
      runAgent(feedback.id).catch(async (err) => {
        console.error("Agent error:", err);
        await prisma.feedback.update({
          where: { id: feedback.id },
          data: { status: "new" },
        });
      })
    );
  }

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
