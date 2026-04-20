import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import FeedbackChips from "@/components/feedback-chips";

const statusBadge: Record<string, string> = {
  new: "bg-cyan-500/10 text-cyan-400",
  reviewing: "bg-cyan-500/10 text-cyan-400",
  generating: "bg-amber-500/10 text-amber-400",
  pr_created: "bg-green-500/10 text-green-400",
  closed: "bg-zinc-500/10 text-zinc-400",
};

export default async function FeedbackListPage({
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

  const feedback = await prisma.feedback.findMany({
    where: { projectId: id },
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
        <span className="gradient-text">Feedback</span>
      </h1>

      {feedback.length === 0 ? (
        <div className="glow-card rounded-xl bg-[#18181b] border border-zinc-800 p-12 text-center">
          <p className="text-zinc-400">
            No feedback yet. Install the widget on your site to start
            collecting feedback.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedback.map((item) => (
            <Link
              key={item.id}
              href={`/dashboard/projects/${project.id}/feedback/${item.id}`}
              className="block glow-card rounded-xl bg-[#18181b] border border-zinc-800 p-6 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-zinc-100 line-clamp-2">
                    {item.content.length > 200
                      ? item.content.slice(0, 200) + "..."
                      : item.content}
                  </p>
                  <div className="mt-2">
                    <FeedbackChips
                      priority={item.priority}
                      category={item.category}
                      tags={item.tags}
                    />
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-sm text-zinc-500">
                    {item.submitterEmail && <span>{item.submitterEmail}</span>}
                    <span>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <span
                  className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    statusBadge[item.status] || "bg-zinc-500/10 text-zinc-400"
                  }`}
                >
                  {item.status.replace("_", " ")}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
