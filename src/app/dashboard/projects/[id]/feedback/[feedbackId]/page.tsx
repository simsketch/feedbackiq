import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import GeneratePrButton from "@/components/generate-pr-button";

const statusBadge: Record<string, string> = {
  new: "bg-cyan-500/10 text-cyan-400",
  reviewing: "bg-cyan-500/10 text-cyan-400",
  generating: "bg-amber-500/10 text-amber-400",
  pr_created: "bg-green-500/10 text-green-400",
  closed: "bg-zinc-500/10 text-zinc-400",
};

export default async function FeedbackDetailPage({
  params,
}: {
  params: Promise<{ id: string; feedbackId: string }>;
}) {
  const user = await getAuthUser();
  if (!user) redirect("/login");

  const { id, feedbackId } = await params;

  const project = await prisma.project.findFirst({
    where: { id, companyId: user.companyId },
  });

  if (!project) notFound();

  const feedback = await prisma.feedback.findFirst({
    where: { id: feedbackId, projectId: id },
    include: { pullRequests: true },
  });

  if (!feedback) notFound();

  const canGenerate =
    feedback.status === "new" || feedback.status === "reviewing";

  return (
    <div>
      <div className="mb-8">
        <nav className="flex items-center gap-2 text-sm text-zinc-500">
          <Link
            href={`/dashboard/projects/${project.id}`}
            className="text-cyan-400 hover:text-cyan-300"
          >
            {project.name}
          </Link>
          <span className="text-zinc-600">/</span>
          <Link
            href={`/dashboard/projects/${project.id}/feedback`}
            className="text-cyan-400 hover:text-cyan-300"
          >
            Feedback
          </Link>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-300">Detail</span>
        </nav>
      </div>

      <div className="glow-card rounded-xl bg-[#18181b] border border-zinc-800 p-6">
        <div className="flex items-start justify-between gap-4 mb-6">
          <h1 className="text-xl font-bold text-zinc-100">
            Feedback Detail
          </h1>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              statusBadge[feedback.status] || "bg-zinc-500/10 text-zinc-400"
            }`}
          >
            {feedback.status.replace("_", " ")}
          </span>
        </div>

        <div className="prose max-w-none mb-6">
          <p className="whitespace-pre-wrap text-zinc-400">
            {feedback.content}
          </p>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-500 mb-6">
          <span>
            Submitted: {new Date(feedback.createdAt).toLocaleString()}
          </span>
          {feedback.submitterEmail && (
            <span>From: {feedback.submitterEmail}</span>
          )}
          {feedback.sourceUrl && (
            <span>
              Source:{" "}
              <a
                href={feedback.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300"
              >
                {feedback.sourceUrl}
              </a>
            </span>
          )}
        </div>

        {canGenerate && (
          <div className="mb-6">
            <GeneratePrButton feedbackId={feedback.id} />
          </div>
        )}

        {feedback.pullRequests.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-zinc-100 mb-3">
              Pull Requests
            </h2>
            <div className="space-y-3">
              {feedback.pullRequests.map((pr) => (
                <div
                  key={pr.id}
                  className="rounded-xl border border-zinc-800 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-zinc-100">
                        {pr.branchName}
                      </p>
                      {pr.githubPrUrl && (
                        <a
                          href={pr.githubPrUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-cyan-400 hover:text-cyan-300"
                        >
                          PR #{pr.githubPrNumber} &rarr;
                        </a>
                      )}
                    </div>
                    <span className="inline-flex items-center rounded-full bg-zinc-500/10 px-2.5 py-0.5 text-xs font-medium text-zinc-400">
                      {pr.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
