"use client";

import {
  ShieldCheck,
  Brain,
  FileText,
  Zap,
} from "lucide-react";
import { ScanForm } from "@/components/scan/ScanForm";

const features = [
  {
    icon: Zap,
    title: "Automated WCAG Scanning",
    description: "axe-core engine checks Level A & AA criteria across your entire page",
  },
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description:
      "LLM enriches findings with plain-English explanations and actionable fix suggestions",
  },
  {
    icon: ShieldCheck,
    title: "Confidence Scoring",
    description:
      "Issues classified as confirmed or potential with per-issue confidence scores",
  },
  {
    icon: FileText,
    title: "Export Reports",
    description:
      "Download PDF or Excel reports with AI-generated executive summaries",
  },
];

export default function Home() {
  return (
    <>
      <ScanForm />

      {/* Features */}
      <section className="mt-2 border-t border-border/40 pt-10 pb-12">
        <div className="grid gap-6 sm:grid-cols-2">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="flex items-start gap-4">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/[0.06]">
                  <Icon className="size-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {f.title}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    {f.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
