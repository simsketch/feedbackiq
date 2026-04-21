export default function AutoTaggingFeedback() {
  return (
    <>
      <p>
        A user submits &ldquo;checkout button is broken on mobile.&rdquo;
        Before that row is fully committed, we want: a category
        (<code>bug</code>), a priority (<code>high</code> — revenue path),
        tags (<code>checkout</code>, <code>mobile</code>,{" "}
        <code>ui</code>), and a short machine-readable title. All derived,
        none typed by the user.
      </p>
      <p>
        The whole pipeline runs in about 400ms on Vercel AI Gateway,
        doesn&rsquo;t block the submission response, and costs roughly
        $0.0004 per feedback item. The interesting part is how we got it
        to stop making things up.
      </p>

      <h2>Structured outputs, not freeform</h2>
      <p>
        The first draft asked Claude <em>&ldquo;summarize this feedback
        and suggest tags.&rdquo;</em> That works for a demo and fails in
        production: the model returns prose, or extra commentary, or tags
        in three different casings. The fix is to treat the model as a
        function that returns a typed object.
      </p>
      <p>
        We use the Vercel AI SDK&rsquo;s <code>generateObject</code> with a
        Zod schema:
      </p>
      <pre>
        <code>{`import { generateObject } from "ai";
import { z } from "zod";

const FeedbackClassification = z.object({
  category: z.enum(["bug", "feature", "improvement", "question", "other"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  tags: z.array(z.string()).max(5),
  title: z.string().max(80),
});

const { object } = await generateObject({
  model: "anthropic/claude-haiku-4-5",
  schema: FeedbackClassification,
  prompt: buildClassifyPrompt(content, projectContext),
});`}</code>
      </pre>
      <p>
        The model is forced to output a shape the SDK can parse. If it
        drifts, the call errors and we retry once. If it errors twice, we
        fall back to heuristics (first-noun-phrase as title, no tags,
        &ldquo;medium&rdquo; priority) so the row still gets saved in a
        reasonable shape.
      </p>

      <h2>Why Haiku instead of Sonnet</h2>
      <p>
        Claude Haiku 4.5 at ~$0.80 per million input tokens is well
        below the noise floor of our other costs, and for classification
        tasks on short (~200 token) inputs it&rsquo;s essentially
        indistinguishable from Sonnet. We reserve Sonnet for the step
        where Claude Code actually writes the PR — a task where you
        can <em>feel</em> the difference between models.
      </p>

      <h2>Priority is the hard one</h2>
      <p>
        Category and tags are stable. Priority is where models either
        underreact (&ldquo;medium&rdquo; for everything) or overreact
        (&ldquo;urgent&rdquo; for cosmetic bugs). We gave the model a
        concrete rubric in the prompt:
      </p>
      <pre>
        <code>{`- urgent: breaks core user flow (checkout, signup, login, data loss)
- high:   affects revenue or retention, visible to many users
- medium: usability issue, non-blocking, one-page scope
- low:    polish, copy, nice-to-have`}</code>
      </pre>
      <p>
        With that in the system prompt, priority predictions are
        reasonable ~85% of the time in our (small) hand-labeled eval set.
        Enough that the dashboard&rsquo;s default sort by priority is
        actually useful; humans override it when the model is off.
      </p>

      <h2>Project context makes tags sharper</h2>
      <p>
        Tags are much better when the model knows what products/surfaces
        exist in the project. Each project in FeedbackIQ has an optional
        &ldquo;surfaces&rdquo; list (<code>checkout</code>,{" "}
        <code>pricing</code>, <code>dashboard</code>, <code>admin</code>).
        We inject those into the prompt as <em>&ldquo;prefer these tags
        when they fit.&rdquo;</em> The result: tags are sharable across
        the inbox and consistent week over week, which is what lets the
        roadmap actually cluster.
      </p>

      <h2>Running after the response</h2>
      <p>
        Like everything else in the inbox pipeline, classification runs
        after the POST returns. The widget sees a 200 in ~200ms; the
        dashboard sees the tagged row ~1s later. The UX cost of doing
        this synchronously was not worth the latency it added for a
        step whose result is only consumed by a refresh of the dashboard.
      </p>
      <pre>
        <code>{`// Inside /api/v1/feedback route handler
const feedback = await prisma.feedback.create({ ... });
classifyFeedback(feedback.id).catch((err) =>
  console.error("classifyFeedback failed:", err)
);
dedupeFeedback(feedback.id).catch((err) =>
  console.error("dedupeFeedback failed:", err)
);
return Response.json({ id: feedback.id }, { status: 201 });`}</code>
      </pre>

      <h2>What we got wrong</h2>
      <p>
        Early on we asked the model to score &ldquo;sentiment&rdquo;
        alongside priority. It was a number 0-100 that no one ever looked
        at — a textbook example of shipping a feature because it was easy
        to prompt for instead of because it was useful. We deleted the
        column two weeks later and nobody noticed.
      </p>
      <p>
        Next up: the PR pipeline. Once an item is tagged and
        prioritized, Claude Code actually opens the pull request. That
        step is where the product earns its name.
      </p>
    </>
  );
}
