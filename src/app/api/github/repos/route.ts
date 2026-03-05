import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getInstallationOctokit } from "@/lib/github";

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const company = await prisma.company.findUnique({
    where: { id: user.companyId },
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
