"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";
import {
  ArrowLeft,
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Ban,
  Bug,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScoreGauge } from "@/components/results/ScoreGauge";
import { relativeTime } from "@/lib/relative-time";
import type { CrawlDetail, CrawlStatus, PageSummary } from "@/lib/types";

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw Object.assign(new Error("Failed"), { status: r.status });
    return r.json();
  });

function statusConfig(status: CrawlStatus) {
  switch (status) {
    case "completed":
      return {
        label: "Completed",
        variant: "secondary" as const,
        icon: CheckCircle2,
        className: "bg-green-100 text-green-700",
      };
    case "failed":
      return {
        label: "Failed",
        variant: "destructive" as const,
        icon: XCircle,
        className: "",
      };
    case "cancelled":
      return {
        label: "Cancelled",
        variant: "outline" as const,
        icon: Ban,
        className: "",
      };
    case "queued":
      return {
        label: "Queued",
        variant: "outline" as const,
        icon: Clock,
        className: "",
      };
    case "discovering":
      return {
        label: "Discovering",
        variant: "secondary" as const,
        icon: Loader2,
        className: "bg-blue-100 text-blue-700",
      };
    case "scanning":
      return {
        label: "Scanning",
        variant: "secondary" as const,
        icon: Loader2,
        className: "bg-blue-100 text-blue-700",
      };
  }
}

function progressText(crawl: CrawlDetail): string {
  switch (crawl.status) {
    case "queued":
      return "Waiting in queue...";
    case "discovering":
      return "Discovering pages...";
    case "scanning":
      if (crawl.enrichedPages > 0 && crawl.enrichedPages < crawl.scannedPages) {
        return `Enriching results... (${crawl.enrichedPages} of ${crawl.scannedPages})`;
      }
      return `Scanning ${crawl.scannedPages} of ${crawl.totalPages} pages...`;
    default:
      return "";
  }
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center gap-3">
        <Skeleton className="size-9 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-3 w-28" />
        </div>
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>

      {/* Progress card skeleton */}
      <div className="rounded-lg border border-border/40 bg-card p-6">
        <Skeleton className="mb-4 h-4 w-40" />
        <Skeleton className="mb-6 h-3 w-full rounded-full" />
        <div className="flex gap-4">
          <Skeleton className="h-20 w-32 rounded-xl" />
          <Skeleton className="h-20 w-32 rounded-xl" />
          <Skeleton className="h-20 w-32 rounded-xl" />
        </div>
      </div>

      {/* Actions skeleton */}
      <Skeleton className="h-9 w-32 rounded-lg" />
    </div>
  );
}

export default function CrawlDetailPage() {
  const params = useParams();
  const router = useRouter();
  const siteId = params.id as string;
  const crawlId = params.crawlId as string;
  const [cancelling, setCancelling] = useState(false);

  const {
    data: crawl,
    isLoading,
    error,
  } = useSWR<CrawlDetail>(
    siteId && crawlId
      ? `/api/sites/${siteId}/crawls/${crawlId}`
      : null,
    fetcher,
    {
      refreshInterval: (data: CrawlDetail | undefined) => {
        if (
          data &&
          (data.status === "queued" ||
            data.status === "discovering" ||
            data.status === "scanning")
        ) {
          return 2000;
        }
        return 0;
      },
      revalidateOnFocus: false,
    }
  );

  const isActive =
    crawl?.status === "queued" ||
    crawl?.status === "discovering" ||
    crawl?.status === "scanning";

  // Fetch pages and issues for completed crawl
  const isCompleted = crawl?.status === "completed";
  const { data: pagesData } = useSWR<{ pages: PageSummary[]; total: number }>(
    siteId && isCompleted ? `/api/sites/${siteId}/pages` : null,
    fetcher,
    { revalidateOnFocus: false }
  );
  const pages = pagesData?.pages;

  const { data: issuesData } = useSWR<{ issues: Array<{ id: string; severity: string; description: string; wcagCriterion: string; pageUrl: string | null; issueStatus: string }>; total: number }>(
    siteId && isCompleted ? `/api/sites/${siteId}/issues?limit=10` : null,
    fetcher,
    { revalidateOnFocus: false }
  );
  const topIssues = issuesData?.issues;
  const totalIssues = issuesData?.total ?? 0;

  // Severity counts from issues
  const severityCounts = topIssues
    ? {
        critical: topIssues.filter((i) => i.severity === "critical").length,
        serious: topIssues.filter((i) => i.severity === "serious").length,
        moderate: topIssues.filter((i) => i.severity === "moderate").length,
        minor: topIssues.filter((i) => i.severity === "minor").length,
      }
    : null;

  async function handleCancel() {
    setCancelling(true);
    try {
      await fetch(`/api/sites/${siteId}/crawls/${crawlId}/cancel`, {
        method: "POST",
      });
    } catch {
      // ignore
    }
    setCancelling(false);
  }

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error || !crawl) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-lg bg-muted">
          <AlertTriangle className="size-6 text-muted-foreground" />
        </div>
        <h2 className="mb-3 text-lg font-bold">
          {(error as { status?: number })?.status === 404
            ? "Crawl not found"
            : "Failed to load crawl"}
        </h2>
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

  const config = statusConfig(crawl.status);
  const StatusIcon = config.icon;
  const progressPct =
    crawl.totalPages > 0
      ? Math.round((crawl.scannedPages / crawl.totalPages) * 100)
      : 0;

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
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold tracking-tight text-foreground">
            {crawl.site?.hostname ?? "Crawl"}
          </h1>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
            <Clock className="size-3" />
            Started {relativeTime(crawl.createdAt)}
          </p>
        </div>
        <Badge variant={config.variant} className={config.className}>
          <StatusIcon
            className={`size-3 ${isActive ? "animate-spin" : ""}`}
          />
          {config.label}
        </Badge>
      </div>

      {/* ── Active crawl state ─────────────────────────────────── */}
      {isActive && (
        <>
          {/* Progress card */}
          <div className="rounded-lg border border-border/40 bg-card p-6">
            {/* Progress text */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">
                {progressText(crawl)}
              </p>
              {crawl.totalPages > 0 && (
                <span className="font-mono text-xs font-semibold tabular-nums text-muted-foreground">
                  {progressPct}%
                </span>
              )}
            </div>

            {/* Progress bar */}
            <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-muted/60">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap gap-3">
              <div className="flex flex-col items-center rounded-xl bg-muted/30 px-5 py-3">
                <span className="font-mono text-2xl font-bold tabular-nums text-foreground">
                  {crawl.totalPages}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                  Pages discovered
                </span>
              </div>
              <div className="flex flex-col items-center rounded-xl bg-muted/30 px-5 py-3">
                <span className="font-mono text-2xl font-bold tabular-nums text-foreground">
                  {crawl.scannedPages}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                  Pages scanned
                </span>
              </div>
              <div className="flex flex-col items-center rounded-xl bg-muted/30 px-5 py-3">
                <span className="font-mono text-2xl font-bold tabular-nums text-foreground">
                  {crawl.enrichedPages}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                  Pages enriched
                </span>
              </div>
            </div>
          </div>

          {/* Cancel button */}
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={cancelling}
            className="gap-2"
          >
            {cancelling ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Ban className="size-4" />
            )}
            Cancel Crawl
          </Button>
        </>
      )}

      {/* ── Completed state ────────────────────────────────────── */}
      {crawl.status === "completed" && (
        <>
          {/* Score + stats card */}
          <div className="rounded-lg border border-border/40 bg-card">
            <div className="flex flex-col items-center gap-6 p-6 sm:flex-row sm:gap-8 sm:p-8">
              {crawl.overallScore !== null && (
                <div className="shrink-0">
                  <ScoreGauge
                    score={crawl.overallScore}
                    size={150}
                    strokeWidth={10}
                  />
                </div>
              )}
              <div className="flex flex-1 flex-wrap gap-3">
                <div className="flex flex-col items-center rounded-xl bg-muted/30 px-5 py-3">
                  <span className="font-mono text-2xl font-bold tabular-nums text-foreground">
                    {crawl.totalPages}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                    Total pages
                  </span>
                </div>
                <div className="flex flex-col items-center rounded-xl bg-muted/30 px-5 py-3">
                  <span className="font-mono text-2xl font-bold tabular-nums text-foreground">
                    {crawl.overallScore ?? "--"}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                    Overall score
                  </span>
                </div>
                <div className="flex flex-col items-center rounded-xl bg-muted/30 px-5 py-3">
                  <span className="font-mono text-2xl font-bold tabular-nums text-foreground">
                    {crawl.newIssues}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                    New issues
                  </span>
                </div>
                <div className="flex flex-col items-center rounded-xl bg-muted/30 px-5 py-3">
                  <span className="font-mono text-2xl font-bold tabular-nums text-foreground">
                    {crawl.fixedIssues}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                    Fixed issues
                  </span>
                </div>
              </div>
            </div>
            <div className="border-t border-border/30 px-6 py-2.5 sm:px-8">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground/50">
                <CheckCircle2 className="size-3" />
                Crawl completed {crawl.completedAt ? relativeTime(crawl.completedAt) : ""}
              </p>
            </div>
          </div>

          {/* Two-column layout: Issues summary + Pages scanned */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left: Issues */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">Issues found</h3>
                <button
                  onClick={() => router.push(`/dashboard/site/${siteId}/issues`)}
                  className="text-[12px] font-semibold text-[#E90029] transition-colors hover:text-[#D10025]"
                >
                  View all {totalIssues} &rarr;
                </button>
              </div>

              {/* Severity breakdown */}
              {severityCounts && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {severityCounts.critical > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-red-50 px-2 py-1 text-[12px] font-semibold text-red-700">
                      <span className="size-1.5 rounded-full bg-red-500" />{severityCounts.critical} critical
                    </span>
                  )}
                  {severityCounts.serious > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-orange-50 px-2 py-1 text-[12px] font-semibold text-orange-700">
                      <span className="size-1.5 rounded-full bg-orange-500" />{severityCounts.serious} serious
                    </span>
                  )}
                  {severityCounts.moderate > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-yellow-50 px-2 py-1 text-[12px] font-semibold text-yellow-700">
                      <span className="size-1.5 rounded-full bg-yellow-500" />{severityCounts.moderate} moderate
                    </span>
                  )}
                  {severityCounts.minor > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2 py-1 text-[12px] font-semibold text-blue-700">
                      <span className="size-1.5 rounded-full bg-blue-400" />{severityCounts.minor} minor
                    </span>
                  )}
                </div>
              )}

              {/* Top issues list */}
              {topIssues && topIssues.length > 0 && (
                <div className="space-y-1">
                  {topIssues.map((issue) => {
                    const dotColor =
                      issue.severity === "critical" ? "bg-red-500" :
                      issue.severity === "serious" ? "bg-orange-500" :
                      issue.severity === "moderate" ? "bg-yellow-500" : "bg-blue-400";
                    return (
                      <div
                        key={issue.id}
                        className="flex items-start gap-2.5 rounded-lg border border-border/30 bg-card p-3"
                      >
                        <span className={`mt-1.5 size-1.5 shrink-0 rounded-full ${dotColor}`} />
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] leading-snug text-foreground/90 line-clamp-2">{issue.description}</p>
                          <p className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                            <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">{issue.wcagCriterion}</span>
                            {issue.pageUrl && (
                              <span className="truncate">{new URL(issue.pageUrl).pathname}</span>
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right: Pages scanned */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">Pages scanned</h3>
                <button
                  onClick={() => router.push(`/dashboard/site/${siteId}/pages`)}
                  className="text-[12px] font-semibold text-[#E90029] transition-colors hover:text-[#D10025]"
                >
                  View all {crawl.totalPages} &rarr;
                </button>
              </div>

              {pages && pages.length > 0 && (
                <div className="space-y-1.5">
                  {pages.map((page) => {
                    const latestScan = page.scans?.[0];
                    const score = latestScan?.summary?.overallScore ?? null;
                    const issueCount = latestScan?._count?.issues ?? 0;
                    return (
                      <button
                        key={page.id}
                        onClick={() => router.push(`/dashboard/site/${siteId}/page/${page.id}`)}
                        className="flex w-full items-center gap-3 rounded-lg border border-border/30 bg-card p-3 text-left transition-colors hover:bg-muted/20"
                      >
                        {score !== null ? (
                          <ScoreGauge score={score} size={36} strokeWidth={3} />
                        ) : (
                          <div className="flex size-9 items-center justify-center rounded-full bg-muted/50">
                            <FileText className="size-4 text-muted-foreground/50" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-medium text-foreground">{page.path}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {issueCount} {issueCount === 1 ? "issue" : "issues"}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Failed state ───────────────────────────────────────── */}
      {crawl.status === "failed" && (
        <>
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10">
                <XCircle className="size-5 text-destructive" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-foreground">
                  Crawl failed
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  The crawl encountered an error and could not complete.
                  {crawl.scannedPages > 0 && (
                    <> {crawl.scannedPages} of {crawl.totalPages} pages were scanned before failure.</>
                  )}
                </p>
              </div>
            </div>

            {/* Partial stats if any work was done */}
            {crawl.scannedPages > 0 && (
              <div className="mt-4 flex flex-wrap gap-3">
                <div className="flex flex-col items-center rounded-xl bg-muted/30 px-5 py-3">
                  <span className="font-mono text-2xl font-bold tabular-nums text-foreground">
                    {crawl.totalPages}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                    Pages discovered
                  </span>
                </div>
                <div className="flex flex-col items-center rounded-xl bg-muted/30 px-5 py-3">
                  <span className="font-mono text-2xl font-bold tabular-nums text-foreground">
                    {crawl.scannedPages}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                    Pages scanned
                  </span>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Cancelled state ────────────────────────────────────── */}
      {crawl.status === "cancelled" && (
        <>
          <div className="rounded-lg border border-border/40 bg-card p-6">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted/50">
                <Ban className="size-5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-foreground">
                  Crawl was cancelled
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  This crawl was manually cancelled.
                  {crawl.scannedPages > 0 && (
                    <> {crawl.scannedPages} of {crawl.totalPages} pages were scanned before cancellation.</>
                  )}
                </p>
              </div>
            </div>

            {/* Partial stats if any work was done */}
            {crawl.scannedPages > 0 && (
              <div className="mt-4 flex flex-wrap gap-3">
                <div className="flex flex-col items-center rounded-xl bg-muted/30 px-5 py-3">
                  <span className="font-mono text-2xl font-bold tabular-nums text-foreground">
                    {crawl.totalPages}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                    Pages discovered
                  </span>
                </div>
                <div className="flex flex-col items-center rounded-xl bg-muted/30 px-5 py-3">
                  <span className="font-mono text-2xl font-bold tabular-nums text-foreground">
                    {crawl.scannedPages}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                    Pages scanned
                  </span>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
