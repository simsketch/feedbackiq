"use client";

import { useEffect, useState } from "react";

interface Props {
  feedbackId: string;
  initialCount: number;
}

function storageKey(id: string): string {
  return `fiq-upvote-${id}`;
}

export default function UpvoteButton({ feedbackId, initialCount }: Props) {
  const [count, setCount] = useState(initialCount);
  const [voted, setVoted] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(storageKey(feedbackId))) {
        setVoted(true);
      }
    } catch {
      // localStorage unavailable
    }
  }, [feedbackId]);

  async function handleClick() {
    if (busy) return;
    setBusy(true);

    const prev = count;
    const wasVoted = voted;
    const nextVoted = !wasVoted;

    setCount(wasVoted ? Math.max(0, prev - 1) : prev + 1);
    setVoted(nextVoted);
    try {
      if (nextVoted) {
        localStorage.setItem(storageKey(feedbackId), "1");
      } else {
        localStorage.removeItem(storageKey(feedbackId));
      }
    } catch {
      // ignore
    }

    try {
      const res = await fetch(`/api/v1/feedback/${feedbackId}/upvote`, {
        method: nextVoted ? "POST" : "DELETE",
      });
      if (!res.ok) {
        setCount(prev);
        setVoted(wasVoted);
        try {
          if (wasVoted) {
            localStorage.setItem(storageKey(feedbackId), "1");
          } else {
            localStorage.removeItem(storageKey(feedbackId));
          }
        } catch {
          // ignore
        }
      } else {
        const data = (await res.json()) as { count: number };
        if (typeof data.count === "number") setCount(data.count);
      }
    } catch {
      setCount(prev);
      setVoted(wasVoted);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      aria-label={voted ? "Remove upvote" : "Upvote"}
      className={`flex min-w-[52px] flex-col items-center justify-center gap-0.5 rounded-lg border px-2 py-2 text-xs font-semibold transition-all ${
        voted
          ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-400 hover:border-cyan-500/60 hover:bg-cyan-500/15 active:scale-95"
          : "border-zinc-700/60 bg-zinc-800/40 text-zinc-300 hover:border-cyan-500/40 hover:text-cyan-400 active:scale-95"
      }`}
    >
      <svg
        className="h-3.5 w-3.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 15l7-7 7 7"
        />
      </svg>
      <span>{count}</span>
    </button>
  );
}
