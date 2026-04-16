import Link from "next/link";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const statusBadgeClasses: Record<string, string> = {
  new: "bg-cyan-500/10 text-cyan-400",
  reviewing: "bg-cyan-500/10 text-cyan-400",
  generating: "bg-amber-500/10 text-amber-400",
  pr_created: "bg-green-500/10 text-green-400",
  closed: "bg-zinc-500/10 text-zinc-400",
  open: "bg-green-500/10 text-green-400",
  merged: "bg-purple-500/10 text-purple-400",
  pending: "bg-amber-500/10 text-amber-400",
};

function StatusBadge({ status }: { status: string }) {
  const classes =
    statusBadgeClasses[status] ?? "bg-zinc-500/10 text-zinc-400";
  const label = status.replace("_", " ");

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${classes}`}
    >
      {label}
    </span>
  );
}

export default async function DashboardPage() {
  const user = await getAuthUser();
  const companyId = user!.companyId;

  const [projectCount, feedbackCount, prCount, recentFeedback] =
    await Promise.all([
      prisma.project.count({
        where: { companyId },
      }),
      prisma.feedback.count({
        where: { project: { companyId } },
      }),
      prisma.pullRequest.count({
        where: { feedback: { project: { companyId } } },
      }),
      prisma.feedback.findMany({
        where: { project: { companyId } },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { project: { select: { name: true } } },
      }),
    ]);

  const stats = [
    { label: "Projects", value: projectCount },
    { label: "Feedback", value: feedbackCount },
    { label: "PRs Generated", value: prCount },
  ];

  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="gradient-text">Overview</span>
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          A summary of your FeedbackIQ activity.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="glow-card rounded-xl bg-[#18181b] p-6"
          >
            <p className="text-sm font-medium text-zinc-400">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold text-white">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* No projects state */}
      {projectCount === 0 && (
        <div className="rounded-xl border border-dashed border-zinc-700 p-10 text-center">
          <p className="text-sm text-zinc-400 mb-3">
            You have not created any projects yet.
          </p>
          <Link
            href="/dashboard/projects/new"
            className="inline-flex items-center text-sm font-medium text-cyan-400 hover:text-cyan-300"
          >
            Create your first project &rarr;
          </Link>
        </div>
      )}

      {/* Recent feedback */}
      {projectCount > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-zinc-100 mb-3">
            Recent Feedback
          </h2>
          <div className="glow-card rounded-xl bg-[#18181b] divide-y divide-zinc-800">
            {recentFeedback.length === 0 ? (
              <p className="px-6 py-8 text-sm text-center text-zinc-500">
                No feedback received yet.
              </p>
            ) : (
              recentFeedback.map((item: { id: string; content: string; status: string; createdAt: Date; project: { name: string } }) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between px-6 py-4 gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-zinc-100 truncate">
                      {item.content}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {item.project.name} &middot;{" "}
                      {new Date(item.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
