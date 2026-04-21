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
    jobs.push({
      slug: `blog-${p.slug}`,
      outFile: join(OUT_DIR, `blog-${p.slug}.png`),
      prompt:
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
