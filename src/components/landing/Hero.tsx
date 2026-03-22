"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section ref={ref} className="relative overflow-hidden bg-[#1a0a0e] pt-32 pb-24 sm:pt-40 sm:pb-32">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-[#E90029]/[0.08] blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 h-[400px] w-[600px] rounded-full bg-[#E90029]/[0.04] blur-[100px]" />
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-5xl px-6 text-center">
        {/* Headline */}
        <motion.h1
          className="text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.08] font-extrabold tracking-[-0.03em] text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Accessibility at the
          <br />
          speed of thought
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          className="mx-auto mt-6 max-w-xl text-[17px] leading-[1.7] text-white/70"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Automate manual compliance workflows with ClearSight. Real-time DOM
          scanning, AI-driven remediation suggestions, and WCAG 2.1 auditing built
          for modern engineering teams.
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="mt-10 flex items-center justify-center gap-4"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Link
            href="/dashboard"
            className="group flex items-center gap-2 rounded-lg bg-[#E90029] px-6 py-3 text-[14px] font-semibold text-white shadow-lg shadow-[#E90029]/25 transition-all hover:bg-[#D10025] hover:shadow-xl hover:shadow-[#E90029]/30"
          >
            Start your first scan
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/how-it-works"
            className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-6 py-3 text-[14px] font-semibold text-white/80 backdrop-blur-sm transition-all hover:bg-white/10 hover:text-white"
          >
            View Demo
          </Link>
        </motion.div>

        {/* Product screenshot */}
        <motion.div
          className="relative mx-auto mt-16 max-w-4xl"
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Glow behind */}
          <div className="absolute -inset-4 rounded-2xl bg-[#E90029]/[0.06] blur-2xl" />

          <div className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-[#0f0f12] shadow-2xl shadow-black/60">
            {/* Browser chrome */}
            <div className="flex h-10 items-center gap-1.5 border-b border-white/[0.06] bg-white/[0.02] px-4">
              <div className="size-2.5 rounded-full bg-white/10" />
              <div className="size-2.5 rounded-full bg-white/10" />
              <div className="size-2.5 rounded-full bg-white/10" />
              <div className="ml-4 flex-1 rounded bg-white/[0.04] px-3 py-1">
                <span className="text-[11px] text-white/20">clearsight / dashboard</span>
              </div>
            </div>

            {/* Dashboard mockup */}
            <div className="p-6">
              {/* Top stats row */}
              <div className="mb-6 grid grid-cols-4 gap-4">
                {[
                  { label: "Score", value: "72", color: "#D97706" },
                  { label: "Pages", value: "12", color: "#64748b" },
                  { label: "Issues", value: "47", color: "#DC2626" },
                  { label: "Fixed", value: "23", color: "#16A34A" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3">
                    <div className="text-[10px] text-white/30 uppercase tracking-wider">{stat.label}</div>
                    <div className="mt-1 text-xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* Chart area mockup */}
              <div className="mb-6 rounded-lg bg-white/[0.02] border border-white/[0.06] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-white/60 uppercase tracking-wider">Score Trend</span>
                  <span className="text-[10px] text-white/20">Last 7 crawls</span>
                </div>
                <svg viewBox="0 0 400 80" className="w-full" aria-hidden="true">
                  <defs>
                    <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#E90029" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#E90029" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,60 C50,55 80,40 120,45 C160,50 200,30 240,25 C280,20 320,15 360,18 L400,15 L400,80 L0,80 Z" fill="url(#chartFill)" />
                  <path d="M0,60 C50,55 80,40 120,45 C160,50 200,30 240,25 C280,20 320,15 360,18 L400,15" fill="none" stroke="#E90029" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>

              {/* Issue detection popup */}
              <div className="relative">
                <div className="absolute right-4 -top-2 z-10 w-[280px] rounded-lg border border-[#DC2626]/30 bg-[#1a1a1f] p-4 shadow-xl">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="size-2 rounded-full bg-[#DC2626]" />
                    <span className="text-[11px] font-bold text-[#DC2626] uppercase tracking-wide">Critical Issue Detected</span>
                  </div>
                  <div className="rounded bg-white/[0.04] border border-white/[0.08] p-2 mb-2">
                    <code className="text-[11px] text-white/60">&lt;button class=&quot;btn-primary&quot;&gt;Submit&lt;/button&gt;</code>
                  </div>
                  <p className="text-[10px] text-white/60 leading-relaxed">
                    Element missing &apos;aria-label&apos; or descriptive text. Fails WCAG 2.1 Criterion 4.1.2.
                  </p>
                </div>

                {/* Issue list below */}
                <div className="space-y-2">
                  {[
                    { sev: "bg-[#DC2626]", text: "Missing alt text on promotional image", tag: "1.1.1" },
                    { sev: "bg-[#D97706]", text: "Low contrast on navigation links", tag: "1.4.3" },
                    { sev: "bg-[#D97706]", text: "Touch target below 48x48px", tag: "2.5.8" },
                  ].map((issue, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg bg-white/[0.02] border border-white/[0.06] p-3">
                      <span className={`size-2 shrink-0 rounded-full ${issue.sev}`} />
                      <span className="flex-1 text-[12px] text-white/70">{issue.text}</span>
                      <span className="rounded bg-white/[0.05] px-1.5 py-0.5 font-mono text-[9px] text-white/30">{issue.tag}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
