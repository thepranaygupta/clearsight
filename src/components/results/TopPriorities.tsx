"use client";

import { AlertTriangle } from "lucide-react";

interface Priority {
  issueId: string;
  title: string;
  reason: string;
}

interface TopPrioritiesProps {
  priorities: Priority[];
}

export function TopPriorities({ priorities }: TopPrioritiesProps) {
  if (priorities.length === 0) return null;

  return (
    <div className="rounded-lg border border-border/50 bg-card p-6">
      <div className="mb-5 flex items-center gap-2">
        <AlertTriangle className="size-4 text-primary/60" />
        <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground/60">
          Fix these first
        </h3>
      </div>

      <div className="space-y-4">
        {priorities.map((priority, index) => (
          <div key={`${priority.issueId}-${index}`} className="flex items-start gap-4">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary font-mono text-sm font-bold text-primary-foreground shadow-sm shadow-primary/20">
              {index + 1}
            </div>
            <div className="min-w-0 pt-0.5">
              <p className="text-sm font-semibold leading-snug text-foreground">
                {priority.title}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {priority.reason}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
