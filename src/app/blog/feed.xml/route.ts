import { posts } from "@/content/blog";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/seo";

export const dynamic = "force-static";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const feedUrl = `${SITE_URL}/blog/feed.xml`;
  const blogUrl = `${SITE_URL}/blog`;
  const updated =
    posts[0]?.date
      ? new Date(posts[0].date).toISOString()
      : new Date().toISOString();

  const entries = posts
    .map((p) => {
      const postUrl = `${SITE_URL}/blog/${p.slug}`;
      const iso = new Date(p.date).toISOString();
      return `  <entry>
    <id>${escapeXml(postUrl)}</id>
    <title>${escapeXml(p.title)}</title>
    <link href="${escapeXml(postUrl)}"/>
    <updated>${iso}</updated>
    <published>${iso}</published>
    <author><name>${escapeXml(p.author)}</name></author>
    <summary type="text">${escapeXml(p.description)}</summary>
  </entry>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <id>${escapeXml(blogUrl)}</id>
  <title>${escapeXml(SITE_NAME)} Blog</title>
  <subtitle>${escapeXml(SITE_DESCRIPTION)}</subtitle>
  <link href="${escapeXml(blogUrl)}"/>
  <link rel="self" href="${escapeXml(feedUrl)}"/>
  <updated>${updated}</updated>
${entries}
</feed>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
