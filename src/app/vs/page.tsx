import Link from "next/link";
import type { Metadata } from "next";
import MarketingShell from "@/components/marketing-shell";
import { buildMetadata } from "@/lib/seo";
import { competitors } from "@/content/competitors";

export const metadata: Metadata = buildMetadata({
  title: "FeedbackIQ vs. other feedback tools",
  description:
    "Honest side-by-side comparisons between FeedbackIQ and Canny, Featurebase, UserVoice, and Productboard.",
  path: "/vs",
});

export default function ComparisonsIndex() {
  return (
    <MarketingShell>
      <section className="relative py-20 sm:py-28">
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] opacity-25"
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
                className="glow-card group block rounded-xl bg-[var(--bg-card)] p-6 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">
                    FeedbackIQ vs. {c.name}
                  </h2>
                  <svg
                    className="h-4 w-4 text-zinc-500 transition-all group-hover:translate-x-1 group-hover:text-cyan-400"
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
                <p className="mt-1 font-mono text-xs text-cyan-400">{c.tagline}</p>
                <p className="mt-4 text-sm leading-relaxed text-zinc-400">
                  {c.summary}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
