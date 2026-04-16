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
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-zinc-100">Projects</h1>
        <Link
          href="/dashboard/projects/new"
          className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-zinc-200"
        >
          New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-700 p-12 text-center">
          <h3 className="text-sm font-semibold text-zinc-100">No projects</h3>
          <p className="mt-1 text-sm text-zinc-400">
            Get started by creating a new project.
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard/projects/new"
              className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-zinc-200"
            >
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
