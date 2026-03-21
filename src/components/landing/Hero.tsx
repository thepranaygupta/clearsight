"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { ArrowRight, Loader2, Lightbulb } from "lucide-react";

// ─── Animated Score Gauge ─────────────────────────────────────────

function AnimatedGauge({ score, delay }: { score: number; delay: number }) {
  const r = 28;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;

  return (
    <div className="relative size-[72px]">
      <svg viewBox="0 0 68 68" className="size-full -rotate-90">
        <circle
          cx="34" cy="34" r={r} fill="none"
          stroke="currentColor" className="text-border/40" strokeWidth="5"
        />
        <motion.circle
          cx="34" cy="34" r={r} fill="none"
          stroke="#E90029" strokeWidth="5" strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, delay, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatedNumber target={score} delay={delay} className="text-[16px] font-bold text-foreground" />
      </div>
    </div>
  );
}

// ─── Animated Counter ─────────────────────────────────────────────

function AnimatedNumber({ target, delay, className }: { target: number; delay: number; className?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const timeout = setTimeout(() => {
      let start = 0;
      const duration = 1200;
      const startTime = performance.now();
      function tick(now: number) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        start = Math.round(eased * target);
        setCount(start);
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }, delay * 1000);
    return () => clearTimeout(timeout);
  }, [inView, target, delay]);

  return <span ref={ref} className={className}>{count}</span>;
}

// ─── Issue Row ────────────────────────────────────────────────────

const issues = [
  { dot: "bg-red-500", text: "Images must have alternate text", tag: "1.1.1", count: 12 },
  { dot: "bg-orange-500", text: "Links must have discernible text", tag: "2.4.4", count: 8 },
  { dot: "bg-yellow-500", text: "Color contrast ratio insufficient", tag: "1.4.3", count: 15 },
  { dot: "bg-blue-400", text: "Document must have one main landmark", tag: "1.3.1", count: 4 },
  { dot: "bg-orange-500", text: "Touch targets below 48x48px", tag: "2.5.8", count: 6 },
];

// ─── Hero ─────────────────────────────────────────────────────────

export function Hero() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const inView = useInView(heroRef, { once: true, amount: 0.3 });

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
        const crawlRes = await fetch(`/api/sites/${site.id}/crawl`, { method: "POST" });
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
    <section ref={heroRef} className="relative pt-32 pb-20 sm:pt-40 sm:pb-28">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 right-0 h-[800px] w-[800px] rounded-full bg-[#E90029]/[0.02] blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">

          {/* ─── Left: Copy ─── */}
          <div>
            <motion.h1
              className="text-[clamp(2.4rem,5vw,3.8rem)] leading-[1.08] font-extrabold tracking-[-0.03em] text-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              Find every
              <br />
              accessibility issue.
              <br />
              <span className="text-[#E90029]">Fix them with AI.</span>
            </motion.h1>

            <motion.p
              className="mt-6 max-w-[420px] text-[16px] leading-[1.75] text-muted-foreground"
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              ClearSight crawls your entire website, checks every page against
              WCAG 2.1, and generates fix suggestions for each issue — so you
              ship accessible products, faster.
            </motion.p>

            {/* Inline stats */}
            <motion.div
              className="mt-8 flex gap-8"
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
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
            </motion.div>

            {/* URL input */}
            <motion.form
              onSubmit={handleSubmit}
              className="mt-10"
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
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
            </motion.form>
          </div>

          {/* ─── Right: Animated Product Mockup ─── */}
          <motion.div
            className="relative hidden lg:block"
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
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

              {/* Dashboard content */}
              <div className="p-5">
                {/* Scan progress bar — fills on mount */}
                <motion.div
                  className="mb-5 overflow-hidden rounded-full bg-muted/40"
                  initial={{ opacity: 0 }}
                  animate={inView ? { opacity: 1 } : {}}
                  transition={{ delay: 0.5 }}
                >
                  <motion.div
                    className="h-1.5 rounded-full bg-[#E90029]"
                    initial={{ width: "0%" }}
                    animate={inView ? { width: "100%" } : {}}
                    transition={{ duration: 2.5, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  />
                </motion.div>

                {/* Score + site name */}
                <motion.div
                  className="mb-5 flex items-center gap-4"
                  initial={{ opacity: 0 }}
                  animate={inView ? { opacity: 1 } : {}}
                  transition={{ delay: 1.2, duration: 0.5 }}
                >
                  <AnimatedGauge score={72} delay={1.3} />
                  <div>
                    <div className="text-[14px] font-bold text-foreground">example.com</div>
                    <div className="text-[11px] text-muted-foreground">
                      12 pages · <AnimatedNumber target={47} delay={1.5} className="tabular-nums" /> issues found
                    </div>
                  </div>
                  <motion.div
                    className="ml-auto flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={inView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: 2.8, duration: 0.3, type: "spring", stiffness: 300 }}
                  >
                    <div className="size-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[9px] font-semibold text-emerald-700">Complete</span>
                  </motion.div>
                </motion.div>

                {/* Issue cards — staggered entrance */}
                <div className="space-y-1.5">
                  {issues.map((item, i) => (
                    <motion.div
                      key={i}
                      className="flex items-center gap-2.5 rounded-lg border border-border/40 bg-background p-3"
                      initial={{ opacity: 0, x: 24 }}
                      animate={inView ? { opacity: 1, x: 0 } : {}}
                      transition={{
                        duration: 0.4,
                        delay: 1.4 + i * 0.2,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    >
                      <motion.div
                        className={`size-2 shrink-0 rounded-full ${item.dot}`}
                        initial={{ scale: 0 }}
                        animate={inView ? { scale: 1 } : {}}
                        transition={{
                          delay: 1.6 + i * 0.2,
                          type: "spring",
                          stiffness: 400,
                          damping: 15,
                        }}
                      />
                      <span className="flex-1 truncate text-[12px] text-foreground/90">{item.text}</span>
                      <span className="shrink-0 text-[11px] font-medium tabular-nums text-muted-foreground/60">{item.count}</span>
                      <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">{item.tag}</span>
                    </motion.div>
                  ))}
                </div>

                {/* AI suggestion — slides up last */}
                <motion.div
                  className="mt-3 rounded-lg border border-amber-300/60 bg-amber-50 p-3"
                  initial={{ opacity: 0, y: 12 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 2.8, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="mb-1 flex items-center gap-1">
                    <Lightbulb className="size-3 text-amber-600" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-800/70">AI Fix Suggestion</span>
                  </div>
                  <div className="text-[12px] leading-relaxed text-amber-900/80">
                    Add descriptive alt text: <code className="rounded bg-amber-100 px-1 py-0.5 text-[11px]">alt=&quot;Team collaborating on audit&quot;</code>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
