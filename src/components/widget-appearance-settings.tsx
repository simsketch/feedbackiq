"use client";

import { useState } from "react";

type Position =
  | "bottom-right"
  | "bottom-left"
  | "top-right"
  | "top-left"
  | "right-middle"
  | "left-middle";

const POSITIONS: { value: Position; label: string }[] = [
  { value: "bottom-right", label: "Bottom right" },
  { value: "bottom-left", label: "Bottom left" },
  { value: "top-right", label: "Top right" },
  { value: "top-left", label: "Top left" },
  { value: "right-middle", label: "Right side (centered)" },
  { value: "left-middle", label: "Left side (centered)" },
];

interface Props {
  projectId: string;
  initialPosition: string;
  initialLabel: string | null;
  initialSize: string;
}

export default function WidgetAppearanceSettings({
  projectId,
  initialPosition,
  initialLabel,
  initialSize,
}: Props) {
  const [position, setPosition] = useState<Position>(
    (POSITIONS.find((p) => p.value === initialPosition)?.value ??
      "bottom-right") as Position
  );
  const [label, setLabel] = useState(initialLabel ?? "");
  const [size, setSize] = useState<"default" | "compact">(
    initialSize === "compact" ? "compact" : "default"
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          widgetPosition: position,
          widgetLabel: label.trim() || null,
          widgetSize: size,
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="glow-card rounded-xl border border-zinc-800 bg-[#18181b] p-6">
      <h3 className="text-lg font-semibold text-zinc-100 mb-1">
        Widget appearance
      </h3>
      <p className="text-sm text-zinc-400 mb-5">
        Control where the feedback button appears and what it says.
      </p>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-zinc-200 mb-2">
            Position
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {POSITIONS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPosition(p.value)}
                className={`rounded-lg border px-3 py-2 text-xs text-left transition-colors ${
                  position === p.value
                    ? "border-cyan-500 bg-cyan-500/10 text-cyan-300"
                    : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label
            htmlFor="widget-label"
            className="block text-sm font-medium text-zinc-200 mb-2"
          >
            Button label (optional)
          </label>
          <input
            id="widget-label"
            type="text"
            maxLength={24}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Leave blank for icon only (e.g. Feedback)"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-200 mb-2">
            Size
          </label>
          <div className="flex gap-2">
            {(["default", "compact"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={`rounded-lg border px-4 py-2 text-xs capitalize transition-colors ${
                  size === s
                    ? "border-cyan-500 bg-cyan-500/10 text-cyan-300"
                    : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="btn-snake"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          {saved && (
            <span className="text-xs text-cyan-400">Saved.</span>
          )}
        </div>
      </div>
    </div>
  );
}
