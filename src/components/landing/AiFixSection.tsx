export function AiFixSection() {
  return (
    <section className="bg-[#1a0a0e] py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left: copy */}
          <div>
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.15em] text-[#E90029]">
              AI Fix Suggestions
            </p>
            <h2 className="text-[clamp(1.8rem,3.5vw,2.8rem)] font-extrabold leading-[1.1] tracking-[-0.02em] text-white">
              Remediate issues in seconds, not hours.
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-[1.7] text-white/40">
              ClearSight doesn&apos;t just point out problems. Our AI engine analyzes
              your component structure and generates optimized, accessible code
              snippets you can merge instantly.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Auto-generated ARIA labels",
                "Color contrast ratio correction",
                "Keyboard focus trap detection & logic",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="size-1.5 rounded-full bg-[#E90029]" />
                  <span className="text-[14px] text-white/60">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: code mockup */}
          <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#1a1a1f] shadow-2xl shadow-black/40">
            {/* Terminal header */}
            <div className="flex items-center gap-1.5 border-b border-white/[0.06] bg-white/[0.02] px-4 py-2.5">
              <div className="size-2.5 rounded-full bg-[#DC2626]/60" />
              <div className="size-2.5 rounded-full bg-[#D97706]/60" />
              <div className="size-2.5 rounded-full bg-[#16A34A]/60" />
              <span className="ml-3 font-mono text-[11px] text-white/30">RemediationView.tsx</span>
              <span className="ml-auto font-mono text-[10px] text-white/20">Line: 42</span>
            </div>

            <div className="p-5 font-mono text-[13px] leading-[1.8]">
              {/* Original issue */}
              <div className="mb-4">
                <div className="mb-1 flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-[#DC2626]" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#DC2626]">Original Issue</span>
                </div>
                <div className="rounded bg-[#DC2626]/[0.06] border border-[#DC2626]/20 px-3 py-2">
                  <code className="text-white/50">
                    <span className="text-[#7aa2f7]">&lt;img</span> <span className="text-[#9ece6a]">src=</span><span className="text-[#e0af68]">&quot;/hero.jpg&quot;</span> <span className="text-[#7aa2f7]">/&gt;</span>
                  </code>
                </div>
              </div>

              {/* AI suggestion */}
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-[#16A34A]" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#16A34A]">ClearSight Suggestion</span>
                  </div>
                  <button className="rounded bg-[#E90029]/10 border border-[#E90029]/20 px-2.5 py-1 text-[10px] font-semibold text-[#E90029] transition-colors hover:bg-[#E90029]/20">
                    Apply Fix
                  </button>
                </div>
                <div className="rounded bg-[#16A34A]/[0.04] border border-[#16A34A]/15 px-3 py-2">
                  <code className="text-white/60">
                    <span className="text-[#7aa2f7]">&lt;img</span><br />
                    {"  "}<span className="text-[#9ece6a]">src=</span><span className="text-[#e0af68]">&quot;/hero.jpg&quot;</span><br />
                    {"  "}<span className="text-[#16A34A] font-semibold">alt=</span><span className="text-[#16A34A] font-semibold">&quot;Marketing professional analyzing data on tablet&quot;</span><br />
                    {"  "}<span className="text-[#16A34A] font-semibold">aria-details=</span><span className="text-[#16A34A] font-semibold">&quot;hero-description&quot;</span><br />
                    <span className="text-[#7aa2f7]">/&gt;</span>
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
