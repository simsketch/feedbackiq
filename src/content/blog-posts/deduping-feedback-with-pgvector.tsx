export default function DedupingFeedbackWithPgvector() {
  return (
    <>
      <p>
        Every feedback-collection tool eventually hits the same wall: one broken
        API endpoint produces forty variations of &ldquo;500 error on
        checkout,&rdquo; thirty of them show up on the public roadmap, and the
        rest sit in the inbox waiting for a human to merge them. Upvotes split.
        The top-voted item is never the real top-voted item. The backlog looks
        like noise.
      </p>
      <p>
        We just shipped the dedupe layer for FeedbackIQ. The rule is simple:
        every submission gets an embedding, we check cosine similarity against
        recent items in the same project, auto-link above <code>0.92</code>,
        surface the <code>0.80–0.92</code> band to the dashboard for a human to
        confirm, and ignore below. This post walks through how it&rsquo;s wired.
      </p>

      <h2>Why embeddings and not keyword matching</h2>
      <p>
        Keyword matching catches &ldquo;500 error&rdquo; vs &ldquo;500
        error.&rdquo; It does not catch &ldquo;checkout is broken&rdquo; vs
        &ldquo;can&rsquo;t complete purchase&rdquo; vs &ldquo;pay button does
        nothing.&rdquo; Those are semantically identical and syntactically
        different, which is exactly the case embeddings are for.
      </p>
      <p>
        We use <code>openai/text-embedding-3-small</code> — 1536 dimensions,
        $0.02 per million tokens. At ~200 tokens per feedback submission,
        that&rsquo;s five million submissions per dollar. The cost is a rounding
        error.
      </p>

      <h2>Routing through Vercel AI Gateway</h2>
      <p>
        We call the model through the Vercel AI SDK&rsquo;s <code>embed</code>{" "}
        helper, which routes to Vercel AI Gateway when{" "}
        <code>AI_GATEWAY_API_KEY</code> is set:
      </p>
      <pre>
        <code>{`import { embed } from "ai";

export async function generateEmbedding(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: "openai/text-embedding-3-small",
    value: text.trim().slice(0, 8000),
  });
  return embedding;
}`}</code>
      </pre>
      <p>
        Gateway gives us observability, per-model rate limiting, and $5/mo free
        credits on any Vercel account. In production on Vercel, we don&rsquo;t
        even set the key — <code>VERCEL_OIDC_TOKEN</code> is injected into every
        deployment and used as a fallback. Zero config.
      </p>

      <h2>pgvector + HNSW on Neon</h2>
      <p>
        Neon runs stock Postgres with pgvector available as an extension. We
        declared it in the Prisma schema with the postgresqlExtensions preview
        feature, added an <code>Unsupported(&quot;vector(1536)&quot;)</code>{" "}
        column to <code>Feedback</code>, and put an HNSW index on it for fast
        approximate nearest-neighbor search:
      </p>
      <pre>
        <code>{`CREATE INDEX feedback_embedding_hnsw_idx
ON feedbackiq."Feedback"
USING hnsw (embedding vector_cosine_ops);`}</code>
      </pre>
      <p>
        HNSW is overkill until you have tens of thousands of rows per project,
        but adding it now is cheaper than retrofitting later. Until then the
        planner falls back to a sequential scan and still finishes in a few
        milliseconds.
      </p>

      <h2>The similarity query</h2>
      <p>
        Prisma doesn&rsquo;t (yet) know about vector operators, so we drop to{" "}
        <code>$queryRaw</code>:
      </p>
      <pre>
        <code>{`const rows = await prisma.$queryRaw<
  Array<{ id: string; similarity: number; duplicateOfId: string | null }>
>\`
  SELECT
    id,
    "duplicateOfId",
    1 - (embedding <=> \${literal}::vector) AS similarity
  FROM feedbackiq."Feedback"
  WHERE "projectId" = \${projectId}
    AND id <> \${excludeId}
    AND embedding IS NOT NULL
  ORDER BY embedding <=> \${literal}::vector
  LIMIT 5
\`;`}</code>
      </pre>
      <p>
        The <code>&lt;=&gt;</code> operator is pgvector&rsquo;s cosine distance.{" "}
        <code>1 - distance</code> gives similarity. We order by distance so the
        closest neighbor is row zero.
      </p>

      <h2>Thresholds and the gray zone</h2>
      <p>Three buckets:</p>
      <ul>
        <li>
          <strong>&gt; 0.92</strong> — auto-link as duplicate. Upvotes flow to
          the parent. The new item is hidden from the public roadmap.
        </li>
        <li>
          <strong>0.80–0.92</strong> — surface as a &ldquo;Possible
          duplicate&rdquo; in the dashboard with both snippets side-by-side.
          Owner confirms (upvotes merge) or rejects (link clears).
        </li>
        <li>
          <strong>&lt; 0.80</strong> — treat as a fresh item.
        </li>
      </ul>
      <p>
        We picked <code>0.92</code> by staring at actual submissions. Cosine
        similarity on <code>text-embedding-3-small</code> saturates fast —{" "}
        <code>0.85</code> is &ldquo;same topic,&rdquo; <code>0.92</code> is
        &ldquo;same bug.&rdquo; Higher thresholds miss real dupes; lower
        thresholds start merging unrelated-but-similar requests.
      </p>

      <h2>Upvote routing for confirmed duplicates</h2>
      <p>
        The widget&rsquo;s upvote endpoint ignores child duplicates and votes on
        the parent instead. Same for un-upvote. The user never knows they
        clicked a child — they clicked the item that was showing, and their
        vote landed where it belongs:
      </p>
      <pre>
        <code>{`const targetId =
  feedback.duplicateConfirmed && feedback.duplicateOfId
    ? feedback.duplicateOfId
    : feedback.id;

await prisma.feedbackUpvote.create({
  data: { feedbackId: targetId, voterHash: hash },
});`}</code>
      </pre>

      <h2>What we got wrong on the first pass</h2>
      <p>
        Our first draft auto-linked above <code>0.85</code>. It merged features
        that were &ldquo;both about notifications&rdquo; but meant different
        things — one person wanted email digests, another wanted push alerts.
        We raised the threshold to <code>0.92</code> and moved the gray zone
        into the dashboard. False positives vanished; real dupes still caught.
      </p>
      <p>
        The other miss: we originally blocked the submission endpoint on the
        embed call. Round-trips to the Gateway added 200-400ms. Made it
        fire-and-forget instead — embed + dedupe runs after the response is
        already back to the widget. The user never waits for our backend.
      </p>

      <h2>What&rsquo;s next</h2>
      <p>
        The dedupe layer is the foundation for expanding the inbox beyond the
        widget. Coming up: Sentry errors auto-filed as feedback, support
        tickets ingested from Intercom/email, server logs through a generic
        HTTP endpoint. Every new input source multiplies the noise — dedupe is
        the reason it won&rsquo;t overwhelm the roadmap.
      </p>
    </>
  );
}
