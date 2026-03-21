"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, useInView } from "motion/react";
import { ArrowRight, Loader2 } from "lucide-react";

const badges = ["WCAG 2.1", "ADA", "Section 508", "EAA"];

export function Hero() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

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
    <section ref={ref} className="pt-28 pb-16 sm:pt-36 sm:pb-20">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <motion.h1
          className="text-[clamp(2.2rem,5.5vw,3.8rem)] leading-[1.1] font-extrabold tracking-[-0.03em] text-foreground"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          Your website has accessibility issues.{" "}
          <span className="text-[#E90029]">We&apos;ll find every one.</span>
        </motion.h1>

        <motion.p
          className="mx-auto mt-5 max-w-lg text-[16px] leading-[1.7] text-muted-foreground"
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        >
          AI-powered WCAG 2.1 scanning with prioritized fix suggestions.
          Free. No signup. Results in minutes.
        </motion.p>

        {/* URL input */}
        <motion.form
          onSubmit={handleSubmit}
          className="mx-auto mt-8 max-w-lg"
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
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
        </motion.form>

        {/* Compliance badges */}
        <motion.div
          className="mt-6 flex items-center justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.24 }}
        >
          {badges.map((badge) => (
            <span
              key={badge}
              className="rounded-md border border-border/60 bg-muted/40 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground/70"
            >
              {badge}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
