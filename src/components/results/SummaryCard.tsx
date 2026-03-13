"use client";

import { CheckCircle, Sparkles } from "lucide-react";

interface PositiveFinding {
  category: string;
  detail: string;
}

interface SummaryCardProps {
  summary: string;
  positiveFindings: PositiveFinding[];
}

export function SummaryCard({ summary, positiveFindings }: SummaryCardProps) {
  return (
    <div className="space-y-4">
      {/* AI Summary */}
      <div className="rounded-2xl border border-border/50 bg-card p-6">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="size-4 text-primary/60" />
          <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground/60">
            AI Summary
          </h3>
        </div>
        <p className="text-[15px] leading-[1.7] text-foreground/80">{summary}</p>
      </div>

      {/* Positive findings */}
      {positiveFindings.length > 0 && (
        <div className="rounded-2xl border border-green-200/50 bg-green-50/30 p-6">
          <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.12em] text-green-700/50">
            What&apos;s working well
          </h4>
          <div className="grid gap-3 sm:grid-cols-2">
            {positiveFindings.map((finding, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md bg-green-100">
                  <CheckCircle className="size-3 text-green-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-green-900">
                    {finding.category}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-green-700/70">
                    {finding.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
