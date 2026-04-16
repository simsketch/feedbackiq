import Link from "next/link";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const statusBadge: Record<string, string> = {
  open: "bg-green-500/10 text-green-400",
  merged: "bg-purple-500/10 text-purple-400",
  pending: "bg-amber-500/10 text-amber-400",
  closed: "bg-zinc-500/10 text-zinc-400",
  failed: "bg-red-500/10 text-red-400",
  canceled: "bg-orange-500/10 text-orange-400",
};

export default async function PullRequestsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getAuthUser();
  if (!user) redirect("/login");

  const { id } = await params;

  const project = await prisma.project.findFirst({
    where: { id, companyId: user.companyId },
  });

  if (!project) notFound();

  const pullRequests = await prisma.pullRequest.findMany({
    where: { feedback: { projectId: id } },
    include: {
      feedback: { select: { content: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-8">
        <Link
          href={`/dashboard/projects/${project.id}`}
          className="text-sm text-cyan-400 hover:text-cyan-300"
        >
          &larr; {project.name}
        </Link>
      </div>

      <h1 className="text-3xl font-bold tracking-tight mb-6 animate-fade-up">
        <span className="gradient-text">Pull Requests</span>
      </h1>

      {pullRequests.length === 0 ? (
        <div className="glow-card rounded-xl bg-[#18181b] p-12 text-center">
          <p className="text-zinc-400">
            No pull requests yet. Pull requests will appear here when generated
            from feedback.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pullRequests.map((pr: { id: string; branchName: string; githubPrUrl: string | null; githubPrNumber: number | null; status: string; createdAt: Date; feedback: { content: string } }) => (
            <div
              key={pr.id}
              className="glow-card rounded-xl bg-[#18181b] p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {pr.githubPrUrl ? (
                      <a
                        href={pr.githubPrUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-cyan-400 hover:text-cyan-300"
                      >
                        {pr.branchName}
                      </a>
                    ) : (
                      <span className="font-medium text-zinc-100">
                        {pr.branchName}
                      </span>
                    )}
                    {pr.githubPrNumber && (
                      <span className="text-sm text-zinc-500">
                        #{pr.githubPrNumber}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-zinc-400 line-clamp-2">
                    {pr.feedback.content.length > 200
                      ? pr.feedback.content.slice(0, 200) + "..."
                      : pr.feedback.content}
                  </p>
                  <p className="mt-2 text-xs text-zinc-500">
                    {new Date(pr.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    statusBadge[pr.status] || "bg-zinc-500/10 text-zinc-400"
                  }`}
                >
                  {pr.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
