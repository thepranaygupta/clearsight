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
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScanProgress } from "@/components/scan/ScanProgress";
import { ScoreGauge } from "@/components/results/ScoreGauge";
import { SummaryCard } from "@/components/results/SummaryCard";
import { IssueTabs } from "@/components/results/IssueTabs";
import { TopPriorities } from "@/components/results/TopPriorities";
import { ExportButtons } from "@/components/results/ExportButtons";
import { InspectorPanel } from "@/components/inspector/InspectorPanel";
import { useInspectorState } from "@/components/inspector/useInspectorState";
import { cn } from "@/lib/utils";
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
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="size-9 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <Skeleton className="h-48 w-full rounded-2xl" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
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
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <div className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-red-50 shadow-sm">
        <AlertTriangle className="size-7 text-[var(--severity-critical)]" />
      </div>
      <h2 className="mb-2 text-xl font-bold text-foreground">Scan failed</h2>
      <p className="mb-1 max-w-md text-sm text-muted-foreground">
        {scan.errorMessage || "An unexpected error occurred while scanning."}
      </p>
      <p className="mb-8 font-mono text-xs text-muted-foreground/40">
        {scan.url}
      </p>
      <Button onClick={onRetry} className="gap-2">
        <RotateCcw className="size-4" />
        Try Again
      </Button>
    </div>
  );
}

function StatCard({
  value,
  label,
  variant = "default",
}: {
  value: number;
  label: string;
  variant?: "default" | "critical";
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-xl px-5 py-3",
        variant === "critical"
          ? "bg-red-50/80"
          : "bg-muted/30"
      )}
    >
      <span
        className={cn(
          "font-mono text-2xl font-bold tabular-nums",
          variant === "critical"
            ? "text-[var(--severity-critical)]"
            : "text-foreground"
        )}
      >
        {value}
      </span>
      <span
        className={cn(
          "text-[10px] font-semibold uppercase tracking-wider",
          variant === "critical"
            ? "text-[var(--severity-critical)]/60"
            : "text-muted-foreground/60"
        )}
      >
        {label}
      </span>
    </div>
  );
}

function ResultsView({ scan }: { scan: ScanDetail }) {
  const inspector = useInspectorState();
  const summary = scan.summary;
  const issues = scan.issues ?? [];
  const isPerfect = issues.length === 0 && summary?.overallScore === 100;
  const activeIssue = issues.find((i) => i.id === inspector.activeIssueId) ?? null;

  const confirmedCount = issues.filter((i) => i.type === "confirmed").length;
  const potentialCount = issues.filter((i) => i.type === "potential").length;
  const criticalCount = issues.filter((i) => i.severity === "critical").length;
  const seriousCount = issues.filter((i) => i.severity === "serious").length;

  return (
    <div className="space-y-6">
      {/* Score hero */}
      <div className="rounded-2xl border border-border/40 bg-card">
        <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:gap-8 sm:p-8">
          {/* Gauge */}
          {summary && (
            <div className="shrink-0 self-center">
              <ScoreGauge score={summary.overallScore} size={150} strokeWidth={10} />
            </div>
          )}

          {/* Info */}
          <div className="flex-1 space-y-4">
            {scan.pageTitle && (
              <h2 className="text-xl font-bold leading-snug tracking-tight text-foreground">
                {scan.pageTitle}
              </h2>
            )}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <Globe className="size-3.5" />
                <span className="font-mono text-xs">{scan.url}</span>
              </span>
              {scan.completedAt && (
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="size-3.5" />
                  <span className="text-xs">{formatDate(scan.completedAt)}</span>
                </span>
              )}
            </div>

            {/* Quick stats */}
            {!isPerfect && (
              <div className="flex flex-wrap gap-2 pt-1">
                <StatCard value={confirmedCount} label="Confirmed" />
                <StatCard value={potentialCount} label="Potential" />
                {criticalCount > 0 && (
                  <StatCard value={criticalCount} label="Critical" variant="critical" />
                )}
                {seriousCount > 0 && (
                  <StatCard value={seriousCount} label="Serious" />
                )}
              </div>
            )}
          </div>

          {/* Screenshot */}
          {scan.pageScreenshot && (
            <div className="hidden shrink-0 sm:block">
              <button
                type="button"
                onClick={() => {
                  const byteChars = atob(scan.pageScreenshot!)
                  const byteArray = new Uint8Array(byteChars.length)
                  for (let i = 0; i < byteChars.length; i++) byteArray[i] = byteChars.charCodeAt(i)
                  const blob = new Blob([byteArray], { type: 'image/png' })
                  window.open(URL.createObjectURL(blob), '_blank')
                }}
                className="block overflow-hidden rounded-xl border border-border/60 shadow-sm transition-opacity hover:opacity-80 cursor-pointer"
              >
                <img
                  src={`data:image/png;base64,${scan.pageScreenshot}`}
                  alt="Page screenshot"
                  className="h-36 w-52 object-cover object-top"
                />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Perfect score */}
      {isPerfect && (
        <div className="flex flex-col items-center rounded-2xl border border-green-200/50 bg-gradient-to-br from-green-50/60 to-emerald-50/30 py-14 text-center">
          <div className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-green-100 shadow-sm">
            <PartyPopper className="size-7 text-green-600" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-green-900">
            Perfect score!
          </h3>
          <p className="max-w-sm text-sm leading-relaxed text-green-700/70">
            No WCAG 2.1 A or AA violations were found.
            This page meets accessibility standards.
          </p>
        </div>
      )}

      {/* Summary + positives */}
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
      {issues.length > 0 && <IssueTabs issues={issues} onInspect={inspector.open} />}

      {/* Inspector overlay */}
      {inspector.isOpen && activeIssue && (
        <InspectorPanel
          scan={scan}
          issue={activeIssue}
          allIssues={issues}
          viewMode={inspector.viewMode}
          onViewModeChange={inspector.setViewMode}
          onNavigateIssue={inspector.setActiveIssue}
          onClose={inspector.close}
        />
      )}
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
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted">
          <AlertTriangle className="size-6 text-muted-foreground" />
        </div>
        <h2 className="mb-3 text-lg font-bold">{error || "Not found"}</h2>
        <Button variant="outline" onClick={() => router.push("/")} className="gap-2">
          <ArrowLeft className="size-4" />
          Back to home
        </Button>
      </div>
    );
  }

  const isComplete =
    scan.status === "completed" || scan.status === "completed_partial";

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/")}
          className="flex size-9 items-center justify-center rounded-xl border border-border/40 text-muted-foreground transition-all hover:border-border hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate font-mono text-sm font-medium text-foreground/80">
            {scan.url}
          </p>
          <p className="text-xs text-muted-foreground/60">
            {formatDate(scan.createdAt)}
          </p>
        </div>
        {isComplete && <ExportButtons scanId={scanId} />}
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

      {isComplete && <ResultsView scan={scan} />}

      {scan.status === "cancelled" && (
        <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
          <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-muted/60">
            <ShieldCheck className="size-6 text-muted-foreground/50" />
          </div>
          <p className="mb-1 text-sm font-medium text-foreground">
            Scan cancelled
          </p>
          <p className="mb-8 text-xs text-muted-foreground/60">
            This scan was stopped before completion.
          </p>
          <Button variant="outline" onClick={handleRetry} className="gap-2">
            <RotateCcw className="size-4" />
            Scan Again
          </Button>
        </div>
      )}
    </div>
  );
}
