export default function PickingTheStack() {
  return (
    <>
      <p>
        Every new SaaS has the same opening gambit: two weeks of stack debate
        disguised as productivity. I wanted to avoid that. The rule I set for
        myself was &ldquo;pick the boring option you&rsquo;ve shipped before,
        unless a newer option is clearly better on a dimension that matters
        for this product.&rdquo; Here&rsquo;s the stack FeedbackIQ ended up
        with, and what I consciously didn&rsquo;t pick.
      </p>

      <h2>Next.js 16 with Turbopack</h2>
      <p>
        I use Next.js for marketing pages, dashboards, and API routes in
        almost every project. The App Router handles the three main surfaces
        cleanly: static marketing (<code>/</code>, <code>/vs/*</code>,{" "}
        <code>/blog/*</code>), authenticated app (<code>/dashboard/*</code>),
        and programmatic endpoints (<code>/api/*</code>). Turbopack made the
        dev loop ~3× faster than webpack, and the stable release in 16
        removed the last reason to hold out.
      </p>
      <p>
        I did <em>not</em> use Remix or Astro. Remix&rsquo;s data-loading
        model is elegant but I already have muscle memory for App Router
        <code>searchParams</code> and server components. Astro is beautiful
        for content sites but I needed a proper app shell, and the split
        would&rsquo;ve been a second surface to maintain.
      </p>

      <h2>Prisma on Neon</h2>
      <p>
        Postgres was never in question — I need ordered writes,
        transactions, real constraints, and later <code>pgvector</code> for
        dedupe. Neon was the serverless Postgres I already had credits on,
        and it lets you toggle the <code>vector</code> extension with one
        checkbox in the dashboard. Prisma 7 added the{" "}
        <code>postgresqlExtensions</code> preview, which lets you declare
        extensions in the schema file:
      </p>
      <pre>
        <code>{`datasource db {
  provider   = "postgresql"
  schemas    = ["feedbackiq"]
  extensions = [vector]
}`}</code>
      </pre>
      <p>
        I briefly considered Drizzle. Drizzle has a cleaner migration story
        and its TypeScript types are better. But Prisma&rsquo;s introspection
        plus its <code>$queryRaw</code> escape hatch (which I use for the
        pgvector cosine query) is a shorter path for a one-engineer team,
        and I&rsquo;ve debugged Prisma perf issues before so I know what
        I&rsquo;m walking into.
      </p>

      <h2>Clerk for auth</h2>
      <p>
        Clerk is the least interesting choice on paper and the highest-ROI
        one in practice. Email + GitHub OAuth + organizations + the UI is
        already built, the middleware is one import, and the dashboard
        handles the stuff I will 100% forget (email verification, password
        reset, session rotation). I spent about two hours on auth total,
        which for a side-project-that-is-also-a-SaaS is exactly the budget.
      </p>
      <p>
        I did not roll my own with <code>next-auth</code>. Last time I tried
        that I spent a weekend debugging a refresh token loop. Never again
        until I have a team.
      </p>

      <h2>Vercel for hosting and AI Gateway</h2>
      <p>
        Deploy-on-push to <code>main</code> is the correct default. I pay
        for Vercel Pro, and the AI Gateway (in the same account) gives me
        <code>openai/*</code> and <code>anthropic/*</code> routing with $5
        of free credits, zero-config <code>VERCEL_OIDC_TOKEN</code> auth on
        production, and actual observability per model. It removed the need
        to carry OpenAI keys around.
      </p>
      <p>
        I looked at Railway and Render. Both are great for Go/Rust/Python.
        For Next.js on the edge, Vercel is still the shortest path from{" "}
        <code>git push</code> to a working URL.
      </p>

      <h2>Resend for email</h2>
      <p>
        Upvote notifications and changelog digests go through Resend. Their
        API is boring in the best way: one POST, one promise, one event
        webhook for bounces. I used to use SendGrid and spent too many
        evenings fighting their dashboard. Resend replaces that entire
        category of pain.
      </p>

      <h2>What&rsquo;s not on the list yet</h2>
      <p>
        No Redis, no queue, no separate worker. Every async path is either a
        Vercel function running past the response (fire-and-forget){" "}
        <code>.catch(err =&gt; console.error(...))</code> or a webhook from
        the GitHub App. I&rsquo;ll add a queue when the dedupe pipeline
        starts ingesting Sentry + support tickets at volume. Until then it
        would be over-engineering.
      </p>
      <p>
        Next post: the widget. One script tag, no framework, Shadow DOM so
        we don&rsquo;t leak styles into the host site. It&rsquo;s the
        smallest piece of code and the most-scrutinized-at-3am piece of
        code, because a broken widget is a visible outage.
      </p>
    </>
  );
}
