"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, useInView } from "motion/react";
import { ArrowRight, Loader2, Lightbulb, CheckCircle2 } from "lucide-react";

// ─── Animated Score ───────────────────────────────────────────────

function AnimatedGauge({ score, delay, size = 80 }: { score: number; delay: number; size?: number }) {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  const center = size / 2;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="size-full -rotate-90">
        <circle cx={center} cy={center} r={r} fill="none" stroke="currentColor" className="text-white/10" strokeWidth="5" />
        <motion.circle
          cx={center} cy={center} r={r} fill="none"
          stroke="#E90029" strokeWidth="5" strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.6, delay, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <Counter target={score} delay={delay} className="text-xl font-bold text-white" />
      </div>
    </div>
  );
}

function Counter({ target, delay, className }: { target: number; delay: number; className?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const t = setTimeout(() => {
      const dur = 1200;
      const start = performance.now();
      function tick(now: number) {
        const p = Math.min((now - start) / dur, 1);
        setCount(Math.round((1 - Math.pow(1 - p, 3)) * target));
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }, delay * 1000);
    return () => clearTimeout(t);
  }, [inView, target, delay]);

  return <span ref={ref} className={className}>{count}</span>;
}

// ─── Data ─────────────────────────────────────────────────────────

const issues = [
  { sev: "critical", dot: "bg-red-500", text: "Images must have alternate text", tag: "1.1.1", count: 12 },
  { sev: "serious", dot: "bg-orange-500", text: "Links must have discernible text", tag: "2.4.4", count: 8 },
  { sev: "serious", dot: "bg-yellow-500", text: "Color contrast ratio insufficient", tag: "1.4.3", count: 15 },
  { sev: "moderate", dot: "bg-blue-400", text: "Document must have main landmark", tag: "1.3.1", count: 4 },
];

// ─── Hero ─────────────────────────────────────────────────────────

export function Hero() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });
  const mockupRef = useRef<HTMLDivElement>(null);
  const mockupInView = useInView(mockupRef, { once: true, amount: 0.2 });

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
    <>
      {/* ─── Hero: Compact, all above fold ─── */}
      <section ref={ref} className="relative pt-28 pb-12 sm:pt-36 sm:pb-16">
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <motion.h1
            className="text-[clamp(2.4rem,5.5vw,4rem)] leading-[1.08] font-extrabold tracking-[-0.035em] text-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            Your website has accessibility issues.{" "}
            <span className="text-[#E90029]">We&apos;ll find every one.</span>
          </motion.h1>

          <motion.p
            className="mx-auto mt-5 max-w-md text-[16px] leading-[1.7] text-muted-foreground"
            initial={{ opacity: 0, y: 14 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            Crawl your entire site, check every page against WCAG 2.1, and get
            AI-powered fix suggestions — in minutes.
          </motion.p>

          {/* CTA input */}
          <motion.form
            onSubmit={handleSubmit}
            className="mx-auto mt-8 max-w-lg"
            initial={{ opacity: 0, y: 14 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-site.com"
                className="h-12 flex-1 rounded-xl border border-border bg-background px-5 text-[15px] text-foreground shadow-sm placeholder:text-muted-foreground/30 focus:border-[#E90029]/30 focus:outline-none focus:ring-2 focus:ring-[#E90029]/10"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !url.trim()}
                className="group flex h-12 shrink-0 items-center gap-2 rounded-xl bg-[#E90029] px-6 text-[14px] font-semibold text-white shadow-lg shadow-[#E90029]/10 transition-all hover:bg-[#D10025] hover:shadow-xl hover:shadow-[#E90029]/20 disabled:opacity-40 disabled:shadow-none"
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
            <div className="mt-3 flex items-center justify-center gap-4 text-[12px] text-muted-foreground/40">
              <span className="flex items-center gap-1"><CheckCircle2 className="size-3" /> Free &amp; open source</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="size-3" /> No account needed</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="size-3" /> 50+ WCAG rules</span>
            </div>
          </motion.form>
        </div>
      </section>

      {/* ─── Product Demo: Dark section, full bleed ─── */}
      <section ref={mockupRef} className="relative bg-[#0C0C0E] py-16 sm:py-20">
        {/* Glow effects */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/2 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-[#E90029]/[0.06] blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-5xl px-6">
          {/* Section label */}
          <motion.p
            className="mb-8 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-white/30"
            initial={{ opacity: 0 }}
            animate={mockupInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            See what ClearSight finds
          </motion.p>

          {/* The mockup */}
          <motion.div
            className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#161618] shadow-2xl shadow-black/40"
            initial={{ opacity: 0, y: 30 }}
            animate={mockupInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Browser chrome */}
            <div className="flex h-10 items-center gap-1.5 border-b border-white/[0.06] bg-white/[0.02] px-4">
              <div className="size-2.5 rounded-full bg-white/10" />
              <div className="size-2.5 rounded-full bg-white/10" />
              <div className="size-2.5 rounded-full bg-white/10" />
              <div className="ml-4 flex-1 rounded bg-white/[0.04] px-3 py-1">
                <span className="text-[11px] text-white/20">clearsight / site / example.com</span>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              {/* Progress bar */}
              <motion.div
                className="mb-6 overflow-hidden rounded-full bg-white/[0.06]"
                initial={{ opacity: 0 }}
                animate={mockupInView ? { opacity: 1 } : {}}
                transition={{ delay: 0.4 }}
              >
                <motion.div
                  className="h-1 rounded-full bg-[#E90029]"
                  initial={{ width: "0%" }}
                  animate={mockupInView ? { width: "100%" } : {}}
                  transition={{ duration: 2.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                />
              </motion.div>

              <div className="grid gap-8 sm:grid-cols-[200px_1fr]">
                {/* Score column */}
                <motion.div
                  className="flex flex-col items-center gap-3 sm:items-start"
                  initial={{ opacity: 0 }}
                  animate={mockupInView ? { opacity: 1 } : {}}
                  transition={{ delay: 1.0, duration: 0.5 }}
                >
                  <AnimatedGauge score={72} delay={1.1} size={88} />
                  <div className="text-center sm:text-left">
                    <div className="text-[15px] font-bold text-white">example.com</div>
                    <div className="text-[12px] text-white/40">
                      12 pages · <Counter target={47} delay={1.3} className="tabular-nums" /> issues
                    </div>
                  </div>
                  <motion.div
                    className="mt-1 flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2.5 py-1"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={mockupInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: 2.6, type: "spring", stiffness: 300 }}
                  >
                    <div className="size-1.5 rounded-full bg-emerald-400" />
                    <span className="text-[10px] font-semibold text-emerald-400">Scan complete</span>
                  </motion.div>
                </motion.div>

                {/* Issues column */}
                <div className="space-y-2">
                  {issues.map((item, i) => (
                    <motion.div
                      key={i}
                      className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5"
                      initial={{ opacity: 0, x: 30 }}
                      animate={mockupInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.45, delay: 1.2 + i * 0.2, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <motion.div
                        className={`size-2.5 shrink-0 rounded-full ${item.dot}`}
                        initial={{ scale: 0 }}
                        animate={mockupInView ? { scale: 1 } : {}}
                        transition={{ delay: 1.35 + i * 0.2, type: "spring", stiffness: 400, damping: 15 }}
                      />
                      <span className="flex-1 truncate text-[13px] text-white/80">{item.text}</span>
                      <span className="shrink-0 text-[12px] tabular-nums text-white/30">{item.count}</span>
                      <span className="shrink-0 rounded bg-white/[0.06] px-2 py-0.5 text-[10px] font-mono text-white/40">{item.tag}</span>
                    </motion.div>
                  ))}

                  {/* AI suggestion */}
                  <motion.div
                    className="mt-1 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] p-4"
                    initial={{ opacity: 0, y: 12 }}
                    animate={mockupInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 2.4, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="mb-2 flex items-center gap-1.5">
                      <Lightbulb className="size-3.5 text-amber-400" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/80">AI Fix Suggestion</span>
                    </div>
                    <div className="text-[13px] leading-relaxed text-amber-200/70">
                      Add descriptive alt text to the hero image:{" "}
                      <code className="rounded bg-amber-400/10 px-1.5 py-0.5 text-[12px] text-amber-300">
                        alt=&quot;Team collaborating on audit&quot;
                      </code>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats below mockup */}
          <motion.div
            className="mt-10 grid grid-cols-3 gap-8 text-center"
            initial={{ opacity: 0, y: 16 }}
            animate={mockupInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 2.8, duration: 0.6 }}
          >
            {[
              { value: "50+", label: "WCAG 2.1 rules checked" },
              { value: "3x", label: "Concurrent page scanners" },
              { value: "100%", label: "AI-enriched suggestions" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-extrabold text-white">{s.value}</div>
                <div className="mt-0.5 text-[11px] text-white/30">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  );
}
