import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

const statusBadge: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  reviewing: "bg-blue-100 text-blue-700",
  generating: "bg-yellow-100 text-yellow-700",
  pr_created: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-700",
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
          className="text-sm text-indigo-600 hover:text-indigo-500"
        >
          &larr; {project.name}
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Feedback</h1>

      {feedback.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-500">
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
              className="block rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-gray-900 line-clamp-2">
                    {item.content.length > 200
                      ? item.content.slice(0, 200) + "..."
                      : item.content}
                  </p>
                  <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                    {item.submitterEmail && <span>{item.submitterEmail}</span>}
                    <span>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <span
                  className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    statusBadge[item.status] || "bg-gray-100 text-gray-700"
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
