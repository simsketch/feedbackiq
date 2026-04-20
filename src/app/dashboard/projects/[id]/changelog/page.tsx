import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ChangelogManager from "@/components/changelog-manager";

export default async function ChangelogManagementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getAuthUser();
  if (!user) redirect("/login");

  const { id } = await params;

  const project = await prisma.project.findFirst({
    where: { id, companyId: user.companyId },
    select: {
      id: true,
      name: true,
      publicChangelog: true,
      publicSlug: true,
    },
  });

  if (!project) notFound();

  const entries = await prisma.changelogEntry.findMany({
    where: { projectId: id },
    orderBy: { publishedAt: "desc" },
    take: 200,
  });

  const serialized = entries.map((e) => ({
    id: e.id,
    title: e.title,
    body: e.body,
    status: e.status,
    prUrl: e.prUrl,
    publishedAt: e.publishedAt.toISOString(),
    pullRequestId: e.pullRequestId,
  }));

  const publicUrl =
    project.publicChangelog && project.publicSlug
      ? `/changelog/${project.publicSlug}`
      : null;

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

      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 animate-fade-up">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="gradient-text">Changelog</span>
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Manage entries generated from merged feedback PRs.
          </p>
        </div>
        {publicUrl && (
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost whitespace-nowrap"
          >
            View public page
          </a>
        )}
      </div>

      {!project.publicChangelog && (
        <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Public changelog is disabled. Entries will still be generated but
          won&apos;t be visible at the public URL until you enable it on the
          project page.
        </div>
      )}

      <ChangelogManager initialEntries={serialized} />
    </div>
  );
}
