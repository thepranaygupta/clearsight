"use client";

import { Suspense } from "react";
import { Globe, Scan, Sparkles } from "lucide-react";
import { ScanForm } from "@/components/scan/ScanForm";

const steps = [
  {
    icon: Globe,
    title: "Enter your URL",
    detail: "Paste any public URL. We render the page in a real Chromium browser.",
  },
  {
    icon: Scan,
    title: "We scan for violations",
    detail: "50+ WCAG 2.1 rules checked with axe-core and custom engines.",
  },
  {
    icon: Sparkles,
    title: "Get AI-powered fixes",
    detail: "Each issue gets a description, fix suggestion, and severity score.",
  },
];

export default function DashboardPage() {
  return (
    <>
      <Suspense>
        <ScanForm />
      </Suspense>

      {/* How it works — compact 3-column */}
      <section className="mt-12 border-t border-border/30 pt-10">
        <h2 className="mb-6 text-sm font-bold text-foreground">
          How it works
        </h2>

        <div className="grid gap-6 sm:grid-cols-3">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="flex gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Icon className="size-4 text-foreground/70" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-foreground">{step.title}</p>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">{step.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
