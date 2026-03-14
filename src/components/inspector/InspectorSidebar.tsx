"use client";

import { useState } from "react";
import {
  ChevronDown,
  Lightbulb,
  Copy,
  Check,
  Code2,
  MousePointerClick,
  AlertCircle,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Issue, Severity } from "@/lib/types";

const severityConfig: Record<
  Severity,
  { label: string; bg: string; text: string; dot: string }
> = {
  critical: {
    label: "Critical",
    bg: "bg-red-500/20",
    text: "text-red-400",
    dot: "bg-red-500",
  },
  serious: {
    label: "Serious",
    bg: "bg-orange-500/20",
    text: "text-orange-400",
    dot: "bg-orange-500",
  },
  moderate: {
    label: "Moderate",
    bg: "bg-yellow-500/20",
    text: "text-yellow-400",
    dot: "bg-yellow-500",
  },
  minor: {
    label: "Minor",
    bg: "bg-blue-400/20",
    text: "text-blue-400",
    dot: "bg-blue-400",
  },
};

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
      className="inline-flex size-5 items-center justify-center rounded text-white/30 transition-colors hover:bg-white/10 hover:text-white/60"
      title="Copy to clipboard"
    >
      {copied ? (
        <Check className="size-2.5 text-emerald-400" />
      ) : (
        <Copy className="size-2.5" />
      )}
    </button>
  );
}

interface InspectorSidebarProps {
  issue: Issue;
  siblingIssues: Issue[];
  onSelectIssue: (issueId: string) => void;
}

export function InspectorSidebar({
  issue,
  siblingIssues,
  onSelectIssue,
}: InspectorSidebarProps) {
  const [whyExpanded, setWhyExpanded] = useState(false);
  const sev = severityConfig[issue.severity] ?? severityConfig.minor;

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="space-y-5 p-5">
        {/* Issue title */}
        <div>
          <h3 className="text-[15px] font-semibold leading-snug text-white">
            {issue.ruleHelp ?? issue.description}
          </h3>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide",
              sev.bg,
              sev.text
            )}
          >
            <span className={cn("size-1.5 rounded-full", sev.dot)} />
            {sev.label}
          </span>
          <span className="rounded bg-white/[0.08] px-2 py-0.5 font-mono text-[11px] font-medium text-white/70">
            WCAG {issue.wcagCriterion}
          </span>
          <span className="rounded bg-white/[0.08] px-2 py-0.5 text-[11px] font-semibold text-white/50">
            Level {issue.wcagLevel}
          </span>
          <span
            className={cn(
              "rounded px-2 py-0.5 text-[11px] font-semibold",
              issue.type === "confirmed"
                ? "bg-red-500/15 text-red-400"
                : "bg-amber-500/15 text-amber-400"
            )}
          >
            {issue.type === "confirmed" ? "Issue" : "Potential"}
          </span>
        </div>

        {/* Description */}
        <p className="text-[13px] leading-relaxed text-white/70">
          {issue.description}
        </p>

        {/* Why is this an issue? */}
        {issue.ruleHelp && issue.ruleHelp !== issue.description && (
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.03]">
            <button
              onClick={() => setWhyExpanded(!whyExpanded)}
              className="flex w-full items-center justify-between px-3 py-2.5 text-left"
            >
              <span className="flex items-center gap-2 text-xs font-semibold text-white/60">
                <AlertCircle className="size-3" />
                Why is this an issue?
              </span>
              <ChevronDown
                className={cn(
                  "size-3 text-white/30 transition-transform duration-150",
                  whyExpanded && "rotate-180"
                )}
              />
            </button>
            <div
              className={cn(
                "grid transition-[grid-template-rows] duration-200 ease-out",
                whyExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              )}
            >
              <div className="overflow-hidden">
                <div className="border-t border-white/[0.06] px-3 pb-3 pt-2">
                  <p className="text-xs leading-relaxed text-white/50">
                    {issue.ruleHelp}. This impacts users who rely on assistive
                    technologies to navigate and interact with web content.
                    Failing to address this violates WCAG {issue.wcagCriterion}{" "}
                    (Level {issue.wcagLevel}).
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Occurrences */}
        {siblingIssues.length > 1 && (
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Layers className="size-3 text-white/40" />
              <span className="text-xs font-semibold text-white/60">
                Occurrences
              </span>
              <span className="rounded-full bg-white/[0.08] px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-white/50">
                {siblingIssues.length}
              </span>
            </div>
            <div className="space-y-1">
              {siblingIssues.map((sibling) => (
                <button
                  key={sibling.id}
                  onClick={() => onSelectIssue(sibling.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left transition-colors",
                    sibling.id === issue.id
                      ? "bg-white/[0.1] ring-1 ring-white/[0.15]"
                      : "hover:bg-white/[0.05]"
                  )}
                >
                  <span
                    className={cn(
                      "size-1.5 shrink-0 rounded-full",
                      severityConfig[sibling.severity]?.dot ?? "bg-blue-400"
                    )}
                  />
                  <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-white/60">
                    {sibling.elementSelector}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Element HTML */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-white/40">
              <Code2 className="size-2.5" />
              Element
            </span>
            <CopyButton text={issue.elementHtml} />
          </div>
          <div className="overflow-hidden rounded border border-white/[0.06] bg-white/[0.03]">
            <pre className="overflow-x-auto p-2.5 font-mono text-[11px] leading-relaxed text-white/50">
              <code>{issue.elementHtml}</code>
            </pre>
          </div>
        </div>

        {/* Selector */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-white/40">
              <MousePointerClick className="size-2.5" />
              Selector
            </span>
            <CopyButton text={issue.elementSelector} />
          </div>
          <div className="overflow-hidden rounded border border-white/[0.06] bg-white/[0.03]">
            <code className="block p-2.5 font-mono text-[11px] text-white/50">
              {issue.elementSelector}
            </code>
          </div>
        </div>

        {/* Fix suggestion */}
        {issue.fixSuggestion && (
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.06] px-3 py-3">
            <div className="mb-1.5 flex items-center gap-1.5">
              <Lightbulb className="size-3 text-amber-400" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400/80">
                Fix suggestion
              </span>
            </div>
            <p className="text-[12px] leading-relaxed text-amber-200/70">
              {issue.fixSuggestion}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
