import { Globe, Scan, Brain, FileBarChart } from "lucide-react";

const steps = [
  {
    num: "01",
    icon: Globe,
    title: "Enter your URL",
    description:
      "Paste any website URL. We follow every internal link and parse sitemaps to discover all pages automatically.",
    accent: "from-[#E90029]/20 to-transparent",
  },
  {
    num: "02",
    icon: Scan,
    title: "We crawl & analyze",
    description:
      "Each page is rendered in a real Chromium browser, then tested against 50+ WCAG 2.1 rules. Concurrently.",
    accent: "from-orange-500/15 to-transparent",
  },
  {
    num: "03",
    icon: Brain,
    title: "AI enriches results",
    description:
      "Every issue gets an AI-generated explanation, confidence score, and actionable fix suggestion.",
    accent: "from-violet-500/15 to-transparent",
  },
  {
    num: "04",
    icon: FileBarChart,
    title: "Actionable report",
    description:
      "See your score. Drill into issues. Compare across crawls. Export to PDF or Excel.",
    accent: "from-emerald-500/15 to-transparent",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E90029]">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            URL in. Audit out.
          </h2>
          <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted-foreground">
            Four stages, fully automated. Most sites complete in under two minutes.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card transition-all duration-500 hover:border-border hover:shadow-xl hover:shadow-black/[0.03]"
              >
                {/* Gradient accent top */}
                <div className={`h-1 w-full bg-gradient-to-r ${step.accent}`} />

                <div className="p-6">
                  {/* Number + Icon row */}
                  <div className="mb-5 flex items-center justify-between">
                    <span className="font-mono text-[32px] font-black leading-none text-foreground/[0.06]">
                      {step.num}
                    </span>
                    <div className="flex size-10 items-center justify-center rounded-xl bg-muted/80 transition-colors duration-300 group-hover:bg-[#E90029]/[0.08]">
                      <Icon className="size-[18px] text-muted-foreground transition-colors duration-300 group-hover:text-[#E90029]" />
                    </div>
                  </div>

                  <h3 className="mb-2 text-[15px] font-bold text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-[13px] leading-[1.7] text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
