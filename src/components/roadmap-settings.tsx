"use client";

import { useState } from "react";

interface Props {
  projectId: string;
  initialEnabled: boolean;
  initialSlug: string | null;
}

export default function RoadmapSettings({
  projectId,
  initialEnabled,
  initialSlug,
}: Props) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [slug, setSlug] = useState(initialSlug);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  const publicUrl = slug ? `${origin}/r/${slug}` : null;

  async function handleToggle() {
    setSaving(true);
    const newValue = !enabled;
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicRoadmap: newValue }),
      });
      if (res.ok) {
        const data = await res.json();
        setEnabled(newValue);
        if (data.publicSlug) setSlug(data.publicSlug);
      }
    } finally {
      setSaving(false);
    }
  }

  async function copyLink() {
    if (!publicUrl) return;
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="glow-card rounded-xl border border-zinc-800 bg-[#18181b] p-6">
      <h3 className="text-lg font-semibold text-zinc-100 mb-4">
        Public roadmap
      </h3>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-100">Publish roadmap</p>
          <p className="text-sm text-zinc-400">
            Share a read-only board so users can upvote what they want most.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          disabled={saving}
          onClick={handleToggle}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-[#18181b] disabled:opacity-50 ${
            enabled ? "bg-cyan-500" : "bg-zinc-700"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              enabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {enabled && publicUrl && (
        <div className="mt-4 flex items-center gap-2">
          <input
            readOnly
            value={publicUrl}
            className="flex-1 font-mono text-xs text-zinc-300"
          />
          <button
            type="button"
            onClick={copyLink}
            className="btn-ghost whitespace-nowrap"
          >
            {copied ? "Copied" : "Copy link"}
          </button>
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-snake whitespace-nowrap"
          >
            Open
          </a>
        </div>
      )}
    </div>
  );
}
