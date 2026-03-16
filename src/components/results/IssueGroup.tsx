"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { IssueCard } from "./IssueCard";
import type { Issue, Severity } from "@/lib/types";

const severityMeta: Record<
  string,
  { label: string; color: string; track: string }
> = {
  critical: { label: "Critical", color: "bg-red-500", track: "bg-red-500/10" },
  serious: {
    label: "Serious",
    color: "bg-orange-500",
    track: "bg-orange-500/10",
  },
  moderate: {
    label: "Moderate",
    color: "bg-yellow-500",
    track: "bg-yellow-500/10",
  },
  minor: { label: "Minor", color: "bg-blue-400", track: "bg-blue-400/10" },
};

export interface IssueGroupProps {
  ruleId: string;
  ruleHelp: string;
  wcagCriterion: string;
  wcagLevel: string;
  worstSeverity: string;
  issues: Issue[];
  onInspect?: (issueId: string) => void;
}

export function IssueGroup({
  ruleHelp,
  wcagCriterion,
  wcagLevel,
  worstSeverity,
  issues,
  onInspect,
}: IssueGroupProps) {
  const [expanded, setExpanded] = useState(false);
  const meta = severityMeta[worstSeverity] ?? severityMeta.minor;

  // Build a mini severity breakdown for this group
  const breakdown: Record<string, number> = {};
  for (const issue of issues) {
    breakdown[issue.severity] = (breakdown[issue.severity] || 0) + 1;
  }

  return (
    <div className="group/rule">
      {/* Group header row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
          expanded
            ? "bg-muted/60"
            : "hover:bg-muted/40"
        )}
      >
        {/* Expand indicator */}
        <ChevronRight
          className={cn(
            "size-3.5 shrink-0 text-muted-foreground/50 transition-transform duration-150",
            expanded && "rotate-90"
          )}
        />

        {/* Severity dot */}
        <span className={cn("size-2 shrink-0 rounded-full", meta.color)} />

        {/* Rule name */}
        <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-foreground/90">
          {ruleHelp}
        </span>

        {/* WCAG ref */}
        <span className="shrink-0 font-mono text-[10px] tracking-wide text-muted-foreground/50">
          {wcagCriterion} {wcagLevel}
        </span>

        {/* Severity mini-bar */}
        <span className="hidden shrink-0 items-center gap-0.5 sm:flex">
          {(["critical", "serious", "moderate", "minor"] as Severity[]).map(
            (sev) => {
              const count = breakdown[sev];
              if (!count) return null;
              const m = severityMeta[sev];
              return (
                <span
                  key={sev}
                  className={cn(
                    "inline-flex h-5 items-center rounded px-1.5 text-[10px] font-semibold tabular-nums",
                    m.track,
                    sev === "critical"
                      ? "text-red-600"
                      : sev === "serious"
                        ? "text-orange-600"
                        : sev === "moderate"
                          ? "text-yellow-600"
                          : "text-blue-500"
                  )}
                >
                  {count}
                </span>
              );
            }
          )}
        </span>

        {/* Total count — visible only on mobile where severity mini-bar is hidden */}
        <span className="shrink-0 min-w-8 text-right text-xs tabular-nums font-medium text-muted-foreground sm:hidden">
          {issues.length}
        </span>
      </button>

      {/* Expanded issue cards */}
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out",
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div className="space-y-2 pb-2 pl-9 pr-3 pt-1">
            {issues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} onInspect={onInspect} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
