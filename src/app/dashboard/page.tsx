import Link from "next/link";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const statusBadgeClasses: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  pr_created: "bg-green-100 text-green-700",
  generating: "bg-yellow-100 text-yellow-700",
};

function StatusBadge({ status }: { status: string }) {
  const classes =
    statusBadgeClasses[status] ?? "bg-gray-100 text-gray-600";
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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <p className="mt-1 text-sm text-gray-500">
          A summary of your FeedbackIQ activity.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-lg border border-gray-200 p-6"
          >
            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* No projects state */}
      {projectCount === 0 && (
        <div className="bg-white rounded-lg border border-dashed border-gray-300 p-10 text-center">
          <p className="text-sm text-gray-500 mb-3">
            You have not created any projects yet.
          </p>
          <Link
            href="/dashboard/projects/new"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Create your first project &rarr;
          </Link>
        </div>
      )}

      {/* Recent feedback */}
      {projectCount > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Recent Feedback
          </h2>
          <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
            {recentFeedback.length === 0 ? (
              <p className="px-6 py-8 text-sm text-center text-gray-500">
                No feedback received yet.
              </p>
            ) : (
              recentFeedback.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between px-6 py-4 gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-900 truncate">
                      {item.content}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-400">
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
