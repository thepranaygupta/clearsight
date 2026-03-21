import { Navbar } from "@/components/landing/Navbar";
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
} from "lucide-react";

const pipeline = [
  {
    icon: Globe,
    title: "1. Discovery",
    subtitle: "BFS crawl + sitemap parsing",
    details: [
      "Starts from your root URL and follows every internal link",
      "Parses sitemap.xml for URLs not in navigation",
      "Same-origin filter prevents crawling external sites",
      "Configurable page limit and throttle delay",
      "URL normalization deduplicates trailing slashes and tracking params",
    ],
  },
  {
    icon: Scan,
    title: "2. Page scanning",
    subtitle: "Concurrent Playwright + axe-core",
    details: [
      "Each page rendered in headless Chromium (1280x720)",
      "axe-core runs 50+ WCAG 2.1 A/AA rule checks",
      "Custom engines check link text quality and touch target sizing",
      "Screenshots captured for visual element inspection",
      "Up to 3 pages scanned concurrently",
    ],
  },
  {
    icon: Brain,
    title: "3. AI enrichment",
    subtitle: "Azure OpenAI analysis",
    details: [
      "Issues sent to LLM for human-readable descriptions",
      "Actionable fix suggestions generated per issue",
      "Confidence scores assigned to each finding",
      "Falls back gracefully if AI is unavailable",
      "Up to 2 parallel enrichment calls",
    ],
  },
  {
    icon: FileBarChart,
    title: "4. Results",
    subtitle: "Score, track, and export",
    details: [
      "Overall accessibility score (0-100) per page and site",
      "Issues categorized as confirmed or potential",
      "Severity levels: critical, serious, moderate, minor",
      "PDF reports with executive summary",
      "Excel spreadsheets with filterable data",
    ],
  },
];

const architecture = [
  {
    icon: Layers,
    title: "Three job queues",
    description:
      "BullMQ + Redis manages crawl-discovery, page-scan, and ai-enrichment as separate queues with independent concurrency and retry strategies.",
  },
  {
    icon: GitCompareArrows,
    title: "Issue tracking",
    description:
      "Deterministic issue hashes enable tracking across crawls. See which issues are new, fixed, or recurring. Dismiss false positives.",
  },
  {
    icon: Zap,
    title: "Progressive results",
    description:
      "Preliminary results appear while AI enrichment runs. No waiting for the full pipeline to finish before seeing findings.",
  },
  {
    icon: Shield,
    title: "Fault tolerant",
    description:
      "Automatic retry with exponential backoff. AI failures fall back to raw findings. Stalled jobs are recovered automatically.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="pt-28 pb-20">
        <div className="mx-auto max-w-4xl px-6">
          {/* Header */}
          <div className="mb-16 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">
              How it works
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              From URL to audit report
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
              ClearSight crawls your site, scans every page for WCAG violations,
              enriches findings with AI, and delivers actionable results.
            </p>
          </div>

          {/* Pipeline steps */}
          <div className="space-y-6">
            {pipeline.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="rounded-2xl border border-border/40 bg-card p-6 sm:p-8"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-primary/[0.08]">
                      <Icon className="size-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-foreground">
                        {step.title}
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        {step.subtitle}
                      </p>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {step.details.map((detail) => (
                      <li
                        key={detail}
                        className="flex items-start gap-2 text-[13px] leading-relaxed text-muted-foreground"
                      >
                        <span className="mt-1.5 block size-1 shrink-0 rounded-full bg-primary/40" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Architecture section */}
          <div className="mt-20">
            <div className="mb-10 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">
                Architecture
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                Built for reliability
              </h2>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {architecture.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-border/40 bg-card p-6"
                  >
                    <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-muted/60">
                      <Icon className="size-4 text-muted-foreground" />
                    </div>
                    <h3 className="mb-1.5 text-sm font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-[13px] leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
