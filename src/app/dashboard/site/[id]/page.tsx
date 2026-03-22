"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";
import {
  ArrowLeft,
  Globe,
  Play,
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Ban,
  ChevronRight,
  ExternalLink,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScoreGauge } from "@/components/results/ScoreGauge";
import { relativeTime } from "@/lib/relative-time";
import type { Site, CrawlSummary, CrawlStatus, PageSummary } from "@/lib/types";

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

function getScoreColor(score: number): string {
  if (score < 50) return "var(--score-bad)";
  if (score < 80) return "var(--score-okay)";
  return "var(--score-good)";
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="size-9 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-8 w-28 rounded-lg" />
      </div>
      <div className="rounded-lg border border-border/40 bg-card p-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
          <Skeleton className="size-36 rounded-full" />
          <div className="flex flex-1 flex-wrap gap-4">
            <Skeleton className="h-20 w-32 rounded-xl" />
            <Skeleton className="h-20 w-32 rounded-xl" />
          </div>
        </div>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-3">
          <Skeleton className="h-5 w-20" />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
        <div className="space-y-3">
          <Skeleton className="h-5 w-28" />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SiteOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const siteId = params.id as string;
  const [crawling, setCrawling] = useState(false);

  const {
    data: site,
    isLoading: siteLoading,
    error: siteError,
  } = useSWR<Site>(siteId ? `/api/sites/${siteId}` : null, fetcher, {
    revalidateOnFocus: false,
  });

  const {
    data: crawlsData,
    isLoading: crawlsLoading,
  } = useSWR<{ crawls: CrawlSummary[]; total: number }>(
    siteId ? `/api/sites/${siteId}/crawls` : null,
    fetcher,
    { revalidateOnFocus: false }
  );
  const crawls = crawlsData?.crawls;

  const {
    data: pagesData,
  } = useSWR<{ pages: PageSummary[]; total: number }>(
    siteId ? `/api/sites/${siteId}/pages?limit=5` : null,
    fetcher,
    { revalidateOnFocus: false }
  );
  const pages = pagesData?.pages;
  const totalPages = pagesData?.total ?? 0;

  // Fetch issues for severity breakdown
  const { data: issuesData } = useSWR<{ issues: Array<{ severity: string }>; total: number }>(
    siteId ? `/api/sites/${siteId}/issues?limit=50` : null,
    fetcher,
    { revalidateOnFocus: false }
  );
  const totalIssues = issuesData?.total ?? 0;
  const sevCounts = issuesData?.issues ? {
    critical: issuesData.issues.filter((i) => i.severity === "critical").length,
    serious: issuesData.issues.filter((i) => i.severity === "serious").length,
    moderate: issuesData.issues.filter((i) => i.severity === "moderate").length,
    minor: issuesData.issues.filter((i) => i.severity === "minor").length,
  } : null;

  async function handleCrawl() {
    setCrawling(true);
    try {
      const res = await fetch(`/api/sites/${siteId}/crawl`, { method: "POST" });
      if (res.ok) {
        const crawl = await res.json();
        router.push(`/dashboard/site/${siteId}/crawl/${crawl.id}`);
        return;
      }
    } catch {
      // ignore
    }
    setCrawling(false);
  }

  if (siteLoading || crawlsLoading) {
    return <LoadingSkeleton />;
  }

  if (siteError || !site) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-lg bg-muted">
          <AlertTriangle className="size-6 text-muted-foreground" />
        </div>
        <h2 className="mb-3 text-lg font-bold">
          {siteError?.status === 404 ? "Site not found" : "Failed to load site"}
        </h2>
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard")}
          className="gap-2"
        >
          <ArrowLeft className="size-4" />
          Back to dashboard
        </Button>
      </div>
    );
  }

  const latestCrawl = site.crawls?.[0] ?? crawls?.[0] ?? null;
  const pageCount = site._count?.pages ?? 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex size-9 items-center justify-center rounded-xl border border-border/40 text-muted-foreground transition-all hover:border-border hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-xl font-bold tracking-tight text-foreground">
              {site.hostname}
            </h1>
            <a
              href={`https://${site.hostname}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground/40 transition-colors hover:text-muted-foreground"
            >
              <ExternalLink className="size-3.5" />
            </a>
          </div>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
            <FileText className="size-3" />
            {pageCount} {pageCount === 1 ? "page" : "pages"} tracked
          </p>
        </div>
        <Button
          onClick={handleCrawl}
          disabled={crawling}
          className="gap-2"
        >
          {crawling ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Play className="size-4" />
          )}
          Crawl Now
        </Button>
      </div>

      {/* Score + stats */}
      {latestCrawl && latestCrawl.overallScore !== null && (
        <div className="rounded-lg border border-border/40 bg-card">
          <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:gap-8 sm:p-8">
            <div className="shrink-0">
              <ScoreGauge score={latestCrawl.overallScore} size={130} strokeWidth={10} />
            </div>
            <div className="flex-1 space-y-4">
              {/* Stats row */}
              <div className="flex flex-wrap gap-6">
                <div>
                  <div className="text-2xl font-extrabold tabular-nums text-foreground">{totalIssues}</div>
                  <div className="text-[11px] text-muted-foreground">Total issues</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold tabular-nums text-foreground">{pageCount}</div>
                  <div className="text-[11px] text-muted-foreground">Pages</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold tabular-nums text-foreground">{latestCrawl.overallScore}</div>
                  <div className="text-[11px] text-muted-foreground">Score</div>
                </div>
              </div>

              {/* Severity chips */}
              {sevCounts && totalIssues > 0 && (
                <div className="flex flex-wrap gap-2">
                  {sevCounts.critical > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-700">
                      <span className="size-1.5 rounded-full bg-red-500" />{sevCounts.critical} critical
                    </span>
                  )}
                  {sevCounts.serious > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-orange-50 px-2 py-1 text-[11px] font-semibold text-orange-700">
                      <span className="size-1.5 rounded-full bg-orange-500" />{sevCounts.serious} serious
                    </span>
                  )}
                  {sevCounts.moderate > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-yellow-50 px-2 py-1 text-[11px] font-semibold text-yellow-700">
                      <span className="size-1.5 rounded-full bg-yellow-500" />{sevCounts.moderate} moderate
                    </span>
                  )}
                  {sevCounts.minor > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700">
                      <span className="size-1.5 rounded-full bg-blue-400" />{sevCounts.minor} minor
                    </span>
                  )}
                </div>
              )}

              {/* Quick links */}
              <div className="flex gap-4">
                <button
                  onClick={() => router.push(`/dashboard/site/${siteId}/issues`)}
                  className="text-[12px] font-semibold text-[#E90029] transition-colors hover:text-[#D10025]"
                >
                  View all issues &rarr;
                </button>
                <button
                  onClick={() => router.push(`/dashboard/site/${siteId}/pages`)}
                  className="text-[12px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
                >
                  View all pages &rarr;
                </button>
              </div>
            </div>
          </div>
          <div className="border-t border-border/30 px-6 py-2.5 sm:px-8">
            <p className="text-xs text-muted-foreground/50">
              Latest crawl {relativeTime(latestCrawl.completedAt ?? latestCrawl.createdAt)}
            </p>
          </div>
        </div>
      )}

      {/* Two-column: Pages + Crawl History */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Pages */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/60">
              Pages
            </h2>
            {totalPages > 0 && (
              <button
                onClick={() => router.push(`/dashboard/site/${siteId}/pages`)}
                className="flex items-center gap-1 text-xs text-muted-foreground/50 transition-colors hover:text-foreground"
              >
                View all {totalPages}
                <ChevronRight className="size-3" />
              </button>
            )}
          </div>

          {(!pages || pages.length === 0) && (
            <div className="flex flex-col items-center rounded-lg border border-dashed border-border/50 py-10 text-center">
              <FileText className="mb-2 size-6 text-muted-foreground/30" />
              <p className="text-sm font-medium text-muted-foreground">
                No pages discovered yet
              </p>
              <p className="mt-1 text-xs text-muted-foreground/50">
                Run a crawl to find pages
              </p>
            </div>
          )}

          {pages && pages.length > 0 && (
            <div className="space-y-1.5">
              {pages.map((page) => {
                const latestScan = page.scans?.[0];
                const score = latestScan?.summary?.overallScore ?? null;
                const issueCount = latestScan?._count?.issues ?? 0;

                return (
                  <button
                    key={page.id}
                    onClick={() =>
                      router.push(`/dashboard/site/${siteId}/page/${page.id}`)
                    }
                    className="group flex w-full items-center gap-3 rounded-xl border border-border/40 bg-card px-3.5 py-2.5 text-left transition-all hover:border-border hover:shadow-sm"
                  >
                    {/* Score mini */}
                    {score !== null ? (
                      <div
                        className="flex size-8 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold tabular-nums"
                        style={{
                          color: getScoreColor(score),
                          backgroundColor: `color-mix(in oklch, ${getScoreColor(score)} 10%, transparent)`,
                        }}
                      >
                        {score}
                      </div>
                    ) : (
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground/30">
                        <BarChart3 className="size-3.5" />
                      </div>
                    )}

                    {/* Path + issues */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {page.path || "/"}
                      </p>
                      {issueCount > 0 && (
                        <p className="text-[11px] text-muted-foreground/50">
                          {issueCount} {issueCount === 1 ? "issue" : "issues"}
                        </p>
                      )}
                    </div>

                    <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/30 transition-transform group-hover:translate-x-0.5 group-hover:text-muted-foreground/60" />
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Crawl History */}
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground/60">
            Crawl History
          </h2>

          {(!crawls || crawls.length === 0) && (
            <div className="flex flex-col items-center rounded-lg border border-dashed border-border/50 py-10 text-center">
              <Globe className="mb-2 size-6 text-muted-foreground/30" />
              <p className="text-sm font-medium text-muted-foreground">
                No crawls yet
              </p>
              <p className="mt-1 text-xs text-muted-foreground/50">
                Start your first crawl above
              </p>
            </div>
          )}

          {crawls && crawls.length > 0 && (
            <div className="space-y-1.5">
              {crawls.map((crawl) => {
                const config = statusConfig(crawl.status);
                const Icon = config.icon;
                const isActive =
                  crawl.status === "discovering" ||
                  crawl.status === "scanning" ||
                  crawl.status === "queued";

                return (
                  <button
                    key={crawl.id}
                    onClick={() =>
                      router.push(
                        `/dashboard/site/${siteId}/crawl/${crawl.id}`
                      )
                    }
                    className="group flex w-full items-center gap-3 rounded-xl border border-border/40 bg-card px-3.5 py-2.5 text-left transition-all hover:border-border hover:shadow-sm"
                  >
                    {/* Status icon */}
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/50">
                      <Icon
                        className={`size-3.5 text-muted-foreground ${
                          isActive ? "animate-spin" : ""
                        }`}
                      />
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={config.variant}
                          className={`text-[10px] px-1.5 py-0 ${config.className}`}
                        >
                          {config.label}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground/50">
                          {relativeTime(crawl.createdAt)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-muted-foreground/50">
                        {crawl.scannedPages} / {crawl.totalPages} pages
                      </p>
                    </div>

                    {/* Score */}
                    {crawl.overallScore !== null && (
                      <div
                        className="shrink-0 font-mono text-sm font-bold tabular-nums"
                        style={{ color: getScoreColor(crawl.overallScore) }}
                      >
                        {crawl.overallScore}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
