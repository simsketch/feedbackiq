import "dotenv/config";
import { embedMany } from "ai";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const BATCH_SIZE = 20;
const EMBEDDING_MODEL = "openai/text-embedding-3-small";

function toVectorLiteral(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}

async function main() {
  const rows = await prisma.$queryRaw<Array<{ id: string; content: string }>>`
    SELECT id, content
    FROM feedbackiq."Feedback"
    WHERE embedding IS NULL
    ORDER BY "createdAt" ASC
  `;

  console.log(`Found ${rows.length} feedback rows needing embeddings.`);
  if (rows.length === 0) return;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const values = batch.map((r) => r.content.trim().slice(0, 8000));

    try {
      const { embeddings } = await embedMany({
        model: EMBEDDING_MODEL,
        values,
      });

      for (let j = 0; j < batch.length; j++) {
        const literal = toVectorLiteral(embeddings[j]);
        await prisma.$executeRaw`
          UPDATE feedbackiq."Feedback"
          SET embedding = ${literal}::vector
          WHERE id = ${batch[j].id}
        `;
      }
      console.log(
        `Embedded batch ${i / BATCH_SIZE + 1} (${i + batch.length}/${rows.length}).`
      );
    } catch (err) {
      console.error(`Batch starting at ${i} failed:`, err);
    }
  }

  console.log("Backfill complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
