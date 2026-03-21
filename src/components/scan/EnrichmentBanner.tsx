"use client";

import { Brain, X } from "lucide-react";

interface EnrichmentBannerProps {
  progress: number;
  currentStage: string | null;
  onCancel?: () => void;
}

export function EnrichmentBanner({
  progress,
  currentStage,
  onCancel,
}: EnrichmentBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-primary/[0.03]">
      {/* Progress bar */}
      <div className="absolute inset-x-0 top-0 h-0.5 bg-primary/10">
        <div
          className="h-full bg-primary transition-all duration-700 ease-out"
          style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
        />
      </div>

      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Brain className="size-4 animate-pulse text-primary" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">
            AI is enhancing your results...
          </p>
          <p className="text-xs text-muted-foreground/70">
            {currentStage ?? "Processing"} — descriptions and fix suggestions will improve shortly
          </p>
        </div>

        {onCancel && (
          <button
            onClick={onCancel}
            aria-label="Cancel scan"
            className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground/50 transition-colors hover:bg-muted hover:text-muted-foreground"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
