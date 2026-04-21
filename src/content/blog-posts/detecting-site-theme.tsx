export default function DetectingSiteTheme() {
  return (
    <>
      <p>
        The default feedback widget looked fine. Cyan button, bottom-right
        corner, friendly panel. It was also the single most common piece of
        feedback we got from the first ten customers:{" "}
        <em>&ldquo;the button doesn&rsquo;t match our site.&rdquo;</em>{" "}
        They were right. A widget that looks pasted-in reads as low-trust,
        and no amount of functionality fixes that.
      </p>
      <p>
        So we wrote a theme detector. When the widget mounts on a host
        page, it sniffs the page&rsquo;s own design tokens and paints
        itself to match. It&rsquo;s one of those features that is
        invisible when it works — which is exactly the goal.
      </p>

      <h2>What to sniff</h2>
      <p>
        Four things are enough for the button and panel to feel
        site-native:
      </p>
      <ul>
        <li>
          <strong>Primary brand color.</strong> Check CSS custom
          properties on <code>:root</code> for anything that looks like{" "}
          <code>--primary</code>, <code>--brand</code>, <code>--accent</code>
          . Fall back to the page&rsquo;s most common saturated color
          sampled from existing buttons.
        </li>
        <li>
          <strong>Background tone.</strong> Read{" "}
          <code>getComputedStyle(document.body).backgroundColor</code> and
          derive whether we&rsquo;re on a dark or light site. Our
          panel&rsquo;s chrome adapts.
        </li>
        <li>
          <strong>Body font.</strong>{" "}
          <code>getComputedStyle(document.body).fontFamily</code>. If the
          host uses <code>Inter</code>, we use <code>Inter</code>. If they
          use Georgia, fine, we&rsquo;ll match.
        </li>
        <li>
          <strong>Corner radius.</strong> Sampled from an existing{" "}
          <code>&lt;button&gt;</code> or <code>&lt;a&gt;</code> styled as a
          button. A site whose buttons are pill-shaped deserves a
          pill-shaped widget button.
        </li>
      </ul>

      <h2>The detection pass</h2>
      <pre>
        <code>{`function detectTheme(): Theme {
  const root = getComputedStyle(document.documentElement);
  const body = getComputedStyle(document.body);

  const primary =
    sampleCustomProperty(root, ["--primary", "--brand", "--accent"]) ??
    sampleButtonColor() ??
    "#22d3ee";

  const bg = body.backgroundColor || "#ffffff";
  const isDark = relativeLuminance(bg) < 0.5;

  const fontFamily = body.fontFamily.replace(/['"]/g, "").split(",")[0];

  const radius = sampleButtonRadius() ?? "0.5rem";

  return { primary, bg, isDark, fontFamily, radius };
}`}</code>
      </pre>
      <p>
        <code>sampleButtonColor</code> walks the DOM for{" "}
        <code>button, [role=&quot;button&quot;], .btn, a.button</code>,
        reads their computed <code>backgroundColor</code>, filters out
        neutrals (anything with low chroma), and takes the mode. It runs
        once on mount and is memoized for the session.
      </p>

      <h2>Server-side preview for the dashboard</h2>
      <p>
        We also run the same detection server-side. When a customer adds a
        site URL in the dashboard, we fetch the page, run it through a
        headless browser (Puppeteer on a serverless function), and show a
        preview of the themed widget next to the URL input. The preview
        matches what the user will see on their site, before they paste
        the script tag.
      </p>
      <p>
        This is behind the <code>/api/projects/[id]/detect-theme</code>{" "}
        endpoint. It returns the same <code>Theme</code> object the
        client-side sniffer uses, so the dashboard preview and the
        production widget agree.
      </p>

      <h2>Escape hatches</h2>
      <p>
        Theme detection is opinionated, and that means sometimes it&rsquo;s
        wrong. Every detected value is overridable in the dashboard: the
        customer can pin a hex, a font, a radius, and a dark/light
        preference. Detection is the default, not the law.
      </p>
      <p>
        We also expose CSS custom properties on the widget host element so
        customers with strong opinions can style the button themselves from
        their own stylesheet:
      </p>
      <pre>
        <code>{`#feedbackiq-root {
  --fiq-primary: #ff3366;
  --fiq-radius: 0px;
}`}</code>
      </pre>

      <h2>What we got wrong</h2>
      <p>
        First pass matched the body text color to the panel. Turns out a
        lot of marketing sites have near-black body text (<code>#0a0a0a</code>
        ) even when their background is off-white, which made our panel
        headers look gunmetal gray. We switched to deriving panel text
        from <em>contrast against our panel bg</em>, not from sampling the
        host. Same shape of problem — the difference between &ldquo;copy
        from the site&rdquo; and &ldquo;make a decision that respects the
        site.&rdquo; The second one is almost always what you actually
        want.
      </p>
      <p>
        Next up: the auto-tagging pipeline. Every submission gets a
        category, a priority, and a handful of tags — none of which the
        user has to pick.
      </p>
    </>
  );
}
