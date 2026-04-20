import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import UpvoteButton from "@/components/upvote-button";

export const revalidate = 60;

type Status = "new" | "reviewing" | "generating" | "pr_created" | "closed";

const COLUMNS: { title: string; statuses: Status[] }[] = [
  { title: "Under consideration", statuses: ["new", "reviewing"] },
  { title: "In progress", statuses: ["generating", "pr_created"] },
  { title: "Shipped", statuses: ["closed"] },
];

export default async function PublicRoadmapPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const project = await prisma.project.findFirst({
    where: { publicSlug: slug, publicRoadmap: true },
    select: {
      id: true,
      name: true,
      themePrimary: true,
      themeBackground: true,
      themeForeground: true,
    },
  });

  if (!project) notFound();

  const feedback = await prisma.feedback.findMany({
    where: { projectId: project.id, isPublic: true },
    select: {
      id: true,
      content: true,
      status: true,
      category: true,
      priority: true,
      upvoteCount: true,
      createdAt: true,
    },
    orderBy: [{ upvoteCount: "desc" }, { createdAt: "desc" }],
    take: 200,
  });

  const grouped = COLUMNS.map((col) => ({
    title: col.title,
    items: feedback.filter((f) => col.statuses.includes(f.status as Status)),
  }));

  const totalOpen = grouped[0].items.length + grouped[1].items.length;

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <header className="mb-12 animate-fade-up">
          <p className="mb-2 text-sm font-medium text-cyan-400">Roadmap</p>
          <h1 className="text-4xl font-bold tracking-tight">
            <span className="gradient-text">{project.name}</span>
          </h1>
          <p className="mt-2 text-zinc-400">
            {totalOpen} open · {grouped[2].items.length} shipped · upvote the
            items you want most
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          {grouped.map((col) => (
            <div key={col.title}>
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-zinc-500">
                {col.title}
                <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs font-mono text-zinc-400">
                  {col.items.length}
                </span>
              </h2>
              <div className="space-y-3">
                {col.items.length === 0 && (
                  <div className="rounded-xl border border-dashed border-zinc-800 p-6 text-center text-sm text-zinc-600">
                    Nothing here yet.
                  </div>
                )}
                {col.items.map((item) => (
                  <div
                    key={item.id}
                    className="glow-card flex items-start gap-3 rounded-xl p-4"
                  >
                    <UpvoteButton
                      feedbackId={item.id}
                      initialCount={item.upvoteCount}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-4 text-sm text-zinc-200">
                        {item.content}
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-[11px]">
                        {item.category && (
                          <span className="rounded-full border border-zinc-700 bg-zinc-800/40 px-2 py-0.5 font-medium text-zinc-400">
                            {item.category}
                          </span>
                        )}
                        {item.priority && (
                          <span className="rounded-full border border-zinc-700 bg-zinc-800/40 px-2 py-0.5 font-medium text-zinc-400">
                            {item.priority}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <footer className="mt-16 text-center text-xs text-zinc-600">
          Powered by{" "}
          <a
            href="https://feedbackiq.app"
            className="text-cyan-500 hover:text-cyan-400"
          >
            FeedbackIQ
          </a>
        </footer>
      </div>
    </div>
  );
}
