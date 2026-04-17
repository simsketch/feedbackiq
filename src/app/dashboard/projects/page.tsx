import Link from "next/link";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function ProjectsPage() {
  const user = await getAuthUser();
  if (!user) redirect("/login");

  const projects = await prisma.project.findMany({
    where: { companyId: user.companyId },
    include: { _count: { select: { feedback: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8 animate-fade-up">
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="gradient-text">Projects</span>
        </h1>
        <Link href="/dashboard/projects/new" className="btn-snake group">
          New Project
          <svg
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-700 p-12 text-center">
          <h3 className="text-sm font-semibold text-zinc-100">No projects</h3>
          <p className="mt-1 text-sm text-zinc-400">
            Get started by creating a new project.
          </p>
          <div className="mt-6">
            <Link href="/dashboard/projects/new" className="btn-snake">
              New Project
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/dashboard/projects/${project.id}`}
              className="block glow-card rounded-xl bg-[#18181b] p-6 hover:border-zinc-700 transition-colors"
            >
              <h2 className="text-lg font-semibold text-zinc-100">
                {project.name}
              </h2>
              <p className="mt-1 text-sm text-zinc-400">{project.githubRepo}</p>
              <p className="mt-3 text-sm text-zinc-500">
                {project._count.feedback} feedback item
                {project._count.feedback !== 1 ? "s" : ""}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
