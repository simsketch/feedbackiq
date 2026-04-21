import { SITE_URL } from "@/lib/seo";
import { competitors } from "@/content/competitors";
import { posts } from "@/content/blog";

export const dynamic = "force-static";

export async function GET() {
  const lines: string[] = [];

  lines.push("# FeedbackIQ");
  lines.push("");
  lines.push(
    "> FeedbackIQ turns user feedback into shipped code. A widget captures feedback from a customer-facing site; Claude reads the report, writes the fix or feature, and opens a pull request on the connected GitHub repo. Built-in public roadmap, changelog, and vector-similarity deduplication."
  );
  lines.push("");
  lines.push("## How it works");
  lines.push(
    "1. Install the JS widget on your marketing or product site."
  );
  lines.push(
    "2. Users submit feedback (optional screenshot, auto-detected site theme)."
  );
  lines.push(
    "3. Submissions are auto-tagged with category, priority, and tags."
  );
  lines.push(
    "4. Embeddings (OpenAI text-embedding-3-small via Vercel AI Gateway) detect duplicates; auto-merge above 0.92 similarity, dashboard review between 0.80–0.92."
  );
  lines.push(
    "5. Claude Code runs as a GitHub App action on the connected repo, writes the PR, and links it back to the feedback."
  );
  lines.push(
    "6. Merged PRs auto-generate changelog entries; upvoters are notified via Resend."
  );
  lines.push("");
  lines.push("## Pages");
  lines.push(`- [Home](${SITE_URL})`);
  lines.push(`- [Comparisons index](${SITE_URL}/vs)`);
  for (const c of competitors) {
    lines.push(`- [vs ${c.name}](${SITE_URL}/vs/${c.slug})`);
  }
  lines.push(`- [Blog](${SITE_URL}/blog)`);
  for (const p of posts) {
    lines.push(`- [${p.title}](${SITE_URL}/blog/${p.slug})`);
  }
  lines.push("");
  lines.push("## Not indexed");
  lines.push(
    "- /dashboard — authenticated customer app"
  );
  lines.push("- /api — programmatic endpoints");
  lines.push("");

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
