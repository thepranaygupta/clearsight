"use client";

import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import {
  ArrowLeft,
  FileText,
  AlertTriangle,
  Loader2,
  Bug,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScoreGauge } from "@/components/results/ScoreGauge";
import type { PageSummary } from "@/lib/types";

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw Object.assign(new Error("Failed"), { status: r.status });
    return r.json();
  });

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center gap-3">
        <Skeleton className="size-9 rounded-xl" />
        <Skeleton className="h-6 w-32" />
      </div>

      {/* Card skeletons */}
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default function PagesListPage() {
  const params = useParams();
  const router = useRouter();
  const siteId = params.id as string;

  const {
    data,
    isLoading,
    error,
  } = useSWR<{ pages: PageSummary[]; total: number }>(
    siteId ? `/api/sites/${siteId}/pages` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  const pages = data?.pages;

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-lg bg-muted">
          <AlertTriangle className="size-6 text-muted-foreground" />
        </div>
        <h2 className="mb-3 text-lg font-bold">
          {(error as { status?: number })?.status === 404
            ? "Site not found"
            : "Failed to load pages"}
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
          Pages
        </h1>
      </div>

      {/* Empty state */}
      {(!pages || pages.length === 0) && (
        <div className="flex flex-col items-center rounded-lg border border-dashed border-border/50 py-14 text-center">
          <FileText className="mb-3 size-8 text-muted-foreground/30" />
          <p className="text-sm font-medium text-muted-foreground">
            No pages discovered yet.
          </p>
        </div>
      )}

      {/* Page cards */}
      {pages && pages.length > 0 && (
        <div className="space-y-2">
          {pages.map((page) => {
            const latestScan = page.scans?.[0] ?? null;
            const score = latestScan?.summary?.overallScore ?? null;
            const issueCount = latestScan?._count?.issues ?? 0;
            const isRunning =
              latestScan?.status === "running" ||
              latestScan?.status === "queued";

            return (
              <button
                key={page.id}
                onClick={() =>
                  router.push(
                    `/dashboard/site/${siteId}/page/${page.id}`
                  )
                }
                className="flex w-full items-center gap-4 rounded-lg border border-border/40 bg-card p-4 text-left transition-all hover:border-border hover:shadow-sm"
              >
                {/* Score gauge or placeholder */}
                <div className="shrink-0">
                  {score !== null ? (
                    <ScoreGauge score={score} size={40} strokeWidth={3} />
                  ) : (
                    <div className="flex size-10 items-center justify-center rounded-full bg-muted/50">
                      <FileText className="size-4 text-muted-foreground/50" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {page.path}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2">
                    {latestScan && !isRunning && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground/60">
                        <Bug className="size-3" />
                        {issueCount} {issueCount === 1 ? "issue" : "issues"}
                      </span>
                    )}
                    {isRunning && (
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-700"
                      >
                        <Loader2 className="size-3 animate-spin" />
                        Scanning
                      </Badge>
                    )}
                    {!latestScan && (
                      <span className="text-xs text-muted-foreground/40">
                        Not scanned
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
