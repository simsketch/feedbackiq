import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";

type Priority = "low" | "medium" | "high" | "urgent";

interface AutoTagResult {
  tags: string[];
  priority: Priority;
  category: string;
}

const ALLOWED_CATEGORIES = [
  "bug",
  "feature",
  "ux",
  "performance",
  "auth",
  "content",
  "other",
];

const anthropic = new Anthropic();

export async function autoTagFeedback(feedbackId: string): Promise<void> {
  const feedback = await prisma.feedback.findUnique({
    where: { id: feedbackId },
    select: { content: true, sourceUrl: true },
  });
  if (!feedback) return;

  const prompt = `Analyze this user feedback and return JSON with shape:
{"category": one of ${ALLOWED_CATEGORIES.join(", ")}, "priority": one of low|medium|high|urgent, "tags": array of 1-4 short lowercase keywords}

Feedback: ${feedback.content}
${feedback.sourceUrl ? `Source: ${feedback.sourceUrl}` : ""}

Respond with ONLY the JSON object, no prose.`;

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 200,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");

  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return;

  let parsed: AutoTagResult;
  try {
    parsed = JSON.parse(match[0]);
  } catch {
    return;
  }

  const priority: Priority = (
    ["low", "medium", "high", "urgent"] as const
  ).includes(parsed.priority)
    ? parsed.priority
    : "medium";

  const category = ALLOWED_CATEGORIES.includes(parsed.category)
    ? parsed.category
    : "other";

  const tags = Array.isArray(parsed.tags)
    ? parsed.tags
        .filter((t): t is string => typeof t === "string")
        .map((t) => t.toLowerCase().trim().slice(0, 24))
        .filter(Boolean)
        .slice(0, 4)
    : [];

  await prisma.feedback.update({
    where: { id: feedbackId },
    data: { tags, priority, category },
  });
}
