import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;

export default async function PublicChangelogPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const project = await prisma.project.findFirst({
    where: { publicSlug: slug, publicChangelog: true },
    select: { id: true, name: true },
  });

  if (!project) notFound();

  const entries = await prisma.changelogEntry.findMany({
    where: { projectId: project.id },
    orderBy: { publishedAt: "desc" },
    take: 100,
  });

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <header className="mb-12 animate-fade-up">
          <p className="mb-2 text-sm font-medium text-cyan-400">Changelog</p>
          <h1 className="text-4xl font-bold tracking-tight">
            <span className="gradient-text">{project.name}</span>
          </h1>
          <p className="mt-2 text-zinc-400">
            What shipped, newest first.
          </p>
        </header>

        {entries.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-800 p-10 text-center text-sm text-zinc-600">
            No entries yet. Check back soon.
          </div>
        ) : (
          <div className="space-y-8">
            {entries.map((entry) => (
              <article
                key={entry.id}
                className="glow-card rounded-xl p-6"
              >
                <div className="mb-2 flex items-center gap-2 text-xs text-zinc-500">
                  <time dateTime={entry.publishedAt.toISOString()}>
                    {entry.publishedAt.toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                  {entry.prUrl && (
                    <>
                      <span>·</span>
                      <a
                        href={entry.prUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-500 hover:text-cyan-400"
                      >
                        View PR
                      </a>
                    </>
                  )}
                </div>
                <h2 className="text-lg font-semibold text-zinc-100">
                  {entry.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                  {entry.body}
                </p>
              </article>
            ))}
          </div>
        )}

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
