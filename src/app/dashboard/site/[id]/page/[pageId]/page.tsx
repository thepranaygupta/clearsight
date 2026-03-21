"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";
import {
  ArrowLeft,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Ban,
  Play,
  Bug,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScoreGauge } from "@/components/results/ScoreGauge";
import { relativeTime } from "@/lib/relative-time";
import type { PageSummary, ScanStatus } from "@/lib/types";

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw Object.assign(new Error("Failed"), { status: r.status });
    return r.json();
  });

function scanStatusConfig(status: ScanStatus) {
  switch (status) {
    case "completed":
      return {
        label: "Completed",
        variant: "secondary" as const,
        icon: CheckCircle2,
        className: "bg-green-100 text-green-700",
      };
    case "completed_partial":
      return {
        label: "Partial",
        variant: "secondary" as const,
        icon: CheckCircle2,
        className: "bg-yellow-100 text-yellow-700",
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
    case "running":
      return {
        label: "Running",
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
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-8 w-32 rounded-lg" />
      </div>

      {/* Score card skeleton */}
      <div className="rounded-2xl border border-border/40 bg-card p-6">
        <div className="flex items-center gap-6">
          <Skeleton className="size-24 rounded-full" />
          <div className="flex flex-wrap gap-4">
            <Skeleton className="h-16 w-28 rounded-xl" />
            <Skeleton className="h-16 w-28 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Scan history skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-32" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export default function PageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const siteId = params.id as string;
  const pageId = params.pageId as string;
  const [scanning, setScanning] = useState(false);

  const {
    data: page,
    isLoading,
    error,
  } = useSWR<PageSummary>(
    siteId && pageId
      ? `/api/sites/${siteId}/pages/${pageId}`
      : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  const scans = page?.scans ?? [];
  const latestScan = scans[0] ?? null;
  const latestScore = latestScan?.summary?.overallScore ?? null;
  const latestIssueCount = latestScan?._count?.issues ?? 0;

  async function handleScan() {
    if (!page) return;
    setScanning(true);
    try {
      const res = await fetch("/api/scans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: page.url }),
      });
      if (res.ok) {
        const newScan = await res.json();
        router.push(`/dashboard/scan/${newScan.id}`);
        return;
      }
    } catch {
      // ignore
    }
    setScanning(false);
  }

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error || !page) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted">
          <AlertTriangle className="size-6 text-muted-foreground" />
        </div>
        <h2 className="mb-3 text-lg font-bold">
          {(error as { status?: number })?.status === 404
            ? "Page not found"
            : "Failed to load page"}
        </h2>
        <Button
          variant="outline"
          onClick={() => router.push(`/dashboard/site/${siteId}/pages`)}
          className="gap-2"
        >
          <ArrowLeft className="size-4" />
          Back to pages
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push(`/dashboard/site/${siteId}/pages`)}
          className="flex size-9 items-center justify-center rounded-xl border border-border/40 text-muted-foreground transition-all hover:border-border hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold tracking-tight text-foreground">
            {page.path}
          </h1>
          <a
            href={page.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground/60 transition-colors hover:text-muted-foreground"
          >
            {page.url}
            <ExternalLink className="size-3" />
          </a>
        </div>
        <Button
          onClick={handleScan}
          disabled={scanning}
          className="gap-2"
        >
          {scanning ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Play className="size-4" />
          )}
          Scan This Page
        </Button>
      </div>

      {/* Latest scan summary */}
      {latestScan && (
        <div className="rounded-2xl border border-border/40 bg-card">
          <div className="flex flex-col items-center gap-6 p-6 sm:flex-row sm:gap-8">
            {latestScore !== null && (
              <div className="shrink-0">
                <ScoreGauge score={latestScore} size={100} strokeWidth={8} />
              </div>
            )}
            <div className="flex flex-1 flex-wrap gap-3">
              <div className="flex flex-col items-center rounded-xl bg-muted/30 px-5 py-3">
                <span className="font-mono text-2xl font-bold tabular-nums text-foreground">
                  {latestIssueCount}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                  Issues
                </span>
              </div>
              {latestScore !== null && (
                <div className="flex flex-col items-center rounded-xl bg-muted/30 px-5 py-3">
                  <span className="font-mono text-2xl font-bold tabular-nums text-foreground">
                    {latestScore}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                    Score
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-border/30 px-6 py-2.5">
            <p className="text-xs text-muted-foreground/50">
              Latest scan {latestScan.status === "completed" || latestScan.status === "completed_partial" ? "completed" : latestScan.status}
            </p>
            <button
              onClick={() => router.push(`/dashboard/scan/${latestScan.id}`)}
              className="text-xs font-semibold text-[#E90029] transition-colors hover:text-[#D10025]"
            >
              View full results &rarr;
            </button>
          </div>
        </div>
      )}

      {/* No scans state */}
      {!latestScan && (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-border/50 py-14 text-center">
          <Bug className="mb-3 size-8 text-muted-foreground/30" />
          <p className="text-sm font-medium text-muted-foreground">
            No scans yet for this page.
          </p>
          <p className="mt-1 text-xs text-muted-foreground/50">
            Click &quot;Scan This Page&quot; to start.
          </p>
        </div>
      )}

      {/* Scan History */}
      {scans.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground/60">
            Scan History
          </h2>

          <div className="space-y-2">
            {scans.map((scan) => {
              const config = scanStatusConfig(scan.status);
              const Icon = config.icon;
              const isActive =
                scan.status === "running" || scan.status === "queued";
              const score = scan.summary?.overallScore ?? null;
              const issues = scan._count?.issues ?? 0;

              return (
                <button
                  key={scan.id}
                  onClick={() =>
                    router.push(`/dashboard/scan/${scan.id}`)
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
                      {!isActive && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground/60">
                          <Bug className="size-3" />
                          {issues} {issues === 1 ? "issue" : "issues"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Score */}
                  {score !== null && (
                    <div className="shrink-0">
                      <ScoreGauge score={score} size={40} strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
