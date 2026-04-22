import { redirect } from "next/navigation";
import { isCurrentUserOwner } from "@/lib/owner";
import AdminWaitlistClient from "./AdminWaitlistClient";

export const dynamic = "force-dynamic";

export default async function AdminWaitlistPage() {
  const allowed = await isCurrentUserOwner();
  if (!allowed) redirect("/dashboard");

  return (
    <div>
      <header className="mb-8">
        <p className="font-mono text-xs uppercase tracking-wider text-cyan-400">
          Owner admin
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Waitlist signups
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Live view of every email on the homepage waitlist. Refresh or export
          to CSV.
        </p>
      </header>
      <AdminWaitlistClient />
    </div>
  );
}
