import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import FeedbackRuns from "@/components/feedback-runs";
import FeedbackChips from "@/components/feedback-chips";

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
    include: { pullRequests: { orderBy: { createdAt: "desc" } } },
  });

  if (!feedback) notFound();

  const runs = feedback.pullRequests.map((pr) => ({
    id: pr.id,
    status: pr.status,
    branchName: pr.branchName,
    githubPrUrl: pr.githubPrUrl,
    githubPrNumber: pr.githubPrNumber,
    workflowRunUrl: pr.workflowRunUrl,
    createdAt: pr.createdAt.toISOString(),
  }));

  return (
    <div className="animate-fade-up">
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
        <h1 className="text-2xl font-bold mb-4">
          <span className="gradient-text">Feedback</span>
        </h1>

        <div className="mb-4">
          <FeedbackChips
            priority={feedback.priority}
            category={feedback.category}
            tags={feedback.tags}
            size="md"
          />
        </div>

        <div className="prose max-w-none mb-6">
          <p className="whitespace-pre-wrap text-zinc-300">
            {feedback.content}
          </p>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-500 mb-6 pb-6 border-b border-zinc-800">
          <span>
            Submitted {new Date(feedback.createdAt).toLocaleString()}
          </span>
          {feedback.submitterEmail && (
            <span>From {feedback.submitterEmail}</span>
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

        <FeedbackRuns
          feedbackId={feedback.id}
          initialStatus={feedback.status}
          initialRuns={runs}
        />
      </div>
    </div>
  );
}
