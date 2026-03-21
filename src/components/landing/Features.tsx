import {
  Globe,
  GitCompareArrows,
  Brain,
  MousePointerClick,
  FileDown,
  ShieldCheck,
  Gauge,
} from "lucide-react";

const heroFeature = {
  icon: Brain,
  title: "AI-powered fix suggestions",
  description:
    "Every accessibility issue comes with an AI-generated explanation in plain English and a step-by-step fix suggestion. No more reading through WCAG spec documents to understand what went wrong — ClearSight tells you exactly what to change and why.",
  details: [
    "Human-readable descriptions for every issue",
    "Actionable code-level fix suggestions",
    "Confidence scores (0-100) per finding",
    "Graceful fallback if AI is unavailable",
  ],
};

const features = [
  {
    icon: Globe,
    title: "Full-site crawling",
    description:
      "BFS discovery follows every internal link and parses sitemaps. Configurable parallelism and page limits.",
  },
  {
    icon: GitCompareArrows,
    title: "Issue tracking",
    description:
      "Deterministic hashes track issues across crawls. See what's new, fixed, or recurring. Dismiss false positives.",
  },
  {
    icon: MousePointerClick,
    title: "Visual inspector",
    description:
      "See the exact element highlighted on a screenshot. Toggle to HTML view. Navigate between occurrences.",
  },
  {
    icon: FileDown,
    title: "PDF & Excel export",
    description:
      "Executive-summary PDFs and filterable Excel spreadsheets. Share results with anyone.",
  },
  {
    icon: ShieldCheck,
    title: "WCAG 2.1 A & AA",
    description:
      "50+ axe-core rules plus custom engines for link text quality and touch target sizing.",
  },
  {
    icon: Gauge,
    title: "Progressive results",
    description:
      "See preliminary findings while AI enrichment is still running. No waiting for the full pipeline to finish.",
  },
];

export function Features() {
  return (
    <section className="border-t border-border/30 bg-muted/20 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16 max-w-lg">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E90029]">
            Capabilities
          </p>
          <h2 className="mt-3 text-[clamp(1.8rem,3.5vw,2.5rem)] font-extrabold tracking-[-0.02em] text-foreground">
            Everything you need for compliance
          </h2>
        </div>

        {/* Hero feature — full width */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-border/50 bg-card">
          <div className="grid lg:grid-cols-2">
            <div className="p-8 lg:p-10">
              <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-[#E90029]/[0.06]">
                <heroFeature.icon className="size-5 text-[#E90029]" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-foreground">
                {heroFeature.title}
              </h3>
              <p className="text-[14px] leading-[1.7] text-muted-foreground">
                {heroFeature.description}
              </p>
            </div>
            <div className="border-t border-border/30 bg-muted/20 p-8 lg:border-t-0 lg:border-l lg:p-10">
              <ul className="space-y-4">
                {heroFeature.details.map((detail) => (
                  <li key={detail} className="flex items-start gap-3">
                    <div className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#E90029]" />
                    <span className="text-[14px] leading-relaxed text-foreground/80">{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Feature grid */}
        <div className="grid gap-px overflow-hidden rounded-2xl border border-border/50 bg-border/30 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group bg-card p-7 transition-colors duration-300 hover:bg-card/80"
              >
                <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-muted/80 transition-colors duration-300 group-hover:bg-[#E90029]/[0.06]">
                  <Icon className="size-[18px] text-muted-foreground transition-colors duration-300 group-hover:text-[#E90029]" />
                </div>
                <h3 className="mb-2 text-[15px] font-bold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-[13px] leading-[1.7] text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
