import Link from "next/link";
import type { Metadata } from "next";
import MarketingShell from "@/components/marketing-shell";
import { buildMetadata } from "@/lib/seo";
import { posts } from "@/content/blog";

export const metadata: Metadata = buildMetadata({
  title: "Blog",
  description:
    "Technical posts from the FeedbackIQ team — how we build the pipeline from user feedback to shipped PRs.",
  path: "/blog",
});

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogIndex() {
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
          <p className="mb-3 font-mono text-sm text-cyan-400">Engineering blog</p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Notes from the build
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400 leading-relaxed">
            We write when we ship something interesting. Deep dives on the
            pipeline, the infra, and the decisions behind turning user feedback
            into merged code.
          </p>
        </div>
      </section>

      <section className="relative pb-24 sm:pb-32">
        <div className="mx-auto max-w-4xl px-6">
          <div className="space-y-4">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="glow-card group block overflow-hidden rounded-xl bg-[var(--bg-card)] transition-colors"
              >
                {post.heroImage && (
                  <div className="relative aspect-[1200/630] overflow-hidden border-b border-zinc-800/50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.heroImage}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-zinc-500">
                      <span>{formatDate(post.date)}</span>
                      <span className="h-1 w-1 rounded-full bg-zinc-700" />
                      <span>{post.readingMinutes} min read</span>
                    </div>
                    <svg
                      className="h-4 w-4 shrink-0 text-zinc-500 transition-all group-hover:translate-x-1 group-hover:text-cyan-400"
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
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                    {post.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                    {post.description}
                  </p>
                  <p className="mt-4 font-mono text-xs text-zinc-500">
                    By {post.author}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
