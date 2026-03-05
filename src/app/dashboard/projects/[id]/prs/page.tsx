import Link from "next/link";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const statusBadge: Record<string, string> = {
  open: "bg-green-100 text-green-700",
  merged: "bg-purple-100 text-purple-700",
  pending: "bg-yellow-100 text-yellow-700",
  closed: "bg-gray-100 text-gray-700",
};

export default async function PullRequestsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;

  const project = await prisma.project.findFirst({
    where: { id, companyId: (session.user as any).companyId },
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
          className="text-sm text-indigo-600 hover:text-indigo-500"
        >
          &larr; {project.name}
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Pull Requests</h1>

      {pullRequests.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-500">
            No pull requests yet. Pull requests will appear here when generated
            from feedback.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pullRequests.map((pr) => (
            <div
              key={pr.id}
              className="block rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {pr.githubPrUrl ? (
                      <a
                        href={pr.githubPrUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-indigo-600 hover:text-indigo-500"
                      >
                        {pr.branchName}
                      </a>
                    ) : (
                      <span className="font-medium text-gray-900">
                        {pr.branchName}
                      </span>
                    )}
                    {pr.githubPrNumber && (
                      <span className="text-sm text-gray-500">
                        #{pr.githubPrNumber}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                    {pr.feedback.content.length > 200
                      ? pr.feedback.content.slice(0, 200) + "..."
                      : pr.feedback.content}
                  </p>
                  <p className="mt-2 text-xs text-gray-400">
                    {new Date(pr.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    statusBadge[pr.status] || "bg-gray-100 text-gray-700"
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
