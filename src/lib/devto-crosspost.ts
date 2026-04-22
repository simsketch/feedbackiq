import { prisma } from "./prisma";
import { posts, type BlogPost } from "@/content/blog";
import { SITE_URL } from "./seo";

export interface CrosspostResult {
  processed: number;
  created: number;
  errors: number;
  details: Array<{
    slug: string;
    ok: boolean;
    externalUrl?: string;
    error?: string;
  }>;
}

const DEVTO_TAGS = ["ai", "nextjs", "buildinpublic", "saas"];

function buildBodyMarkdown(post: BlogPost): string {
  const canonical = `${SITE_URL}/blog/${post.slug}`;
  const heroSection = post.heroImage
    ? `![${post.title}](${SITE_URL}${post.heroImage})\n\n`
    : "";

  return `${heroSection}${post.description}

> Originally published on [feedbackiq.app](${canonical}). This is a short-form cross-post — the full post includes extra diagrams and code samples.

**[Read the full post on feedbackiq.app →](${canonical})**

---

### Why this might be interesting to you

FeedbackIQ is building the system we wish existed: a feedback widget that turns user reports into AI-authored pull requests, with pgvector dedupe, auto-tagging, and a closed-loop changelog. We're writing publicly about the engineering as we build it.

If that sounds useful, the full post lives at [${canonical}](${canonical}).
`;
}

export async function runDevtoCrosspost(
  opts: { force?: boolean } = {}
): Promise<CrosspostResult> {
  const apiKey = process.env.DEVTO_API_KEY;
  if (!apiKey) {
    return {
      processed: 0,
      created: 0,
      errors: 0,
      details: [],
    };
  }

  const existing = await prisma.blogCrosspost.findMany({
    where: { platform: "devto" },
    select: { slug: true },
  });
  const alreadyCrossposted = new Set(existing.map((c) => c.slug));

  const toProcess = opts.force
    ? posts
    : posts.filter((p) => !alreadyCrossposted.has(p.slug));

  const result: CrosspostResult = {
    processed: toProcess.length,
    created: 0,
    errors: 0,
    details: [],
  };

  for (const post of toProcess) {
    const canonical = `${SITE_URL}/blog/${post.slug}`;
    const body_markdown = buildBodyMarkdown(post);

    try {
      const res = await fetch("https://dev.to/api/articles", {
        method: "POST",
        headers: {
          "api-key": apiKey,
          "Content-Type": "application/json",
          "User-Agent": "FeedbackIQ-Crosspost/1.0",
        },
        body: JSON.stringify({
          article: {
            title: post.title,
            published: true,
            body_markdown,
            tags: DEVTO_TAGS,
            canonical_url: canonical,
            description: post.description,
            main_image: post.heroImage
              ? `${SITE_URL}${post.heroImage}`
              : undefined,
          },
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        result.errors += 1;
        result.details.push({
          slug: post.slug,
          ok: false,
          error: `HTTP ${res.status}: ${text.slice(0, 200)}`,
        });
        continue;
      }

      const data = (await res.json()) as {
        id?: number;
        url?: string;
      };

      await prisma.blogCrosspost.upsert({
        where: { slug_platform: { slug: post.slug, platform: "devto" } },
        create: {
          slug: post.slug,
          platform: "devto",
          externalId: data.id ? String(data.id) : null,
          externalUrl: data.url ?? null,
        },
        update: {
          externalId: data.id ? String(data.id) : null,
          externalUrl: data.url ?? null,
        },
      });

      result.created += 1;
      result.details.push({
        slug: post.slug,
        ok: true,
        externalUrl: data.url,
      });

      // dev.to rate limits; 1 post per ~30 seconds is safe.
      await new Promise((r) => setTimeout(r, 35_000));
    } catch (err) {
      result.errors += 1;
      result.details.push({
        slug: post.slug,
        ok: false,
        error: err instanceof Error ? err.message : "unknown",
      });
    }
  }

  return result;
}
