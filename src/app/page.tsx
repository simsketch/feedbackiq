import { AnimatedDemo } from "@/components/animated-demo";
import { NavAuthLinks, AuthAwareCta } from "@/components/marketing-auth";

function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#09090b]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-green-400">
            <span className="text-sm font-bold text-black">F</span>
          </div>
          <span className="text-lg font-bold tracking-tight">FeedbackIQ</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#how-it-works" className="hidden text-sm text-zinc-400 transition-colors hover:text-white sm:block">
            How it works
          </a>
          <a href="#features" className="hidden text-sm text-zinc-400 transition-colors hover:text-white sm:block">
            Features
          </a>
          <NavAuthLinks />
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-24 sm:pt-44 sm:pb-32">
      {/* Radial glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] opacity-30"
        style={{
          background: "radial-gradient(ellipse at center, rgba(34,211,238,0.15) 0%, rgba(34,211,238,0) 70%)",
        }}
      />
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <div className="animate-fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-4 py-1.5 text-sm text-zinc-400">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-400" style={{ animation: "pulse-dot 2s ease infinite" }} />
            Now in beta
          </div>

          <h1 className="animate-fade-up delay-1 text-5xl font-bold leading-[1.1] tracking-tight sm:text-7xl">
            User feedback,{" "}
            <span className="gradient-text">shipped as code</span>
          </h1>

          <p className="animate-fade-up delay-2 mx-auto mt-6 max-w-xl text-lg leading-relaxed text-zinc-400 sm:text-xl">
            Drop a widget on your site. Users tell you what to build.
            Our AI agent reads your codebase and opens a pull request.
          </p>

          <div className="animate-fade-up delay-3 mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <AuthAwareCta
              signedOutLabel="Start for free"
              signedInLabel="Go to dashboard"
              className="group relative inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3.5 text-base font-medium text-black transition-all hover:bg-zinc-200"
            >
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </AuthAwareCta>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 px-8 py-3.5 text-base font-medium text-zinc-300 transition-all hover:border-zinc-700 hover:text-white"
            >
              See how it works
            </a>
          </div>
        </div>

        {/* Code snippet preview */}
        <div className="animate-fade-up delay-5 mx-auto mt-20 max-w-2xl">
          <div className="glow-card rounded-xl bg-[var(--bg-card)] overflow-hidden">
            <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-zinc-700" />
              <span className="h-3 w-3 rounded-full bg-zinc-700" />
              <span className="h-3 w-3 rounded-full bg-zinc-700" />
              <span className="ml-2 font-mono text-xs text-zinc-500">index.html</span>
            </div>
            <div className="p-5 font-mono text-sm leading-relaxed">
              <span className="text-zinc-500">&lt;!-- One line. That&apos;s it. --&gt;</span>
              <br />
              <span className="text-zinc-500">&lt;</span>
              <span className="text-cyan-400">script</span>
              <br />
              <span className="text-zinc-500 ml-4">src</span>
              <span className="text-zinc-500">=</span>
              <span className="text-green-400">&quot;https://cdn.feedbackiq.app/widget.js&quot;</span>
              <br />
              <span className="text-zinc-500 ml-4">data-site-key</span>
              <span className="text-zinc-500">=</span>
              <span className="text-amber-400">&quot;pk_live_your_key&quot;</span>
              <br />
              <span className="text-zinc-500">&gt;&lt;/</span>
              <span className="text-cyan-400">script</span>
              <span className="text-zinc-500">&gt;</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Embed the widget",
      desc: "Add one script tag. A sleek feedback button appears in the corner of your site. No SDK, no config, no build step.",
      visual: (
        <div className="flex items-end justify-end pr-4 pb-4 h-full">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-green-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
          </div>
        </div>
      ),
    },
    {
      num: "02",
      title: "Users give feedback",
      desc: "They describe what they want changed. The more detail they give, the better the PR. We prompt them to be specific.",
      visual: (
        <div className="p-4 space-y-2">
          <div className="rounded-lg bg-zinc-800/50 p-3 text-xs text-zinc-400 border border-zinc-700/50">
            &quot;The checkout page should show a progress bar so users know which step they&apos;re on...&quot;
          </div>
          <div className="flex gap-2">
            <div className="h-2 w-2 rounded-full bg-cyan-400 mt-1" />
            <span className="text-[11px] text-zinc-500">Submitting feedback...</span>
          </div>
        </div>
      ),
    },
    {
      num: "03",
      title: "AI reads your codebase",
      desc: "Our agent connects to GitHub, explores your repository structure, reads the relevant files, and understands your patterns.",
      visual: (
        <div className="p-4 font-mono text-[11px] text-zinc-500 space-y-1">
          <div><span className="text-cyan-400">reading</span> src/app/checkout/page.tsx</div>
          <div><span className="text-cyan-400">reading</span> src/components/ui/progress.tsx</div>
          <div><span className="text-cyan-400">analyzing</span> 12 related files</div>
          <div className="text-green-400 mt-2">ready to generate changes</div>
        </div>
      ),
    },
    {
      num: "04",
      title: "PR lands on GitHub",
      desc: "A focused pull request with clean code changes, a clear description of what was changed and why, linked to the original feedback.",
      visual: (
        <div className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-block h-4 w-4 rounded-full bg-green-500/20 border border-green-500/40" />
            <span className="text-xs text-green-400 font-medium">Open</span>
          </div>
          <div className="text-xs text-zinc-300 font-medium">Add checkout progress bar</div>
          <div className="text-[11px] text-zinc-500">feedbackiq/feedback-a3c8 → main</div>
          <div className="flex gap-3 text-[11px] mt-1">
            <span className="text-green-400">+47</span>
            <span className="text-red-400">-3</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="how-it-works" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16 text-center">
          <p className="mb-3 font-mono text-sm text-cyan-400">How it works</p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
            Feedback to PR in four steps
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div key={step.num} className="glow-card group rounded-xl bg-[var(--bg-card)] overflow-hidden">
              <div className="h-36 bg-zinc-900/50 border-b border-zinc-800/50 relative overflow-hidden">
                {step.visual}
              </div>
              <div className="p-5">
                <span className="font-mono text-xs text-cyan-400">{step.num}</span>
                <h3 className="mt-2 text-base font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DemoSection() {
  return (
    <section className="relative py-24 sm:py-32 border-t border-zinc-800/50">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16 text-center">
          <p className="mb-3 font-mono text-sm text-cyan-400">Live demo</p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
            See it in action
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-400">
            Text feedback, screen recordings with webcam — your users show you exactly what they need, and AI turns it into code.
          </p>
        </div>
        <AnimatedDemo />
      </div>
    </section>
  );
}

function ScreenRecordFeature() {
  return (
    <section className="relative py-24 sm:py-32 border-t border-zinc-800/50 overflow-hidden">
      {/* Accent glow */}
      <div className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] opacity-20"
        style={{
          background: "radial-gradient(ellipse at center, rgba(34,211,238,0.15) 0%, rgba(34,211,238,0) 70%)",
        }}
      />
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          {/* Text */}
          <div>
            <p className="mb-3 font-mono text-sm text-cyan-400">Screen recording</p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Show, don&apos;t just tell
            </h2>
            <p className="mt-4 text-lg text-zinc-400 leading-relaxed">
              Users can record their screen with a webcam overlay to show exactly what they want changed. The AI agent watches the recording to understand context, navigation flows, and visual intent.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                {
                  icon: (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                  ),
                  title: "Screen + webcam capture",
                  desc: "Record your screen with a camera bubble overlay. Show the bug, explain the fix, point at the problem."
                },
                {
                  icon: (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                    </svg>
                  ),
                  title: "AI-powered analysis",
                  desc: "Our agent watches the recording, extracts visual context, and combines it with code analysis for better PRs."
                },
                {
                  icon: (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                    </svg>
                  ),
                  title: "Zero friction",
                  desc: "Built into the widget. No extensions, no downloads. One click to start recording, one click to submit."
                },
              ].map((item) => (
                <li key={item.title} className="flex gap-4">
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-cyan-400">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                    <p className="mt-1 text-sm text-zinc-400 leading-relaxed">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="glow-card rounded-xl bg-[var(--bg-card)] overflow-hidden">
              {/* Recording preview mockup */}
              <div className="relative aspect-video bg-zinc-950">
                {/* Fake screen content */}
                <div className="absolute inset-4 rounded-lg border border-zinc-800/50 bg-zinc-900/40 p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-2 w-2 rounded-full bg-zinc-700" />
                    <div className="h-2 w-2 rounded-full bg-zinc-700" />
                    <div className="h-2 w-2 rounded-full bg-zinc-700" />
                    <div className="ml-2 h-2 w-24 rounded bg-zinc-800" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1 space-y-2">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className="h-2 rounded bg-zinc-800/60" style={{width: `${60+i*8}%`}} />
                      ))}
                    </div>
                    <div className="col-span-2 space-y-2">
                      <div className="h-3 w-24 rounded bg-zinc-800" />
                      <div className="rounded-lg border border-zinc-800/30 p-3 space-y-2">
                        <div className="h-2 w-full rounded bg-zinc-800/40" />
                        <div className="h-2 w-3/4 rounded bg-zinc-800/40" />
                        <div className="h-6 w-20 rounded bg-zinc-800/60 mt-3" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Webcam bubble */}
                <div className="absolute bottom-4 left-4 w-24 h-24 rounded-full border-[3px] border-cyan-400/70 bg-zinc-800 overflow-hidden shadow-xl shadow-cyan-500/10">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-zinc-600" />
                      <div className="w-14 h-7 rounded-t-full bg-zinc-600 mt-1 -ml-3" />
                    </div>
                  </div>
                </div>

                {/* Recording indicator */}
                <div className="absolute top-4 right-4 flex items-center gap-2 rounded-full bg-red-500/90 px-3 py-1">
                  <span className="h-2 w-2 rounded-full bg-white" style={{animation: "pulse-dot 1.5s ease infinite"}} />
                  <span className="text-xs font-mono text-white font-medium">0:12</span>
                </div>

                {/* Mouse cursor */}
                <div className="absolute" style={{top: "45%", left: "60%"}}>
                  <svg width="16" height="20" viewBox="0 0 12 16" fill="none">
                    <path d="M1 1L1 12L4 9L7 15L9 14L6 8L10 8L1 1Z" fill="white" stroke="black" strokeWidth="0.5" />
                  </svg>
                </div>
              </div>

              {/* Caption bar */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                  <span className="text-xs text-zinc-400">Screen recording with webcam overlay</span>
                </div>
                <span className="text-xs text-zinc-600 font-mono">720p</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    {
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
        </svg>
      ),
      title: "Claude Agent SDK",
      desc: "Powered by Claude's agent capabilities. Reads your codebase, understands patterns, writes clean code that fits your style.",
    },
    {
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      ),
      title: "GitHub App integration",
      desc: "Install once, select repos. Fine-grained permissions. No token management. Works with private repositories.",
    },
    {
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
        </svg>
      ),
      title: "Approval or auto-mode",
      desc: "Review feedback before generating PRs, or flip a switch and let the agent handle everything automatically.",
    },
    {
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      ),
      title: "Screen recording + webcam",
      desc: "Users record their screen with a webcam overlay. Show the problem, narrate the fix. AI watches and understands.",
    },
    {
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      ),
      title: "Dashboard analytics",
      desc: "Track feedback volume, PR generation, merge rates. See which pages generate the most feedback.",
    },
    {
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      ),
      title: "Team management",
      desc: "Invite your team. Role-based access. Everyone stays in the loop on what users want and what's being built.",
    },
  ];

  return (
    <section id="features" className="relative py-24 sm:py-32 border-t border-zinc-800/50">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16 text-center">
          <p className="mb-3 font-mono text-sm text-cyan-400">Features</p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
            Built for engineering teams
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-400">
            Everything you need to close the loop between user feedback and shipped code.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="glow-card rounded-xl bg-[var(--bg-card)] p-6"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-cyan-400">
                {feature.icon}
              </div>
              <h3 className="text-base font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="relative py-24 sm:py-32 border-t border-zinc-800/50">
      <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] opacity-20"
        style={{
          background: "radial-gradient(ellipse at center, rgba(34,211,238,0.2) 0%, rgba(34,211,238,0) 70%)",
        }}
      />
      <div className="relative mx-auto max-w-6xl px-6 text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
          Stop triaging. Start shipping.
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-lg text-zinc-400">
          Your users already know what they want. Let them tell you, and let AI do the rest.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <AuthAwareCta
            signedOutLabel="Get started free"
            signedInLabel="Open dashboard"
            className="group inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3.5 text-base font-medium text-black transition-all hover:bg-zinc-200"
          >
            <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </AuthAwareCta>
        </div>
        <p className="mt-4 text-sm text-zinc-500">No credit card required</p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-zinc-800/50 py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-br from-cyan-400 to-green-400">
              <span className="text-[10px] font-bold text-black">F</span>
            </div>
            <span className="text-sm font-semibold">FeedbackIQ</span>
          </div>
          <p className="text-sm text-zinc-500">
            Feedback to code, automatically.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <div className="noise-bg">
      <Nav />
      <main className="grid-bg">
        <Hero />
        <DemoSection />
        <HowItWorks />
        <ScreenRecordFeature />
        <Features />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
