import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const installationId = request.nextUrl.searchParams.get("installation_id");

  if (!installationId) {
    return NextResponse.json(
      { error: "Missing installation_id" },
      { status: 400 }
    );
  }

  const companyId = (session.user as any).companyId as string;

  await prisma.company.update({
    where: { id: companyId },
    data: { githubInstallationId: parseInt(installationId, 10) },
  });

  return NextResponse.redirect(
    new URL("/dashboard/settings/github", request.url)
  );
}
