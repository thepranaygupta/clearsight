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
    title: "WCAG 2.1 A & AA",
    description: "50+ axe-core rules plus custom engines for link text quality and touch target sizing.",
  },
  {
    icon: Sparkles,
    title: "AI-Enriched Suggestions",
    description: "Every flagged issue gets a plain-English explanation and actionable fix suggestion from our AI engine.",
  },
  {
    icon: Globe,
    title: "Full-Site Discovery",
    description: "BFS discovery follows every internal link. Handles sitemap parsing and concurrent page scanning.",
  },
  {
    icon: GitCompareArrows,
    title: "Issue Regression Tracking",
    description: "Deterministic hashing tracks violations across crawls. Distinguish new, fixed, or recurring issues automatically.",
  },
  {
    icon: MousePointerClick,
    title: "Visual Inspector",
    description: "See exactly where issues reside on a screenshot. Toggle between rendered preview and DOM source code.",
  },
  {
    icon: FileDown,
    title: "Executive Exporting",
    description: "Generate stakeholder-ready PDFs or developer-focused Excel spreadsheets with one click.",
  },
];

export function Features() {
  return (
    <section className="bg-white py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-20 max-w-2xl">
          <h2 className="mb-6 text-4xl font-bold tracking-tight text-foreground">
            Everything you need for full compliance
          </h2>
          <p className="text-lg text-muted-foreground">
            Beyond simple checks. A comprehensive suite for engineering teams who care about inclusion.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group rounded border border-border/50 bg-card p-8 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#E90029]/40 hover:shadow-lg"
              >
                <div className="mb-6 flex size-12 items-center justify-center rounded bg-red-50 text-[#E90029] transition-colors group-hover:bg-[#E90029] group-hover:text-white">
                  <Icon className="size-5" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-foreground">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
