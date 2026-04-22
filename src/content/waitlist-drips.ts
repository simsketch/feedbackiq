export const DRIP_INTERVAL_DAYS = 3;

export interface DripIssue {
  sequenceNumber: number;
  subject: string;
  preview: string;
  headline: string;
  bodyHtml: string;
  bodyText: string;
  cta?: { label: string; href: string };
}

export const DRIP_ISSUES: DripIssue[] = [
  {
    sequenceNumber: 1,
    subject: "Why FeedbackIQ exists (the LinkedIn post that started it)",
    preview:
      "A 30-second demo of a feedback form spinning up a GitHub PR. The commenters called it a toy. They were wrong.",
    headline: "The moment the toy became a product",
    bodyHtml: `
      <p>Thanks for joining the waitlist.</p>
      <p>FeedbackIQ started with a video. Someone demoed a feedback form that, on submit, opened a pull request. In the comments, half the dev community called it a toy — too risky, too easy to abuse, won't survive contact with real codebases.</p>
      <p>But that instinct — "someone typed what they wanted and the fix arrived" — is the single highest-leverage interaction a B2B SaaS team can build. If your users can't describe the change, no AI is smart enough to guess. If they <em>can</em>, you shouldn't be the bottleneck between their sentence and a PR.</p>
      <p>So we built the thing. One widget, an embedding-backed dedupe pass, auto-tagging, a Claude agent loop that typechecks before opening the PR, and a public changelog that closes the loop when it ships.</p>
      <p>We'll write one of these every three days while we open early access. Nothing salesy — just the real engineering behind the product, and one idea you might be able to steal.</p>
    `,
    bodyText: `Thanks for joining the waitlist.

FeedbackIQ started with a video. Someone demoed a feedback form that, on submit, opened a pull request. In the comments, half the dev community called it a toy — too risky, too easy to abuse, won't survive contact with real codebases.

But that instinct — "someone typed what they wanted and the fix arrived" — is the single highest-leverage interaction a B2B SaaS team can build. If your users can't describe the change, no AI is smart enough to guess. If they can, you shouldn't be the bottleneck between their sentence and a PR.

So we built the thing. One widget, an embedding-backed dedupe pass, auto-tagging, a Claude agent loop that typechecks before opening the PR, and a public changelog that closes the loop when it ships.

We'll write one of these every three days while we open early access. Nothing salesy — just the real engineering behind the product, and one idea you might be able to steal.`,
    cta: { label: "Read the origin post", href: "/blog/linkedin-inspiration-to-saas" },
  },
  {
    sequenceNumber: 2,
    subject: "Killing '500 error' duplicates with pgvector",
    preview:
      "Cosine similarity on OpenAI embeddings, HNSW indexes, and an auto-link threshold of 0.92.",
    headline: "The dedupe pass is the load-bearing wall",
    bodyHtml: `
      <p>A feedback inbox without dedupe is a public roadmap for everyone to file the same bug. One person types "500 error on checkout", another writes "broken payment page", a third pastes a stack trace. Three tickets. One bug.</p>
      <p>FeedbackIQ runs every submission through OpenAI's <code>text-embedding-3-small</code>, stores the 1536-dim vector in Postgres via pgvector with an HNSW index, and does cosine-similarity search against the last 60 days of feedback on the same project. Above 0.92 similarity we auto-merge; between 0.80 and 0.92 we flag for review; below 0.80 is its own issue.</p>
      <p>This is the load-bearing wall of the whole product. Without it, the agent would open seven PRs for the same bug, the upvote counter would mean nothing, and the changelog fan-out would spam your users three times per fix.</p>
      <p>Small change to the data model, huge lift to signal-to-noise.</p>
    `,
    bodyText: `A feedback inbox without dedupe is a public roadmap for everyone to file the same bug. One person types "500 error on checkout", another writes "broken payment page", a third pastes a stack trace. Three tickets. One bug.

FeedbackIQ runs every submission through OpenAI's text-embedding-3-small, stores the 1536-dim vector in Postgres via pgvector with an HNSW index, and does cosine-similarity search against the last 60 days of feedback on the same project. Above 0.92 similarity we auto-merge; between 0.80 and 0.92 we flag for review; below 0.80 is its own issue.

This is the load-bearing wall of the whole product. Without it, the agent would open seven PRs for the same bug, the upvote counter would mean nothing, and the changelog fan-out would spam your users three times per fix.

Small change to the data model, huge lift to signal-to-noise.`,
    cta: { label: "Read the deep dive", href: "/blog/deduping-feedback-with-pgvector" },
  },
  {
    sequenceNumber: 3,
    subject: "Letting Claude open real pull requests",
    preview:
      "GitHub App install, short-lived tokens, an agent loop that typechecks before committing, and what happens when it gets it wrong.",
    headline: "The agent is not the demo",
    bodyHtml: `
      <p>Every AI-PR demo on the internet skips the boring parts. You know the ones — auth, token minting, sandboxing, typecheck-before-commit, branch reuse with force-push, the "did this actually work" loop.</p>
      <p>Those are the parts that matter. A demo that opens a PR on a pristine repo proves nothing. A system that opens a PR on your repo, on a fresh branch, with the project's ESLint + tsc actually passing, and a linkback to the feedback ticket — that's the product.</p>
      <p>We install as a GitHub App. The user picks the repo; we mint a per-install token with <code>contents: write</code> and <code>pull-requests: write</code> scopes only. The agent clones ephemerally, works inside a sandbox, typechecks before committing, and only opens a PR if the check passes. If it fails, the feedback ticket gets a "generation failed" tag, not a broken PR.</p>
      <p>We treat the PR as an artifact to review, not a deliverable. Your team always merges.</p>
    `,
    bodyText: `Every AI-PR demo on the internet skips the boring parts. You know the ones — auth, token minting, sandboxing, typecheck-before-commit, branch reuse with force-push, the "did this actually work" loop.

Those are the parts that matter. A demo that opens a PR on a pristine repo proves nothing. A system that opens a PR on your repo, on a fresh branch, with the project's ESLint + tsc actually passing, and a linkback to the feedback ticket — that's the product.

We install as a GitHub App. The user picks the repo; we mint a per-install token with contents: write and pull-requests: write scopes only. The agent clones ephemerally, works inside a sandbox, typechecks before committing, and only opens a PR if the check passes. If it fails, the feedback ticket gets a "generation failed" tag, not a broken PR.

We treat the PR as an artifact to review, not a deliverable. Your team always merges.`,
    cta: { label: "How the agent actually works", href: "/blog/claude-opens-the-pr" },
  },
  {
    sequenceNumber: 4,
    subject: "Closing the loop: PR merged → users notified",
    preview: "GitHub webhook, LLM-drafted changelog, Resend fan-out, RSS because RSS still works.",
    headline: "Shipping is half the loop",
    bodyHtml: `
      <p>The worst feeling as a user is writing feedback and getting silence. Not "we're working on it" silence — the other kind, where you never hear whether it landed.</p>
      <p>When a PR linked to feedback merges, a GitHub webhook hits our endpoint, verifies the HMAC signature, and drafts a changelog entry from the PR title and body (not the diff — diffs don't make good prose). You review the draft, hit publish, and Resend fans it out to every user who upvoted or filed a related ticket.</p>
      <p>There's an Atom feed at <code>/changelog/[slug]/feed.xml</code> because some of your users live in Feedly. Everything stays boring and durable.</p>
      <p>The loop closes: a user writes a sentence, the agent opens a PR, you merge, and the user gets an email that says "that thing you asked for — it's live."</p>
    `,
    bodyText: `The worst feeling as a user is writing feedback and getting silence. Not "we're working on it" silence — the other kind, where you never hear whether it landed.

When a PR linked to feedback merges, a GitHub webhook hits our endpoint, verifies the HMAC signature, and drafts a changelog entry from the PR title and body (not the diff — diffs don't make good prose). You review the draft, hit publish, and Resend fans it out to every user who upvoted or filed a related ticket.

There's an Atom feed at /changelog/[slug]/feed.xml because some of your users live in Feedly. Everything stays boring and durable.

The loop closes: a user writes a sentence, the agent opens a PR, you merge, and the user gets an email that says "that thing you asked for — it's live."`,
    cta: { label: "Read the changelog post", href: "/blog/closing-the-loop-changelog" },
  },
  {
    sequenceNumber: 5,
    subject: "Early access is opening — want in?",
    preview:
      "We're onboarding the first 20 design partners. Free forever, direct line to the team, and we build what you need.",
    headline: "Design partners wanted",
    bodyHtml: `
      <p>We're opening early access to the first 20 teams. It's free forever for design partners, and you get:</p>
      <ul>
        <li>White-glove onboarding — we help you wire the widget, map to your repo, and tune the dedupe threshold for your domain.</li>
        <li>Direct Slack channel with the founders. No tickets, no queue.</li>
        <li>A line-item veto on our roadmap for anything that affects your usage.</li>
      </ul>
      <p>In exchange, we'd love a 20-minute intro call and permission to mention you as a design partner once you've shipped at least one PR through FeedbackIQ.</p>
      <p>If you're interested, hit reply. We'll set up a time.</p>
    `,
    bodyText: `We're opening early access to the first 20 teams. It's free forever for design partners, and you get:

- White-glove onboarding — we help you wire the widget, map to your repo, and tune the dedupe threshold for your domain.
- Direct Slack channel with the founders. No tickets, no queue.
- A line-item veto on our roadmap for anything that affects your usage.

In exchange, we'd love a 20-minute intro call and permission to mention you as a design partner once you've shipped at least one PR through FeedbackIQ.

If you're interested, hit reply. We'll set up a time.`,
    cta: { label: "Visit feedbackiq.app", href: "/" },
  },
];

export const TOTAL_DRIP_ISSUES = DRIP_ISSUES.length;

export function getDripIssue(n: number): DripIssue | null {
  return DRIP_ISSUES.find((i) => i.sequenceNumber === n) ?? null;
}

export function computeTargetSequence(signupDate: Date, now: Date = new Date()): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const days = Math.floor((now.getTime() - signupDate.getTime()) / msPerDay);
  const target = Math.floor(days / DRIP_INTERVAL_DAYS);
  return Math.min(Math.max(target, 0), TOTAL_DRIP_ISSUES);
}
