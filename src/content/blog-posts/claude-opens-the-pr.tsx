export default function ClaudeOpensThePr() {
  return (
    <>
      <p>
        This is the post where the product earns its name. A user submits
        feedback, it&rsquo;s tagged and dedup&rsquo;d, and then a PR
        appears on the customer&rsquo;s repo with Claude&rsquo;s attempt at
        the fix. The magic trick isn&rsquo;t the code generation — Claude
        is fine at that. The magic trick is all the plumbing around it:
        GitHub App installation, repo selection, branch protection,
        compilation, and retries.
      </p>

      <h2>GitHub App, not OAuth</h2>
      <p>
        I briefly considered shipping with a personal access token the
        user pastes in. This is the wrong call for four reasons: it&rsquo;s
        a bad security posture, it can&rsquo;t be scoped to a single repo,
        it can&rsquo;t be revoked cleanly, and no enterprise customer will
        ever install it.
      </p>
      <p>
        FeedbackIQ is a GitHub App. The customer installs it from{" "}
        <code>github.com/apps/feedbackiq</code>, picks specific repos, and
        grants <code>contents: write</code>, <code>pull-requests: write</code>
        , <code>metadata: read</code>, and nothing else. We store only the
        installation ID; we never see the user&rsquo;s personal credentials.
        Installation tokens are short-lived, scoped to a single repo, and
        re-minted on every run.
      </p>

      <h2>The agent loop</h2>
      <p>
        When a feedback item is marked for PR generation (either manually
        from the dashboard or automatically if <code>auto-mode</code> is
        on), we enqueue a job that:
      </p>
      <ol>
        <li>
          Mints a short-lived installation token for the target repo.
        </li>
        <li>
          Clones the repo into a fresh ephemeral sandbox.
        </li>
        <li>
          Hands the feedback text, screenshot (if any), and repo path to
          the Claude Agent SDK.
        </li>
        <li>
          Lets Claude read files, propose edits, run the project&rsquo;s
          build/typecheck, and iterate until it either succeeds or hits a
          step limit.
        </li>
        <li>
          Commits on a branch like <code>feedback/a3c8f2</code>, pushes,
          opens the PR, and writes a link back to the feedback row.
        </li>
      </ol>
      <p>
        The Agent SDK does the heavy lifting: tool use, file reads,
        edits, and shelling out to run <code>npm run build</code>. We
        wrap it so every action is logged and checkpointed, which makes
        debugging a failed run tractable.
      </p>

      <h2>Typecheck before PR</h2>
      <p>
        For the first month, we opened PRs regardless of whether the
        change compiled. About 30% of them were &ldquo;close but not
        compiling&rdquo; — a type error, a missing import, a renamed file
        the agent didn&rsquo;t see. These PRs were worse than no PR
        because reviewers would open them, see the red CI, and lose trust.
      </p>
      <p>
        Fix: before we commit, the agent runs the project&rsquo;s own
        typecheck + build. If it fails, we feed the compiler output back
        into the agent, let it take one more pass, and try again. Only if
        the build <em>then</em> fails do we still commit — with a PR
        description that honestly says{" "}
        <em>&ldquo;compile failed, here&rsquo;s the output.&rdquo;</em>{" "}
        Honesty beats hiding a broken branch.
      </p>

      <h2>Branch reuse and force-push</h2>
      <p>
        A single feedback item can go through the pipeline more than once —
        the user added more detail, the agent&rsquo;s first pass was
        wrong, a repo change invalidated the old branch. We used to
        create a new branch each retry, which left a graveyard of{" "}
        <code>feedback/*</code> branches in the customer&rsquo;s repo.
      </p>
      <p>
        Fix: reuse the branch if it exists and force-push. Reuse the PR
        if it&rsquo;s open. Each retry cleanly updates the same PR in
        place. Customers now see a single live PR that improves over
        time instead of a drawer full of stale ones.
      </p>

      <h2>Review-only or auto-mode</h2>
      <p>
        Auto-mode is a per-project toggle. In review-only mode, feedback
        items sit in the dashboard until a human clicks
        &ldquo;Generate PR.&rdquo; In auto-mode, the pipeline runs as
        soon as the item clears dedupe. Both are useful, to different
        teams:
      </p>
      <ul>
        <li>
          <strong>Review-only</strong> for teams that want a human to
          decide what&rsquo;s worth shipping. PR generation becomes a
          button, not a daemon.
        </li>
        <li>
          <strong>Auto-mode</strong> for teams that trust the pipeline
          and treat PR review as the gate, not the classification. These
          tend to be smaller, scrappier teams — and they ship faster.
        </li>
      </ul>

      <h2>What we got wrong</h2>
      <p>
        The first version committed directly to <code>main</code>. Yes,
        really. No branch. It took exactly one customer asking
        &ldquo;uh, did we skip review?&rdquo; to fix it. That&rsquo;s a
        mistake I will tell the story about for years.
      </p>
      <p>
        Next up: upvote routing when feedback items get merged as
        duplicates. The parent owns the vote count, the child is hidden,
        and the voter never knows they clicked a stand-in.
      </p>
    </>
  );
}
