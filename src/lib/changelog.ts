import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";

const anthropic = new Anthropic();

export async function maybeGenerateChangelogEntry(
  pullRequestId: string
): Promise<void> {
  const pr = await prisma.pullRequest.findUnique({
    where: { id: pullRequestId },
    include: {
      feedback: {
        include: { project: true },
      },
    },
  });

  if (!pr || !pr.feedback) return;
  if (pr.status !== "merged") return;
  if (!pr.feedback.project.publicChangelog) return;

  const existing = await prisma.changelogEntry.findFirst({
    where: { pullRequestId: pr.id },
  });
  if (existing) return;

  const prompt = `You write short, friendly user-facing changelog entries for a SaaS product. A pull request was just merged based on user feedback. Write an entry describing what shipped.

Rules:
- Return JSON: {"title": "...", "body": "..."}
- Title: 4-8 words, sentence case, no period, no emoji
- Body: 1-2 sentences, plain language, present tense, describe the user-visible change. Do not mention commit hashes, file names, or internal details.
- Never invent features not implied by the feedback.

User feedback:
${pr.feedback.content}

PR URL: ${pr.githubPrUrl || "(none)"}

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
  if (!match) return;

  let parsed: { title?: string; body?: string };
  try {
    parsed = JSON.parse(match[0]);
  } catch {
    return;
  }

  if (!parsed.title || !parsed.body) return;

  await prisma.changelogEntry.create({
    data: {
      projectId: pr.feedback.projectId,
      feedbackId: pr.feedbackId,
      pullRequestId: pr.id,
      title: parsed.title.slice(0, 120),
      body: parsed.body.slice(0, 800),
      prUrl: pr.githubPrUrl,
    },
  });
}
