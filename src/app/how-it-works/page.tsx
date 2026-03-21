import { Navbar } from "@/components/landing/Navbar";
import { CTABand } from "@/components/landing/CTABand";
import { Footer } from "@/components/landing/Footer";
import {
  Globe,
  Scan,
  Brain,
  FileBarChart,
  Layers,
  GitCompareArrows,
  Zap,
  Shield,
  ArrowDown,
} from "lucide-react";

const pipeline = [
  {
    icon: Globe,
    title: "Discovery",
    subtitle: "BFS crawl + sitemap parsing",
    color: "text-[#E90029]",
    bg: "bg-[#E90029]/[0.06]",
    details: [
      "Starts from your root URL and follows every internal link",
      "Parses sitemap.xml for URLs not linked in navigation",
      "Same-origin filter — only crawls pages on your domain",
      "URL normalization deduplicates trailing slashes, fragments, and tracking params",
      "Configurable page limit (MAX_CRAWL_PAGES) and crawl delay (CRAWL_DELAY_MS)",
    ],
  },
  {
    icon: Scan,
    title: "Page scanning",
    subtitle: "Concurrent Playwright + axe-core",
    color: "text-orange-600",
    bg: "bg-orange-600/[0.06]",
    details: [
      "Each page rendered in headless Chromium at 1280x720",
      "axe-core runs 50+ WCAG 2.1 Level A and AA rule checks",
      "Custom engines check link text quality and touch target sizing (48x48px)",
      "Screenshots captured for visual element inspection",
      "Bounding boxes computed for every flagged element",
      "Up to 3 pages scanned concurrently (configurable via WORKER_CONCURRENCY)",
    ],
  },
  {
    icon: Brain,
    title: "AI enrichment",
    subtitle: "Azure OpenAI analysis",
    color: "text-violet-600",
    bg: "bg-violet-600/[0.06]",
    details: [
      "Issues sent to LLM for human-readable descriptions",
      "Actionable fix suggestions generated per issue with code examples",
      "Confidence scores (0-100) assigned to each finding",
      "Falls back gracefully to axe-core help text if AI is unavailable",
      "Up to 2 parallel enrichment calls (configurable via AI_CONCURRENCY)",
      "Preliminary results visible while enrichment runs (progressive UX)",
    ],
  },
  {
    icon: FileBarChart,
    title: "Results & export",
    subtitle: "Score, track, and share",
    color: "text-emerald-600",
    bg: "bg-emerald-600/[0.06]",
    details: [
      "Overall accessibility score (0-100) per page and aggregated per site",
      "Issues categorized as confirmed violations or potential concerns",
      "Four severity levels: critical, serious, moderate, minor",
      "Issue tracking across crawls — new, fixed, recurring with deterministic hashes",
      "PDF reports with AI-generated executive summary",
      "Excel spreadsheets with filterable multi-sheet data",
    ],
  },
];

const architecture = [
  {
    icon: Layers,
    title: "Three independent job queues",
    description:
      "BullMQ + Redis manages crawl-discovery, page-scan, and ai-enrichment as separate queues. Each has independent concurrency limits, retry strategies, and exponential backoff.",
  },
  {
    icon: GitCompareArrows,
    title: "Cross-crawl issue tracking",
    description:
      "Every issue gets a SHA-256 hash from its rule, selector, criterion, and page URL. Re-crawls compare hashes to show what's new, fixed, or recurring. Dismissed issues stay dismissed.",
  },
  {
    icon: Zap,
    title: "Progressive results",
    description:
      "An intermediate store stage saves raw findings before AI enrichment starts. The frontend shows preliminary results immediately, then upgrades them in-place as AI completes.",
  },
  {
    icon: Shield,
    title: "Fault-tolerant pipeline",
    description:
      "Automatic retry with exponential backoff per queue. AI failures fall back to raw axe-core descriptions. Stalled jobs are recovered by BullMQ. Scans complete as 'completed_partial' when AI fails.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="pt-32 pb-0 sm:pt-40">
        <div className="mx-auto max-w-4xl px-6">
          {/* Header */}
          <div className="mb-20 max-w-lg">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E90029]">
              How it works
            </p>
            <h1 className="mt-3 text-[clamp(2rem,4vw,3rem)] font-extrabold tracking-[-0.03em] text-foreground">
              From URL to audit report
            </h1>
            <p className="mt-4 text-[16px] leading-[1.75] text-muted-foreground">
              ClearSight runs a four-stage pipeline for every page it scans.
              Here&apos;s exactly what happens when you click &ldquo;Scan now&rdquo;.
            </p>
          </div>

          {/* Pipeline — vertical timeline */}
          <div className="relative mb-24">
            {pipeline.map((step, i) => {
              const Icon = step.icon;
              const isLast = i === pipeline.length - 1;
              return (
                <div key={step.title} className="relative pb-14 last:pb-0">
                  {!isLast && (
                    <div className="absolute top-14 bottom-0 left-5 w-px bg-gradient-to-b from-border to-border/10 sm:left-6" />
                  )}

                  <div className="flex gap-6 sm:gap-8">
                    {/* Icon */}
                    <div className="relative shrink-0">
                      <div className={`flex size-10 items-center justify-center rounded-xl ${step.bg} sm:size-12`}>
                        <Icon className={`size-[18px] ${step.color} sm:size-5`} />
                      </div>
                      {!isLast && (
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                          <ArrowDown className="size-3 text-border/60" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1 pt-0.5">
                      <h2 className="text-lg font-bold text-foreground">
                        {step.title}
                      </h2>
                      <p className="mt-0.5 font-mono text-[11px] text-muted-foreground/40">
                        {step.subtitle}
                      </p>
                      <ul className="mt-4 space-y-2.5">
                        {step.details.map((detail) => (
                          <li
                            key={detail}
                            className="flex items-start gap-2.5 text-[14px] leading-[1.6] text-muted-foreground"
                          >
                            <span className="mt-2 block size-1 shrink-0 rounded-full bg-border" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Architecture section */}
          <div className="mb-0">
            <div className="mb-12 max-w-lg">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E90029]">
                Architecture
              </p>
              <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.02em] text-foreground">
                Built for reliability at scale
              </h2>
              <p className="mt-3 text-[15px] leading-[1.7] text-muted-foreground">
                Three concurrent queues, automatic retry, progressive results, and graceful degradation.
              </p>
            </div>

            <div className="grid gap-px overflow-hidden rounded-2xl border border-border/50 bg-border/30 sm:grid-cols-2">
              {architecture.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="bg-card p-7"
                  >
                    <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-muted/80">
                      <Icon className="size-4 text-muted-foreground" />
                    </div>
                    <h3 className="mb-2 text-[15px] font-bold text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-[13px] leading-[1.7] text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      <CTABand />
      <Footer />
    </div>
  );
}
