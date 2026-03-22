"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section ref={ref} className="relative overflow-hidden pt-36 pb-24 sm:pt-40 sm:pb-28" style={{ background: "radial-gradient(circle at 50% -20%, #2A0A0E 0%, #0A0505 100%)" }}>
      {/* Dot grid */}
      <div className="pointer-events-none absolute inset-0 opacity-40" style={{
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }} />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Centered headline */}
        <div className="mb-16 text-center">
          <motion.h1
            className="mb-6 text-4xl font-bold leading-[0.95] tracking-tighter text-white md:text-6xl"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Accessibility at the
            <br />
            <span className="bg-gradient-to-r from-[#E90029] to-rose-400 bg-clip-text text-transparent">
              speed of thought
            </span>
          </motion.h1>

          <motion.p
            className="mx-auto mb-8 max-w-xl text-base font-medium leading-relaxed text-gray-400 md:text-lg"
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Automate manual compliance workflows. Real-time DOM scanning and
            AI-driven remediation suggestions built for modern engineering teams.
          </motion.p>

          <motion.div
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link
              href="/dashboard"
              className="group flex items-center gap-2 rounded bg-[#E90029] px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-[#E90029]/20 transition-all hover:bg-red-600"
            >
              Start your first scan
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href={process.env.NEXT_PUBLIC_DOCS_URL || "http://localhost:3002"}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded border border-white/10 bg-white/5 px-7 py-3.5 text-sm font-bold text-white transition-colors hover:bg-white/10"
            >
              View Docs
            </Link>
          </motion.div>
        </div>

        {/* Dashboard mockup */}
        <motion.div
          className="group relative mx-auto max-w-5xl"
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Glow */}
          <div className="absolute -inset-1 rounded bg-gradient-to-r from-[#E90029]/30 to-rose-500/30 opacity-30 blur transition-opacity duration-1000 group-hover:opacity-50" />

          <div className="relative overflow-hidden rounded-t border border-white/10 bg-[#0A0505]/90 p-1.5 shadow-2xl" style={{ boxShadow: "0 0 80px -20px rgba(233, 0, 41, 0.2)" }}>
            <div className="rounded-t-sm border border-white/5 bg-[#0A0505]/90 p-6">
              {/* Browser chrome */}
              <div className="mb-8 flex items-center gap-2 px-2">
                <div className="flex gap-1.5">
                  <div className="size-3 rounded-full bg-[#FF5F56]" />
                  <div className="size-3 rounded-full bg-[#FFBD2E]" />
                  <div className="size-3 rounded-full bg-[#27C93F]" />
                </div>
                <span className="ml-6 font-mono text-xs tracking-wider text-gray-500 opacity-60">
                  app.clearsight.dev / dashboard / audit
                </span>
              </div>

              {/* Stats row */}
              <div className="mb-12 grid grid-cols-2 gap-6 lg:grid-cols-4">
                {[
                  { label: "Health Score", value: "72.4", color: "text-yellow-500" },
                  { label: "Total Pages", value: "12", color: "text-white" },
                  { label: "Critical Issues", value: "47", color: "text-[#E90029]" },
                  { label: "Remediated", value: "23", color: "text-green-500" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded border border-white/10 bg-white/5 p-5">
                    <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">{stat.label}</div>
                    <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* Chart */}
              <div className="relative mb-10 h-32 w-full overflow-hidden" aria-hidden="true">
                <svg className="size-full" preserveAspectRatio="none" viewBox="0 0 1000 120">
                  <path d="M0 100 Q 250 80, 500 70 T 1000 40" fill="none" stroke="#E90029" strokeWidth="3" />
                  <path d="M0 100 Q 250 80, 500 70 T 1000 40 L 1000 120 L 0 120 Z" fill="url(#heroGrad)" opacity="0.15" />
                  <defs>
                    <linearGradient id="heroGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#E90029" stopOpacity="1" />
                      <stop offset="100%" stopColor="#E90029" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Issue rows */}
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded border border-white/5 bg-white/5 p-4">
                  <div className="flex items-center gap-4">
                    <div className="size-2.5 animate-pulse rounded-full bg-yellow-500" />
                    <span className="text-sm text-gray-400">Missing descriptive alt text on primary hero images</span>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded border border-[#E90029]/30 bg-[#E90029]/10 p-4 ring-1 ring-[#E90029]/20">
                  <div className="flex items-center gap-4">
                    <div className="size-2.5 rounded-full bg-[#E90029]" />
                    <span className="text-sm font-semibold tracking-wide text-gray-100">Critical: Interactive touch targets below 48x48px on mobile</span>
                  </div>
                  <span className="rounded bg-[#E90029] px-2 py-1 text-[10px] font-bold tracking-wider text-white">CRITICAL</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
