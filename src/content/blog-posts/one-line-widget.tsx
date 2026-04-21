export default function OneLineWidget() {
  return (
    <>
      <p>
        The widget is one line of code that a customer pastes on their site.
        That one line has to: mount a button, not leak styles into the host
        page, not <em>inherit</em> styles from the host page, open a panel
        that supports screenshot attachments, stream submissions to our API,
        recover gracefully on offline, and stay under 10&thinsp;KB gzipped.
        It&rsquo;s small, but the constraints are the entire point.
      </p>

      <h2>No framework</h2>
      <p>
        The widget is vanilla JavaScript. No React, no Svelte, no bundler
        preamble. Every framework I tried added 30-40&thinsp;KB of runtime
        that a marketing page doesn&rsquo;t need to load. The final{" "}
        <code>widget.js</code> is ~7&thinsp;KB gzipped with a flat event
        system and hand-rolled DOM. It turns out that if you don&rsquo;t
        need reactivity, you don&rsquo;t need a framework to give you
        reactivity.
      </p>
      <pre>
        <code>{`<script
  src="https://cdn.feedbackiq.app/widget.js"
  data-site-key="pk_live_your_key"
></script>`}</code>
      </pre>
      <p>
        That&rsquo;s it. No config object, no init call, no
        <code>.mount()</code>. The script reads its own{" "}
        <code>data-*</code> attributes, registers a listener on{" "}
        <code>DOMContentLoaded</code>, and injects a root element just
        before <code>&lt;/body&gt;</code>.
      </p>

      <h2>Shadow DOM so nothing leaks in either direction</h2>
      <p>
        The worst thing a third-party widget can do is pick up a{" "}
        <code>{`* { box-sizing: border-box }`}</code> rule from the host page
        and explode its own layout. Shadow DOM solves this with one line:
      </p>
      <pre>
        <code>{`const host = document.createElement("div");
host.id = "feedbackiq-root";
document.body.appendChild(host);

const root = host.attachShadow({ mode: "open" });
root.innerHTML = \`<style>\${styles}</style>\${markup}\`;`}</code>
      </pre>
      <p>
        Inside the shadow root our styles don&rsquo;t see host-page CSS and
        the host page doesn&rsquo;t see ours. This also means we can ship
        aggressive resets (<code>all: initial</code>) on our root elements
        without affecting the host. The widget looks identical on a
        Tailwind site, a Bootstrap site, and a pile of inline styles from
        2014.
      </p>

      <h2>Screenshots via the browser, no extensions</h2>
      <p>
        Users can attach a screenshot to their feedback. We could have
        required a browser extension (users hate this) or asked them to
        paste in a dataURL (users will never do this). Instead, the widget
        uses <code>html2canvas</code> lazy-loaded on first use to snapshot
        the current viewport, then renders a small annotation layer where
        the user can drag to highlight the problem area. The resulting PNG
        is posted to <code>/api/v1/attachments</code> with a presigned URL
        scheme so the file never lands in our application database.
      </p>
      <p>
        Lazy-loading matters: screenshot code is ~40&thinsp;KB. Including
        it up front for users who never take screenshots is a 6× increase
        in widget weight. We dynamically <code>import()</code> it the first
        time the screenshot button is clicked. If the user never clicks,
        it&rsquo;s never loaded.
      </p>

      <h2>Network: optimistic, retrying, honest</h2>
      <p>
        Submissions go to <code>/api/v1/feedback</code> with a simple POST.
        We never block the UI on the embedding/dedupe work — the server
        responds as soon as the row is written, then kicks off{" "}
        <code>dedupeFeedback(feedback.id).catch(...)</code>{" "}
        fire-and-forget. On the client, we show &ldquo;Sent, thanks!&rdquo;
        in ~200ms regardless of what&rsquo;s happening downstream.
      </p>
      <p>
        Offline is handled by a tiny queue: failed submissions are written
        to <code>localStorage</code>, and we retry on the next{" "}
        <code>online</code> event. This is one of those features that is
        invisible when it works and is the reason we won&rsquo;t ever lose
        a user&rsquo;s carefully typed bug report to a flaky hotel WiFi.
      </p>

      <h2>What I got wrong the first time</h2>
      <p>
        First draft had the widget render into a regular <code>div</code>{" "}
        with high-specificity class names. A customer&rsquo;s site had a
        rule <code>{`div > * { color: inherit }`}</code> that cascaded
        through our panel and turned every label dark blue. That was the
        bug that taught me Shadow DOM was non-optional. Switched in the
        next commit; never had the issue again.
      </p>
      <p>
        Next post: detecting the host site&rsquo;s theme so our widget
        button matches the page instead of looking like a pasted-in
        tooltip.
      </p>
    </>
  );
}
