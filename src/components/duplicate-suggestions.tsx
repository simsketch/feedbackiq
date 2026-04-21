"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Suggestion {
  id: string;
  content: string;
  similarity: number;
  parent: {
    id: string;
    content: string;
    upvoteCount: number;
  } | null;
}

interface Props {
  projectId: string;
  suggestions: Suggestion[];
}

export default function DuplicateSuggestions({ projectId, suggestions }: Props) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  if (suggestions.length === 0) return null;

  async function handle(id: string, action: "confirm" | "reject") {
    setBusyId(id);
    try {
      const res = await fetch(`/api/feedback/${id}/dedupe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mb-8 rounded-xl border border-amber-500/30 bg-amber-500/5 p-6">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-300">
          Possible duplicates
        </h2>
        <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-mono text-amber-200">
          {suggestions.length}
        </span>
      </div>
      <p className="mb-5 text-xs text-amber-200/70">
        Similarity-matched against existing feedback in <span className="font-mono">{projectId.slice(0, 8)}</span>.
        Confirming merges upvotes into the parent item.
      </p>
      <div className="space-y-3">
        {suggestions.map((s) => (
          <div
            key={s.id}
            className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-4"
          >
            <div className="mb-3 flex items-center gap-2 text-[11px]">
              <span className="rounded-full bg-amber-500/10 px-2 py-0.5 font-mono text-amber-300">
                {(s.similarity * 100).toFixed(0)}% match
              </span>
            </div>
            <div className="grid gap-3 text-sm md:grid-cols-2">
              <div>
                <p className="mb-1 text-[10px] uppercase tracking-wider text-zinc-500">
                  New submission
                </p>
                <p className="line-clamp-4 text-zinc-200">{s.content}</p>
              </div>
              <div>
                <p className="mb-1 text-[10px] uppercase tracking-wider text-zinc-500">
                  Possibly duplicates {s.parent ? `(${s.parent.upvoteCount} upvotes)` : ""}
                </p>
                <p className="line-clamp-4 text-zinc-300">
                  {s.parent?.content ?? "—"}
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                disabled={busyId === s.id}
                onClick={() => handle(s.id, "confirm")}
                className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-200 hover:bg-amber-500/20 disabled:opacity-50"
              >
                Confirm duplicate
              </button>
              <button
                type="button"
                disabled={busyId === s.id}
                onClick={() => handle(s.id, "reject")}
                className="rounded-lg border border-zinc-700 bg-zinc-800/40 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 disabled:opacity-50"
              >
                Not a duplicate
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
