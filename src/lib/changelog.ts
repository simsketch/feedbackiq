import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { sendChangelogNotification } from "@/lib/email";

const anthropic = new Anthropic();

function publicUrl(slug: string | null): string | null {
  if (!slug) return null;
  const base =
    process.env.NEXT_PUBLIC_APP_URL || "https://www.feedbackiq.app";
  return `${base.replace(/\/$/, "")}/c/${slug}`;
}

async function generateTitleAndBody(
  feedbackContent: string,
  prUrl: string | null
): Promise<{ title: string; body: string } | null> {
  const prompt = `You write short, friendly user-facing changelog entries for a SaaS product. A pull request was just merged based on user feedback. Write an entry describing what shipped.

Rules:
- Return JSON: {"title": "...", "body": "..."}
- Title: 4-8 words, sentence case, no period, no emoji
- Body: 1-2 sentences, plain language, present tense, describe the user-visible change. Do not mention commit hashes, file names, or internal details.
- Never invent features not implied by the feedback.

User feedback:
${feedbackContent}

PR URL: ${prUrl || "(none)"}

Respond with ONLY the JSON object.`;

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 400,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");

  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;

  try {
    const parsed = JSON.parse(match[0]);
    if (!parsed.title || !parsed.body) return null;
    return {
      title: String(parsed.title).slice(0, 120),
      body: String(parsed.body).slice(0, 800),
    };
  } catch {
    return null;
  }
}

export async function maybeGenerateChangelogEntry(
  pullRequestId: string,
  options: { force?: boolean } = {}
): Promise<{ entryId: string | null; reason?: string }> {
  const pr = await prisma.pullRequest.findUnique({
    where: { id: pullRequestId },
    include: {
      feedback: { include: { project: true } },
    },
  });

  if (!pr || !pr.feedback) return { entryId: null, reason: "pr not found" };
  if (pr.status !== "merged") return { entryId: null, reason: "pr not merged" };
  if (!pr.feedback.project.publicChangelog)
    return { entryId: null, reason: "changelog disabled" };

  const existing = await prisma.changelogEntry.findFirst({
    where: { pullRequestId: pr.id },
  });
  if (existing && !options.force)
    return { entryId: existing.id, reason: "already exists" };

  const generated = await generateTitleAndBody(
    pr.feedback.content,
    pr.githubPrUrl
  );
  if (!generated) return { entryId: null, reason: "generation failed" };

  const project = pr.feedback.project;
  const now = new Date();

  let entry;
  if (existing && options.force) {
    entry = await prisma.changelogEntry.update({
      where: { id: existing.id },
      data: {
        title: generated.title,
        body: generated.body,
        prUrl: pr.githubPrUrl,
      },
    });
  } else {
    entry = await prisma.changelogEntry.create({
      data: {
        projectId: project.id,
        feedbackId: pr.feedbackId,
        pullRequestId: pr.id,
        title: generated.title,
        body: generated.body,
        prUrl: pr.githubPrUrl,
        status: project.changelogAutoPublish ? "published" : "draft",
        publishedAt: now,
      },
    });
  }

  if (entry.status === "published") {
    await notifyIfPossible(entry.id);
  }

  return { entryId: entry.id };
}

export async function publishChangelogEntry(
  entryId: string
): Promise<{ ok: boolean; reason?: string }> {
  const entry = await prisma.changelogEntry.findUnique({
    where: { id: entryId },
  });
  if (!entry) return { ok: false, reason: "not found" };
  if (entry.status === "published") return { ok: true, reason: "already published" };

  await prisma.changelogEntry.update({
    where: { id: entryId },
    data: { status: "published", publishedAt: new Date() },
  });

  await notifyIfPossible(entryId);
  return { ok: true };
}

async function notifyIfPossible(entryId: string): Promise<void> {
  const entry = await prisma.changelogEntry.findUnique({
    where: { id: entryId },
    include: {
      project: { select: { name: true, publicSlug: true } },
    },
  });
  if (!entry || entry.notifiedAt) return;
  if (!entry.feedbackId) return;

  const feedback = await prisma.feedback.findUnique({
    where: { id: entry.feedbackId },
    select: { submitterEmail: true },
  });
  if (!feedback?.submitterEmail) return;

  const { sent } = await sendChangelogNotification({
    to: feedback.submitterEmail,
    projectName: entry.project.name,
    title: entry.title,
    body: entry.body,
    publicUrl: publicUrl(entry.project.publicSlug),
    prUrl: entry.prUrl,
  });

  if (sent) {
    await prisma.changelogEntry.update({
      where: { id: entryId },
      data: { notifiedAt: new Date() },
    });
  }
}
