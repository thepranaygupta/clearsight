import { Navbar } from "@/components/landing/Navbar";
import { CTABand } from "@/components/landing/CTABand";
import { Footer } from "@/components/landing/Footer";
import Link from "next/link";
import {
  ArrowRight,
  Scan,
  Brain,
  Code2,
  Keyboard,
  Palette,
  Shield,
  Building2,
  CreditCard,
  ShoppingCart,
} from "lucide-react";

// ─── Two-column hero ──────────────────────────────────────────────

function SolutionsHero() {
  return (
    <section className="relative overflow-hidden bg-[#f0f4f8] pt-32 pb-20 sm:pt-40 sm:pb-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: copy */}
          <div>
            <h1 className="text-[clamp(2.2rem,4.5vw,3.5rem)] leading-[1.08] font-extrabold tracking-[-0.03em] text-foreground">
              Precision Accessibility.
              <br />
              <span className="text-[#E90029]">Automated at scale.</span>
            </h1>
            <p className="mt-5 max-w-md text-[16px] leading-[1.7] text-muted-foreground">
              ClearSight bridges the gap between manual auditing and production-ready
              remediation. Deploy accessible products faster with developer-first tools.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <Link
                href="/dashboard"
                className="group flex items-center gap-2 rounded-lg bg-[#E90029] px-5 py-2.5 text-[14px] font-semibold text-white shadow-lg shadow-[#E90029]/15 transition-all hover:bg-[#D10025]"
              >
                Start Free Audit
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href={process.env.NEXT_PUBLIC_DOCS_URL || "http://localhost:3002"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-[14px] font-semibold text-foreground transition-colors hover:bg-muted"
              >
                Read Documentation
              </Link>
            </div>
          </div>

          {/* Right: product mockup */}
          <div className="relative hidden lg:block">
            <div className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-2xl shadow-black/[0.06]">
              {/* Mockup showing dashboard with score */}
              <div className="p-6">
                {/* Header */}
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-lg bg-[#E90029]/10 flex items-center justify-center">
                      <Scan className="size-4 text-[#E90029]" />
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-foreground">Mockboard</div>
                      <div className="text-[10px] text-muted-foreground">mockboard.io</div>
                    </div>
                  </div>
                  <div className="rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                    Scan Complete
                  </div>
                </div>

                {/* Score gauges row */}
                <div className="mb-4 grid grid-cols-4 gap-3">
                  {[
                    { label: "Perceivable", score: 94, color: "#16A34A" },
                    { label: "Operable", score: 88, color: "#16A34A" },
                    { label: "Understandable", score: 100, color: "#16A34A" },
                    { label: "Robust", score: 96, color: "#16A34A" },
                  ].map((g) => (
                    <div key={g.label} className="text-center">
                      <div className="relative mx-auto size-14">
                        <svg viewBox="0 0 56 56" className="size-full -rotate-90">
                          <circle cx="28" cy="28" r="22" fill="none" stroke="#f1f5f9" strokeWidth="4" />
                          <circle cx="28" cy="28" r="22" fill="none" stroke={g.color} strokeWidth="4" strokeLinecap="round"
                            strokeDasharray={`${(g.score / 100) * 2 * Math.PI * 22} ${2 * Math.PI * 22}`}
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-foreground">{g.score}</span>
                      </div>
                      <div className="mt-1 text-[8px] text-muted-foreground">{g.label}</div>
                    </div>
                  ))}
                </div>

                {/* Mini issue list */}
                <div className="space-y-1.5">
                  {[
                    { sev: "bg-red-500", text: "Missing alt attribute on img", tag: "1.1.1" },
                    { sev: "bg-orange-500", text: "Color contrast below 4.5:1", tag: "1.4.3" },
                    { sev: "bg-blue-400", text: "Missing landmark role", tag: "1.3.1" },
                  ].map((issue, i) => (
                    <div key={i} className="flex items-center gap-2 rounded border border-border/40 bg-muted/20 p-2">
                      <span className={`size-1.5 shrink-0 rounded-full ${issue.sev}`} />
                      <span className="flex-1 text-[11px] text-foreground/70">{issue.text}</span>
                      <span className="font-mono text-[9px] text-muted-foreground">{issue.tag}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating score badge */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 rounded-xl bg-[#E90029] px-5 py-2.5 shadow-lg shadow-[#E90029]/25">
              <div className="text-[10px] font-semibold text-white/70 uppercase tracking-wider">Real-Time Score</div>
              <div className="text-2xl font-extrabold text-white">98.4%</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Bento feature grid ───────────────────────────────────────────

function BentoFeatures() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-14 max-w-lg">
          <h2 className="text-3xl font-extrabold tracking-[-0.02em] text-foreground">
            The Platform for Digital Authority
          </h2>
          <p className="mt-3 text-[15px] leading-[1.7] text-muted-foreground">
            Every component in our ecosystem is designed for high-density precision,
            ensuring your team spends more time building and less time troubleshooting.
          </p>
        </div>

        {/* Bento grid — asymmetric */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Large card */}
          <div className="sm:col-span-2 rounded-xl border border-border bg-card p-8">
            <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-muted">
              <Scan className="size-5 text-foreground/70" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-foreground">Automated WCAG 2.1 Auditing</h3>
            <p className="max-w-md text-[14px] leading-[1.7] text-muted-foreground">
              Our engine scans your entire DOM tree, identifying violations
              across A and AA levels with axe-core and custom accessibility engines.
            </p>
            {/* Mini code mockup */}
            <div className="mt-6 rounded-lg bg-[#0f0f12] border border-white/[0.06] p-4 font-mono text-[12px]">
              <div className="flex items-center gap-2 mb-2">
                <span className="size-1.5 rounded-full bg-red-500" />
                <span className="text-red-400 text-[10px] font-bold uppercase">Violation: Missing Alt Text [IMG_042]</span>
              </div>
              <div className="text-white/40">&lt;img src=&quot;/assets/hero.jpg&quot; class=&quot;w-full&quot; /&gt;</div>
              <div className="mt-2 text-amber-400/80">Suggested Remediation: Add aria-label or alt attribute.</div>
            </div>
          </div>

          {/* AI card — accent colored */}
          <div className="rounded-xl border border-[#E90029]/20 bg-[#E90029]/[0.03] p-8">
            <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-[#E90029]/10">
              <Brain className="size-5 text-[#E90029]" />
            </div>
            <h3 className="mb-2 text-lg font-bold text-foreground">AI-Powered Remediation</h3>
            <p className="text-[14px] leading-[1.7] text-muted-foreground">
              Don&apos;t just find issues. Fix them. Our AI suggests exact code snippets
              to resolve aria-conflicts and contrast issues instantly.
            </p>
          </div>

          {/* Full-site crawling */}
          <div className="rounded-xl border border-border bg-card p-7">
            <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-muted">
              <Code2 className="size-4 text-foreground/70" />
            </div>
            <h3 className="mb-1.5 text-[15px] font-bold text-foreground">Full-Site Crawling</h3>
            <p className="text-[13px] leading-[1.7] text-muted-foreground">
              BFS link discovery + sitemap parsing finds every page. Three concurrent
              Playwright browsers scan your entire site in minutes.
            </p>
          </div>

          {/* Issue tracking */}
          <div className="rounded-xl border border-border bg-card p-7">
            <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-muted">
              <Palette className="size-4 text-foreground/70" />
            </div>
            <h3 className="mb-1.5 text-[15px] font-bold text-foreground">Cross-Crawl Issue Tracking</h3>
            <p className="text-[13px] leading-[1.7] text-muted-foreground">
              Deterministic issue hashes track what&apos;s new, fixed, or recurring
              across crawls. Dismiss false positives once — they stay dismissed.
            </p>
          </div>

          {/* Technical integrity — full width */}
          <div className="sm:col-span-2 lg:col-span-1 rounded-xl border border-border bg-card p-7">
            <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-muted">
              <Keyboard className="size-4 text-foreground/70" />
            </div>
            <h3 className="mb-1.5 text-[15px] font-bold text-foreground">Keyboard & Focus Trapping</h3>
            <p className="text-[13px] leading-[1.7] text-muted-foreground">
              Simulates keyboard navigation to identify traps and focus sequence errors
              across modals, dropdowns, and complex interactive patterns.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Technical integrity section ──────────────────────────────────

function TechnicalSection() {
  return (
    <section className="border-t border-border/30 bg-muted/20 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left: copy */}
          <div>
            <h2 className="text-3xl font-extrabold tracking-[-0.02em] text-foreground">
              Engineered for Technical Integrity.
            </h2>
            <p className="mt-3 max-w-md text-[15px] leading-[1.7] text-muted-foreground">
              Accessibility shouldn&apos;t be an afterthought. Our platform treats accessibility
              like unit tests: mandatory, automated, and strictly typed.
            </p>
            <div className="mt-8 space-y-5">
              {[
                { icon: Shield, title: "Semantic Structure Validation", desc: "Validates heading levels (H1-H6) and landmark roles to ensure screen reader logic is sound." },
                { icon: Palette, title: "Color Contrast Engine", desc: "Calculates APCA and WCAG 2.1 contrast ratios dynamically across complex backgrounds." },
                { icon: Keyboard, title: "Interactive Focus Trapping", desc: "Simulates keyboard navigation to identify traps and focus sequence errors." },
              ].map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#E90029]/[0.06]">
                    <item.icon className="size-4 text-[#E90029]" />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-foreground">{item.title}</h3>
                    <p className="mt-0.5 text-[13px] leading-[1.6] text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: config mockup */}
          <div className="hidden lg:block">
            <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#0f0f12] shadow-2xl">
              <div className="flex items-center gap-1.5 border-b border-white/[0.06] bg-white/[0.02] px-4 py-2.5">
                <div className="size-2.5 rounded-full bg-white/10" />
                <div className="size-2.5 rounded-full bg-white/10" />
                <div className="size-2.5 rounded-full bg-white/10" />
                <span className="ml-3 font-mono text-[11px] text-white/30">clearsight-config.json</span>
                <span className="ml-auto rounded bg-emerald-500/10 px-2 py-0.5 font-mono text-[9px] text-emerald-400">READ ONLY</span>
              </div>
              <div className="p-5 font-mono text-[12px] leading-[2] text-white/50">
                <div>{`{`}</div>
                <div className="pl-4"><span className="text-[#9ece6a]">&quot;audit_mode&quot;</span>: <span className="text-[#e0af68]">&quot;strict&quot;</span>,</div>
                <div className="pl-4"><span className="text-[#9ece6a]">&quot;compliance_levels&quot;</span>: [</div>
                <div className="pl-8"><span className="text-[#e0af68]">&quot;WCAG_2.1_AA&quot;</span>,</div>
                <div className="pl-8"><span className="text-[#e0af68]">&quot;SECTION_508&quot;</span></div>
                <div className="pl-4">],</div>
                <div className="pl-4"><span className="text-[#9ece6a]">&quot;ai_remediation&quot;</span>: {`{`}</div>
                <div className="pl-8"><span className="text-[#9ece6a]">&quot;enabled&quot;</span>: <span className="text-[#7aa2f7]">true</span>,</div>
                <div className="pl-8"><span className="text-[#9ece6a]">&quot;confidence_threshold&quot;</span>: <span className="text-[#ff9e64]">0.95</span></div>
                <div className="pl-4">{`}`},</div>
                <div className="pl-4"><span className="text-[#9ece6a]">&quot;ci_pipeline&quot;</span>: {`{`}</div>
                <div className="pl-8"><span className="text-[#9ece6a]">&quot;fail_on_critical&quot;</span>: <span className="text-[#7aa2f7]">true</span></div>
                <div className="pl-4">{`}`}</div>
                <div>{`}`}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Industry verticals ───────────────────────────────────────────

function IndustryCards() {
  const industries = [
    {
      icon: Building2,
      title: "Enterprise",
      desc: "Centralized auditing for organizations managing multiple web properties.",
      features: ["Full-site crawling at scale", "PDF & Excel compliance reports", "Issue tracking over time"],
    },
    {
      icon: CreditCard,
      title: "FinTech",
      desc: "Precision auditing for complex data visualizations, forms, and interactive charts.",
      features: ["Dynamic DOM scanning", "Color contrast validation", "Tab-index verification"],
    },
    {
      icon: ShoppingCart,
      title: "E-Commerce",
      desc: "Ensure checkout flows and product pages work for all users.",
      features: ["Form accessibility validation", "ARIA-live region checks", "AI-generated alt text suggestions"],
    },
  ];

  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-6 sm:grid-cols-3">
          {industries.map((ind) => (
            <div key={ind.title} className="rounded-xl border border-border bg-card p-7">
              <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-muted">
                <ind.icon className="size-5 text-foreground/70" />
              </div>
              <h3 className="mb-1.5 text-lg font-bold text-foreground">{ind.title}</h3>
              <p className="mb-4 text-[13px] leading-[1.7] text-muted-foreground">{ind.desc}</p>
              <ul className="space-y-2">
                {ind.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-[#E90029]" />
                    <span className="text-[13px] text-foreground/70">{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/dashboard"
                className="mt-5 inline-flex items-center gap-1 text-[13px] font-semibold text-[#E90029] transition-colors hover:text-[#D10025]"
              >
                View Solutions <ArrowRight className="size-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────

export default function SolutionsPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <SolutionsHero />
        <BentoFeatures />
        <TechnicalSection />
        <IndustryCards />
        <CTABand />
      </main>
      <Footer />
    </div>
  );
}
