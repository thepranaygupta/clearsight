"use client";

import { Eye, Scan, Brain, Database, ChevronRight } from "lucide-react";
import { ScanForm } from "@/components/scan/ScanForm";
import { cn } from "@/lib/utils";

const steps = [
  {
    num: "01",
    icon: Eye,
    title: "Render",
    detail: "Headless browser captures the page as real users see it",
  },
  {
    num: "02",
    icon: Scan,
    title: "Analyze",
    detail: "axe-core runs 80+ WCAG 2.1 rule checks on every element",
  },
  {
    num: "03",
    icon: Brain,
    title: "Enrich",
    detail: "AI explains issues in plain English with fix suggestions",
  },
  {
    num: "04",
    icon: Database,
    title: "Report",
    detail: "Score, prioritize, and export as PDF or spreadsheet",
  },
];

export default function Home() {
  return (
    <>
      <ScanForm />

      {/* Pipeline */}
      <section className="border-t border-border/30 pt-12 pb-10">
        <div className="mb-10 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">
            Pipeline
          </p>
          <h2 className="mt-1.5 text-lg font-semibold tracking-tight text-foreground">
            Four steps to a full audit
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4 sm:gap-2">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.num} className="group relative">
                <div className="flex h-full flex-row items-start gap-4 rounded-2xl border border-border/50 bg-card p-4 transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/[0.03] sm:flex-col sm:items-center sm:p-5 sm:text-center">
                  {/* Icon */}
                  <div className="relative">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-muted/60 transition-colors duration-300 group-hover:bg-primary/[0.08]">
                      <Icon className="size-5 text-muted-foreground transition-colors group-hover:text-primary" />
                    </div>
                    <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-md bg-foreground font-mono text-[9px] font-bold text-background">
                      {step.num}
                    </span>
                  </div>

                  {/* Text */}
                  <div className="min-w-0 sm:mt-3">
                    <p className="text-sm font-semibold text-foreground">
                      {step.title}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {step.detail}
                    </p>
                  </div>
                </div>

                {/* Arrow connector */}
                {i < steps.length - 1 && (
                  <div className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 sm:block">
                    <ChevronRight className="size-4 text-border" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
