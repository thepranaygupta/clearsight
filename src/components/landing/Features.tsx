import {
  ShieldCheck,
  Sparkles,
  Globe,
  GitCompareArrows,
  MousePointerClick,
  FileDown,
} from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "WCAG 2.1 Level A & AA",
    description: "50+ axe-core rules plus custom engines for link text quality and touch target sizing.",
  },
  {
    icon: Sparkles,
    title: "AI-enriched fix suggestions",
    description: "Every issue gets a plain-English description and a specific, actionable fix suggestion.",
  },
  {
    icon: Globe,
    title: "Full-site crawling",
    description: "BFS discovery follows every internal link. Sitemap parsing. Configurable parallelism and page limits.",
  },
  {
    icon: GitCompareArrows,
    title: "Issue tracking across crawls",
    description: "Deterministic hashes track what's new, fixed, or recurring. Dismiss false positives.",
  },
  {
    icon: MousePointerClick,
    title: "Visual element inspector",
    description: "See the exact element highlighted on a screenshot. Toggle to HTML source. Navigate between occurrences.",
  },
  {
    icon: FileDown,
    title: "PDF & Excel export",
    description: "Executive-summary PDFs for stakeholders. Filterable Excel spreadsheets for dev teams.",
  },
];

export function Features() {
  return (
    <section className="border-t border-border/30 bg-muted/20 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 max-w-md">
          <h2 className="text-2xl font-extrabold tracking-[-0.02em] text-foreground">
            Everything you need for compliance
          </h2>
        </div>

        <div className="grid gap-px overflow-hidden rounded-2xl border border-border/50 bg-border/30 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="bg-card p-7">
                <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-muted/80">
                  <Icon className="size-[16px] text-muted-foreground" />
                </div>
                <h3 className="mb-1.5 text-[15px] font-bold text-foreground">{feature.title}</h3>
                <p className="text-[13px] leading-[1.7] text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
