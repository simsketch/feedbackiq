"use client";

import { useState } from "react";

interface Theme {
  primary: string | null;
  background: string | null;
  foreground: string | null;
  fontFamily: string | null;
  borderRadius: string | null;
}

interface Props {
  projectId: string;
  initialWebsiteUrl: string | null;
  initialTheme: Theme;
  initialUpdatedAt: Date | null;
}

function Swatch({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="h-8 w-8 shrink-0 rounded-md border border-zinc-700"
        style={value ? { background: value } : undefined}
      />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-zinc-500">{label}</p>
        <p className="truncate font-mono text-xs text-zinc-300">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

export default function ThemeSettings({
  projectId,
  initialWebsiteUrl,
  initialTheme,
  initialUpdatedAt,
}: Props) {
  const [websiteUrl, setWebsiteUrl] = useState(initialWebsiteUrl || "");
  const [overrideUrl, setOverrideUrl] = useState("");
  const [theme, setTheme] = useState(initialTheme);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(initialUpdatedAt);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveWebsiteUrl() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ websiteUrl: websiteUrl || null }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to save");
      }
    } finally {
      setBusy(false);
    }
  }

  async function detectTheme() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/detect-theme`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(overrideUrl ? { url: overrideUrl } : {}),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to detect theme");
        return;
      }
      const data = await res.json();
      setTheme(data.theme);
      setUpdatedAt(new Date(data.theme.updatedAt));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="glow-card rounded-xl border border-zinc-800 bg-[#18181b] p-6">
      <div className="mb-4 flex items-baseline justify-between">
        <h3 className="text-lg font-semibold text-zinc-100">Widget theme</h3>
        {updatedAt && (
          <span className="text-xs text-zinc-500">
            Updated {new Date(updatedAt).toLocaleString()}
          </span>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-400">
            Website URL
          </label>
          <div className="mt-1 flex gap-2">
            <input
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://example.com"
              className="flex-1 rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-white placeholder-zinc-500 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 sm:text-sm"
            />
            <button
              type="button"
              onClick={saveWebsiteUrl}
              disabled={busy}
              className="btn-ghost"
            >
              Save
            </button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Swatch label="Primary" value={theme.primary} />
          <Swatch label="Background" value={theme.background} />
          <Swatch label="Foreground" value={theme.foreground} />
          <Swatch label="Radius" value={theme.borderRadius} />
          <div className="sm:col-span-2">
            <p className="text-xs text-zinc-500">Font family</p>
            <p className="truncate font-mono text-xs text-zinc-300">
              {theme.fontFamily || "—"}
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400">
            Re-detect from URL (optional)
          </label>
          <div className="mt-1 flex gap-2">
            <input
              type="url"
              value={overrideUrl}
              onChange={(e) => setOverrideUrl(e.target.value)}
              placeholder="Leave blank to use website URL above"
              className="flex-1 rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-white placeholder-zinc-500 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 sm:text-sm"
            />
            <button
              type="button"
              onClick={detectTheme}
              disabled={busy || (!websiteUrl && !overrideUrl)}
              className="btn-snake"
            >
              {busy ? "Detecting..." : "Re-detect"}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}
      </div>
    </div>
  );
}
