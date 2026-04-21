import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import MarketingShell from "@/components/marketing-shell";
import { buildMetadata, SITE_URL } from "@/lib/seo";
import {
  competitors,
  getCompetitor,
  type CellValue,
  type Competitor,
} from "@/content/competitors";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return competitors.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const c = getCompetitor(slug);
  if (!c) return buildMetadata({ title: "Comparison not found", path: `/vs/${slug}` });
  return buildMetadata({
    title: `FeedbackIQ vs. ${c.name}`,
    description: `Side-by-side: ${c.name} (${c.tagline}) vs. FeedbackIQ. ${c.ourPitch}`,
    path: `/vs/${c.slug}`,
    image: `${SITE_URL}/og/vs-${c.slug}.png`,
  });
}

function Cell({ value }: { value: CellValue }) {
  if (value === true) {
    return (
      <div className="flex items-center justify-center">
        <svg
          className="h-5 w-5 text-cyan-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>
    );
  }
  if (value === false) {
    return (
      <div className="flex items-center justify-center">
        <svg
          className="h-5 w-5 text-zinc-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
    );
  }
  return <span className="text-sm text-zinc-300">{value}</span>;
}

function ComparisonSchema({ competitor }: { competitor: Competitor }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `FeedbackIQ vs. ${competitor.name}`,
    url: `${SITE_URL}/vs/${competitor.slug}`,
    description: competitor.ourPitch,
    mainEntity: {
      "@type": "SoftwareApplication",
      name: "FeedbackIQ",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
  };
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default async function ComparisonPage({ params }: PageProps) {
  const { slug } = await params;
  const competitor = getCompetitor(slug);
  if (!competitor) notFound();

  return (
    <MarketingShell>
      <ComparisonSchema competitor={competitor} />
      <section className="relative py-20 sm:py-28">
        <div
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] opacity-25"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(34,211,238,0.18) 0%, rgba(34,211,238,0) 70%)",
          }}
        />
        <div className="relative mx-auto max-w-4xl px-6">
          <Link
            href="/vs"
            className="inline-flex items-center gap-1 font-mono text-xs text-zinc-500 transition-colors hover:text-cyan-400"
          >
            ← All comparisons
          </Link>
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">
            FeedbackIQ vs.{" "}
            <span className="gradient-text">{competitor.name}</span>
          </h1>
          <p className="mt-4 font-mono text-sm text-cyan-400">{competitor.tagline}</p>
          <p className="mt-6 text-lg leading-relaxed text-zinc-400">
            {competitor.summary}
          </p>
        </div>
      </section>

      <section className="relative pb-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="glow-card rounded-xl bg-[var(--bg-card)] p-6">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-cyan-400/10 font-mono text-xs text-cyan-400">
                  F
                </span>
                <h2 className="text-base font-semibold">The FeedbackIQ case</h2>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-zinc-300">
                {competitor.ourPitch}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-6">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-zinc-800 font-mono text-xs text-zinc-400">
                  {competitor.name.charAt(0)}
                </span>
                <h2 className="text-base font-semibold text-zinc-200">
                  The {competitor.name} case
                </h2>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                {competitor.theirPitch}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative pb-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-6 text-2xl font-bold tracking-tight">
            Feature-by-feature
          </h2>
          <div className="glow-card overflow-hidden rounded-xl bg-[var(--bg-card)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800/70 text-left text-xs uppercase tracking-wider text-zinc-500">
                  <th className="py-3 pl-5 pr-4 font-mono font-normal">Feature</th>
                  <th className="py-3 px-4 text-center font-mono font-normal">
                    FeedbackIQ
                  </th>
                  <th className="py-3 pl-4 pr-5 text-center font-mono font-normal">
                    {competitor.name}
                  </th>
                </tr>
              </thead>
              <tbody>
                {competitor.rows.map((row, idx) => (
                  <tr
                    key={row.feature}
                    className={
                      idx === competitor.rows.length - 1
                        ? ""
                        : "border-b border-zinc-800/40"
                    }
                  >
                    <td className="py-3 pl-5 pr-4 text-zinc-300">{row.feature}</td>
                    <td className="py-3 px-4 text-center">
                      <Cell value={row.us} />
                    </td>
                    <td className="py-3 pl-4 pr-5 text-center">
                      <Cell value={row.them} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="relative pb-24 sm:pb-32">
        <div className="mx-auto max-w-4xl px-6">
          <div className="rounded-xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/5 to-blue-500/5 p-8">
            <p className="mb-3 font-mono text-sm text-cyan-400">Verdict</p>
            <p className="text-lg leading-relaxed text-zinc-200">
              {competitor.verdict}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-medium text-black transition-all hover:bg-zinc-200"
              >
                Start with FeedbackIQ
                <svg
                  className="h-4 w-4"
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
              </Link>
              <a
                href={competitor.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-800 px-6 py-3 text-sm font-medium text-zinc-300 transition-all hover:border-zinc-700 hover:text-white"
              >
                Visit {competitor.name}
              </a>
            </div>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
