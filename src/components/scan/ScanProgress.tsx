"use client";

import { Globe, X, Check, Scan, Brain, Database, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

const stages = [
  {
    key: "Fetching",
    label: "Rendering page",
    icon: Eye,
    description: "Capturing the page in a headless browser",
  },
  {
    key: "Analyzing",
    label: "Running checks",
    icon: Scan,
    description: "axe-core engine + custom WCAG rule checks",
  },
  {
    key: "Enriching",
    label: "AI analysis",
    icon: Brain,
    description: "Generating explanations and fix suggestions",
  },
  {
    key: "Complete",
    label: "Finalizing",
    icon: Database,
    description: "Computing score and saving results",
  },
] as const;

function mapStageToIndex(currentStage: string | null): number {
  if (!currentStage) return 0;
  const lower = currentStage.toLowerCase();
  if (lower.includes("fetch") || lower.includes("render")) return 0;
  if (lower.includes("analy") || lower.includes("custom") || lower.includes("prepar")) return 1;
  if (lower.includes("enrich") || lower.includes("generat") || lower.includes("summar")) return 2;
  if (lower.includes("stor") || lower.includes("sav") || lower.includes("complete")) return 3;
  return 0;
}

interface ScanProgressProps {
  url: string;
  progress: number;
  currentStage: string | null;
  onCancel?: () => void;
}

export function ScanProgress({
  url,
  progress,
  currentStage,
  onCancel,
}: ScanProgressProps) {
  const activeIndex = mapStageToIndex(currentStage);
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  const circumference = 2 * Math.PI * 68;

  let hostname = url;
  try {
    hostname = new URL(url).hostname;
  } catch {
    // keep raw
  }

  return (
    <div className="flex min-h-[65vh] flex-col items-center justify-center">
      {/* Progress ring */}
      <div className="relative mb-8">
        <svg width="176" height="176" viewBox="0 0 176 176" className="-rotate-90">
          {/* Track */}
          <circle
            cx="88"
            cy="88"
            r="68"
            fill="none"
            stroke="currentColor"
            className="text-muted/30"
            strokeWidth="4"
          />
          {/* Tick marks */}
          {Array.from({ length: 40 }).map((_, i) => {
            const angle = (i / 40) * 360;
            const rad = (angle * Math.PI) / 180;
            const x1 = 88 + 80 * Math.cos(rad);
            const y1 = 88 + 80 * Math.sin(rad);
            const x2 = 88 + 83 * Math.cos(rad);
            const y2 = 88 + 83 * Math.sin(rad);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="currentColor"
                className="text-muted/20"
                strokeWidth="1"
              />
            );
          })}
          {/* Progress arc */}
          <circle
            cx="88"
            cy="88"
            r="68"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - clampedProgress / 100)}
            className="transition-[stroke-dashoffset] duration-700 ease-out"
            style={{
              filter: "drop-shadow(0 0 10px oklch(0.52 0.22 25 / 0.35))",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-4xl font-bold tabular-nums tracking-tighter text-foreground">
            {clampedProgress}
          </span>
          <span className="text-xs font-medium text-muted-foreground">percent</span>
        </div>
      </div>

      {/* URL pill */}
      <div className="mb-10 flex items-center gap-2 rounded-full border border-border/60 bg-card px-4 py-2">
        <Globe className="size-3 text-muted-foreground/50" />
        <span className="font-mono text-xs text-foreground/60">{hostname}</span>
      </div>

      {/* Stage timeline */}
      <div className="mb-8 w-full max-w-sm">
        {stages.map((stage, i) => {
          const isPast = i < activeIndex;
          const isCurrent = i === activeIndex;
          const isFuture = i > activeIndex;
          const Icon = stage.icon;
          const isLast = i === stages.length - 1;

          return (
            <div key={stage.key} className="flex gap-4">
              {/* Timeline track */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-xl border transition-all duration-500",
                    isCurrent && "border-primary/40 bg-primary/[0.08] shadow-sm shadow-primary/10",
                    isPast && "border-green-300/50 bg-green-50",
                    isFuture && "border-border/40 bg-muted/30"
                  )}
                >
                  {isPast ? (
                    <Check className="size-4 text-green-600" />
                  ) : (
                    <Icon
                      className={cn(
                        "size-4 transition-colors",
                        isCurrent && "text-primary animate-pulse",
                        isFuture && "text-muted-foreground/30"
                      )}
                    />
                  )}
                </div>
                {!isLast && (
                  <div
                    className={cn(
                      "w-px flex-1 min-h-4 transition-colors duration-500",
                      isPast ? "bg-green-300/50" : "bg-border/30"
                    )}
                  />
                )}
              </div>

              {/* Content */}
              <div className={cn("pb-5", isLast && "pb-0")}>
                <div className="flex items-center gap-2">
                  <p
                    className={cn(
                      "text-sm font-medium transition-colors",
                      isCurrent && "text-foreground",
                      isPast && "text-green-700",
                      isFuture && "text-muted-foreground/40"
                    )}
                  >
                    {stage.label}
                  </p>
                  {isCurrent && (
                    <span className="relative flex size-1.5">
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-40" />
                      <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
                    </span>
                  )}
                  {isPast && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-green-600/70">
                      Done
                    </span>
                  )}
                </div>
                {(isCurrent || isPast) && (
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground/70">
                    {stage.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cancel */}
      {onCancel && (
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border/40 px-4 py-2 text-xs font-medium text-muted-foreground transition-all hover:border-border hover:bg-muted hover:text-foreground"
        >
          <X className="size-3" />
          Cancel scan
        </button>
      )}
    </div>
  );
}
