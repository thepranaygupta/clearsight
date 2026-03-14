"use client";

import { useEffect, useMemo, useCallback } from "react";
import { ArrowLeft, X } from "lucide-react";
import type { ScanDetail, Issue } from "@/lib/types";
import type { ViewMode } from "./useInspectorState";
import { InspectorViewToggle } from "./InspectorViewToggle";
import { InspectorSidebar } from "./InspectorSidebar";
import { ScreenshotViewer } from "./ScreenshotViewer";
import { HtmlViewer } from "./HtmlViewer";

interface InspectorPanelProps {
  scan: ScanDetail;
  issue: Issue;
  allIssues: Issue[];
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onNavigateIssue: (issueId: string) => void;
  onClose: () => void;
}

export function InspectorPanel({
  scan,
  issue,
  allIssues,
  viewMode,
  onViewModeChange,
  onNavigateIssue,
  onClose,
}: InspectorPanelProps) {
  // Issues with the same rule (occurrences)
  const siblingIssues = useMemo(() => {
    const ruleKey = issue.ruleId ?? issue.axeRuleId ?? issue.wcagCriterion;
    return allIssues.filter((i) => {
      const key = i.ruleId ?? i.axeRuleId ?? i.wcagCriterion;
      return key === ruleKey;
    });
  }, [issue, allIssues]);

  // Keyboard handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      // Arrow keys for navigating occurrences
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        const currentIdx = siblingIssues.findIndex((i) => i.id === issue.id);
        if (currentIdx === -1) return;
        const nextIdx =
          e.key === "ArrowDown"
            ? Math.min(currentIdx + 1, siblingIssues.length - 1)
            : Math.max(currentIdx - 1, 0);
        if (nextIdx !== currentIdx) {
          onNavigateIssue(siblingIssues[nextIdx].id);
        }
      }
    },
    [onClose, siblingIssues, issue.id, onNavigateIssue]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    // Prevent body scrolling while inspector is open
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  return (
    <div className="fixed inset-0 z-50 flex animate-in slide-in-from-right duration-250">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative z-10 flex h-full w-full flex-col bg-zinc-950">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-2.5">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              aria-label="Close inspector"
              className="inline-flex size-8 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/[0.08] hover:text-white/80"
            >
              <ArrowLeft className="size-4" />
            </button>
            <div>
              <h2 className="text-sm font-semibold text-white/90">
                Issue Inspector
              </h2>
              <p className="font-mono text-[10px] text-white/30 truncate max-w-[300px]">
                {scan.url}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <InspectorViewToggle
              viewMode={viewMode}
              onViewModeChange={onViewModeChange}
            />
            <button
              onClick={onClose}
              aria-label="Close inspector"
              className="inline-flex size-8 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/[0.08] hover:text-white/70"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Split layout */}
        <div className="flex min-h-0 flex-1">
          {/* Left sidebar */}
          <div className="w-[380px] shrink-0 border-r border-white/[0.08] bg-zinc-950">
            <InspectorSidebar
              issue={issue}
              siblingIssues={siblingIssues}
              onSelectIssue={onNavigateIssue}
            />
          </div>

          {/* Right content */}
          <div className="min-w-0 flex-1">
            {viewMode === "page" ? (
              scan.pageScreenshot ? (
                <ScreenshotViewer
                  screenshot={scan.pageScreenshot}
                  issue={issue}
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-zinc-900">
                  <p className="text-xs text-white/40">
                    Screenshot not available
                  </p>
                </div>
              )
            ) : (
              <HtmlViewer scanId={scan.id} issue={issue} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
