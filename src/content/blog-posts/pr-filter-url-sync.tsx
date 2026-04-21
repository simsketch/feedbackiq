export default function PrFilterUrlSync() {
  return (
    <>
      <p>
        Every project eventually accumulates hundreds of pull requests.
        The dashboard&rsquo;s PR list became the page I opened most and
        the page I was most frustrated by, because there was no way to
        find anything. I needed filters — by status (open, merged,
        closed, failed) and by free-text search on branch name / PR
        title / feedback ID. Easy feature, surprisingly deep rabbit
        hole of UX decisions.
      </p>

      <h2>URL as the source of truth</h2>
      <p>
        The first rule: filter state lives in the URL, not in React
        state. If a customer finds an interesting slice of PRs, they
        should be able to copy the URL, paste it in Slack, and have a
        teammate land on the exact same view. No &ldquo;let me
        screenshot it&rdquo; workflow, no &ldquo;it&rsquo;s the fourth
        tab down.&rdquo;
      </p>
      <p>
        In Next.js App Router, that means{" "}
        <code>searchParams</code> on a server component. The page reads
        them, builds a Prisma <code>where</code> clause, and renders
        the filtered list on the server. No client-side fetching, no
        loading spinners, no hydration mismatch. The client is
        involved only for the input components that write back to the
        URL.
      </p>
      <pre>
        <code>{`interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string; status?: string }>;
}

export default async function PrsPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { q = "", status = "all" } = await searchParams;

  const where: Prisma.PullRequestWhereInput = { projectId: id };
  if (status !== "all") where.status = status as PrStatus;

  const trimmed = q.trim();
  if (trimmed) {
    const prNumber = Number.parseInt(trimmed, 10);
    where.OR = [
      { feedbackId: { startsWith: trimmed } },
      { branchName: { contains: trimmed, mode: "insensitive" } },
      { feedback: { content: { contains: trimmed, mode: "insensitive" } } },
      ...(Number.isFinite(prNumber) ? [{ githubPrNumber: prNumber }] : []),
    ];
  }

  const prs = await prisma.pullRequest.findMany({ where, include: { feedback: true } });
  return <PrList prs={prs} />;
}`}</code>
      </pre>

      <h2>Debounced writes, not debounced renders</h2>
      <p>
        The filter input is a client component. A naive implementation
        pushes a new URL on every keystroke, which re-runs the server
        component and, at ~200 PRs, flickers. The fix is to debounce
        the URL <em>write</em> but render the input without delay:
      </p>
      <pre>
        <code>{`"use client";
export default function PrFilter({ defaultQuery, defaultStatus }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = useState(defaultQuery);

  useEffect(() => {
    const t = setTimeout(() => {
      const next = new URLSearchParams(params);
      if (q) next.set("q", q);
      else next.delete("q");
      router.replace(\`\${pathname}?\${next.toString()}\`, { scroll: false });
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  return <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search PRs or feedback..." />;
}`}</code>
      </pre>
      <p>
        200ms is the sweet spot. Below that the server component
        re-renders faster than the user can type; above that, the list
        feels stale. <code>router.replace</code> (not{" "}
        <code>push</code>) avoids polluting the back button.{" "}
        <code>scroll: false</code> is the magic option that keeps the
        page from jumping to the top on every keystroke.
      </p>

      <h2>Clear button that doesn&rsquo;t flash</h2>
      <p>
        When any filter is active we show a Clear button. Pre-first-pass,
        it would flash in for 200ms after clearing the input because the
        parent re-renders before the URL writes back. Fix: the Clear
        button reads <em>live state</em>, not URL state, so it hides the
        moment the user types the delete.
      </p>

      <h2>Status dropdown semantics</h2>
      <p>
        Status is its own param because it maps to an enum, not a
        free-text search. &ldquo;All&rdquo; clears the key entirely
        rather than setting <code>status=all</code>, which keeps URLs
        clean when no filter is applied. It&rsquo;s a small
        aesthetic choice, but it matters for the shareability goal —
        the canonical unfiltered URL is{" "}
        <code>/prs</code>, not <code>/prs?q=&status=all</code>.
      </p>

      <h2>What we got wrong</h2>
      <p>
        First version did the search client-side — fetched all PRs,
        filtered in memory. It worked beautifully on the demo project
        with 8 PRs. It fell over at ~400 PRs because the server was
        shipping a 2MB payload on every page load. Moving filtering
        server-side was a 2-hour rewrite and a 20× payload shrink.
        Classic lesson: &ldquo;client-side filter&rdquo; is a fine
        prototype and almost always wrong in production.
      </p>
      <p>
        Small feature, useful daily, took about an afternoon to ship
        properly. The kind of feature that&rsquo;s easy to skip and
        impossible to miss once it&rsquo;s there.
      </p>
    </>
  );
}
