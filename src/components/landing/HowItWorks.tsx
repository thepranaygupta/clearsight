import { Globe, Scan, Sparkles } from "lucide-react";

const steps = [
  {
    num: "1",
    icon: Globe,
    title: "Enter your URL",
    description: "Paste any public URL. We crawl every page — following links, parsing sitemaps — and render each one in a real Chromium browser.",
  },
  {
    num: "2",
    icon: Scan,
    title: "AI scans for violations",
    description: "50+ WCAG 2.1 rules checked per page with axe-core. Custom engines catch link text and touch target issues. 3 browsers scan concurrently.",
  },
  {
    num: "3",
    icon: Sparkles,
    title: "Get actionable fixes",
    description: "Each issue gets an AI-generated description, a specific fix suggestion, and a severity score. Export to PDF or Excel for your team.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 max-w-md">
          <h2 className="text-2xl font-extrabold tracking-[-0.02em] text-foreground">
            Three steps to a full audit
          </h2>
          <p className="mt-2 text-[15px] leading-[1.7] text-muted-foreground">
            No setup, no config, no learning curve.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.num}>
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-[#E90029]/[0.07]">
                    <Icon className="size-[18px] text-[#E90029]" />
                  </div>
                  <span className="text-[13px] font-bold text-muted-foreground/40">Step {step.num}</span>
                </div>
                <h3 className="mb-2 text-[16px] font-bold text-foreground">{step.title}</h3>
                <p className="text-[14px] leading-[1.7] text-muted-foreground">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
