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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScoreGauge } from "@/components/results/ScoreGauge";
import { relativeTime } from "@/lib/relative-time";
import type { Site, CrawlSummary, CrawlStatus } from "@/lib/types";

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

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center gap-3">
        <Skeleton className="size-9 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-8 w-28 rounded-lg" />
      </div>

      {/* Score section skeleton */}
      <div className="rounded-2xl border border-border/40 bg-card p-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
          <Skeleton className="size-36 rounded-full" />
          <div className="flex flex-1 flex-wrap gap-4">
            <Skeleton className="h-20 w-32 rounded-xl" />
            <Skeleton className="h-20 w-32 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Crawl history skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-32" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-2xl" />
        ))}
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
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted">
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex size-9 items-center justify-center rounded-xl border border-border/40 text-muted-foreground transition-all hover:border-border hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold tracking-tight text-foreground">
            {site.hostname}
          </h1>
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

      {/* Score section */}
      {latestCrawl && latestCrawl.overallScore !== null && (
        <div className="rounded-2xl border border-border/40 bg-card">
          <div className="flex flex-col items-center gap-6 p-6 sm:flex-row sm:gap-8 sm:p-8">
            <div className="shrink-0">
              <ScoreGauge score={latestCrawl.overallScore} size={150} strokeWidth={10} />
            </div>
            <div className="flex flex-1 flex-col gap-3">
              <div className="flex flex-wrap gap-3">
                <div className="flex flex-col items-center rounded-xl bg-muted/30 px-5 py-3">
                  <span className="font-mono text-2xl font-bold tabular-nums text-foreground">
                    {latestCrawl.scannedPages}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                    Pages scanned
                  </span>
                </div>
                <div className="flex flex-col items-center rounded-xl bg-muted/30 px-5 py-3">
                  <span className="font-mono text-2xl font-bold tabular-nums text-foreground">
                    {latestCrawl.totalPages}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                    Total pages
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/dashboard/site/${siteId}/pages`)}
                className="w-fit gap-1.5 text-xs"
              >
                <FileText className="size-3" />
                View all pages
              </Button>
            </div>
          </div>
          <div className="border-t border-border/30 px-6 py-2.5 sm:px-8">
            <p className="text-xs text-muted-foreground/50">
              Latest crawl {relativeTime(latestCrawl.completedAt ?? latestCrawl.createdAt)}
            </p>
          </div>
        </div>
      )}

      {/* Crawl History */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground/60">
          Crawl History
        </h2>

        {(!crawls || crawls.length === 0) && (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-border/50 py-14 text-center">
            <Globe className="mb-3 size-8 text-muted-foreground/30" />
            <p className="text-sm font-medium text-muted-foreground">
              No crawls yet.
            </p>
            <p className="mt-1 text-xs text-muted-foreground/50">
              Start your first crawl above.
            </p>
          </div>
        )}

        {crawls && crawls.length > 0 && (
          <div className="space-y-2">
            {crawls.map((crawl) => {
              const config = statusConfig(crawl.status);
              const Icon = config.icon;
              const isActive = crawl.status === "discovering" || crawl.status === "scanning" || crawl.status === "queued";

              return (
                <button
                  key={crawl.id}
                  onClick={() =>
                    router.push(`/dashboard/site/${siteId}/crawl/${crawl.id}`)
                  }
                  className="flex w-full items-center gap-4 rounded-2xl border border-border/40 bg-card p-4 text-left transition-all hover:border-border hover:shadow-sm"
                >
                  {/* Status icon */}
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted/50">
                    <Icon
                      className={`size-4 text-muted-foreground ${
                        isActive ? "animate-spin" : ""
                      }`}
                    />
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={config.variant}
                        className={config.className}
                      >
                        {config.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground/50">
                        {relativeTime(crawl.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {crawl.scannedPages} / {crawl.totalPages} pages scanned
                    </p>
                  </div>

                  {/* Score */}
                  {crawl.overallScore !== null && (
                    <div className="shrink-0">
                      <ScoreGauge score={crawl.overallScore} size={48} strokeWidth={4} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
