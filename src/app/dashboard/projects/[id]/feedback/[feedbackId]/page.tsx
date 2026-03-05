import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import GeneratePrButton from "@/components/generate-pr-button";

const statusBadge: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  reviewing: "bg-blue-100 text-blue-700",
  generating: "bg-yellow-100 text-yellow-700",
  pr_created: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-700",
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
        <nav className="flex items-center gap-2 text-sm text-gray-500">
          <Link
            href={`/dashboard/projects/${project.id}`}
            className="text-indigo-600 hover:text-indigo-500"
          >
            {project.name}
          </Link>
          <span>/</span>
          <Link
            href={`/dashboard/projects/${project.id}/feedback`}
            className="text-indigo-600 hover:text-indigo-500"
          >
            Feedback
          </Link>
          <span>/</span>
          <span className="text-gray-700">Detail</span>
        </nav>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 mb-6">
          <h1 className="text-xl font-bold text-gray-900">
            Feedback Detail
          </h1>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              statusBadge[feedback.status] || "bg-gray-100 text-gray-700"
            }`}
          >
            {feedback.status.replace("_", " ")}
          </span>
        </div>

        <div className="prose max-w-none mb-6">
          <p className="whitespace-pre-wrap text-gray-800">
            {feedback.content}
          </p>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500 mb-6">
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
                className="text-indigo-600 hover:text-indigo-500"
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
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Pull Requests
            </h2>
            <div className="space-y-3">
              {feedback.pullRequests.map((pr) => (
                <div
                  key={pr.id}
                  className="rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {pr.branchName}
                      </p>
                      {pr.githubPrUrl && (
                        <a
                          href={pr.githubPrUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-indigo-600 hover:text-indigo-500"
                        >
                          PR #{pr.githubPrNumber} &rarr;
                        </a>
                      )}
                    </div>
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
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
