export default function LiquidGlassUi() {
  return (
    <>
      <p>
        For the first few months, the FeedbackIQ UI was correct and
        forgettable — dark zinc, cyan accent, flat cards, rounded
        buttons. It worked. It looked like every other side-project
        dashboard on the internet. When a product&rsquo;s differentiator
        is &ldquo;this tool feels different than other feedback
        tools,&rdquo; the UI has to carry part of that claim.
      </p>
      <p>
        So we did a liquid-glass pass. The goal: keep the dark aesthetic,
        but make surfaces feel layered, luminous, and slightly alive —
        Apple&rsquo;s 2025 visual language filtered through a dev-tool
        lens. Three ingredients carry most of the effect.
      </p>

      <h2>Snake borders with conic-gradient</h2>
      <p>
        The primary CTA (<code>.btn-snake</code>) has a cyan-blue gradient
        fill and a rotating conic-gradient border that runs like a snake
        of light around the button on hover. It&rsquo;s done with zero
        JavaScript, using <code>@property</code> for a custom angle that
        CSS can animate:
      </p>
      <pre>
        <code>{`@property --fiq-angle {
  syntax: "<angle>";
  initial-value: 0deg;
  inherits: false;
}

@keyframes fiq-spin {
  to { --fiq-angle: 360deg; }
}

.btn-snake::before {
  content: "";
  position: absolute;
  inset: -2px;
  padding: 2px;
  border-radius: inherit;
  background: conic-gradient(
    from var(--fiq-angle),
    transparent 0%,
    rgba(34,211,238,0.9) 20%,
    rgba(125,211,252,1) 30%,
    rgba(34,211,238,0) 50%,
    transparent 100%
  );
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.25s ease;
  z-index: -1;
}

.btn-snake:hover::before {
  opacity: 1;
  animation: fiq-spin 2.4s linear infinite;
}`}</code>
      </pre>
      <p>
        The trick is the mask-composite pair: the outer conic gradient
        becomes <em>only the border</em> because the inner content box
        masks out everything else. The border then spins by animating{" "}
        <code>--fiq-angle</code>. Before <code>@property</code> existed
        this was a hack; now it&rsquo;s essentially a one-liner.
      </p>

      <h2>Glow cards with backdrop-filter</h2>
      <p>
        Every content card on the marketing site is a{" "}
        <code>.glow-card</code>: a layered gradient inner, blurred
        backdrop, soft inner top highlight, and a hover state that
        subtly lifts and emits cyan glow. The CSS is ~20 lines and
        replaces every previous card style in the codebase:
      </p>
      <pre>
        <code>{`.glow-card {
  border: 1px solid rgba(255,255,255,0.06);
  background:
    linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0) 40%),
    rgba(24,24,27,0.55);
  backdrop-filter: blur(18px) saturate(140%);
  border-radius: 0.75rem;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.04),
    0 1px 2px rgba(0,0,0,0.3);
  transition:
    border-color 0.35s cubic-bezier(0.16,1,0.3,1),
    box-shadow  0.35s cubic-bezier(0.16,1,0.3,1),
    transform   0.35s cubic-bezier(0.16,1,0.3,1);
}
.glow-card:hover {
  border-color: rgba(34,211,238,0.25);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.05),
    0 20px 40px -20px rgba(34,211,238,0.25),
    0 0 32px -8px rgba(34,211,238,0.12);
  transform: translateY(-1px);
}`}</code>
      </pre>

      <h2>Noise and grid textures</h2>
      <p>
        Pure flat dark backgrounds read as cheap. A small amount of
        stochastic noise and a faint grid makes them feel like a real
        surface. The noise is an inline SVG <code>feTurbulence</code>{" "}
        filter baked into a data-URI, applied at ~3% opacity on top of
        everything:
      </p>
      <pre>
        <code>{`.noise-bg::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg ...%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 128px 128px;
}`}</code>
      </pre>
      <p>
        The grid is two linear gradients at 72px tiling. It&rsquo;s the
        visual-weight equivalent of adding one grain of salt to a dish —
        you can&rsquo;t point at it, but you can feel its absence.
      </p>

      <h2>What we deliberately didn&rsquo;t do</h2>
      <p>
        No animated gradients on page backgrounds. No particle fields.
        No cursor followers. No bespoke fonts. The visual language is
        confident precisely because it stops before it gets cute. When
        every surface has a flourish, no surface is special.
      </p>

      <h2>The perf cost</h2>
      <p>
        <code>backdrop-filter</code> is the one thing to watch — it can
        wreck paint times on mid-range Android if you stack too many
        blurred surfaces. We cap it at three visible at once, and the
        widget itself uses a flat blur (no saturate) because it&rsquo;s
        rendering in a Shadow DOM on someone else&rsquo;s marketing site
        where we don&rsquo;t own the frame budget.
      </p>
      <p>
        Next up: the SEO pass. Comparison pages, a technical blog (this
        one), <code>llms.txt</code>, structured data, and OG images
        generated by a Gemini 2.5 Flash Image prompt chain.
      </p>
    </>
  );
}
