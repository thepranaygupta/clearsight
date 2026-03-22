import { AlertTriangle, Clock } from "lucide-react";

export function TheProblem() {
  return (
    <section className="bg-white py-32 text-foreground">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-20 lg:grid-cols-2">
          {/* Left: copy */}
          <div>
            <span className="mb-6 block text-sm font-bold uppercase tracking-[0.2em] text-[#E90029]">
              The Blind Spot
            </span>
            <h2 className="mb-8 text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
              Traditional audits are slow, manual, and expensive.
            </h2>
            <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
              Most accessibility tools give you a laundry list of problems without a single
              solution. Engineering teams waste hundreds of hours every quarter manually
              verifying DOM elements and writing ARIA labels.
            </p>
            <div className="space-y-5">
              <div className="flex gap-4 rounded border border-red-100 bg-red-50 p-5">
                <AlertTriangle className="mt-0.5 size-5 shrink-0 text-[#E90029]" />
                <div>
                  <h4 className="mb-1 font-bold text-foreground">Incomplete Coverage</h4>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Most free scanners only catch a fraction of actual WCAG violations, leaving you legally exposed.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 rounded border border-red-100 bg-red-50 p-5">
                <Clock className="mt-0.5 size-5 shrink-0 text-[#E90029]" />
                <div>
                  <h4 className="mb-1 font-bold text-foreground">Human Bottlenecks</h4>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Manual audits take weeks to complete and are outdated the moment you push new code.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: legacy scan mockup */}
          <div className="relative">
            <div className="absolute -inset-4 rounded bg-[#E90029]/5 blur-2xl" />
            <div className="group relative overflow-hidden rounded bg-gray-900 p-8 shadow-2xl">
              <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
                <span className="font-mono text-xs text-gray-500">Legacy Scan Results</span>
                <span className="text-[10px] uppercase tracking-widest text-white/40">Failures detected (234)</span>
              </div>
              <div className="space-y-4 opacity-40 grayscale transition-all duration-500 group-hover:opacity-100 group-hover:grayscale-0">
                <div className="h-4 w-full rounded bg-white/5" />
                <div className="h-4 w-3/4 rounded bg-white/5" />
                <div className="h-4 w-full rounded bg-white/10" />
                <div className="h-4 w-1/2 rounded bg-white/5" />
                <div className="flex h-10 items-center rounded border border-[#E90029]/30 px-4">
                  <span className="font-mono text-[10px] text-[#E90029]">Error: L142. Missing aria-label on &lt;div role=&quot;button&quot;&gt;</span>
                </div>
                <div className="h-4 w-full rounded bg-white/5" />
                <div className="flex h-10 items-center rounded border border-[#E90029]/30 px-4">
                  <span className="font-mono text-[10px] text-[#E90029]">Error: L289. Low contrast (2.1:1) on footer text.</span>
                </div>
              </div>
              <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-gray-900 via-transparent pb-8">
                <p className="text-center text-sm font-bold text-white">You shouldn&apos;t have to fix this manually.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
