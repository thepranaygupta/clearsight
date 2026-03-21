"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";

export function Hero() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);

    try {
      const siteRes = await fetch("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (siteRes.ok) {
        const site = await siteRes.json();
        const crawlRes = await fetch(`/api/sites/${site.id}/crawl`, {
          method: "POST",
        });

        if (crawlRes.ok) {
          const crawl = await crawlRes.json();
          router.push(`/dashboard/site/${site.id}/crawl/${crawl.id}`);
          return;
        }
      }

      router.push(`/dashboard`);
    } catch {
      router.push(`/dashboard`);
    }
    setLoading(false);
  }

  return (
    <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28">
      {/* Subtle background pattern */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 right-0 h-[800px] w-[800px] rounded-full bg-[#E90029]/[0.02] blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Left: Copy */}
          <div>
            <h1 className="text-[clamp(2.4rem,5vw,3.8rem)] leading-[1.08] font-extrabold tracking-[-0.03em] text-foreground">
              Find every
              <br />
              accessibility issue.
              <br />
              <span className="text-[#E90029]">Fix them with AI.</span>
            </h1>

            <p className="mt-6 max-w-[420px] text-[16px] leading-[1.75] text-muted-foreground">
              ClearSight crawls your entire website, checks every page against
              WCAG 2.1, and generates fix suggestions for each issue — so you
              ship accessible products, faster.
            </p>

            {/* Inline stats */}
            <div className="mt-8 flex gap-8">
              {[
                { value: "50+", label: "WCAG rules" },
                { value: "3x", label: "Parallel scanners" },
                { value: "<2min", label: "Per site crawl" },
              ].map((stat, i) => (
                <div key={stat.label} className="flex items-center gap-8">
                  <div>
                    <div className="text-[22px] font-extrabold tracking-tight text-foreground">{stat.value}</div>
                    <div className="text-[11px] font-medium text-muted-foreground/60">{stat.label}</div>
                  </div>
                  {i < 2 && <div className="h-8 w-px bg-border/60" />}
                </div>
              ))}
            </div>

            {/* URL input */}
            <form onSubmit={handleSubmit} className="mt-10">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://your-site.com"
                  className="h-[52px] flex-1 rounded-xl border border-border bg-background px-5 text-[15px] text-foreground shadow-sm placeholder:text-muted-foreground/30 focus:border-[#E90029]/30 focus:outline-none focus:ring-2 focus:ring-[#E90029]/10"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !url.trim()}
                  className="group flex h-[52px] shrink-0 items-center gap-2 rounded-xl bg-[#E90029] px-7 text-[14px] font-semibold text-white shadow-lg shadow-[#E90029]/10 transition-all hover:bg-[#D10025] hover:shadow-xl hover:shadow-[#E90029]/20 disabled:opacity-40 disabled:shadow-none"
                >
                  {loading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <>
                      Scan now
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </div>
              <p className="mt-3 text-[12px] text-muted-foreground/40">
                Free and open source. No account needed. Results in minutes.
              </p>
            </form>
          </div>

          {/* Right: Product mockup */}
          <div className="relative hidden lg:block">
            <div className="absolute -inset-10 rounded-3xl bg-[#E90029]/[0.02] blur-3xl" />

            <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl shadow-black/[0.08]">
              {/* Browser chrome */}
              <div className="flex h-10 items-center gap-1.5 border-b border-border/50 bg-muted/50 px-4">
                <div className="size-3 rounded-full bg-[#E90029]/40" />
                <div className="size-3 rounded-full bg-orange-400/40" />
                <div className="size-3 rounded-full bg-emerald-400/40" />
                <div className="ml-3 flex-1 rounded-md bg-background/80 px-3 py-1">
                  <span className="text-[11px] text-muted-foreground/50">clearsight / dashboard / site</span>
                </div>
              </div>

              {/* Dashboard mockup */}
              <div className="p-5">
                {/* Score + site name */}
                <div className="mb-5 flex items-center gap-4">
                  <div className="relative size-[68px]">
                    <svg viewBox="0 0 68 68" className="size-full -rotate-90">
                      <circle cx="34" cy="34" r="28" fill="none" stroke="currentColor" className="text-border/40" strokeWidth="5" />
                      <circle
                        cx="34" cy="34" r="28" fill="none"
                        stroke="#E90029" strokeWidth="5" strokeLinecap="round"
                        strokeDasharray={`${0.72 * 2 * Math.PI * 28} ${2 * Math.PI * 28}`}
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[15px] font-bold text-foreground">72</span>
                  </div>
                  <div>
                    <div className="text-[14px] font-bold text-foreground">example.com</div>
                    <div className="text-[11px] text-muted-foreground">12 pages scanned · 47 issues</div>
                  </div>
                  <div className="ml-auto flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1">
                    <div className="size-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[9px] font-semibold text-emerald-700">Completed</span>
                  </div>
                </div>

                {/* Issue cards */}
                <div className="space-y-1.5">
                  {[
                    { dot: "bg-red-500", text: "Images must have alternate text", tag: "1.1.1", count: "12" },
                    { dot: "bg-orange-500", text: "Links must have discernible text", tag: "2.4.4", count: "8" },
                    { dot: "bg-yellow-500", text: "Color contrast ratio insufficient", tag: "1.4.3", count: "15" },
                    { dot: "bg-blue-400", text: "Document must have one main landmark", tag: "1.3.1", count: "4" },
                    { dot: "bg-orange-500", text: "Touch targets below 48x48px", tag: "2.5.8", count: "6" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5 rounded-lg border border-border/40 bg-background p-3 transition-colors hover:bg-muted/30">
                      <div className={`size-2 shrink-0 rounded-full ${item.dot}`} />
                      <span className="flex-1 truncate text-[12px] text-foreground/90">{item.text}</span>
                      <span className="shrink-0 text-[11px] font-medium tabular-nums text-muted-foreground/60">{item.count}</span>
                      <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">{item.tag}</span>
                    </div>
                  ))}
                </div>

                {/* AI suggestion preview */}
                <div className="mt-3 rounded-lg border border-amber-300/60 bg-amber-50 p-3">
                  <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-amber-800/70">AI Fix Suggestion</div>
                  <div className="text-[12px] leading-relaxed text-amber-900/80">
                    Add descriptive alt text to the hero image: <code className="rounded bg-amber-100 px-1 py-0.5 text-[11px]">alt=&quot;Team collaborating on accessibility audit&quot;</code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
