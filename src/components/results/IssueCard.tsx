"use client";

import { useState } from "react";
import {
  ChevronDown,
  Lightbulb,
  Copy,
  Check,
  Code2,
  MousePointerClick,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Issue } from "@/lib/types";

const severityConfig: Record<
  string,
  { color: string; bg: string; text: string; ringActive: string; dot: string }
> = {
  critical: {
    color: "var(--severity-critical)",
    bg: "bg-red-50",
    text: "text-red-700",
    ringActive: "ring-red-200/60",
    dot: "bg-red-500",
  },
  serious: {
    color: "var(--severity-serious)",
    bg: "bg-orange-50",
    text: "text-orange-700",
    ringActive: "ring-orange-200/60",
    dot: "bg-orange-500",
  },
  moderate: {
    color: "var(--severity-moderate)",
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    ringActive: "ring-yellow-200/60",
    dot: "bg-yellow-500",
  },
  minor: {
    color: "var(--severity-minor)",
    bg: "bg-blue-50",
    text: "text-blue-700",
    ringActive: "ring-blue-200/60",
    dot: "bg-blue-400",
  },
};

function SeverityBadge({ severity }: { severity: string }) {
  const config = severityConfig[severity] ?? severityConfig.minor;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        config.bg,
        config.text
      )}
    >
      <span className={cn("size-1.5 rounded-full", config.dot)} />
      {severity}
    </span>
  );
}

function WcagBadge({
  criterion,
  level,
}: {
  criterion: string;
  level: string;
}) {
  return (
    <span className="inline-flex items-center rounded-md border border-border/80 bg-muted/40 px-2 py-0.5 text-[11px] font-medium tracking-wide text-muted-foreground">
      {criterion}
      <span className="mx-1 text-border">|</span>
      <span className="font-bold">Level {level}</span>
    </span>
  );
}

function ConfidenceIndicator({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color =
    pct >= 80
      ? "var(--score-good)"
      : pct >= 50
        ? "var(--score-okay)"
        : "var(--score-bad)";

  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
      <span className="relative flex items-center">
        <svg width="16" height="16" viewBox="0 0 16 16" className="-rotate-90">
          <circle
            cx="8"
            cy="8"
            r="6"
            fill="none"
            stroke="currentColor"
            className="text-muted/60"
            strokeWidth="2"
          />
          <circle
            cx="8"
            cy="8"
            r="6"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 6}
            strokeDashoffset={2 * Math.PI * 6 * (1 - score)}
          />
        </svg>
      </span>
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
      className="inline-flex size-6 items-center justify-center rounded-md text-muted-foreground/50 transition-colors hover:bg-muted hover:text-muted-foreground"
      title="Copy to clipboard"
    >
      {copied ? (
        <Check className="size-3 text-green-600" />
      ) : (
        <Copy className="size-3" />
      )}
    </button>
  );
}

interface IssueCardProps {
  issue: Issue;
}

export function IssueCard({ issue }: IssueCardProps) {
  const [expanded, setExpanded] = useState(false);
  const config = severityConfig[issue.severity] ?? severityConfig.minor;

  return (
    <div
      className={cn(
        "group rounded-xl border bg-card transition-all duration-200",
        expanded
          ? cn("border-border shadow-sm", config.ringActive, "ring-1")
          : "border-border/60 hover:border-border"
      )}
      style={{
        borderLeftWidth: "3px",
        borderLeftColor: config.color,
      }}
    >
      {/* Header — always visible, clickable */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-start gap-3 px-4 py-4 text-left"
      >
        <div className="min-w-0 flex-1">
          {/* Badges row */}
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <SeverityBadge severity={issue.severity} />
            <WcagBadge
              criterion={issue.wcagCriterion}
              level={issue.wcagLevel}
            />
            {issue.type === "potential" && issue.confidenceScore !== null && (
              <ConfidenceIndicator score={issue.confidenceScore} />
            )}
            {issue.axeRuleId && (
              <span className="text-[10px] font-mono text-muted-foreground/40">
                {issue.axeRuleId}
              </span>
            )}
          </div>

          {/* Description */}
          <p
            className={cn(
              "text-sm leading-relaxed text-foreground/85",
              !expanded && "line-clamp-2"
            )}
          >
            {issue.description}
          </p>
        </div>

        {/* Expand chevron */}
        <div className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground/40 transition-colors group-hover:bg-muted group-hover:text-muted-foreground">
          <ChevronDown
            className={cn(
              "size-4 transition-transform duration-200",
              expanded && "rotate-180"
            )}
          />
        </div>
      </button>

      {/* Expandable detail section */}
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out",
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div className="border-t border-border/40 px-4 pb-4 pt-4 space-y-4">
            {/* Element HTML */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <Code2 className="size-3" />
                  Element
                </span>
                <CopyButton text={issue.elementHtml} />
              </div>
              <div className="relative overflow-hidden rounded-lg border border-border/60 bg-muted/30">
                <pre className="overflow-x-auto p-3 font-mono text-xs leading-relaxed text-foreground/70">
                  <code>{issue.elementHtml}</code>
                </pre>
              </div>
            </div>

            {/* Selector */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <MousePointerClick className="size-3" />
                  CSS Selector
                </span>
                <CopyButton text={issue.elementSelector} />
              </div>
              <div className="relative overflow-hidden rounded-lg border border-border/60 bg-muted/30">
                <code className="block p-3 font-mono text-xs text-foreground/70">
                  {issue.elementSelector}
                </code>
              </div>
            </div>

            {/* Fix suggestion */}
            {issue.fixSuggestion && (
              <div className="rounded-xl border border-amber-200/60 bg-gradient-to-br from-amber-50/60 to-orange-50/30 px-4 py-3.5">
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex size-6 items-center justify-center rounded-md bg-amber-100">
                    <Lightbulb className="size-3.5 text-amber-600" />
                  </div>
                  <span className="text-xs font-semibold text-amber-800">
                    Suggested Fix
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-amber-900/80">
                  {issue.fixSuggestion}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
