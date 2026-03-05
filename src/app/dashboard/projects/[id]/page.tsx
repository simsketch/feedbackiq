import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import WidgetSnippet from "@/components/widget-snippet";
import ProjectSettings from "@/components/project-settings";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;

  const project = await prisma.project.findFirst({
    where: { id, companyId: (session.user as any).companyId },
    include: { _count: { select: { feedback: true } } },
  });

  if (!project) notFound();

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/dashboard/projects"
          className="text-sm text-indigo-600 hover:text-indigo-500"
        >
          &larr; All Projects
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
        <p className="mt-1 text-sm text-gray-500">{project.githubRepo}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 mb-8">
        <Link
          href={`/dashboard/projects/${project.id}/feedback`}
          className="block rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-semibold text-gray-900">Feedback</h3>
          <p className="mt-1 text-sm text-gray-500">
            {project._count.feedback} item
            {project._count.feedback !== 1 ? "s" : ""}
          </p>
        </Link>

        <Link
          href={`/dashboard/projects/${project.id}/pull-requests`}
          className="block rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-semibold text-gray-900">
            Pull Requests
          </h3>
          <p className="mt-1 text-sm text-gray-500">
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
