"use client";

import { useEffect, useState } from "react";

const PHASES = [
  { id: "idle", duration: 1500 },
  { id: "click", duration: 800 },
  { id: "panel", duration: 600 },
  { id: "typing", duration: 2800 },
  { id: "record-start", duration: 600 },
  { id: "recording", duration: 3200 },
  { id: "record-stop", duration: 800 },
  { id: "submit", duration: 1200 },
  { id: "success", duration: 2000 },
  { id: "agent", duration: 3000 },
  { id: "pr", duration: 2500 },
] as const;

type Phase = (typeof PHASES)[number]["id"];

export function AnimatedDemo() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [typedText, setTypedText] = useState("");
  const [recordTime, setRecordTime] = useState(0);

  const fullText =
    "The settings page needs a dark mode toggle. It should persist across sessions and apply to all pages instantly.";

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let phaseIndex = 0;

    function nextPhase() {
      if (phaseIndex >= PHASES.length) {
        phaseIndex = 0;
        setTypedText("");
        setRecordTime(0);
      }
      const p = PHASES[phaseIndex];
      setPhase(p.id);
      phaseIndex++;
      timeout = setTimeout(nextPhase, p.duration);
    }

    nextPhase();
    return () => clearTimeout(timeout);
  }, []);

  // Typing animation
  useEffect(() => {
    if (phase !== "typing") return;
    let i = 0;
    setTypedText("");
    const interval = setInterval(() => {
      if (i < fullText.length) {
        setTypedText(fullText.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 22);
    return () => clearInterval(interval);
  }, [phase]);

  // Recording timer
  useEffect(() => {
    if (phase !== "recording") {
      return;
    }
    setRecordTime(0);
    const interval = setInterval(() => {
      setRecordTime((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  const showPanel = [
    "panel",
    "typing",
    "record-start",
    "recording",
    "record-stop",
    "submit",
  ].includes(phase);
  const showSuccess = phase === "success";
  const showAgent = phase === "agent" || phase === "pr";
  const showPR = phase === "pr";
  const isRecording = phase === "recording";
  const showRecordUI =
    phase === "record-start" ||
    phase === "recording" ||
    phase === "record-stop";

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="relative mx-auto max-w-5xl">
      {/* Fake browser window */}
      <div className="glow-card rounded-xl bg-[var(--bg-card)] overflow-hidden">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          <div className="ml-3 flex-1 flex justify-center">
            <div className="rounded-md bg-zinc-800/80 px-4 py-1 text-xs text-zinc-500 font-mono">
              acme.com/settings
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="relative h-[420px] sm:h-[480px] bg-zinc-950 overflow-hidden">
          {/* Fake app UI */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-zinc-800" />
                <div className="h-4 w-20 rounded bg-zinc-800" />
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-16 rounded-md bg-zinc-800/50" />
                <div className="h-8 w-16 rounded-md bg-zinc-800/50" />
                <div className="h-8 w-20 rounded-md bg-zinc-800/50" />
              </div>
            </div>

            <div className="flex gap-6">
              {/* Sidebar */}
              <div className="hidden sm:block w-44 space-y-2">
                {["Profile", "Settings", "Billing", "Team", "API Keys"].map(
                  (item, i) => (
                    <div
                      key={item}
                      className={`h-8 rounded-md px-3 flex items-center text-xs ${
                        i === 1
                          ? "bg-zinc-800 text-zinc-300"
                          : "text-zinc-600"
                      }`}
                    >
                      {item}
                    </div>
                  )
                )}
              </div>

              {/* Main content */}
              <div className="flex-1 space-y-4">
                <div className="h-5 w-32 rounded bg-zinc-800 mb-4" />
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3"
                    >
                      <div className="space-y-1">
                        <div
                          className="h-3 rounded bg-zinc-800"
                          style={{ width: `${80 + i * 20}px` }}
                        />
                        <div
                          className="h-2 rounded bg-zinc-800/50"
                          style={{ width: `${120 + i * 15}px` }}
                        />
                      </div>
                      <div className="h-6 w-10 rounded-full bg-zinc-800" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Widget trigger button */}
          <div
            className={`absolute bottom-4 right-4 transition-all duration-300 ${
              phase === "click"
                ? "scale-90"
                : showPanel || showSuccess
                  ? "scale-75 opacity-50"
                  : "scale-100"
            }`}
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                showPanel || showSuccess
                  ? "bg-zinc-700"
                  : "bg-gradient-to-br from-cyan-400 to-green-400 shadow-cyan-500/20"
              }`}
            >
              <svg
                className="w-5 h-5 text-black"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
                />
              </svg>
            </div>
          </div>

          {/* Feedback panel */}
          {showPanel && (
            <div
              className="absolute bottom-20 right-4 w-[340px] rounded-xl bg-[#1a1a1e] border border-zinc-700/50 shadow-2xl shadow-black/50 overflow-hidden"
              style={{
                animation: "fade-up 0.25s cubic-bezier(0.16, 1, 0.3, 1) both",
              }}
            >
              <div className="p-4 border-b border-zinc-800">
                <h4 className="text-sm font-semibold text-white">
                  Share your feedback
                </h4>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Be specific so our AI can build it for you
                </p>
              </div>
              <div className="p-4 space-y-3">
                {/* Text area */}
                <div className="rounded-lg border border-zinc-700/50 bg-zinc-900/50 p-3 min-h-[72px]">
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {typedText}
                    {phase === "typing" && (
                      <span className="inline-block w-[2px] h-3 bg-cyan-400 ml-0.5 animate-pulse" />
                    )}
                  </p>
                </div>

                {/* Screen recording area */}
                {showRecordUI && (
                  <div
                    className="rounded-lg border border-zinc-700/50 bg-zinc-900/50 overflow-hidden"
                    style={{
                      animation:
                        "fade-up 0.2s cubic-bezier(0.16, 1, 0.3, 1) both",
                    }}
                  >
                    {/* Recording preview */}
                    <div className="relative h-[120px] bg-zinc-950">
                      {/* Fake screen capture content */}
                      <div className="absolute inset-0 opacity-60 p-2">
                        <div className="h-full rounded border border-zinc-800/50 bg-zinc-900/30 p-2">
                          <div className="flex gap-1 mb-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
                            <div className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
                            <div className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
                          </div>
                          <div className="space-y-1">
                            <div className="h-1 w-16 rounded bg-zinc-800" />
                            <div className="h-1 w-24 rounded bg-zinc-800" />
                            <div className="h-1 w-12 rounded bg-zinc-800" />
                          </div>
                        </div>
                      </div>

                      {/* Webcam overlay - circle in bottom left */}
                      <div className="absolute bottom-2 left-2 w-16 h-16 rounded-full border-2 border-cyan-400/60 bg-zinc-800 overflow-hidden shadow-lg">
                        <div className="absolute inset-0 flex items-center justify-center">
                          {/* Stylized face silhouette */}
                          <div className="relative">
                            <div className="w-6 h-6 rounded-full bg-zinc-600" />
                            <div className="w-10 h-5 rounded-t-full bg-zinc-600 mt-0.5 -ml-2" />
                          </div>
                        </div>
                        {/* Webcam ring glow when recording */}
                        {isRecording && (
                          <div className="absolute inset-0 rounded-full border-2 border-cyan-400 animate-pulse" />
                        )}
                      </div>

                      {/* Recording indicator */}
                      {isRecording && (
                        <div className="absolute top-2 right-2 flex items-center gap-1.5 rounded-full bg-red-500/90 px-2 py-0.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                          <span className="text-[9px] font-mono text-white font-medium">
                            {formatTime(recordTime)}
                          </span>
                        </div>
                      )}

                      {/* Mouse cursor animation */}
                      {isRecording && (
                        <div
                          className="absolute"
                          style={{
                            top: "40%",
                            left: "55%",
                            animation:
                              "cursor-move 3s ease-in-out infinite alternate",
                          }}
                        >
                          <svg
                            width="12"
                            height="16"
                            viewBox="0 0 12 16"
                            fill="none"
                          >
                            <path
                              d="M1 1L1 12L4 9L7 15L9 14L6 8L10 8L1 1Z"
                              fill="white"
                              stroke="black"
                              strokeWidth="0.5"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Recording controls */}
                    <div className="flex items-center justify-between px-3 py-2 border-t border-zinc-800/50">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-3.5 h-3.5 text-cyan-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
                          />
                        </svg>
                        <span className="text-[10px] text-zinc-400">
                          Screen + Camera
                        </span>
                      </div>
                      {isRecording ? (
                        <div className="flex items-center gap-1 text-[10px] text-red-400 font-medium">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                          Recording
                        </div>
                      ) : (
                        <span className="text-[10px] text-zinc-500">
                          Ready
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                  {/* Screen record button */}
                  <button
                    className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] transition-colors ${
                      showRecordUI
                        ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-400"
                        : "border-zinc-700/50 text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
                      />
                    </svg>
                    Record
                  </button>
                  <div className="flex-1" />
                  <button
                    className={`rounded-lg px-4 py-1.5 text-[11px] font-medium transition-all ${
                      phase === "submit"
                        ? "bg-zinc-600 text-zinc-300"
                        : "bg-white text-black hover:bg-zinc-200"
                    }`}
                  >
                    {phase === "submit" ? "Sending..." : "Submit"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Success state */}
          {showSuccess && (
            <div
              className="absolute bottom-20 right-4 w-[340px] rounded-xl bg-[#1a1a1e] border border-zinc-700/50 shadow-2xl shadow-black/50 overflow-hidden"
              style={{
                animation: "fade-up 0.25s cubic-bezier(0.16, 1, 0.3, 1) both",
              }}
            >
              <div className="p-8 text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10 border border-green-500/20">
                  <svg
                    className="h-5 w-5 text-green-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12.75l6 6 9-13.5"
                    />
                  </svg>
                </div>
                <p className="text-sm font-medium text-white">Thank you!</p>
                <p className="text-xs text-zinc-500 mt-1">
                  Your feedback has been submitted.
                </p>
              </div>
            </div>
          )}

          {/* Agent processing overlay */}
          {showAgent && (
            <div
              className="absolute inset-0 bg-zinc-950/90 backdrop-blur-sm flex items-center justify-center"
              style={{
                animation: "fade-in 0.3s ease both",
              }}
            >
              <div
                className="w-[400px] rounded-xl border border-zinc-800 bg-[#1a1a1e] overflow-hidden"
                style={{
                  animation:
                    "fade-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) both",
                }}
              >
                <div className="p-4 border-b border-zinc-800 flex items-center gap-3">
                  <div className="h-6 w-6 rounded-md bg-gradient-to-br from-cyan-400 to-green-400 flex items-center justify-center">
                    <span className="text-[8px] font-bold text-black">AI</span>
                  </div>
                  <span className="text-sm font-medium">
                    FeedbackIQ Agent
                  </span>
                  <div className="ml-auto flex items-center gap-1.5">
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-amber-400"
                      style={{ animation: "pulse-dot 1s ease infinite" }}
                    />
                    <span className="text-[11px] text-amber-400">
                      Working
                    </span>
                  </div>
                </div>
                <div className="p-4 font-mono text-[11px] space-y-2">
                  <div
                    className="text-zinc-400"
                    style={{
                      animation: "fade-up 0.3s ease both",
                      animationDelay: "0ms",
                    }}
                  >
                    <span className="text-cyan-400">$</span> Analyzing feedback
                    + screen recording...
                  </div>
                  <div
                    className="text-zinc-500"
                    style={{
                      animation: "fade-up 0.3s ease both",
                      animationDelay: "400ms",
                    }}
                  >
                    <span className="text-cyan-400">reading</span>{" "}
                    src/app/settings/page.tsx
                  </div>
                  <div
                    className="text-zinc-500"
                    style={{
                      animation: "fade-up 0.3s ease both",
                      animationDelay: "800ms",
                    }}
                  >
                    <span className="text-cyan-400">reading</span>{" "}
                    src/lib/theme-provider.tsx
                  </div>
                  <div
                    className="text-zinc-500"
                    style={{
                      animation: "fade-up 0.3s ease both",
                      animationDelay: "1200ms",
                    }}
                  >
                    <span className="text-cyan-400">reading</span>{" "}
                    src/components/ui/toggle.tsx
                  </div>
                  <div
                    className="text-zinc-500"
                    style={{
                      animation: "fade-up 0.3s ease both",
                      animationDelay: "1600ms",
                    }}
                  >
                    <span className="text-green-400">generating</span> changes
                    across 3 files...
                  </div>
                  {showPR && (
                    <div
                      className="text-green-400 pt-1 border-t border-zinc-800 mt-2"
                      style={{
                        animation: "fade-up 0.3s ease both",
                      }}
                    >
                      ✓ PR #127 opened — &quot;Add dark mode toggle to
                      settings&quot;
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating label */}
      <div className="mt-4 text-center">
        <span className="text-xs text-zinc-600 font-mono">
          {showAgent
            ? "AI agent analyzing codebase..."
            : showSuccess
              ? "Feedback received"
              : isRecording
                ? "Recording screen + webcam"
                : showPanel
                  ? "Describing the change"
                  : "Live demo — loops automatically"}
        </span>
      </div>
    </div>
  );
}
