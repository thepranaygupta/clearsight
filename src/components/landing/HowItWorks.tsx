import { Globe, Scan, Brain, FileBarChart, ArrowDown } from "lucide-react";

const steps = [
  {
    num: "01",
    icon: Globe,
    title: "Discover every page",
    description:
      "Enter a URL. ClearSight follows every internal link, parses sitemaps, and builds a complete map of your site. Same-origin only, fully automated.",
    detail: "BFS crawl · sitemap.xml · URL normalization",
    color: "text-[#E90029]",
    bg: "bg-[#E90029]/[0.06]",
  },
  {
    num: "02",
    icon: Scan,
    title: "Scan with real browsers",
    description:
      "Each page is rendered in headless Chromium, then checked against 50+ WCAG 2.1 rules using axe-core. Custom engines catch link text and touch target issues too.",
    detail: "Playwright · axe-core · 3 concurrent browsers",
    color: "text-orange-600",
    bg: "bg-orange-600/[0.06]",
  },
  {
    num: "03",
    icon: Brain,
    title: "Enrich with AI",
    description:
      "Every issue gets an AI-generated explanation in plain English, a step-by-step fix suggestion, and a confidence score. No more cryptic rule IDs.",
    detail: "Azure OpenAI · confidence scoring · graceful fallback",
    color: "text-violet-600",
    bg: "bg-violet-600/[0.06]",
  },
  {
    num: "04",
    icon: FileBarChart,
    title: "Act on the results",
    description:
      "See your score, drill into issues by severity, track what's new or fixed across crawls, and export PDF or Excel reports for stakeholders.",
    detail: "0-100 score · issue tracking · PDF & Excel export",
    color: "text-emerald-600",
    bg: "bg-emerald-600/[0.06]",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16 max-w-lg">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E90029]">
            How it works
          </p>
          <h2 className="mt-3 text-[clamp(1.8rem,3.5vw,2.5rem)] font-extrabold tracking-[-0.02em] text-foreground">
            URL in. Audit out.
          </h2>
          <p className="mt-3 text-[15px] leading-[1.7] text-muted-foreground">
            Four stages, fully automated. Most sites complete in under two minutes.
          </p>
        </div>

        {/* Vertical timeline */}
        <div className="relative">
          {steps.map((step, i) => {
            const Icon = step.icon;
            const isLast = i === steps.length - 1;
            return (
              <div key={step.num} className="relative pb-12 last:pb-0">
                {/* Connector line */}
                {!isLast && (
                  <div className="absolute top-14 bottom-0 left-5 w-px bg-gradient-to-b from-border to-border/20 sm:left-6" />
                )}

                <div className="flex gap-5 sm:gap-8">
                  {/* Icon column */}
                  <div className="relative shrink-0">
                    <div className={`flex size-10 items-center justify-center rounded-xl ${step.bg} sm:size-12`}>
                      <Icon className={`size-[18px] ${step.color} sm:size-5`} />
                    </div>
                    {!isLast && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                        <ArrowDown className="size-3 text-border" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1 pt-1">
                    <div className="mb-1 flex items-baseline gap-3">
                      <span className="font-mono text-[11px] font-bold text-muted-foreground/30">{step.num}</span>
                      <h3 className="text-[17px] font-bold text-foreground">{step.title}</h3>
                    </div>
                    <p className="max-w-lg text-[14px] leading-[1.7] text-muted-foreground">
                      {step.description}
                    </p>
                    <p className="mt-2 font-mono text-[11px] text-muted-foreground/40">
                      {step.detail}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
