import Link from "next/link";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function GitHubSettingsPage() {
  const user = await getAuthUser();
  const companyId = user!.companyId;

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { githubInstallationId: true },
  });

  const isConnected = !!company?.githubInstallationId;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/dashboard/settings"
          className="text-sm text-zinc-400 hover:text-zinc-300"
        >
          &larr; Back to Settings
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-zinc-100">
          GitHub Integration
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Manage your GitHub App connection for automated PR generation.
        </p>
      </div>

      <div className="glow-card rounded-xl bg-[#18181b] border border-zinc-800 p-6">
        {isConnected ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="inline-block h-3 w-3 rounded-full bg-green-400" />
              <h2 className="text-lg font-semibold text-zinc-100">
                Connected
              </h2>
            </div>
            <p className="text-sm text-zinc-400">
              GitHub App is installed with installation ID{" "}
              <code className="rounded bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 text-xs font-mono text-cyan-400">
                {company!.githubInstallationId}
              </code>
              .
            </p>
            <div className="flex gap-4">
              <a
                href={`https://github.com/settings/installations/${company!.githubInstallationId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost"
              >
                Manage on GitHub
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="inline-block h-3 w-3 rounded-full bg-zinc-600" />
              <h2 className="text-lg font-semibold text-zinc-100">
                Not Connected
              </h2>
            </div>
            <p className="text-sm text-zinc-400">
              Install the FeedbackIQ GitHub App to enable automatic pull request
              generation from user feedback.
            </p>
            <a
              href="/api/github/install"
              className="btn-snake"
            >
              Connect GitHub
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
