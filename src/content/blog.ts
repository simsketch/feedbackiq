import type { ReactNode } from "react";

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  author: string;
  date: string;
  readingMinutes: number;
  heroImage?: string;
  render: () => ReactNode;
}

import DedupePost from "./blog-posts/deduping-feedback-with-pgvector";
import LinkedInInspiration from "./blog-posts/linkedin-inspiration-to-saas";
import PickingStack from "./blog-posts/picking-the-stack";
import OneLineWidget from "./blog-posts/one-line-widget";
import DetectingSiteTheme from "./blog-posts/detecting-site-theme";
import AutoTagging from "./blog-posts/auto-tagging-feedback";
import ClaudeOpensThePr from "./blog-posts/claude-opens-the-pr";
import UpvoteRouting from "./blog-posts/upvote-routing";
import ChangelogLoop from "./blog-posts/closing-the-loop-changelog";
import LiquidGlassUi from "./blog-posts/liquid-glass-ui";
import PrFilter from "./blog-posts/pr-filter-url-sync";
import SeoLlmsOgPost from "./blog-posts/seo-llms-og-nano-banana";

export const posts: BlogPost[] = [
  {
    slug: "linkedin-inspiration-to-saas",
    title: "How a LinkedIn post at midnight became a SaaS",
    description:
      "A short demo video showed a feedback form spinning up a GitHub PR in real time. The commenters called it a toy. They were wrong, and here's why that 30-second clip became FeedbackIQ.",
    author: "FeedbackIQ team",
    date: "2026-01-08",
    readingMinutes: 5,
    heroImage: "/og/blog-linkedin-inspiration-to-saas.png",
    render: LinkedInInspiration,
  },
  {
    slug: "picking-the-stack",
    title: "Picking the stack for a solo-founder SaaS that needs to scale",
    description:
      "Next.js 16 with Turbopack, Prisma on Neon, Clerk, Vercel AI Gateway, Resend. Why each, and what I deliberately did not pick.",
    author: "FeedbackIQ team",
    date: "2026-01-20",
    readingMinutes: 6,
    heroImage: "/og/blog-picking-the-stack.png",
    render: PickingStack,
  },
  {
    slug: "one-line-widget",
    title: "A one-line embed: rebuilding the feedback widget in vanilla JS",
    description:
      "Shadow DOM, 7KB gzipped, lazy-loaded screenshot capture, offline queue, and zero framework runtime. The smallest piece of code and the most scrutinized-at-3am piece of code.",
    author: "FeedbackIQ team",
    date: "2026-02-02",
    readingMinutes: 6,
    heroImage: "/og/blog-one-line-widget.png",
    render: OneLineWidget,
  },
  {
    slug: "detecting-site-theme",
    title: "Auto-detecting a site's theme so the widget doesn't look pasted-in",
    description:
      "Reading CSS custom properties, sampling existing buttons, deriving panel chrome from background luminance. How the widget paints itself to match whichever site it's embedded on.",
    author: "FeedbackIQ team",
    date: "2026-02-14",
    readingMinutes: 5,
    heroImage: "/og/blog-detecting-site-theme.png",
    render: DetectingSiteTheme,
  },
  {
    slug: "auto-tagging-feedback",
    title: "Auto-tagging feedback: category, priority, tags — none typed by the user",
    description:
      "Structured outputs with Zod schemas, Claude Haiku on Vercel AI Gateway, project-aware tag hints, and a hand-written priority rubric that keeps the model from either under- or overreacting.",
    author: "FeedbackIQ team",
    date: "2026-02-26",
    readingMinutes: 6,
    heroImage: "/og/blog-auto-tagging-feedback.png",
    render: AutoTagging,
  },
  {
    slug: "claude-opens-the-pr",
    title: "Letting Claude open real pull requests from your feedback inbox",
    description:
      "GitHub App installation, short-lived per-repo tokens, an agent loop that typechecks before committing, branch reuse with force-push, and auto-mode vs review-only semantics.",
    author: "FeedbackIQ team",
    date: "2026-03-10",
    readingMinutes: 7,
    heroImage: "/og/blog-claude-opens-the-pr.png",
    render: ClaudeOpensThePr,
  },
  {
    slug: "upvote-routing",
    title: "Upvote routing: when duplicates exist, the parent wins",
    description:
      "Toggle semantics, duplicate-aware target ID, optimistic updates, localStorage-backed voter state, and the tiny invariant that keeps the public roadmap sane.",
    author: "FeedbackIQ team",
    date: "2026-03-20",
    readingMinutes: 5,
    heroImage: "/og/blog-upvote-routing.png",
    render: UpvoteRouting,
  },
  {
    slug: "closing-the-loop-changelog",
    title: "Closing the loop: merged PRs → changelog → upvoter emails → RSS",
    description:
      "GitHub webhook verification, LLM-written changelog drafts a human reviews, Resend for fan-out, and a first-class Atom feed because RSS is deeply uncool and still works.",
    author: "FeedbackIQ team",
    date: "2026-03-30",
    readingMinutes: 6,
    heroImage: "/og/blog-closing-the-loop-changelog.png",
    render: ChangelogLoop,
  },
  {
    slug: "liquid-glass-ui",
    title: "A liquid-glass UI pass: snake borders, noise, conic gradients",
    description:
      "Rotating conic-gradient borders with @property, backdrop-filter glow cards, SVG feTurbulence noise, and the things we deliberately didn't do. The CSS behind why the dashboard feels different.",
    author: "FeedbackIQ team",
    date: "2026-04-05",
    readingMinutes: 6,
    heroImage: "/og/blog-liquid-glass-ui.png",
    render: LiquidGlassUi,
  },
  {
    slug: "pr-filter-url-sync",
    title: "URL-synced filters for a PR list that actually scales",
    description:
      "searchParams as source of truth, 200ms-debounced URL writes, server-side Prisma filtering, a clear button that doesn't flash, and why client-side filtering fell over at 400 PRs.",
    author: "FeedbackIQ team",
    date: "2026-04-12",
    readingMinutes: 5,
    heroImage: "/og/blog-pr-filter-url-sync.png",
    render: PrFilter,
  },
  {
    slug: "seo-llms-og-nano-banana",
    title: "SEO without bloat: llms.txt, nano-banana OG images, a sitemap that knows about blog posts",
    description:
      "robots.ts, sitemap.ts, a programmatic llms.txt route, one buildMetadata helper, and Gemini 2.5 Flash Image generating unique OG cards for every marketing page.",
    author: "FeedbackIQ team",
    date: "2026-04-18",
    readingMinutes: 6,
    heroImage: "/og/blog-seo-llms-og-nano-banana.png",
    render: SeoLlmsOgPost,
  },
  {
    slug: "deduping-feedback-with-pgvector",
    title: "Deduping user feedback with pgvector and Vercel AI Gateway",
    description:
      "How we kill '500 error' spam on the public roadmap: cosine similarity on OpenAI embeddings, HNSW indexes on Neon, auto-link above 0.92, and a dashboard review queue for the gray zone.",
    author: "FeedbackIQ team",
    date: "2026-04-21",
    readingMinutes: 7,
    heroImage: "/og/blog-deduping-feedback-with-pgvector.png",
    render: DedupePost,
  },
];

// Newest first for the index
posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export function getPost(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}
