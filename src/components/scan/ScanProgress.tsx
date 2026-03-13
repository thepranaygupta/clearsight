"use client";

import { Globe, X, Check, Scan, Brain, Database, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

const stages = [
  {
    key: "Fetching",
    label: "Fetching",
    icon: Eye,
    description: "Rendering the page in a headless browser and capturing a screenshot",
  },
  {
    key: "Analyzing",
    label: "Analyzing",
    icon: Scan,
    description: "Running axe-core accessibility engine and custom WCAG checks",
  },
  {
    key: "Enriching",
    label: "Enriching",
    icon: Brain,
    description: "AI is reviewing findings, generating human-readable explanations and fix suggestions",
  },
  {
    key: "Complete",
    label: "Storing",
    icon: Database,
    description: "Saving results and computing your accessibility score",
  },
] as const;

function mapStageToIndex(currentStage: string | null): number {
  if (!currentStage) return 0;
  const lower = currentStage.toLowerCase();
  if (lower.includes("fetch") || lower.includes("render")) return 0;
  if (lower.includes("analy") || lower.includes("custom")) return 1;
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

  let hostname = url;
  try {
    hostname = new URL(url).hostname;
  } catch {
    // keep raw
  }

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center">
      {/* Animated ring */}
      <div className="relative mb-10">
        <svg width="160" height="160" viewBox="0 0 160 160" className="-rotate-90">
          <circle
            cx="80"
            cy="80"
            r="72"
            fill="none"
            stroke="currentColor"
            className="text-muted/40"
            strokeWidth="3"
          />
          <circle
            cx="80"
            cy="80"
            r="72"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 72}
            strokeDashoffset={2 * Math.PI * 72 * (1 - clampedProgress / 100)}
            className="transition-[stroke-dashoffset] duration-700 ease-out"
            style={{
              filter: "drop-shadow(0 0 8px oklch(0.52 0.22 25 / 0.3))",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-semibold tabular-nums tracking-tight text-foreground">
            {clampedProgress}
            <span className="text-lg text-muted-foreground">%</span>
          </span>
        </div>
      </div>

      {/* URL pill */}
      <div className="mb-8 flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 shadow-sm">
        <Globe className="size-3.5 text-muted-foreground" />
        <span className="font-mono text-xs text-foreground/70">{hostname}</span>
      </div>

      {/* Stage cards — vertical timeline */}
      <div className="mb-8 w-full max-w-md space-y-3">
        {stages.map((stage, i) => {
          const isPast = i < activeIndex;
          const isCurrent = i === activeIndex;
          const isFuture = i > activeIndex;
          const Icon = stage.icon;

          return (
            <div
              key={stage.key}
              className={cn(
                "flex items-start gap-4 rounded-xl border px-4 py-3.5 transition-all duration-500",
                isCurrent && "border-primary/30 bg-primary/[0.03] shadow-sm",
                isPast && "border-green-200/60 bg-green-50/30",
                isFuture && "border-transparent bg-transparent opacity-40"
              )}
            >
              {/* Icon */}
              <div
                className={cn(
                  "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-300",
                  isCurrent && "bg-primary/10 text-primary",
                  isPast && "bg-green-100 text-green-600",
                  isFuture && "bg-muted text-muted-foreground"
                )}
              >
                {isPast ? (
                  <Check className="size-4" />
                ) : (
                  <Icon className={cn("size-4", isCurrent && "animate-pulse")} />
                )}
              </div>

              {/* Text */}
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "text-sm font-medium transition-colors",
                    isCurrent && "text-foreground",
                    isPast && "text-green-700",
                    isFuture && "text-muted-foreground"
                  )}
                >
                  {stage.label}
                </p>
                {(isCurrent || isPast) && (
                  <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                    {stage.description}
                  </p>
                )}
              </div>

              {/* Status */}
              {isPast && (
                <span className="mt-1 text-[10px] font-medium uppercase tracking-wider text-green-600">
                  Done
                </span>
              )}
              {isCurrent && (
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-40" />
                    <span className="relative inline-flex size-2 rounded-full bg-primary" />
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Cancel */}
      {onCancel && (
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-3" />
          Cancel scan
        </button>
      )}
    </div>
  );
}
