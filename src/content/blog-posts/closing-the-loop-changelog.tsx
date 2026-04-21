export default function ClosingTheLoopChangelog() {
  return (
    <>
      <p>
        A pull request merging is the most satisfying moment in the whole
        pipeline, and for months we were wasting it. The PR would land,
        the feedback row would get marked <code>shipped</code>, and that
        was it. The user who filed the original bug never knew. The
        upvoters who voted for the feature never knew. The rest of the
        world never saw a changelog.
      </p>
      <p>
        Closing that loop — merged PR → changelog entry → upvoter emails →
        RSS feed — is this post. It&rsquo;s most of what turns FeedbackIQ
        from a ticket generator into a product-marketing surface.
      </p>

      <h2>The GitHub webhook</h2>
      <p>
        Every repo the customer connects gets a GitHub App webhook
        listening for <code>pull_request.closed</code> events. When the
        event arrives with <code>merged: true</code>, we look up the
        feedback row by the stored <code>githubPrNumber</code> and
        transition it to <code>shipped</code>.
      </p>
      <pre>
        <code>{`export async function POST(req: Request) {
  const event = req.headers.get("x-github-event");
  const body = await req.json();

  if (event === "pull_request" && body.action === "closed" && body.pull_request.merged) {
    const pr = body.pull_request;
    await handleMerged(pr.number, pr.base.repo.full_name, pr.merge_commit_sha);
  }
  return new Response("ok");
}`}</code>
      </pre>
      <p>
        Signature verification is non-negotiable. The webhook secret is
        stored per installation, and we <code>createHmac('sha256')</code>{" "}
        the raw body and compare against the <code>x-hub-signature-256</code>
        header in constant time before we touch anything.
      </p>

      <h2>Changelog entry from the PR diff</h2>
      <p>
        A merged PR gives us a title, a body, and a diff. That&rsquo;s
        already more than most changelogs have. We run the PR through a
        small LLM pass that converts the technical PR description into
        user-facing copy: a one-line headline, a short paragraph of
        what changed and why, and a category
        (<code>feature</code>/<code>fix</code>/<code>improvement</code>).
      </p>
      <p>
        The model never sees the diff — only the PR title, body, and the
        linked feedback&rsquo;s original text. That&rsquo;s enough
        context; sending the diff adds tokens without improving output.
      </p>
      <p>
        The generated entry lands in the dashboard as a <em>draft</em>.
        The user reviews it, tweaks if needed, and hits Publish. Nothing
        ships user-facing until a human confirms — we never want a
        customer&rsquo;s public changelog to read like a commit log from
        Mars.
      </p>

      <h2>Resend for the emails</h2>
      <p>
        When the changelog entry is published, every upvoter of the
        underlying feedback (and its confirmed duplicates — yes, the
        dedupe layer matters here too) gets an email saying{" "}
        <em>&ldquo;the thing you voted for just shipped.&rdquo;</em>{" "}
        Simple template, one CTA button linking to the changelog page.
      </p>
      <p>
        Resend is the least-interesting integration on paper and the one
        that made this feature cheap to ship. <code>resend.emails.send</code>{" "}
        returns a promise; we fan out with <code>Promise.allSettled</code>{" "}
        and let the failures (bounces, unsubscribes) settle into a
        webhook that flips the voter&rsquo;s <code>canEmail</code> flag.
      </p>
      <pre>
        <code>{`const results = await Promise.allSettled(
  upvoters.map((u) =>
    resend.emails.send({
      from: "FeedbackIQ <changelog@feedbackiq.app>",
      to: u.email,
      subject: \`Shipped: \${entry.title}\`,
      react: <ChangelogEmail entry={entry} unsubscribeUrl={u.unsubUrl} />,
    })
  )
);`}</code>
      </pre>

      <h2>RSS feed as a first-class surface</h2>
      <p>
        Every project gets a public changelog at{" "}
        <code>/changelog/[slug]</code> and a matching Atom feed at{" "}
        <code>/changelog/[slug]/feed.xml</code>. RSS is deeply uncool and
        also the single most-reliable way to let power users keep up with
        product changes without joining another email list. Generating it
        in Next.js is 20 lines:
      </p>
      <pre>
        <code>{`export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: Props) {
  const entries = await prisma.changelogEntry.findMany({
    where: { project: { slug: params.slug }, publishedAt: { not: null } },
    orderBy: { publishedAt: "desc" },
    take: 50,
  });
  const xml = buildAtomXml(entries);
  return new Response(xml, {
    headers: { "Content-Type": "application/atom+xml" },
  });
}`}</code>
      </pre>

      <h2>The psychological win</h2>
      <p>
        The whole loop — from widget submission to merged PR to
        &ldquo;your vote shipped&rdquo; email — compresses a cycle that
        used to take weeks into one that can run in a day. That
        compression is the actual product. The AI is incidental; the
        loop is the thing.
      </p>
      <p>
        Next up: the liquid-glass UI pass. Snake borders,
        backdrop-filter, conic gradients, and a surprisingly-deep rabbit
        hole of CSS that made the dashboard feel like 2026 instead of
        2018.
      </p>
    </>
  );
}
