import Link from "next/link";
import type { Metadata } from "next";
import MarketingShell from "@/components/marketing-shell";
import { buildMetadata } from "@/lib/seo";
import { competitors, type Competitor } from "@/content/competitors";

export const metadata: Metadata = buildMetadata({
  title: "FeedbackIQ vs. other feedback tools",
  description:
    "Honest side-by-side comparisons between FeedbackIQ and Canny, Featurebase, UserVoice, and Productboard.",
  path: "/vs",
});

const ACCENTS: Record<
  string,
  { from: string; to: string; ring: string; glow: string }
> = {
  canny: {
    from: "from-amber-400",
    to: "to-orange-500",
    ring: "ring-amber-500/30",
    glow: "rgba(251,191,36,0.18)",
  },
  featurebase: {
    from: "from-fuchsia-400",
    to: "to-purple-500",
    ring: "ring-fuchsia-500/30",
    glow: "rgba(217,70,239,0.18)",
  },
  uservoice: {
    from: "from-emerald-400",
    to: "to-teal-500",
    ring: "ring-emerald-500/30",
    glow: "rgba(52,211,153,0.18)",
  },
  productboard: {
    from: "from-rose-400",
    to: "to-pink-500",
    ring: "ring-rose-500/30",
    glow: "rgba(244,114,182,0.18)",
  },
};

function computeStats(c: Competitor) {
  let onlyUs = 0;
  let both = 0;
  let onlyThem = 0;
  for (const row of c.rows) {
    const usYes = row.us === true || (typeof row.us === "string" && row.us.toLowerCase() !== "no");
    const themYes =
      row.them === true ||
      (typeof row.them === "string" && row.them.toLowerCase() !== "no");
    if (usYes && themYes) both++;
    else if (usYes) onlyUs++;
    else if (themYes) onlyThem++;
  }
  return { onlyUs, both, onlyThem, total: c.rows.length };
}

function CardVisual({ c }: { c: Competitor }) {
  const accent = ACCENTS[c.slug] ?? ACCENTS.canny;
  return (
    <div className="relative h-36 overflow-hidden border-b border-zinc-800/50 bg-gradient-to-br from-zinc-900/60 to-zinc-950/60">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background: `radial-gradient(ellipse at 20% 50%, rgba(34,211,238,0.2) 0%, rgba(34,211,238,0) 55%), radial-gradient(ellipse at 80% 50%, ${accent.glow} 0%, ${accent.glow.replace("0.18", "0")} 55%)`,
        }}
      />

      {/* diagonal divider */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(100deg, transparent 48%, rgba(255,255,255,0.08) 49.5%, rgba(255,255,255,0.08) 50.5%, transparent 52%)",
        }}
      />

      {/* Left: FeedbackIQ side */}
      <div className="absolute inset-y-0 left-0 w-1/2 p-4">
        <div className="flex h-full flex-col justify-between">
          <div className="flex items-center gap-2">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 shadow-[0_0_14px_rgba(34,211,238,0.45)]">
              <svg
                viewBox="0 0 32 32"
                className="h-5 w-5"
                fill="currentColor"
                aria-hidden="true"
              >
                <rect x="6" y="8" width="20" height="13" rx="3" fill="#09090b" opacity="0.25" />
                <circle cx="12" cy="14.5" r="1.2" fill="#ffffff" />
                <circle cx="16" cy="14.5" r="1.2" fill="#ffffff" />
                <circle cx="20" cy="14.5" r="1.2" fill="#ffffff" />
              </svg>
            </div>
            <span className="font-mono text-[10px] font-semibold text-zinc-300">
              FeedbackIQ
            </span>
          </div>
          <div className="rounded-md border border-cyan-400/25 bg-cyan-400/5 px-2 py-1 font-mono text-[9px] text-cyan-300">
            <span className="text-green-400">+</span>
            <span> PR opened</span>
          </div>
        </div>
      </div>

      {/* Right: Competitor side */}
      <div className="absolute inset-y-0 right-0 w-1/2 p-4">
        <div className="flex h-full flex-col items-end justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-semibold text-zinc-400">
              {c.name}
            </span>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${accent.from} ${accent.to} ring-1 ${accent.ring} font-bold text-sm text-black/80`}
            >
              {c.name.charAt(0)}
            </div>
          </div>
          <div className="rounded-md border border-zinc-700/70 bg-zinc-900/60 px-2 py-1 font-mono text-[9px] text-zinc-400">
            inbox · roadmap
          </div>
        </div>
      </div>

      {/* VS chip center */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-zinc-950/80 font-mono text-[10px] font-bold tracking-wider text-zinc-300 shadow-lg backdrop-blur-sm">
          VS
        </div>
      </div>
    </div>
  );
}

function DotGrid({
  count,
  color,
  muted = false,
}: {
  count: number;
  color: string;
  muted?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={`h-1.5 w-1.5 rounded-full ${muted ? "opacity-40" : ""}`}
          style={{ background: color }}
        />
      ))}
    </div>
  );
}

function Stats({ c }: { c: Competitor }) {
  const { onlyUs, both, onlyThem } = computeStats(c);
  return (
    <div className="mt-5 grid grid-cols-3 gap-2 rounded-lg border border-zinc-800/60 bg-zinc-950/40 p-3">
      <div>
        <div className="flex items-baseline gap-1">
          <span className="font-mono text-lg font-semibold text-cyan-400">
            {onlyUs}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
            only us
          </span>
        </div>
        <div className="mt-1.5">
          <DotGrid count={onlyUs} color="#22d3ee" />
        </div>
      </div>
      <div>
        <div className="flex items-baseline gap-1">
          <span className="font-mono text-lg font-semibold text-zinc-300">
            {both}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
            both
          </span>
        </div>
        <div className="mt-1.5">
          <DotGrid count={both} color="#a1a1aa" />
        </div>
      </div>
      <div>
        <div className="flex items-baseline gap-1">
          <span className="font-mono text-lg font-semibold text-zinc-500">
            {onlyThem}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
            only them
          </span>
        </div>
        <div className="mt-1.5">
          <DotGrid count={onlyThem} color="#52525b" muted />
        </div>
      </div>
    </div>
  );
}

export default function ComparisonsIndex() {
  return (
    <MarketingShell>
      <section className="relative py-20 sm:py-28">
        <div
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] opacity-25"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(34,211,238,0.18) 0%, rgba(34,211,238,0) 70%)",
          }}
        />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <p className="mb-3 font-mono text-sm text-cyan-400">Compare</p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            FeedbackIQ vs. everyone else
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400 leading-relaxed">
            Every other feedback tool stops at the PM handoff. We keep going — Claude
            reads the feedback, writes the PR, opens it on your repo. Here&rsquo;s
            how we stack up against the incumbents.
          </p>
        </div>
      </section>

      <section className="relative pb-24 sm:pb-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {competitors.map((c) => (
              <Link
                key={c.slug}
                href={`/vs/${c.slug}`}
                className="glow-card group relative block overflow-hidden rounded-xl bg-[var(--bg-card)]"
              >
                <CardVisual c={c} />
                <div className="p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold">
                        FeedbackIQ vs. {c.name}
                      </h2>
                      <p className="mt-1 font-mono text-xs text-cyan-400">
                        {c.tagline}
                      </p>
                    </div>
                    <svg
                      className="mt-1 h-4 w-4 shrink-0 text-zinc-500 transition-all group-hover:translate-x-1 group-hover:text-cyan-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-zinc-400">
                    {c.summary}
                  </p>
                  <Stats c={c} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
