"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  pullRequestId: string;
  hasExistingEntry: boolean;
}

export default function GenerateChangelogButton({
  pullRequestId,
  hasExistingEntry,
}: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    if (
      hasExistingEntry &&
      !confirm("Regenerate the changelog entry from this PR's feedback?")
    ) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/pull-requests/${pullRequestId}/generate-changelog`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(hasExistingEntry ? { force: true } : {}),
        }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "failed");
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={run}
        disabled={busy}
        className="btn-ghost whitespace-nowrap text-xs"
      >
        {busy
          ? "Generating…"
          : hasExistingEntry
          ? "Regenerate changelog"
          : "Generate changelog"}
      </button>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}
