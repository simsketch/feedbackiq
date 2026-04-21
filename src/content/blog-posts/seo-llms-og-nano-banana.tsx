export default function SeoLlmsOgNanoBanana() {
  return (
    <>
      <p>
        SEO on a modern SaaS marketing site is about three things: the
        comparison page for every incumbent, a technical blog with actual
        signal, and the machine-readable surface that models (both
        crawler and agent) use to understand what the product is. I put
        the third one off for way too long — this post is the catch-up.
      </p>

      <h2>The four files every marketing site owes its future</h2>
      <ul>
        <li>
          <code>robots.txt</code> — who&rsquo;s allowed where. Dashboard
          and <code>/api</code> are disallowed, everything else is open.
        </li>
        <li>
          <code>sitemap.xml</code> — the canonical map of public URLs,
          regenerated from static content (competitors, blog posts) on
          every build.
        </li>
        <li>
          <code>llms.txt</code> — the emerging standard from{" "}
          <a href="https://llmstxt.org/">llmstxt.org</a> for giving LLMs a
          structured summary of the site. Ignored by most crawlers today,
          read by agents increasingly often.
        </li>
        <li>
          OpenGraph + Twitter + JSON-LD on every page. Nothing clever —
          just consistent.
        </li>
      </ul>
      <p>
        In Next.js 16 these are all one file each. <code>robots.ts</code>{" "}
        and <code>sitemap.ts</code> export functions that return typed
        objects; <code>llms.txt</code> is a route handler returning
        plain text; metadata is an exported const per page.
      </p>

      <h2>One helper, every page</h2>
      <p>
        Every page&rsquo;s metadata flows through a single{" "}
        <code>buildMetadata()</code> helper. It takes a title,
        description, path, optional image, optional{" "}
        <code>type: &ldquo;article&rdquo;</code>, and returns the full
        Next.js <code>Metadata</code> object with canonical URL,
        OpenGraph, Twitter, and optional <code>noIndex</code>. The result
        is that adding a new marketing page takes three lines of
        config and never ships with a broken OG card.
      </p>
      <pre>
        <code>{`export const metadata: Metadata = buildMetadata({
  title: "FeedbackIQ vs. Canny",
  description: "Side-by-side: Canny's roadmap tool vs. FeedbackIQ's code-generating pipeline.",
  path: "/vs/canny",
  image: \`\${SITE_URL}/og/vs-canny.png\`,
});`}</code>
      </pre>

      <h2>OG images from Gemini 2.5 Flash Image (&ldquo;nano-banana&rdquo;)</h2>
      <p>
        OG cards used to be the first thing I cut when shipping a new
        page. They&rsquo;re nobody&rsquo;s favorite work, and fonts in
        SVG templates are a special kind of pain. Gemini 2.5 Flash Image —
        colloquially <em>nano-banana</em> — made the cost of
        &ldquo;generate a custom OG card for this page&rdquo; drop to
        about two cents and zero design time.
      </p>
      <p>
        We have a script at <code>scripts/generate-hero-images.ts</code>{" "}
        that reads the competitors and blog posts, builds a prompt for
        each one, and writes the resulting PNGs into{" "}
        <code>public/og/</code>. The default prompt is generic-brand; any
        slug with strong opinions can register an override in a{" "}
        <code>BLOG_PROMPT_OVERRIDES</code> map.
      </p>
      <pre>
        <code>{`const res = await fetch(
  \`https://generativelanguage.googleapis.com/v1beta/models/\${MODEL}:generateContent?key=\${API_KEY}\`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  }
);

const json = await res.json();
const b64 = json.candidates[0].content.parts.find(p => p.inlineData?.data).inlineData.data;
await writeFile(outFile, Buffer.from(b64, "base64"));`}</code>
      </pre>
      <p>
        The generic prompt nails ~60% of the cards. The rest get a
        hand-written override that reads more like a film brief than a
        prompt — isometric, futuristic, specific symbolism. Nano-banana
        is surprisingly good at following long visual prompts; almost
        all the iteration time is on the prompt, not the output.
      </p>

      <h2>llms.txt without ceremony</h2>
      <p>
        <code>/llms.txt</code> is a simple GET route that assembles a
        markdown-ish summary of what FeedbackIQ is, how it works, and
        links to every public page — comparison pages, blog posts, the
        home page. It&rsquo;s cacheable (<code>s-maxage=3600</code>) and
        regenerates on deploy because the source arrays{" "}
        (<code>competitors</code>, <code>posts</code>) are bundled at
        build time.
      </p>
      <pre>
        <code>{`export const dynamic = "force-static";

export async function GET() {
  const lines: string[] = ["# FeedbackIQ", "", "> ...summary...", ""];
  lines.push("## Pages");
  lines.push(\`- [Home](\${SITE_URL})\`);
  for (const c of competitors) lines.push(\`- [vs \${c.name}](\${SITE_URL}/vs/\${c.slug})\`);
  for (const p of posts)       lines.push(\`- [\${p.title}](\${SITE_URL}/blog/\${p.slug})\`);
  return new Response(lines.join("\\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}`}</code>
      </pre>

      <h2>Structured data on comparisons and posts</h2>
      <p>
        Each <code>/vs/[slug]</code> page emits a <code>WebPage</code>{" "}
        JSON-LD block with the FeedbackIQ <code>SoftwareApplication</code>{" "}
        as the main entity. Each blog post emits a <code>BlogPosting</code>
        block with author, datePublished, and headline. It&rsquo;s
        inline-scripted, not loaded from a CDN, because schema.org is
        literally just strings and shipping strings does not warrant a
        network round-trip.
      </p>

      <h2>What we got wrong</h2>
      <p>
        The first sitemap pointed at <code>/dashboard</code> and every
        authenticated route. Everyone who&rsquo;s shipped Next.js
        before has done this at least once. Fix: filter the list to
        public routes before returning, and add <code>noIndex</code>{" "}
        via <code>buildMetadata</code> on everything behind auth. The
        crawler politeness cost of getting this wrong is small; the
        accidentally-leaking-private-urls cost is not.
      </p>
      <p>
        That wraps the first arc of the journey. The next arc is
        ingesting feedback from sources beyond the widget — Sentry,
        support tickets, server logs — and feeding them through the
        same dedupe and PR pipeline. The dedupe layer was the
        foundation. Everything else rides on it.
      </p>
    </>
  );
}
