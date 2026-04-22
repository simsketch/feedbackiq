"use client";

import { useState } from "react";

type State =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; alreadyOnList: boolean }
  | { kind: "error"; message: string };

export default function WaitlistForm({ source = "homepage" }: { source?: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (state.kind === "submitting") return;
    setState({ kind: "submitting" });

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        alreadyOnList?: boolean;
      };

      if (!res.ok) {
        setState({
          kind: "error",
          message: data.error || "Something went wrong. Try again?",
        });
        return;
      }
      setState({ kind: "success", alreadyOnList: !!data.alreadyOnList });
    } catch {
      setState({ kind: "error", message: "Network error. Try again?" });
    }
  }

  if (state.kind === "success") {
    return (
      <div className="glow-card mx-auto max-w-md rounded-xl px-6 py-5 text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10 ring-1 ring-green-500/30">
          <svg
            className="h-5 w-5 text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-base font-medium text-white">
          {state.alreadyOnList ? "Already on the list." : "You're on the list."}
        </p>
        <p className="mt-1 text-sm text-zinc-400">
          We&rsquo;ll send a short note when early access opens.
        </p>
      </div>
    );
  }

  const submitting = state.kind === "submitting";

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto w-full max-w-md"
      noValidate
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="waitlist-email" className="sr-only">
          Email address
        </label>
        <input
          id="waitlist-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          disabled={submitting}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (state.kind === "error") setState({ kind: "idle" });
          }}
          placeholder="you@company.com"
          className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900/70 px-4 py-3 text-base text-white placeholder-zinc-500 outline-none transition-colors focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={submitting}
          className="btn-snake inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3 text-base font-medium text-black transition-all hover:brightness-110 disabled:opacity-60"
        >
          {submitting ? (
            <>
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  opacity="0.25"
                />
                <path
                  d="M12 2a10 10 0 0 1 10 10"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              Joining…
            </>
          ) : (
            <>
              Join the waitlist
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
        </button>
      </div>
      {state.kind === "error" && (
        <p className="mt-3 text-center text-sm text-red-400">{state.message}</p>
      )}
      {state.kind !== "error" && (
        <p className="mt-3 text-center text-xs text-zinc-500">
          No spam. One short note when early access opens.
        </p>
      )}
    </form>
  );
}
