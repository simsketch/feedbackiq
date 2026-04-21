import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import MarketingShell from "@/components/marketing-shell";
import { buildMetadata, SITE_URL } from "@/lib/seo";
import { posts, getPost, type BlogPost } from "@/content/blog";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return buildMetadata({ title: "Post not found", path: `/blog/${slug}` });
  return buildMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
    image: post.heroImage ? `${SITE_URL}${post.heroImage}` : undefined,
    type: "article",
    publishedTime: new Date(post.date).toISOString(),
  });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function ArticleSchema({ post }: { post: BlogPost }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    author: { "@type": "Organization", name: post.author },
    datePublished: new Date(post.date).toISOString(),
    url: `${SITE_URL}/blog/${post.slug}`,
    image: post.heroImage ? `${SITE_URL}${post.heroImage}` : undefined,
    publisher: {
      "@type": "Organization",
      name: "FeedbackIQ",
      url: SITE_URL,
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

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const Content = post.render;

  return (
    <MarketingShell>
      <ArticleSchema post={post} />
      <article className="relative py-16 sm:py-24">
        <div
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-20"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(34,211,238,0.15) 0%, rgba(34,211,238,0) 70%)",
          }}
        />
        <div className="relative mx-auto max-w-3xl px-6">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1 font-mono text-xs text-zinc-500 transition-colors hover:text-cyan-400"
          >
            ← All posts
          </Link>
          <div className="mt-8 flex flex-wrap items-center gap-3 font-mono text-xs text-zinc-500">
            <span>{formatDate(post.date)}</span>
            <span className="h-1 w-1 rounded-full bg-zinc-700" />
            <span>{post.readingMinutes} min read</span>
            <span className="h-1 w-1 rounded-full bg-zinc-700" />
            <span>{post.author}</span>
          </div>
          <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            {post.title}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-zinc-400">
            {post.description}
          </p>

          <div className="prose prose-invert mt-12 max-w-none prose-headings:tracking-tight prose-h2:mt-12 prose-h2:text-2xl prose-h2:font-semibold prose-p:text-zinc-300 prose-p:leading-relaxed prose-li:text-zinc-300 prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline prose-code:rounded prose-code:bg-zinc-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:text-cyan-300 prose-code:before:content-none prose-code:after:content-none prose-pre:rounded-xl prose-pre:border prose-pre:border-zinc-800 prose-pre:bg-zinc-950 prose-pre:text-sm prose-strong:text-white">
            <Content />
          </div>

          <div className="mt-16 rounded-xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/5 to-blue-500/5 p-8">
            <p className="font-mono text-sm text-cyan-400">Try FeedbackIQ</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">
              Drop a widget on your site, ship PRs from feedback
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              Claude reads the report, writes the fix, opens the PR on your
              repo. Dedupe with pgvector so the backlog doesn&rsquo;t drown in
              duplicates.
            </p>
            <Link
              href="/signup"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-black transition-all hover:bg-zinc-200"
            >
              Start for free
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
          </div>
        </div>
      </article>
    </MarketingShell>
  );
}
