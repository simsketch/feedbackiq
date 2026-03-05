import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function GitHubSettingsPage() {
  const session = await auth();
  const companyId = (session!.user as any).companyId as string;

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
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          &larr; Back to Settings
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          GitHub Integration
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your GitHub App connection for automated PR generation.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {isConnected ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="inline-block h-3 w-3 rounded-full bg-green-500" />
              <h2 className="text-lg font-semibold text-gray-900">
                Connected
              </h2>
            </div>
            <p className="text-sm text-gray-600">
              GitHub App is installed with installation ID{" "}
              <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">
                {company!.githubInstallationId}
              </code>
              .
            </p>
            <div className="flex gap-4">
              <a
                href={`https://github.com/settings/installations/${company!.githubInstallationId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                Manage on GitHub
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="inline-block h-3 w-3 rounded-full bg-gray-300" />
              <h2 className="text-lg font-semibold text-gray-900">
                Not Connected
              </h2>
            </div>
            <p className="text-sm text-gray-600">
              Install the FeedbackIQ GitHub App to enable automatic pull request
              generation from user feedback.
            </p>
            <a
              href="/api/github/install"
              className="inline-flex items-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              Connect GitHub
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
