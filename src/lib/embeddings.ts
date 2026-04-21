import { embed } from "ai";
import { prisma } from "@/lib/prisma";

const EMBEDDING_MODEL = "openai/text-embedding-3-small";

export const DUPLICATE_AUTO_CONFIRM_THRESHOLD = 0.92;
export const DUPLICATE_SUGGEST_THRESHOLD = 0.8;

export async function generateEmbedding(text: string): Promise<number[]> {
  const trimmed = text.trim().slice(0, 8000);
  if (!trimmed) throw new Error("Cannot embed empty text");
  const { embedding } = await embed({
    model: EMBEDDING_MODEL,
    value: trimmed,
  });
  return embedding;
}

function toVectorLiteral(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}

export async function storeEmbedding(
  feedbackId: string,
  embedding: number[]
): Promise<void> {
  const literal = toVectorLiteral(embedding);
  await prisma.$executeRaw`
    UPDATE feedbackiq."Feedback"
    SET embedding = ${literal}::vector
    WHERE id = ${feedbackId}
  `;
}

export interface SimilarFeedback {
  id: string;
  similarity: number;
  duplicateOfId: string | null;
}

export async function findSimilarFeedback(
  projectId: string,
  embedding: number[],
  excludeId: string,
  limit = 5
): Promise<SimilarFeedback[]> {
  const literal = toVectorLiteral(embedding);
  const rows = await prisma.$queryRaw<
    Array<{ id: string; similarity: number; duplicateOfId: string | null }>
  >`
    SELECT
      id,
      "duplicateOfId",
      1 - (embedding <=> ${literal}::vector) AS similarity
    FROM feedbackiq."Feedback"
    WHERE "projectId" = ${projectId}
      AND id <> ${excludeId}
      AND embedding IS NOT NULL
    ORDER BY embedding <=> ${literal}::vector
    LIMIT ${limit}
  `;
  return rows.map((r) => ({
    id: r.id,
    similarity: Number(r.similarity),
    duplicateOfId: r.duplicateOfId,
  }));
}

export async function dedupeFeedback(feedbackId: string): Promise<void> {
  const feedback = await prisma.feedback.findUnique({
    where: { id: feedbackId },
    select: { id: true, projectId: true, content: true },
  });
  if (!feedback) return;

  const embedding = await generateEmbedding(feedback.content);
  await storeEmbedding(feedback.id, embedding);

  const neighbors = await findSimilarFeedback(
    feedback.projectId,
    embedding,
    feedback.id,
    5
  );

  const best = neighbors[0];
  if (!best || best.similarity < DUPLICATE_SUGGEST_THRESHOLD) return;

  const parentId = best.duplicateOfId ?? best.id;
  if (parentId === feedback.id) return;

  const autoConfirm = best.similarity >= DUPLICATE_AUTO_CONFIRM_THRESHOLD;

  await prisma.feedback.update({
    where: { id: feedback.id },
    data: {
      duplicateOfId: parentId,
      duplicateSimilarity: best.similarity,
      duplicateConfirmed: autoConfirm,
    },
  });

  if (autoConfirm) {
    await prisma.feedback.update({
      where: { id: parentId },
      data: { upvoteCount: { increment: 1 } },
    });
  }
}
