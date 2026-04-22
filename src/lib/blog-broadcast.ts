import { prisma } from "./prisma";
import { sendBlogBroadcast } from "./email";
import { getUnsubscribeUrl } from "./unsubscribe";
import { posts } from "@/content/blog";
import { SITE_URL } from "./seo";

export interface BroadcastResult {
  processed: number;
  sent: number;
  errors: number;
  details: Array<{ slug: string; sent: number; errors: number }>;
}

export async function runBlogBroadcast(
  opts: { force?: boolean } = {}
): Promise<BroadcastResult> {
  const now = Date.now();
  const maxAgeMs = 14 * 24 * 60 * 60 * 1000;
  const candidates = posts.filter((p) => {
    const ageMs = now - new Date(p.date).getTime();
    return ageMs >= 0 && ageMs <= maxAgeMs;
  });

  const existing = await prisma.blogBroadcast.findMany({
    where: { slug: { in: candidates.map((p) => p.slug) } },
    select: { slug: true },
  });
  const alreadyBroadcast = new Set(existing.map((b) => b.slug));

  const toSend = opts.force
    ? candidates
    : candidates.filter((p) => !alreadyBroadcast.has(p.slug));

  const result: BroadcastResult = {
    processed: toSend.length,
    sent: 0,
    errors: 0,
    details: [],
  };

  if (toSend.length === 0) return result;

  const subscribers = await prisma.waitlistSignup.findMany({
    where: { unsubscribed: false },
    select: { id: true, email: true },
  });

  for (const post of toSend) {
    let postSent = 0;
    let postErrors = 0;
    const postUrl = `${SITE_URL}/blog/${post.slug}`;
    const heroImageUrl = post.heroImage ? `${SITE_URL}${post.heroImage}` : null;

    for (const sub of subscribers) {
      const out = await sendBlogBroadcast({
        to: sub.email,
        postTitle: post.title,
        postDescription: post.description,
        postUrl,
        heroImageUrl,
        unsubscribeUrl: getUnsubscribeUrl(sub.email),
      });
      if (out.sent) postSent += 1;
      else postErrors += 1;
    }

    await prisma.blogBroadcast.upsert({
      where: { slug: post.slug },
      create: { slug: post.slug, sentCount: postSent },
      update: { sentCount: postSent, broadcastAt: new Date() },
    });

    result.sent += postSent;
    result.errors += postErrors;
    result.details.push({ slug: post.slug, sent: postSent, errors: postErrors });
  }

  return result;
}
