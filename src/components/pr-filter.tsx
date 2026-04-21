"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const STATUSES = ["all", "pending", "open", "merged", "closed", "failed"] as const;

export default function PrFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const status = searchParams.get("status") ?? "all";

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  function updateParams(next: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (!value || value === "all") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }

  useEffect(() => {
    const handle = setTimeout(() => {
      const current = searchParams.get("q") ?? "";
      if (query.trim() !== current) {
        updateParams({ q: query.trim() || undefined });
      }
    }, 200);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by feedback ID, PR #, or content…"
        className="min-w-[260px] flex-1 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-cyan-500 focus:outline-none"
      />
      <select
        value={status}
        onChange={(e) => updateParams({ status: e.target.value })}
        className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-200 focus:border-cyan-500 focus:outline-none"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s === "all" ? "All statuses" : s}
          </option>
        ))}
      </select>
      {(query || status !== "all") && (
        <button
          type="button"
          onClick={() => {
            setQuery("");
            updateParams({ q: undefined, status: undefined });
          }}
          className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-xs text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
        >
          Clear
        </button>
      )}
    </div>
  );
}
