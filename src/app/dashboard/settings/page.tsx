import Link from "next/link";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function SettingsPage() {
  const user = await getAuthUser();
  const companyId = user!.companyId;

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: {
      users: {
        select: { id: true, name: true, email: true, role: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!company) {
    return <p className="text-sm text-red-400">Company not found.</p>;
  }

  const isGithubConnected = !!company.githubInstallationId;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Settings</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Manage your company settings and integrations.
        </p>
      </div>

      {/* Company info */}
      <div className="glow-card rounded-xl bg-[#18181b] border border-zinc-800 p-6">
        <h2 className="text-lg font-semibold text-zinc-100 mb-4">Company</h2>
        <dl className="space-y-3">
          <div>
            <dt className="text-sm font-medium text-zinc-500">Name</dt>
            <dd className="mt-1 text-sm text-zinc-100">{company.name}</dd>
          </div>
        </dl>
      </div>

      {/* GitHub connection */}
      <div className="glow-card rounded-xl bg-[#18181b] border border-zinc-800 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">
              GitHub Integration
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              {isGithubConnected
                ? "GitHub App is connected."
                : "Connect the GitHub App to enable PR generation."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-block h-2.5 w-2.5 rounded-full ${
                isGithubConnected ? "bg-green-400" : "bg-zinc-600"
              }`}
            />
            <span className="text-sm text-zinc-400">
              {isGithubConnected ? "Connected" : "Not connected"}
            </span>
          </div>
        </div>
        <div className="mt-4">
          <Link
            href="/dashboard/settings/github"
            className="text-sm font-medium text-cyan-400 hover:text-cyan-300"
          >
            Manage GitHub settings &rarr;
          </Link>
        </div>
      </div>

      {/* Team members */}
      <div className="glow-card rounded-xl bg-[#18181b] border border-zinc-800 p-6">
        <h2 className="text-lg font-semibold text-zinc-100 mb-4">
          Team Members
        </h2>
        <div className="divide-y divide-zinc-800">
          {company.users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
            >
              <div>
                <p className="text-sm font-medium text-zinc-100">
                  {user.name || user.email}
                </p>
                <p className="text-xs text-zinc-500">{user.email}</p>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-500/10 text-zinc-400 capitalize">
                {user.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
