export default function UpvoteRouting() {
  return (
    <>
      <p>
        Once you have a dedupe layer, upvotes get interesting fast.
        A user upvotes an item that is secretly a confirmed duplicate of
        another item. Where does the vote go? If it stays on the child,
        the parent&rsquo;s count is wrong. If the UI reveals the child is
        a duplicate, every roadmap becomes a tangle of arrows. The right
        answer is: the child is invisible to the user, and their vote
        silently routes to the parent.
      </p>

      <h2>The invariant</h2>
      <p>
        Feedback items can be in three states relative to duplicates:
      </p>
      <ul>
        <li>
          <strong>Standalone</strong> — <code>duplicateOfId</code> is null.
          Treat normally.
        </li>
        <li>
          <strong>Suggested duplicate</strong> —{" "}
          <code>duplicateOfId</code> is set but{" "}
          <code>duplicateConfirmed</code> is <code>false</code>. Still
          displayed as a separate item on the roadmap; the dashboard shows
          a &ldquo;Possible duplicate&rdquo; card for review.
        </li>
        <li>
          <strong>Confirmed duplicate</strong> —{" "}
          <code>duplicateConfirmed</code> is <code>true</code>. Hidden
          from the roadmap; votes route to the parent.
        </li>
      </ul>
      <p>
        All three states flow through the same upvote endpoint. The
        endpoint is responsible for picking the right target:
      </p>
      <pre>
        <code>{`const feedback = await prisma.feedback.findUnique({
  where: { id: feedbackId },
  select: { id: true, duplicateOfId: true, duplicateConfirmed: true },
});

const targetId =
  feedback.duplicateConfirmed && feedback.duplicateOfId
    ? feedback.duplicateOfId
    : feedback.id;`}</code>
      </pre>
      <p>
        Every write (create upvote, delete upvote, increment{" "}
        <code>upvoteCount</code>) uses <code>targetId</code>, not{" "}
        <code>feedbackId</code>. It&rsquo;s a one-line change that makes
        the invariant hold no matter where the vote originated.
      </p>

      <h2>The toggle, not a one-way click</h2>
      <p>
        The first version was upvote-only. Users who tapped twice got a
        duplicate-vote error. That&rsquo;s bad UX for a widget that&rsquo;s
        supposed to feel weightless. We switched to a toggle: POST adds
        the vote, DELETE removes it, both return the new count. The
        button knows its own state from <code>localStorage</code> keyed
        by feedback ID + a voter hash.
      </p>
      <p>
        The client is optimistic — it updates the count and the filled
        state before the network call resolves, then rolls back if the
        API returns an error. You can mash the upvote button repeatedly
        and the UI stays consistent because there&rsquo;s a{" "}
        <code>busy</code> flag that gates concurrent requests.
      </p>
      <pre>
        <code>{`async function handleClick() {
  if (busy) return;
  setBusy(true);

  const wasVoted = voted;
  const nextVoted = !wasVoted;
  setCount(wasVoted ? Math.max(0, count - 1) : count + 1);
  setVoted(nextVoted);

  const res = await fetch(\`/api/v1/feedback/\${id}/upvote\`, {
    method: nextVoted ? "POST" : "DELETE",
  });

  if (!res.ok) {
    setCount(count);       // rollback
    setVoted(wasVoted);
  }
  setBusy(false);
}`}</code>
      </pre>

      <h2>Who counts as a voter</h2>
      <p>
        The widget is embedded on sites where most visitors are
        unauthenticated. We identify voters with a stable hash of
        (project ID + a long-lived cookie) — enough to prevent a single
        user from racking up hundreds of votes, not enough to identify
        them personally. No emails collected, no accounts required.
      </p>
      <p>
        The <code>FeedbackUpvote</code> table has a unique constraint on
        <code>(feedbackId, voterHash)</code>, so an accidental
        double-POST is idempotent at the DB level. Belt and suspenders.
      </p>

      <h2>When a duplicate gets un-merged</h2>
      <p>
        Sometimes the dashboard user looks at a suggested duplicate and
        clicks &ldquo;not a duplicate.&rdquo; Sometimes they&rsquo;ve
        already confirmed one and change their mind. The un-merge path
        has to reverse the vote transfer cleanly: we remember the count
        the child had at merge time (its own{" "}
        <code>upvoteCount</code> + 1 for the original vote that caused
        the merge), and subtract that from the parent (clamped to zero)
        on unmerge.
      </p>
      <p>
        It&rsquo;s not perfect — subsequent upvotes while merged can&rsquo;t
        be un-transferred cleanly without a full event log — but it&rsquo;s
        correct for the common case and close enough for the edge case
        that nobody notices.
      </p>

      <h2>What we got wrong</h2>
      <p>
        The first version of the toggle disabled the button after an
        upvote — <code>disabled={`{voted || busy}`}</code>. That meant
        users who accidentally upvoted couldn&rsquo;t undo, which they
        correctly complained about. Now it&rsquo;s just{" "}
        <code>disabled={`{busy}`}</code>, and the filled/unfilled state
        communicates what clicking will do.
      </p>
      <p>
        Next up: the changelog. Once a PR merges, we turn it into a
        public changelog entry, email the upvoters, and syndicate an
        RSS feed — all automatically.
      </p>
    </>
  );
}
