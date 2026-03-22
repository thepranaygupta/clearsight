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
  ChevronDown,
} from "lucide-react";

const pipeline = [
  {
    icon: Globe,
    title: "Discovery",
    subtitle: "BFS crawl + sitemap parsing",
    description: "ClearSight starts from your root URL and discovers every page on your site.",
    details: [
      "Follows every internal link via breadth-first search",
      "Parses sitemap.xml for URLs not linked in navigation",
      "Same-origin filter — only crawls pages on your domain",
      "URL normalization deduplicates trailing slashes, fragments, and tracking params",
      "Configurable page limit and throttle delay between requests",
    ],
  },
  {
    icon: Scan,
    title: "Page scanning",
    subtitle: "Concurrent Playwright + axe-core",
    description: "Each page is rendered in a real browser and tested against 50+ accessibility rules.",
    details: [
      "Rendered in headless Chromium at 1280x720 viewport",
      "axe-core runs 50+ WCAG 2.1 Level A and AA rule checks",
      "Custom engines check link text quality and touch target sizing (48x48px)",
      "Screenshots captured for visual element inspection",
      "Bounding boxes computed for every flagged element",
      "Up to 3 pages scanned concurrently",
    ],
  },
  {
    icon: Brain,
    title: "AI enrichment",
    subtitle: "ClearSight AI engine",
    description: "Every issue gets enriched with AI-generated descriptions and fix suggestions.",
    details: [
      "Each issue analyzed with full page context for human-readable descriptions",
      "Actionable fix suggestions with code examples",
      "Confidence scores (0-100) assigned to each finding",
      "Falls back to axe-core help text if AI is unavailable",
      "Up to 2 parallel enrichment calls",
      "Preliminary results visible while enrichment runs",
    ],
  },
  {
    icon: FileBarChart,
    title: "Results & export",
    subtitle: "Score, track, and share",
    description: "Get a scored report with prioritized issues you can track and share.",
    details: [
      "Accessibility score (0-100) per page and aggregated per site",
      "Issues categorized as confirmed violations or potential concerns",
      "Four severity levels: critical, serious, moderate, minor",
      "Issue tracking across crawls — new, fixed, recurring",
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
      "BullMQ + Redis manages crawl-discovery, page-scan, and ai-enrichment as separate queues with independent concurrency, retry, and backoff.",
  },
  {
    icon: GitCompareArrows,
    title: "Cross-crawl issue tracking",
    description:
      "Every issue gets a SHA-256 hash. Re-crawls compare hashes to show what's new, fixed, or recurring. Dismissed issues stay dismissed.",
  },
  {
    icon: Zap,
    title: "Progressive results",
    description:
      "Raw findings are saved before AI enrichment starts. The frontend shows preliminary results immediately, then upgrades them as AI completes.",
  },
  {
    icon: Shield,
    title: "Fault-tolerant pipeline",
    description:
      "Automatic retry with exponential backoff. AI failures fall back to raw descriptions. Stalled jobs are recovered automatically.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="pt-28 sm:pt-36">
        <div className="mx-auto max-w-6xl px-6">
          {/* Header */}
          <div className="mb-14 max-w-lg">
            <h1 className="text-3xl font-extrabold tracking-[-0.02em] text-foreground sm:text-4xl">
              From URL to audit report
            </h1>
            <p className="mt-3 text-[16px] leading-[1.7] text-muted-foreground">
              Four stages, fully automated. Here&apos;s what happens when you scan.
            </p>
          </div>

          {/* Pipeline — numbered cards with arrows between */}
          <div className="space-y-4">
            {pipeline.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.title}>
                  <div className="rounded-2xl border border-border/50 bg-card p-6 sm:p-8">
                    <div className="flex flex-col gap-6 sm:flex-row">
                      {/* Left: number + icon */}
                      <div className="flex shrink-0 items-start gap-4 sm:w-48 sm:flex-col sm:gap-2">
                        <div className="flex size-11 items-center justify-center rounded-xl bg-muted">
                          <Icon className="size-5 text-foreground" />
                        </div>
                        <div>
                          <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            Step {i + 1} of 4
                          </div>
                          <h2 className="text-lg font-bold text-foreground">{step.title}</h2>
                          <p className="text-[12px] text-muted-foreground">{step.subtitle}</p>
                        </div>
                      </div>

                      {/* Right: content */}
                      <div className="flex-1">
                        <p className="mb-4 text-[15px] leading-[1.7] text-foreground/80">
                          {step.description}
                        </p>
                        <ul className="space-y-2">
                          {step.details.map((detail) => (
                            <li
                              key={detail}
                              className="flex items-start gap-2.5 text-[14px] leading-[1.6] text-muted-foreground"
                            >
                              <span className="mt-2 block size-1 shrink-0 rounded-full bg-muted-foreground/30" />
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Arrow between cards */}
                  {i < pipeline.length - 1 && (
                    <div className="flex justify-center py-1">
                      <ChevronDown className="size-5 text-border" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Architecture */}
        <div className="mt-20 border-t border-border/30 bg-muted/20 py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-12 max-w-lg">
              <h2 className="text-2xl font-extrabold tracking-[-0.02em] text-foreground">
                Built for reliability
              </h2>
              <p className="mt-2 text-[15px] leading-[1.7] text-muted-foreground">
                Three concurrent queues, automatic retry, progressive results, and graceful degradation.
              </p>
            </div>

            <div className="grid gap-px overflow-hidden rounded-2xl border border-border/50 bg-border/30 sm:grid-cols-2">
              {architecture.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="bg-card p-7">
                    <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-muted">
                      <Icon className="size-4 text-foreground/70" />
                    </div>
                    <h3 className="mb-2 text-[15px] font-bold text-foreground">{item.title}</h3>
                    <p className="text-[14px] leading-[1.7] text-muted-foreground">{item.description}</p>
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
