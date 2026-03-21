import { Globe, Scan, Brain, FileBarChart } from "lucide-react";

const steps = [
  {
    num: "01",
    icon: Globe,
    title: "Enter your URL",
    description:
      "Paste your website URL and we'll crawl every page — following links, parsing sitemaps, and discovering all same-origin content.",
  },
  {
    num: "02",
    icon: Scan,
    title: "We crawl & analyze",
    description:
      "Each page is rendered in a real browser, then checked against 50+ WCAG 2.1 rules using axe-core and custom engines. Concurrently.",
  },
  {
    num: "03",
    icon: Brain,
    title: "AI enriches results",
    description:
      "Every issue gets an AI-generated description, fix suggestion, and confidence score. No more guessing what went wrong or how to fix it.",
  },
  {
    num: "04",
    icon: FileBarChart,
    title: "Actionable report",
    description:
      "See your score, drill into issues, compare across crawls, and export to PDF or Excel. Track progress over time.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-t border-border/30 bg-muted/20 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">
            How it works
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Four steps to a full audit
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="group relative rounded-2xl border border-border/40 bg-card p-6 transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/[0.03]"
              >
                {/* Step number */}
                <span className="absolute -top-3 -right-2 flex size-6 items-center justify-center rounded-md bg-foreground font-mono text-[10px] font-bold text-background">
                  {step.num}
                </span>

                <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-muted/60 transition-colors group-hover:bg-primary/[0.08]">
                  <Icon className="size-5 text-muted-foreground transition-colors group-hover:text-primary" />
                </div>

                <h3 className="mb-2 text-sm font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="text-[13px] leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
