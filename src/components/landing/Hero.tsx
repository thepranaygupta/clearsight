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
      <div className="mx-auto max-w-6xl px-6">
        {/* Two-column hero: text left, mockup right */}
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: Copy */}
          <div>
            <h1 className="text-[clamp(2.2rem,5vw,3.5rem)] leading-[1.1] font-extrabold tracking-[-0.025em] text-foreground">
              Find every
              <br />
              accessibility issue.
              <br />
              <span className="text-[#E90029]">Fix them with AI.</span>
            </h1>

            <p className="mt-6 max-w-md text-[16px] leading-[1.7] text-muted-foreground">
              ClearSight crawls your entire website, checks every page against
              WCAG 2.1, and generates AI-powered fix suggestions — so you know
              exactly what to change and why.
            </p>

            {/* Inline stats */}
            <div className="mt-8 flex gap-8">
              <div>
                <div className="text-2xl font-extrabold tracking-tight text-foreground">50+</div>
                <div className="text-[12px] text-muted-foreground">WCAG rules</div>
              </div>
              <div className="h-10 w-px bg-border" />
              <div>
                <div className="text-2xl font-extrabold tracking-tight text-foreground">3x</div>
                <div className="text-[12px] text-muted-foreground">Parallel scanners</div>
              </div>
              <div className="h-10 w-px bg-border" />
              <div>
                <div className="text-2xl font-extrabold tracking-tight text-foreground">&lt;2m</div>
                <div className="text-[12px] text-muted-foreground">Per site crawl</div>
              </div>
            </div>

            {/* URL input */}
            <form onSubmit={handleSubmit} className="mt-10">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://your-site.com"
                  className="h-12 flex-1 rounded-xl border border-border bg-background px-4 text-[15px] text-foreground shadow-sm placeholder:text-muted-foreground/40 focus:border-[#E90029]/40 focus:outline-none focus:ring-2 focus:ring-[#E90029]/10"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !url.trim()}
                  className="group flex h-12 shrink-0 items-center gap-2 rounded-xl bg-[#E90029] px-6 text-[14px] font-semibold text-white transition-all hover:bg-[#D10025] disabled:opacity-40"
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
              <p className="mt-2.5 text-[12px] text-muted-foreground/50">
                Free. No account needed. Results in minutes.
              </p>
            </form>
          </div>

          {/* Right: Product mockup */}
          <div className="relative hidden lg:block">
            {/* Subtle red glow behind */}
            <div className="absolute -inset-8 rounded-3xl bg-[#E90029]/[0.03] blur-3xl" />

            <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl shadow-black/[0.06]">
              {/* Browser chrome */}
              <div className="flex h-9 items-center gap-1.5 border-b border-border/40 bg-muted/30 px-3">
                <div className="size-2 rounded-full bg-border" />
                <div className="size-2 rounded-full bg-border" />
                <div className="size-2 rounded-full bg-border" />
                <div className="ml-3 flex-1 rounded bg-background/60 px-2 py-0.5">
                  <span className="text-[10px] text-muted-foreground/50">clearsight / dashboard</span>
                </div>
              </div>

              {/* Dashboard mockup content */}
              <div className="p-5">
                {/* Score + header */}
                <div className="mb-5 flex items-center gap-4">
                  <div className="relative size-16">
                    <svg viewBox="0 0 64 64" className="size-full -rotate-90">
                      <circle cx="32" cy="32" r="27" fill="none" stroke="currentColor" className="text-muted/30" strokeWidth="5" />
                      <circle
                        cx="32" cy="32" r="27" fill="none"
                        stroke="#E90029" strokeWidth="5" strokeLinecap="round"
                        strokeDasharray={`${0.72 * 2 * Math.PI * 27} ${2 * Math.PI * 27}`}
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground">72</span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">example.com</div>
                    <div className="text-[11px] text-muted-foreground">12 pages · 47 issues found</div>
                  </div>
                </div>

                {/* Issue list mockup */}
                <div className="space-y-1.5">
                  {[
                    { dot: "bg-red-500", text: "Images must have alternate text", tag: "1.1.1" },
                    { dot: "bg-orange-500", text: "Links must have discernible text", tag: "2.4.4" },
                    { dot: "bg-yellow-500", text: "Elements must have sufficient color contrast", tag: "1.4.3" },
                    { dot: "bg-blue-400", text: "Document should have one main landmark", tag: "BP" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5 rounded-lg border border-border/30 bg-background p-2.5">
                      <div className={`size-1.5 shrink-0 rounded-full ${item.dot}`} />
                      <span className="flex-1 truncate text-[11px] text-foreground/80">{item.text}</span>
                      <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground">{item.tag}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
