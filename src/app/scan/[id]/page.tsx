"use client";

import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw Object.assign(new Error("Fetch error"), { status: r.status });
    return r.json();
  });
import {
  ArrowLeft,
  Globe,
  Calendar,
  AlertTriangle,
  RotateCcw,
  PartyPopper,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScanProgress } from "@/components/scan/ScanProgress";
import { ScoreGauge } from "@/components/results/ScoreGauge";
import { SummaryCard } from "@/components/results/SummaryCard";
import { IssueTabs } from "@/components/results/IssueTabs";
import { TopPriorities } from "@/components/results/TopPriorities";
import { ExportButtons } from "@/components/results/ExportButtons";
import type { ScanDetail } from "@/lib/types";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Skeleton className="size-8 rounded-lg" />
        <Skeleton className="h-5 w-64" />
      </div>
      <Skeleton className="mx-auto h-64 w-full max-w-2xl rounded-xl" />
    </div>
  );
}

function ErrorState({
  scan,
  onRetry,
}: {
  scan: ScanDetail;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-red-50">
        <AlertTriangle className="size-6 text-[var(--severity-critical)]" />
      </div>
      <h2 className="mb-2 text-lg font-semibold text-foreground">
        Scan Failed
      </h2>
      <p className="mb-1 max-w-md text-sm text-muted-foreground">
        {scan.errorMessage || "An unexpected error occurred while scanning."}
      </p>
      <p className="mb-6 font-mono text-xs text-muted-foreground/60">
        {scan.url}
      </p>
      <Button onClick={onRetry}>
        <RotateCcw className="size-4" />
        Try Again
      </Button>
    </div>
  );
}

function ResultsView({ scan }: { scan: ScanDetail }) {
  const summary = scan.summary;
  const issues = scan.issues ?? [];
  const isPerfect = issues.length === 0 && summary?.overallScore === 100;

  const confirmedCount = issues.filter((i) => i.type === "confirmed").length;
  const potentialCount = issues.filter((i) => i.type === "potential").length;
  const criticalCount = issues.filter((i) => i.severity === "critical").length;

  return (
    <div className="space-y-8">
      {/* Hero header */}
      <div className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-10">
          {/* Score gauge */}
          {summary && (
            <div className="shrink-0 self-center sm:self-start">
              <ScoreGauge score={summary.overallScore} size={140} strokeWidth={10} />
            </div>
          )}

          {/* Meta info */}
          <div className="flex-1 space-y-4">
            {scan.pageTitle && (
              <h2 className="text-xl font-semibold leading-snug text-foreground">
                {scan.pageTitle}
              </h2>
            )}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Globe className="size-3.5" />
                <span className="font-mono text-xs">{scan.url}</span>
              </span>
              {scan.completedAt && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="size-3.5" />
                  <span className="text-xs">{formatDate(scan.completedAt)}</span>
                </span>
              )}
            </div>

            {/* Quick stats */}
            {!isPerfect && (
              <div className="flex gap-1.5 pt-1">
                <div className="flex flex-col items-center rounded-xl bg-background px-5 py-3">
                  <span className="text-2xl font-semibold tabular-nums text-foreground">
                    {confirmedCount}
                  </span>
                  <span className="text-[11px] font-medium text-muted-foreground">Confirmed</span>
                </div>
                <div className="flex flex-col items-center rounded-xl bg-background px-5 py-3">
                  <span className="text-2xl font-semibold tabular-nums text-foreground">
                    {potentialCount}
                  </span>
                  <span className="text-[11px] font-medium text-muted-foreground">Potential</span>
                </div>
                {criticalCount > 0 && (
                  <div className="flex flex-col items-center rounded-xl bg-red-50/80 px-5 py-3">
                    <span className="text-2xl font-semibold tabular-nums text-[var(--severity-critical)]">
                      {criticalCount}
                    </span>
                    <span className="text-[11px] font-medium text-[var(--severity-critical)]/70">Critical</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Screenshot thumbnail */}
          {scan.pageScreenshot && (
            <div className="shrink-0 hidden sm:block">
              <img
                src={`data:image/png;base64,${scan.pageScreenshot}`}
                alt="Page screenshot"
                className="h-32 w-48 rounded-xl border border-border object-cover object-top shadow-sm"
              />
            </div>
          )}
        </div>
      </div>

      {/* Zero issues celebration */}
      {isPerfect && (
        <div className="flex flex-col items-center rounded-2xl border border-green-200/60 bg-green-50/50 py-12 text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-green-100">
            <PartyPopper className="size-7 text-green-600" />
          </div>
          <h3 className="mb-1.5 text-lg font-semibold text-green-900">
            Perfect accessibility score!
          </h3>
          <p className="max-w-sm text-sm text-green-700/80">
            No WCAG 2.1 A or AA violations were found. This page is fully
            accessible.
          </p>
        </div>
      )}

      {/* Summary */}
      {summary && !isPerfect && (
        <SummaryCard
          summary={summary.summary}
          positiveFindings={summary.positiveFindings}
        />
      )}

      {/* Top Priorities */}
      {summary && summary.topPriorities.length > 0 && (
        <TopPriorities priorities={summary.topPriorities} />
      )}

      {/* Issues */}
      {issues.length > 0 && <IssueTabs issues={issues} />}
    </div>
  );
}

export default function ScanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const scanId = params?.id as string;

  const isInProgress = (s?: ScanDetail) =>
    s?.status === "queued" || s?.status === "running";

  const { data: scan, isLoading: loading, error: swrError } = useSWR<ScanDetail>(
    scanId ? `/api/scans/${scanId}` : null,
    fetcher,
    {
      refreshInterval: (data) => (isInProgress(data) ? 2000 : 0),
      revalidateOnFocus: false,
    }
  );

  const error = swrError
    ? swrError.status === 404
      ? "Scan not found"
      : "Failed to load scan"
    : null;

  async function handleCancel() {
    if (!scan) return;
    try {
      await fetch(`/api/scans/${scanId}/cancel`, { method: "POST" });
    } catch {
      // ignore
    }
  }

  async function handleRetry() {
    if (!scan) return;
    try {
      const res = await fetch("/api/scans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: scan.url }),
      });
      if (res.ok) {
        const newScan = await res.json();
        router.push(`/scan/${newScan.id}`);
      }
    } catch {
      // ignore
    }
  }

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error || !scan) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
          <AlertTriangle className="size-6 text-muted-foreground" />
        </div>
        <h2 className="mb-2 text-lg font-semibold">{error || "Not found"}</h2>
        <Button variant="outline" onClick={() => router.push("/")}>
          <ArrowLeft className="size-4" />
          Back to home
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/")}
          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate font-mono text-sm text-foreground/80">
            {scan.url}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDate(scan.createdAt)}
          </p>
        </div>
        {(scan.status === "completed" || scan.status === "completed_partial") && (
          <ExportButtons scanId={scanId} />
        )}
      </div>

      {/* Content */}
      {(scan.status === "queued" || scan.status === "running") && (
        <ScanProgress
          url={scan.url}
          progress={scan.progress}
          currentStage={scan.currentStage}
          onCancel={handleCancel}
        />
      )}

      {scan.status === "failed" && (
        <ErrorState scan={scan} onRetry={handleRetry} />
      )}

      {(scan.status === "completed" ||
        scan.status === "completed_partial") && <ResultsView scan={scan} />}

      {scan.status === "cancelled" && (
        <div className="flex flex-col items-center py-16 text-center">
          <p className="mb-4 text-sm text-muted-foreground">
            This scan was cancelled.
          </p>
          <Button variant="outline" onClick={handleRetry}>
            <RotateCcw className="size-4" />
            Scan Again
          </Button>
        </div>
      )}
    </div>
  );
}
