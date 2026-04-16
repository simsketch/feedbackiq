"use client";

import { useState } from "react";

export default function WidgetSnippet({ siteKey }: { siteKey: string }) {
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
