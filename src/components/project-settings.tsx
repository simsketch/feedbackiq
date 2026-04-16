"use client";

import { useState } from "react";

export default function ProjectSettings({
  projectId,
  autoGeneratePrs,
}: {
  projectId: string;
  autoGeneratePrs: boolean;
}) {
  const [enabled, setEnabled] = useState(autoGeneratePrs);
  const [saving, setSaving] = useState(false);

  async function handleToggle() {
    setSaving(true);
    const newValue = !enabled;

    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ autoGeneratePrs: newValue }),
      });

      if (res.ok) {
        setEnabled(newValue);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="glow-card rounded-xl border border-zinc-800 bg-[#18181b] p-6">
      <h3 className="text-lg font-semibold text-zinc-100 mb-4">Settings</h3>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-100">
            Auto-generate Pull Requests
          </p>
          <p className="text-sm text-zinc-400">
            Automatically create PRs from feedback using AI.
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
    </div>
  );
}
