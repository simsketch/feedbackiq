"use client";

import { useState } from "react";

type Position =
  | "bottom-right"
  | "bottom-left"
  | "top-right"
  | "top-left"
  | "right-middle"
  | "left-middle";

type Icon =
  | "chat"
  | "lightbulb"
  | "megaphone"
  | "heart"
  | "question"
  | "sparkle";

const POSITIONS: { value: Position; label: string }[] = [
  { value: "bottom-right", label: "Bottom right" },
  { value: "bottom-left", label: "Bottom left" },
  { value: "top-right", label: "Top right" },
  { value: "top-left", label: "Top left" },
  { value: "right-middle", label: "Right side (centered)" },
  { value: "left-middle", label: "Left side (centered)" },
];

const ICONS: { value: Icon; label: string; path: string }[] = [
  {
    value: "chat",
    label: "Chat",
    path: "M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm0 15.17L18.83 16H4V4h16v13.17zM7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z",
  },
  {
    value: "lightbulb",
    label: "Idea",
    path: "M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z",
  },
  {
    value: "megaphone",
    label: "Megaphone",
    path: "M18 11v2h4v-2h-4zm-2 6.61c.96.71 2.21 1.65 3.2 2.39.4-.53.8-1.07 1.2-1.6-.99-.74-2.24-1.68-3.2-2.4-.4.54-.8 1.08-1.2 1.61zM20.4 5.6c-.4-.53-.8-1.07-1.2-1.6-.99.74-2.24 1.68-3.2 2.4.4.53.8 1.07 1.2 1.6.96-.72 2.21-1.65 3.2-2.4zM4 9c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h1v4h2v-4h1l5 3V6L8 9H4zm11.5 3c0-1.33-.58-2.53-1.5-3.35v6.69c.92-.81 1.5-2.01 1.5-3.34z",
  },
  {
    value: "heart",
    label: "Heart",
    path: "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z",
  },
  {
    value: "question",
    label: "Question",
    path: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z",
  },
  {
    value: "sparkle",
    label: "Sparkle",
    path: "M12 3l1.88 4.77L19 9.5l-4.5 3.75L16 19l-4-3-4 3 1.5-5.75L5 9.5l5.12-1.73z",
  },
];

interface Props {
  projectId: string;
  initialPosition: string;
  initialLabel: string | null;
  initialSize: string;
  initialIcon: string;
  initialHeaderTitle: string | null;
  initialHeaderSubtitle: string | null;
  initialContentPlaceholder: string | null;
  initialEmailPlaceholder: string | null;
  initialAttachText: string | null;
  initialSubmitText: string | null;
  initialSuccessMessage: string | null;
  initialShowEmail: boolean;
  initialRequireEmail: boolean;
  initialShowScreenshot: boolean;
}

const COPY_DEFAULTS = {
  headerTitle: "Share your feedback",
  headerSubtitle: "Be specific so our AI can build it",
  contentPlaceholder: "What's on your mind?",
  emailPlaceholder: "Email (optional)",
  attachText: "Attach screenshot",
  submitText: "Submit Feedback",
  successMessage: "Thank you! Your feedback has been submitted.",
};

export default function WidgetAppearanceSettings({
  projectId,
  initialPosition,
  initialLabel,
  initialSize,
  initialIcon,
  initialHeaderTitle,
  initialHeaderSubtitle,
  initialContentPlaceholder,
  initialEmailPlaceholder,
  initialAttachText,
  initialSubmitText,
  initialSuccessMessage,
  initialShowEmail,
  initialRequireEmail,
  initialShowScreenshot,
}: Props) {
  const [position, setPosition] = useState<Position>(
    (POSITIONS.find((p) => p.value === initialPosition)?.value ??
      "bottom-right") as Position
  );
  const [label, setLabel] = useState(initialLabel ?? "");
  const [size, setSize] = useState<"default" | "compact">(
    initialSize === "compact" ? "compact" : "default"
  );
  const [icon, setIcon] = useState<Icon>(
    (ICONS.find((i) => i.value === initialIcon)?.value ?? "chat") as Icon
  );
  const [headerTitle, setHeaderTitle] = useState(initialHeaderTitle ?? "");
  const [headerSubtitle, setHeaderSubtitle] = useState(
    initialHeaderSubtitle ?? ""
  );
  const [contentPlaceholder, setContentPlaceholder] = useState(
    initialContentPlaceholder ?? ""
  );
  const [emailPlaceholder, setEmailPlaceholder] = useState(
    initialEmailPlaceholder ?? ""
  );
  const [attachText, setAttachText] = useState(initialAttachText ?? "");
  const [submitText, setSubmitText] = useState(initialSubmitText ?? "");
  const [successMessage, setSuccessMessage] = useState(
    initialSuccessMessage ?? ""
  );
  const [showEmail, setShowEmail] = useState(initialShowEmail);
  const [requireEmail, setRequireEmail] = useState(initialRequireEmail);
  const [showScreenshot, setShowScreenshot] = useState(initialShowScreenshot);
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
          widgetIcon: icon,
          widgetHeaderTitle: headerTitle,
          widgetHeaderSubtitle: headerSubtitle,
          widgetContentPlaceholder: contentPlaceholder,
          widgetEmailPlaceholder: emailPlaceholder,
          widgetAttachText: attachText,
          widgetSubmitText: submitText,
          widgetSuccessMessage: successMessage,
          widgetShowEmail: showEmail,
          widgetRequireEmail: requireEmail,
          widgetShowScreenshot: showScreenshot,
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
          <label className="block text-sm font-medium text-zinc-200 mb-2">
            Icon
          </label>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {ICONS.map((i) => (
              <button
                key={i.value}
                type="button"
                onClick={() => setIcon(i.value)}
                title={i.label}
                className={`flex flex-col items-center justify-center gap-1 rounded-lg border py-3 text-xs transition-colors ${
                  icon === i.value
                    ? "border-cyan-500 bg-cyan-500/10 text-cyan-300"
                    : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="h-5 w-5 fill-current"
                >
                  <path d={i.path} />
                </svg>
                <span>{i.label}</span>
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

        <div className="border-t border-zinc-800 pt-5">
          <h4 className="text-sm font-semibold text-zinc-100 mb-1">
            Copy
          </h4>
          <p className="text-xs text-zinc-500 mb-4">
            Override the text inside the feedback form. Leave blank to use defaults.
          </p>
          <div className="space-y-4">
            {(
              [
                ["headerTitle", headerTitle, setHeaderTitle, "Header title", 60],
                ["headerSubtitle", headerSubtitle, setHeaderSubtitle, "Header subtitle", 120],
                ["contentPlaceholder", contentPlaceholder, setContentPlaceholder, "Textarea placeholder", 120],
                ["emailPlaceholder", emailPlaceholder, setEmailPlaceholder, "Email field placeholder", 60],
                ["attachText", attachText, setAttachText, "Attach button text", 40],
                ["submitText", submitText, setSubmitText, "Submit button text", 40],
                ["successMessage", successMessage, setSuccessMessage, "Success message", 200],
              ] as const
            ).map(([key, val, setter, label, max]) => (
              <div key={key}>
                <label
                  htmlFor={`widget-${key}`}
                  className="block text-xs font-medium text-zinc-300 mb-1"
                >
                  {label}
                </label>
                <input
                  id={`widget-${key}`}
                  type="text"
                  maxLength={max}
                  value={val}
                  onChange={(e) => setter(e.target.value)}
                  placeholder={COPY_DEFAULTS[key]}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-zinc-800 pt-5">
          <h4 className="text-sm font-semibold text-zinc-100 mb-1">
            Fields
          </h4>
          <p className="text-xs text-zinc-500 mb-4">
            Choose which fields appear in the form.
          </p>
          <div className="space-y-3">
            <label className="flex items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2.5 text-sm text-zinc-200">
              <span>Email field</span>
              <input
                type="checkbox"
                checked={showEmail}
                onChange={(e) => setShowEmail(e.target.checked)}
                className="h-4 w-4 accent-cyan-500"
              />
            </label>
            <label
              className={`flex items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2.5 text-sm ${
                showEmail ? "text-zinc-200" : "text-zinc-600"
              }`}
            >
              <span>Require email</span>
              <input
                type="checkbox"
                checked={requireEmail}
                disabled={!showEmail}
                onChange={(e) => setRequireEmail(e.target.checked)}
                className="h-4 w-4 accent-cyan-500"
              />
            </label>
            <label className="flex items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2.5 text-sm text-zinc-200">
              <span>Screenshot attach button</span>
              <input
                type="checkbox"
                checked={showScreenshot}
                onChange={(e) => setShowScreenshot(e.target.checked)}
                className="h-4 w-4 accent-cyan-500"
              />
            </label>
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
