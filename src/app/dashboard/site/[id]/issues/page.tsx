"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback } from "react";
import useSWR from "swr";
import {
  ArrowLeft,
  AlertTriangle,
  ChevronDown,
  Lightbulb,
  Code2,
  Bug,
  Eye,
  EyeOff,
  RotateCcw,
  Ban,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Severity, IssueStatusType } from "@/lib/types";

// ─── Types ──────────────────────────────────────────────────────────

interface SiteIssue {
  id: string;
  type: string;
  severity: Severity;
  confidenceScore: number | null;
  wcagCriterion: string;
  wcagLevel: string;
  elementSelector: string;
  elementHtml: string;
  description: string;
  fixSuggestion: string;
  issueStatus: IssueStatusType;
  issueHash: string | null;
  pageUrl: string | null;
  scan: { url: string; pageId: string | null };
}

interface IssuesResponse {
  issues: SiteIssue[];
  total: number;
}

// ─── Constants ──────────────────────────────────────────────────────

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw Object.assign(new Error("Failed"), { status: r.status });
    return r.json();
  });

const severityMeta: Record<
  Severity,
  { dot: string; text: string; label: string }
> = {
  critical: { dot: "bg-red-500", text: "text-red-700", label: "Critical" },
  serious: { dot: "bg-orange-500", text: "text-orange-700", label: "Serious" },
  moderate: { dot: "bg-yellow-500", text: "text-yellow-700", label: "Moderate" },
  minor: { dot: "bg-blue-400", text: "text-blue-700", label: "Minor" },
};

const statusMeta: Record<
  IssueStatusType,
  { label: string; variant: "secondary" | "outline"; className: string }
> = {
  open: { label: "Open", variant: "outline", className: "" },
  fixed: { label: "Fixed", variant: "secondary", className: "bg-green-100 text-green-700" },
  dismissed: { label: "Dismissed", variant: "secondary", className: "bg-zinc-100 text-zinc-500" },
  cant_fix: { label: "Can't Fix", variant: "secondary", className: "bg-amber-100 text-amber-700" },
};

const LIMIT = 50;

// ─── Skeleton ───────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center gap-3">
        <Skeleton className="size-9 rounded-xl" />
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-5 w-10 rounded-full" />
      </div>

      {/* Filters skeleton */}
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-8 w-32 rounded-lg" />
        <Skeleton className="h-8 w-32 rounded-lg" />
        <Skeleton className="h-8 w-36 rounded-lg" />
      </div>

      {/* Card skeletons */}
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

// ─── Issue Card ─────────────────────────────────────────────────────

function IssueCard({
  issue,
  siteId,
  onStatusChange,
}: {
  issue: SiteIssue;
  siteId: string;
  onStatusChange: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);
  const meta = severityMeta[issue.severity];
  const status = statusMeta[issue.issueStatus] ?? statusMeta.open;

  async function handleStatusChange(newStatus: IssueStatusType) {
    setUpdating(true);
    try {
      const res = await fetch(`/api/sites/${siteId}/issues/${issue.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issueStatus: newStatus }),
      });
      if (res.ok) {
        onStatusChange();
      }
    } catch {
      // ignore
    }
    setUpdating(false);
  }

  return (
    <div
      className={cn(
        "rounded-2xl border transition-all duration-150",
        expanded
          ? "border-border bg-card shadow-sm"
          : "border-border/40 bg-card hover:border-border/80"
      )}
    >
      {/* Compact header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-start gap-3 p-4 text-left"
      >
        {/* Severity dot */}
        <span
          className={cn("mt-1.5 size-2 shrink-0 rounded-full", meta.dot)}
        />

        {/* Content */}
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-sm leading-snug text-foreground/80",
              !expanded && "line-clamp-2"
            )}
          >
            {issue.description}
          </p>

          {/* Metadata row */}
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="font-mono text-[10px]">
              {issue.wcagCriterion} {issue.wcagLevel}
            </Badge>
            <Badge variant={status.variant} className={cn("text-[10px]", status.className)}>
              {status.label}
            </Badge>
            {issue.pageUrl && (
              <span className="truncate text-[10px] text-muted-foreground/50">
                {issue.pageUrl}
              </span>
            )}
          </div>
        </div>

        {/* Expand chevron */}
        <ChevronDown
          className={cn(
            "mt-1 size-4 shrink-0 text-muted-foreground/30 transition-transform duration-150",
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
          <div className="space-y-3 border-t border-border/30 px-4 pb-4 pt-3">
            {/* Fix suggestion */}
            {issue.fixSuggestion && (
              <div className="flex gap-2 rounded-lg border border-amber-200/40 bg-amber-50/50 px-3 py-2.5">
                <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
                <p className="text-xs leading-relaxed text-amber-900/70">
                  {issue.fixSuggestion}
                </p>
              </div>
            )}

            {/* Element selector */}
            {issue.elementSelector && (
              <div>
                <span className="mb-1.5 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                  <Code2 className="size-2.5" />
                  Selector
                </span>
                <div className="overflow-hidden rounded border border-border/40 bg-muted/20">
                  <code className="block overflow-x-auto p-2 font-mono text-[11px] text-foreground/60">
                    {issue.elementSelector}
                  </code>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 pt-1">
              {issue.issueStatus === "open" && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    disabled={updating}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange("dismissed");
                    }}
                  >
                    {updating ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <EyeOff className="size-3" />
                    )}
                    Dismiss
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    disabled={updating}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange("cant_fix");
                    }}
                  >
                    {updating ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <Ban className="size-3" />
                    )}
                    Can&apos;t Fix
                  </Button>
                </>
              )}
              {(issue.issueStatus === "dismissed" ||
                issue.issueStatus === "cant_fix") && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  disabled={updating}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange("open");
                  }}
                >
                  {updating ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <RotateCcw className="size-3" />
                  )}
                  Reopen
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────

export default function SiteIssuesPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const siteId = params.id as string;

  // Read filters from URL search params
  const severityFilter = searchParams.get("severity") || "";
  const statusFilter = searchParams.get("status") || "";
  const showDismissed = searchParams.get("showDismissed") === "true";
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  // Build API URL from filters
  const apiUrl = buildApiUrl(siteId, severityFilter, statusFilter, showDismissed, offset);

  const {
    data,
    isLoading,
    error,
    mutate,
  } = useSWR<IssuesResponse>(siteId ? apiUrl : null, fetcher, {
    revalidateOnFocus: false,
  });

  const issues = data?.issues ?? [];
  const total = data?.total ?? 0;

  // Update URL search params when filters change
  const updateFilters = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }
      // Reset offset when filters change (unless we're explicitly setting offset)
      if (!("offset" in updates)) {
        params.delete("offset");
      }
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [searchParams, router]
  );

  const handleStatusChange = useCallback(
    () => {
      mutate();
    },
    [mutate]
  );

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted">
          <AlertTriangle className="size-6 text-muted-foreground" />
        </div>
        <h2 className="mb-3 text-lg font-bold">Failed to load issues</h2>
        <Button
          variant="outline"
          onClick={() => router.push(`/dashboard/site/${siteId}`)}
          className="gap-2"
        >
          <ArrowLeft className="size-4" />
          Back to site
        </Button>
      </div>
    );
  }

  const hasMore = offset + LIMIT < total;
  const hasPrev = offset > 0;
  const currentPage = Math.floor(offset / LIMIT) + 1;
  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push(`/dashboard/site/${siteId}`)}
          className="flex size-9 items-center justify-center rounded-xl border border-border/40 text-muted-foreground transition-all hover:border-border hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
        </button>
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Issues
        </h1>
        <Badge variant="secondary" className="tabular-nums">
          {total}
        </Badge>
      </div>

      {/* Severity summary chips */}
      {issues.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {(["critical", "serious", "moderate", "minor"] as Severity[]).map((sev) => {
            const count = issues.filter((i) => i.severity === sev).length;
            if (count === 0 && severityFilter && severityFilter !== sev) return null;
            const meta = severityMeta[sev];
            const isActive = severityFilter === sev;
            return (
              <button
                key={sev}
                onClick={() => updateFilters({ severity: isActive ? "" : sev })}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[13px] font-medium transition-colors",
                  isActive
                    ? "border-foreground/20 bg-foreground/5 text-foreground"
                    : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground"
                )}
              >
                <span className={`size-2 rounded-full ${meta.dot}`} />
                {meta.label}
                <span className="ml-0.5 tabular-nums text-muted-foreground">{count}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => updateFilters({ status: e.target.value })}
          className="h-8 rounded-lg border border-border/60 bg-background px-2.5 text-[13px] text-foreground outline-none transition-colors hover:border-border focus:border-ring focus:ring-2 focus:ring-ring/50"
        >
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="dismissed">Dismissed</option>
          <option value="cant_fix">Can&apos;t Fix</option>
          <option value="fixed">Fixed</option>
        </select>

        {/* Show dismissed toggle */}
        <button
          onClick={() =>
            updateFilters({ showDismissed: showDismissed ? "" : "true" })
          }
          className={cn(
            "inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[13px] transition-colors",
            showDismissed
              ? "border-foreground/20 bg-foreground/5 text-foreground"
              : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground"
          )}
        >
          {showDismissed ? (
            <Eye className="size-3.5" />
          ) : (
            <EyeOff className="size-3.5" />
          )}
          Show dismissed
        </button>
      </div>

      {/* Issue list */}
      {issues.length === 0 && (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-border/50 py-14 text-center">
          <Bug className="mb-3 size-8 text-muted-foreground/30" />
          <p className="text-sm font-medium text-muted-foreground">
            No issues found.
          </p>
        </div>
      )}

      {issues.length > 0 && (
        <div className="space-y-2">
          {issues.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              siteId={siteId}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!hasPrev}
            onClick={() =>
              updateFilters({ offset: String(Math.max(0, offset - LIMIT)) })
            }
          >
            Previous
          </Button>
          <span className="text-xs tabular-nums text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={!hasMore}
            onClick={() =>
              updateFilters({ offset: String(offset + LIMIT) })
            }
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────

function buildApiUrl(
  siteId: string,
  severity: string,
  status: string,
  showDismissed: boolean,
  offset: number
): string {
  const params = new URLSearchParams();
  params.set("limit", String(LIMIT));
  if (offset > 0) params.set("offset", String(offset));
  if (severity) params.set("severity", severity);
  if (status) params.set("status", status);

  // When showDismissed is off and no explicit status filter,
  // default to showing only "open" issues
  if (!showDismissed && !status) {
    params.set("status", "open");
  }

  return `/api/sites/${siteId}/issues?${params.toString()}`;
}
