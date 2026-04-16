"use client";

import { useState } from "react";
import Link from "next/link";

export default function WidgetSnippet({
  siteKey,
  isGithubConnected,
}: {
  siteKey: string;
  isGithubConnected: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const snippet = `<script src="https://cdn.feedbackiq.app/widget.js" data-site-key="${siteKey}"></script>`;

  async function handleCopy() {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="glow-card rounded-xl border border-zinc-800 bg-[#18181b] p-6">
      <h3 className="text-lg font-semibold text-zinc-100 mb-4">
        Widget Snippet
      </h3>

      {!isGithubConnected && (
        <div className="mb-4 flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3">
          <svg className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-amber-400">
              GitHub not connected
            </p>
            <p className="mt-0.5 text-sm text-zinc-400">
              The widget will collect feedback, but PRs cannot be generated until you{" "}
              <Link
                href="/dashboard/settings/github"
                className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2"
              >
                connect GitHub
              </Link>
              .
            </p>
          </div>
        </div>
      )}

      <p className="text-sm text-zinc-400 mb-4">
        Add this snippet to your website to enable the feedback widget.
      </p>
      <div className="relative">
        <pre className="rounded-md bg-zinc-950 border border-zinc-800 p-4 text-sm text-zinc-100 overflow-x-auto">
          {snippet}
        </pre>
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 rounded-md bg-zinc-700 px-3 py-1 text-xs text-zinc-200 hover:bg-zinc-600"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}
