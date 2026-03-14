"use client";

import { useState } from "react";
import {
  ChevronDown,
  Lightbulb,
  Copy,
  Check,
  Code2,
  MousePointerClick,
  Crosshair,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Issue } from "@/lib/types";

const severityMeta: Record<
  string,
  { color: string; bg: string; text: string }
> = {
  critical: { color: "bg-red-500", bg: "bg-red-50", text: "text-red-700" },
  serious: {
    color: "bg-orange-500",
    bg: "bg-orange-50",
    text: "text-orange-700",
  },
  moderate: {
    color: "bg-yellow-500",
    bg: "bg-yellow-50",
    text: "text-yellow-700",
  },
  minor: { color: "bg-blue-400", bg: "bg-blue-50", text: "text-blue-700" },
};

function ConfidenceIndicator({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color =
    pct >= 80
      ? "var(--score-good)"
      : pct >= 50
        ? "var(--score-okay)"
        : "var(--score-bad)";

  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground/70">
      <svg
        width="12"
        height="12"
        viewBox="0 0 16 16"
        className="-rotate-90"
      >
        <circle
          cx="8"
          cy="8"
          r="6"
          fill="none"
          stroke="currentColor"
          className="text-muted/60"
          strokeWidth="2.5"
        />
        <circle
          cx="8"
          cy="8"
          r="6"
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={2 * Math.PI * 6}
          strokeDashoffset={2 * Math.PI * 6 * (1 - score)}
        />
      </svg>
      {pct}%
    </span>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex size-5 items-center justify-center rounded text-muted-foreground/40 transition-colors hover:bg-muted hover:text-muted-foreground"
      title="Copy to clipboard"
    >
      {copied ? (
        <Check className="size-2.5 text-green-600" />
      ) : (
        <Copy className="size-2.5" />
      )}
    </button>
  );
}

interface IssueCardProps {
  issue: Issue;
  onInspect?: (issueId: string) => void;
}

export function IssueCard({ issue, onInspect }: IssueCardProps) {
  const [expanded, setExpanded] = useState(false);
  const meta = severityMeta[issue.severity] ?? severityMeta.minor;

  return (
    <div
      className={cn(
        "rounded-lg border transition-all duration-150",
        expanded
          ? "border-border bg-card shadow-sm"
          : "border-border/50 bg-card/50 hover:border-border/80"
      )}
    >
      {/* Compact header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-start gap-2.5 px-3 py-2.5 text-left"
      >
        {/* Severity dot */}
        <span
          className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", meta.color)}
        />

        {/* Description */}
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-[13px] leading-snug text-foreground/80",
              !expanded && "line-clamp-2"
            )}
          >
            {issue.description}
          </p>

          {/* Inline metadata */}
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
            <span
              className={cn(
                "text-[10px] font-semibold uppercase tracking-wide",
                meta.text
              )}
            >
              {issue.severity}
            </span>

            <span className="font-mono text-[10px] text-muted-foreground/50">
              {issue.wcagCriterion} {issue.wcagLevel}
            </span>

            {issue.type === "potential" && issue.confidenceScore !== null && (
              <ConfidenceIndicator score={issue.confidenceScore} />
            )}

            {issue.axeRuleId && (
              <span className="font-mono text-[10px] text-muted-foreground/30">
                {issue.axeRuleId}
              </span>
            )}
          </div>
        </div>

        {/* Expand chevron */}
        <ChevronDown
          className={cn(
            "mt-1 size-3.5 shrink-0 text-muted-foreground/30 transition-transform duration-150",
            expanded && "rotate-180 text-muted-foreground/50"
          )}
        />
      </button>

      {/* Expandable detail */}
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out",
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div className="space-y-3 border-t border-border/30 px-3 pb-3 pt-3">
            {/* Element HTML */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                  <Code2 className="size-2.5" />
                  Element
                </span>
                <CopyButton text={issue.elementHtml} />
              </div>
              <div className="overflow-hidden rounded border border-border/40 bg-muted/20">
                <pre className="overflow-x-auto p-2 font-mono text-[11px] leading-relaxed text-foreground/60">
                  <code>{issue.elementHtml}</code>
                </pre>
              </div>
            </div>

            {/* Selector */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                  <MousePointerClick className="size-2.5" />
                  Selector
                </span>
                <CopyButton text={issue.elementSelector} />
              </div>
              <div className="overflow-hidden rounded border border-border/40 bg-muted/20">
                <code className="block p-2 font-mono text-[11px] text-foreground/60">
                  {issue.elementSelector}
                </code>
              </div>
            </div>

            {/* Fix suggestion */}
            {issue.fixSuggestion && (
              <div className="flex gap-2 rounded-lg bg-amber-50/50 px-3 py-2.5 border border-amber-200/40">
                <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
                <p className="text-[12px] leading-relaxed text-amber-900/70">
                  {issue.fixSuggestion}
                </p>
              </div>
            )}

            {/* Inspect button */}
            {onInspect && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onInspect(issue.id);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Crosshair className="size-3" />
                Inspect element
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
