import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getInstallationOctokit } from "@/lib/github";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const companyId = (session.user as any).companyId as string;

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { githubInstallationId: true },
  });

  if (!company?.githubInstallationId) {
    return NextResponse.json(
      { error: "GitHub App not installed" },
      { status: 400 }
    );
  }

  const octokit = await getInstallationOctokit(company.githubInstallationId);

  const { data } =
    await octokit.request("GET /installation/repositories", {
      per_page: 100,
    });

  const repos = data.repositories.map((repo: any) => ({
    full_name: repo.full_name,
    name: repo.name,
    default_branch: repo.default_branch,
    private: repo.private,
  }));

  return NextResponse.json(repos);
}
