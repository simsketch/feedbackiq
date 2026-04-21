import "dotenv/config";
import { writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { competitors } from "../src/content/competitors";
import { posts } from "../src/content/blog";

const MODEL = "gemini-2.5-flash-image";
const API_KEY = process.env.NANO_BANANA_GEMINI_KEY || process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error("Missing NANO_BANANA_GEMINI_KEY / GEMINI_API_KEY");
  process.exit(1);
}

const OUT_DIR = join(process.cwd(), "public", "og");

const BRAND_STYLE = [
  "Dark zinc-950 background (#09090b) with subtle grid texture.",
  "Cyan-to-blue gradient glow (#22d3ee → #3b82f6) as the focal light source.",
  "Editorial, technical, minimal. No text overlays. Negative space friendly.",
  "Soft volumetric light, clean glass morphism surfaces with subtle noise.",
  "Wide aspect ratio suitable for a 1200x630 OpenGraph card.",
  "No logos, no watermarks, no words. Pure visual metaphor.",
].join(" ");

const SHARED_STYLE =
  "Highly detailed futuristic isometric 3D illustration, 30-degree isometric perspective, pixel-crisp edges, editorial tech magazine quality. Deep zinc-950 / near-black background (#09090b), cyan (#22d3ee) and electric blue (#3b82f6) as primary accents, volumetric rim lighting, subtle hexagonal lattice, cinematic bloom, soft ambient occlusion, balanced negative space, 1200x630 composition. No watermarks, no logos, no additional text unless explicitly specified in the scene description. Feels like: Apple keynote × Blade Runner 2049 × modern dev-tool marketing hero.";

const BLOG_PROMPT_OVERRIDES: Record<string, string> = {
  "deduping-feedback-with-pgvector": `${SHARED_STYLE} Scene: a dark floating platform in deep cyberspace. Dozens of translucent glass-like holographic bubbles float above it — each bubble clearly displays the glowing red text '500 ERROR' in bold futuristic typography, seen from the isometric angle. The bubbles are visibly duplicates of each other, arranged in a swirling cloud. A single massive central glowing cyan orb (a 'vector embedding' sphere) pulses in the middle of the platform, magnetically attracting the bubbles. Bubbles near the orb dissolve into cyan particle streams and merge into one clean consolidated bubble that rises out the top, labeled with a single '500 ERROR' in calmer cyan. Hazard red (#ef4444) only on the incoming error bubbles.`,

  "linkedin-inspiration-to-saas": `${SHARED_STYLE} Scene: a lone isometric workstation floating in deep space at midnight. A holographic rectangular social-media post panel glows in front of it, showing an abstract play button and a tiny animated feedback form morphing into a pull request card with a branching git-graph trail. A single lightbulb made of pure cyan plasma ignites above the workstation, sending cyan sparks that trace forward into the future toward a stylized holographic app icon. Feels like the moment an idea becomes a product.`,

  "picking-the-stack": `${SHARED_STYLE} Scene: an isometric cutaway of a futuristic server rack sitting on a dark glass platform. Each blade of the rack is a different translucent glowing module connected by luminous cyan data conduits: one module shaped like a black N on a white tile (framework), one triangular module (edge host), one leaf-shaped module (database), one lock module (auth), one rounded-rectangle module labeled with a minimalist gateway glyph (AI). Cables of light flow between them in a clean topology. Subtle particles, crisp engineering blueprint feel.`,

  "one-line-widget": `${SHARED_STYLE} Scene: an isometric laptop rendered as a wireframe sits on a dark grid floor. A single glowing cyan line of code descends from a floating <script> tag in the sky and threads cleanly into the laptop, where it blossoms into a small perfectly round pill-shaped feedback widget button hovering in the corner of the screen. A translucent Shadow DOM bubble envelopes the button like a glass cocoon, protecting it from overlapping CSS rays emitted by the surrounding host page. Minimalist, elegant, 'one line' as the hero.`,

  "detecting-site-theme": `${SHARED_STYLE} Scene: an isometric holographic browser window is being scanned by a horizontal cyan laser. The laser extracts colored swatches (brand color, background tone, font glyph, rounded-corner sample) which rise up into a floating glass palette-card above the browser. From the palette, a tiny pill-shaped feedback widget on the corner of the browser is re-painted in real time to match the sampled colors. Soft particle trails between the swatches and the widget, very 'style transfer' in feel.`,

  "auto-tagging-feedback": `${SHARED_STYLE} Scene: a single translucent glass feedback card floats above a dark isometric platform. Around it, a slowly rotating holographic hexagonal ring holds several glowing tag-chips (bug, feature, high, checkout, mobile) as cyan crystal shards. Magnetic cyan tracers fly from the feedback card and snap onto the correct tags, sorting them. A small translucent Zod-schema scroll unrolls beside the card, showing a stylized structured shape (no readable code, just a schematic outline). Looks like intelligent magnetic sorting.`,

  "claude-opens-the-pr": `${SHARED_STYLE} Scene: an isometric dark forge chamber. A holographic anvil sits at the center, and floating above it is a translucent glowing pull-request card being shaped by streams of cyan code particles pouring out of a higher luminous orb representing an agent. Sparks fly as the anvil strikes. To the side, a small holographic console shows a stylized green checkmark and a compile-pass indicator. The whole scene suggests an agent actually crafting a reviewable artifact, not a toy.`,

  "upvote-routing": `${SHARED_STYLE} Scene: two isometric translucent feedback cards sit side by side on a dark platform, connected by a glowing cyan chain-link binding them as parent and duplicate-child. A stream of upward-pointing vote arrows (↑) flows from the child card, curves around it like a helix, and terminates inside the parent card where a large counter glows with aggregated votes. The child card is slightly dimmer and tagged with a small 'duplicate' ring; the parent is brighter and crowned with subtle cyan aura.`,

  "closing-the-loop-changelog": `${SHARED_STYLE} Scene: an isometric conveyor pipeline on a dark platform. On the left, a translucent pull-request card marked with a green 'merged' ring enters the belt. In the middle, the belt produces a glowing holographic changelog page as an output. On the right, the changelog fans out into a beautiful arc of tiny paper-plane envelope glyphs launching upward toward a constellation of user avatars scattered in the cyber-sky. A subtle RSS-feed icon glows at the corner.`,

  "liquid-glass-ui": `${SHARED_STYLE} Scene: a beautifully art-directed isometric gallery of floating glass UI components on a dark gallery plinth. The hero element is a large glass pill-shaped button with a conic-gradient cyan 'snake' of light chasing around its border in motion-blur trails. Around it float other glass cards at layered depths, each with soft backdrop-blur, a subtle inner highlight, and tiny grain-noise textures. Lighting is studio-product-photography caliber. The scene is an homage to modern liquid-glass design language.`,

  "pr-filter-url-sync": `${SHARED_STYLE} Scene: an isometric dashboard panel floats above a dark platform, displaying a vertically scrolling list of pull-request rows rendered as translucent cyan cards. At the top of the panel, a glowing search field emits a narrow cyan beam that traces down through the list, highlighting matching rows while others fade to half-opacity. A small URL-bar glyph floats above the panel with its query string updating in real time, connected by a dotted luminous line to the search field — showing that the URL is the source of truth.`,

  "seo-llms-og-nano-banana": `${SHARED_STYLE} Scene: a dark isometric web-of-routes floor — a spider-web of luminous cyan paths connecting small holographic node-cards labeled abstractly as home, vs, blog, robots, sitemap, and a single llms node glowing brighter than the rest. Above the web, a softly spinning 'nano-banana' orb (a stylized Gemini-like crystal) emits a ray that paints a freshly generated OG card floating into an /og/ slot on the web. Clean, systematic, mapping-of-the-site feel.`,
};

interface ImageJob {
  slug: string;
  prompt: string;
  outFile: string;
}

function buildJobs(): ImageJob[] {
  const jobs: ImageJob[] = [
    {
      slug: "default",
      outFile: join(OUT_DIR, "default.png"),
      prompt:
        "A glowing chat bubble rising out of a lattice of code, transforming into a branching git graph. Feels like 'feedback becoming shipped software.' " +
        BRAND_STYLE,
    },
  ];

  for (const c of competitors) {
    jobs.push({
      slug: `vs-${c.slug}`,
      outFile: join(OUT_DIR, `vs-${c.slug}.png`),
      prompt:
        `A visual metaphor of a split: on one side an abstract floating feedback inbox, on the other side a merged pull request. Title-less. Suggests "FeedbackIQ vs. ${c.name}" without any words. ` +
        BRAND_STYLE,
    });
  }

  for (const p of posts) {
    const override = BLOG_PROMPT_OVERRIDES[p.slug];
    jobs.push({
      slug: `blog-${p.slug}`,
      outFile: join(OUT_DIR, `blog-${p.slug}.png`),
      prompt:
        override ??
        `Editorial tech illustration for a blog post titled "${p.title}". Concept: ${p.description} Render as abstract, symbolic, not literal. ` +
          BRAND_STYLE,
    });
  }

  return jobs;
}

async function generate(prompt: string): Promise<Buffer> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gemini API ${res.status}: ${body.slice(0, 500)}`);
  }

  const json = (await res.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{ inlineData?: { data?: string; mimeType?: string } }>;
      };
    }>;
  };

  const parts = json.candidates?.[0]?.content?.parts ?? [];
  const imagePart = parts.find((p) => p.inlineData?.data);
  if (!imagePart?.inlineData?.data) {
    throw new Error(
      `No image returned. Response: ${JSON.stringify(json).slice(0, 500)}`
    );
  }

  return Buffer.from(imagePart.inlineData.data, "base64");
}

async function main() {
  const onlySlug = process.argv[2];
  const jobs = buildJobs().filter((j) => !onlySlug || j.slug === onlySlug);

  if (jobs.length === 0) {
    console.error(`No jobs matched slug "${onlySlug}".`);
    process.exit(1);
  }

  console.log(`Generating ${jobs.length} images with ${MODEL}...`);

  for (const job of jobs) {
    try {
      console.log(`→ ${job.slug}`);
      const buf = await generate(job.prompt);
      await mkdir(dirname(job.outFile), { recursive: true });
      await writeFile(job.outFile, buf);
      console.log(`  ✓ ${job.outFile} (${(buf.byteLength / 1024).toFixed(1)} KB)`);
    } catch (err) {
      console.error(`  ✗ ${job.slug}:`, err instanceof Error ? err.message : err);
    }
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
