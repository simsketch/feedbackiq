import { prisma } from "@/lib/prisma";

export interface SimilarFeedback {
  id: string;
  content: string;
  status: string;
  createdAt: Date;
  similarity: number;
}

const DEFAULT_THRESHOLD = 0.25;
const DEFAULT_LIMIT = 5;

export async function findSimilarFeedback(
  feedbackId: string,
  projectId: string,
  threshold = DEFAULT_THRESHOLD,
  limit = DEFAULT_LIMIT
): Promise<SimilarFeedback[]> {
  const rows = await prisma.$queryRaw<
    Array<{
      id: string;
      content: string;
      status: string;
      createdAt: Date;
      similarity: number;
    }>
  >`
    SELECT
      other.id,
      other.content,
      other.status::text AS status,
      other."createdAt",
      similarity(other.content, self.content) AS similarity
    FROM feedbackiq."Feedback" self
    JOIN feedbackiq."Feedback" other
      ON other."projectId" = self."projectId"
     AND other.id <> self.id
    WHERE self.id = ${feedbackId}
      AND self."projectId" = ${projectId}
      AND similarity(other.content, self.content) >= ${threshold}
    ORDER BY similarity DESC
    LIMIT ${limit}
  `;

  return rows;
}
