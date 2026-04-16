import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import WidgetSnippet from "@/components/widget-snippet";
import ProjectSettings from "@/components/project-settings";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getAuthUser();
  if (!user) redirect("/login");

  const { id } = await params;

  const project = await prisma.project.findFirst({
    where: { id, companyId: user.companyId },
    include: { _count: { select: { feedback: true } } },
  });

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

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">{project.name}</h1>
        <p className="mt-1 text-sm text-zinc-400">{project.githubRepo}</p>
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
          href={`/dashboard/projects/${project.id}/pull-requests`}
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
        <WidgetSnippet siteKey={project.siteKey} />
        <ProjectSettings
          projectId={project.id}
          autoGeneratePrs={project.autoGeneratePrs}
        />
      </div>
    </div>
  );
}
