export function AiFixSection() {
  return (
    <section className="relative py-32" style={{ background: "radial-gradient(circle at 50% -20%, #2A0A0E 0%, #0A0505 100%)" }}>
      <div className="pointer-events-none absolute inset-0 opacity-10" style={{
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }} />

      <div className="relative z-10 mx-auto max-w-7xl px-6 grid items-center gap-20 md:grid-cols-2">
        {/* Left: copy */}
        <div>
          <span className="mb-6 block text-xs font-bold uppercase tracking-[0.3em] text-[#E90029]">
            The Solution
          </span>
          <h2 className="mb-8 text-4xl font-bold tracking-tight text-white md:text-5xl">
            Remediate issues in seconds, not hours.
          </h2>
          <p className="mb-10 text-lg font-medium leading-relaxed text-gray-400">
            ClearSight doesn&apos;t just point out problems. Our AI engine analyzes your
            component structure and generates optimized, accessible code snippets you
            can merge instantly.
          </p>
          <ul className="space-y-6">
            {[
              "Auto-generated ARIA labels based on surrounding context",
              "Precise color contrast correction for brand palettes",
              "Dynamic keyboard focus trap logic injection",
            ].map((item) => (
              <li key={item} className="flex items-start gap-4">
                <div className="mt-1 flex size-5 items-center justify-center rounded-full bg-[#E90029]/20">
                  <span className="size-1.5 rounded-full bg-[#E90029]" />
                </div>
                <span className="text-base font-medium italic text-gray-300">&ldquo;{item}&rdquo;</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: code diff mockup */}
        <div className="relative rounded border border-white/10 bg-[#0f0a0a] p-1.5 font-mono text-xs shadow-2xl">
          <div className="absolute -right-10 -top-10 size-40 rounded-full bg-[#E90029]/10 blur-3xl" />
          <div className="relative rounded-sm bg-[#0A0505] p-6">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between opacity-40">
              <div className="flex gap-1.5">
                <div className="size-2.5 rounded-full bg-white/20" />
                <div className="size-2.5 rounded-full bg-white/20" />
              </div>
              <span>RemediationView.tsx</span>
            </div>

            <div className="space-y-10">
              {/* Original violation */}
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-red-500 shadow-lg shadow-red-500/50" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-red-500">Original Violation</span>
                </div>
                <div className="border-l border-red-500/30 pl-4 font-medium text-red-400">
                  &lt;img src=&quot;/hero-image.jpg&quot; /&gt;
                </div>
              </div>

              {/* AI fix — green */}
              <div className="group relative rounded-r border-l-2 border-green-500 bg-green-500/5 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-green-500 shadow-lg shadow-green-500/50" />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-green-500">AI Remediation Suggestion</span>
                  </div>
                  <span className="rounded bg-green-600 px-3 py-1.5 text-[10px] font-bold text-white transition-all hover:bg-green-500 active:scale-95">
                    COPY FIX
                  </span>
                </div>
                <div className="font-medium leading-relaxed text-green-400">
                  &lt;img<br />
                  {"  "}src=&quot;/hero-image.jpg&quot;<br />
                  {"  "}<span className="rounded bg-green-500/20 text-green-300">alt=&quot;Professional team collaborating on laptop&quot;</span><br />
                  {"  "}<span className="rounded bg-green-500/20 text-green-300">aria-describedby=&quot;hero-context&quot;</span><br />
                  /&gt;
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
