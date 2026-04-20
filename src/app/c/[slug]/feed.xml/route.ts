import { prisma } from "@/lib/prisma";

export const revalidate = 60;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function baseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL || "https://www.feedbackiq.app"
  ).replace(/\/$/, "");
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const project = await prisma.project.findFirst({
    where: { publicSlug: slug, publicChangelog: true },
    select: { id: true, name: true },
  });

  if (!project) {
    return new Response("Not found", { status: 404 });
  }

  const entries = await prisma.changelogEntry.findMany({
    where: { projectId: project.id, status: "published" },
    orderBy: { publishedAt: "desc" },
    take: 50,
  });

  const origin = baseUrl();
  const feedUrl = `${origin}/c/${slug}/feed.xml`;
  const pageUrl = `${origin}/c/${slug}`;
  const updated =
    entries[0]?.publishedAt.toISOString() || new Date().toISOString();

  const entryXml = entries
    .map((entry) => {
      const entryUrl = `${pageUrl}#${entry.id}`;
      return `  <entry>
    <id>${escapeXml(entryUrl)}</id>
    <title>${escapeXml(entry.title)}</title>
    <link href="${escapeXml(entry.prUrl || entryUrl)}"/>
    <updated>${entry.publishedAt.toISOString()}</updated>
    <published>${entry.publishedAt.toISOString()}</published>
    <content type="text">${escapeXml(entry.body)}</content>
  </entry>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <id>${escapeXml(pageUrl)}</id>
  <title>${escapeXml(project.name)} changelog</title>
  <link href="${escapeXml(pageUrl)}"/>
  <link rel="self" href="${escapeXml(feedUrl)}"/>
  <updated>${updated}</updated>
${entryXml}
</feed>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
      "Cache-Control": "public, max-age=60, s-maxage=60",
    },
  });
}
