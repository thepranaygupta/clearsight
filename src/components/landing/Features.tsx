import {
  Globe,
  GitCompareArrows,
  Brain,
  MousePointerClick,
  FileDown,
  ShieldCheck,
} from "lucide-react";

const features = [
  {
    icon: Globe,
    title: "Full-site crawling",
    description:
      "BFS discovery follows every internal link and parses sitemaps. Scan 10 or 10,000 pages — all concurrently.",
  },
  {
    icon: GitCompareArrows,
    title: "Issue tracking across crawls",
    description:
      "Track new, fixed, and recurring issues between crawls. Dismiss false positives. See your progress over time.",
  },
  {
    icon: Brain,
    title: "AI-generated fix suggestions",
    description:
      "Every issue comes with a clear explanation and actionable fix suggestion — powered by Azure OpenAI.",
  },
  {
    icon: MousePointerClick,
    title: "Visual element inspector",
    description:
      "See the exact element on a screenshot. Switch to HTML view. Navigate between occurrences. Zoom, pan, highlight.",
  },
  {
    icon: FileDown,
    title: "PDF & Excel export",
    description:
      "Generate executive-summary PDF reports or filterable Excel spreadsheets. Share with stakeholders who don't use the tool.",
  },
  {
    icon: ShieldCheck,
    title: "WCAG 2.1 A & AA coverage",
    description:
      "50+ axe-core rules plus custom checks for link text and touch targets. Confirmed and potential issues separated.",
  },
];

export function Features() {
  return (
    <section className="border-t border-border/30 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">
            Features
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Everything you need for compliance
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group rounded-2xl border border-border/40 bg-card p-6 transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/[0.03]"
              >
                <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-muted/60 transition-colors group-hover:bg-primary/[0.08]">
                  <Icon className="size-5 text-muted-foreground transition-colors group-hover:text-primary" />
                </div>
                <h3 className="mb-2 text-sm font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-[13px] leading-relaxed text-muted-foreground">
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
