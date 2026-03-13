"use client";

import { CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-sm leading-relaxed text-foreground/80">{summary}</p>

        {positiveFindings.length > 0 && (
          <div className="rounded-lg border border-green-200/60 bg-green-50/50 p-4">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-green-800/70">
              What&apos;s working well
            </h4>
            <ul className="space-y-2.5">
              {positiveFindings.map((finding, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <CheckCircle className="mt-0.5 size-4 shrink-0 text-green-600" />
                  <div>
                    <span className="text-sm font-medium text-green-900">
                      {finding.category}
                    </span>
                    <span className="text-sm text-green-800/70">
                      {" "}&mdash; {finding.detail}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
