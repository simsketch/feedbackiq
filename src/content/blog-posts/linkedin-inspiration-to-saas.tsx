export default function LinkedInInspirationToSaas() {
  return (
    <>
      <p>
        A few months ago I was scrolling LinkedIn at midnight — the exact time
        of day when every post feels either life-changing or stupid, and you
        can&rsquo;t tell which. I stopped on a short demo video. Someone had
        embedded a feedback form on a marketing site, typed &ldquo;the CTA
        button should be cyan, not green,&rdquo; and, live on camera, a pull
        request appeared on their GitHub repo seconds later. Claude had read
        the page, found the component, and rewritten it. The video had a
        couple thousand likes and a lot of comments saying some version of
        &ldquo;this is a toy&rdquo; or &ldquo;cool but fragile.&rdquo;
      </p>
      <p>
        I watched it four times. It didn&rsquo;t matter if the demo was held
        together with string — the shape of the idea was obviously correct.
        Most feedback tools stop at the handoff: they give you a polished
        inbox, a public roadmap, a voting widget, and then they hand you a
        spreadsheet and wish you well. Everything interesting happens
        <em>after</em> the handoff, and that&rsquo;s where nothing exists.
      </p>

      <h2>The gap the demo was pointing at</h2>
      <p>
        Every product team has the same backlog shape. The top 20% of tickets
        are real: architecture changes, new products, things that need a
        human. The bottom 40% are landfills: &ldquo;typo on the pricing
        page,&rdquo; &ldquo;button is slightly too small on mobile,&rdquo;
        &ldquo;can you make the confirmation email bold.&rdquo; They&rsquo;re
        obvious, they&rsquo;re cheap, they&rsquo;re boring, and they
        <em>never get done</em> because every engineer with the skills to do
        them is busy doing the top 20%.
      </p>
      <p>
        What the LinkedIn demo implied — even if the demo itself was a
        scaffold — was that agents are now good enough to absorb that 40%. You
        don&rsquo;t need to triage &ldquo;button too small on mobile&rdquo;
        into a ticket anymore. You can let an agent read the repo, diff the
        component, open a PR, and put a human in the loop only at review
        time. The bottleneck stops being engineer-hours and becomes
        reviewer-hours, which is a much cheaper constraint.
      </p>

      <h2>Why the existing incumbents won&rsquo;t do this</h2>
      <p>
        Canny, Featurebase, UserVoice, Productboard — they&rsquo;re all good
        at what they do. None of them will ship this. Three reasons:
      </p>
      <ul>
        <li>
          <strong>It&rsquo;s a different buyer.</strong> Their ICP is a PM.
          Ours is an engineer. PMs don&rsquo;t want PRs opened without their
          planning ritual; engineers do.
        </li>
        <li>
          <strong>It&rsquo;s a different risk profile.</strong> A code-writing
          integration requires a GitHub App, write scopes, branch protection
          awareness, and a legal review. You can&rsquo;t bolt that onto a
          vote-counter.
        </li>
        <li>
          <strong>It&rsquo;s a different disposition.</strong> They sell
          certainty. We sell &ldquo;here&rsquo;s a PR, review it.&rdquo; That
          requires a team comfortable with an agent in their repo, which is a
          much smaller market <em>today</em> and a much larger one in two
          years.
        </li>
      </ul>

      <h2>The first commit</h2>
      <p>
        Two days later I registered <code>feedbackiq.app</code>, wrote the
        first commit at 11:47pm, and opened a Next.js app with exactly three
        pages: a landing page, a dashboard shell, and a widget script. The
        scope was aggressive: in the first week I wanted a working path from
        &ldquo;user submits feedback on a demo site&rdquo; to &ldquo;Claude
        opens a PR on a connected repo.&rdquo; It took nine days, most of
        which was GitHub App permissions and not the AI.
      </p>
      <p>
        This blog is the series about what came after. Every post is one
        decision, one tradeoff, or one thing we got wrong the first time.
        Next up: picking the stack — why Next.js 16, Prisma on Neon, Clerk
        auth, Vercel AI Gateway — and what I specifically did <em>not</em>{" "}
        pick, and why.
      </p>
      <p>
        If you&rsquo;re the person who made that LinkedIn demo: thank you.
        The commenters were wrong.
      </p>
    </>
  );
}
