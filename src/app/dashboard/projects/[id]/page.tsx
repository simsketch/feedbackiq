import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import WidgetSnippet from "@/components/widget-snippet";
import ProjectSettings from "@/components/project-settings";
import ThemeSettings from "@/components/theme-settings";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getAuthUser();
  if (!user) redirect("/login");

  const { id } = await params;

  const [project, company] = await Promise.all([
    prisma.project.findFirst({
      where: { id, companyId: user.companyId },
      include: { _count: { select: { feedback: true } } },
    }),
    prisma.company.findUnique({
      where: { id: user.companyId },
      select: { githubInstallationId: true },
    }),
  ]);

  if (!project) notFound();

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/dashboard/projects"
          className="text-sm text-cyan-400 hover:text-cyan-300"
        >
          &larr; All Projects
        </Link>
      </div>

      <div className="mb-8 animate-fade-up">
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="gradient-text">{project.name}</span>
        </h1>
        <p className="mt-2 text-sm font-mono text-zinc-500">
          {project.githubRepo}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 mb-8">
        <Link
          href={`/dashboard/projects/${project.id}/feedback`}
          className="glow-card block rounded-xl border border-zinc-800 bg-[#18181b] p-6 hover:border-zinc-700 transition-colors"
        >
          <h3 className="text-lg font-semibold text-zinc-100">Feedback</h3>
          <p className="mt-1 text-sm text-zinc-400">
            {project._count.feedback} item
            {project._count.feedback !== 1 ? "s" : ""}
          </p>
        </Link>

        <Link
          href={`/dashboard/projects/${project.id}/prs`}
          className="glow-card block rounded-xl border border-zinc-800 bg-[#18181b] p-6 hover:border-zinc-700 transition-colors"
        >
          <h3 className="text-lg font-semibold text-zinc-100">
            Pull Requests
          </h3>
          <p className="mt-1 text-sm text-zinc-400">
            View generated pull requests
          </p>
        </Link>
      </div>

      <div className="space-y-8">
        <WidgetSnippet siteKey={project.siteKey} isGithubConnected={!!company?.githubInstallationId} />
        <ThemeSettings
          projectId={project.id}
          initialWebsiteUrl={project.websiteUrl}
          initialTheme={{
            primary: project.themePrimary,
            background: project.themeBackground,
            foreground: project.themeForeground,
            fontFamily: project.themeFontFamily,
            borderRadius: project.themeBorderRadius,
          }}
          initialUpdatedAt={project.themeUpdatedAt}
        />
        <ProjectSettings
          projectId={project.id}
          autoGeneratePrs={project.autoGeneratePrs}
        />
      </div>
    </div>
  );
}
