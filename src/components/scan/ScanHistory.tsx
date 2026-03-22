"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import useSWR from "swr";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { relativeTime } from "@/lib/relative-time";
import type { ScanListItem } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function getSiteName(scan: ScanListItem): string {
  if (scan.pageTitle) return scan.pageTitle;
  try {
    return new URL(scan.url).hostname;
  } catch {
    return scan.url;
  }
}

function getHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function getScoreColor(score: number): string {
  if (score >= 80) return "var(--score-good)";
  if (score >= 50) return "var(--score-okay)";
  return "var(--score-bad)";
}

function StatusDot({ scan }: { scan: ScanListItem }) {
  if (scan.status === "running" || scan.status === "queued") {
    return (
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-sidebar-primary opacity-50" />
        <span className="relative inline-flex size-2 rounded-full bg-sidebar-primary" />
      </span>
    );
  }

  if (scan.status === "failed") {
    return <span className="size-2 rounded-full bg-red-500" />;
  }

  return <span className="size-2 rounded-full bg-sidebar-foreground/20" />;
}

export function useScanHistory() {
  const { data, isLoading } = useSWR<{ scans: ScanListItem[] }>(
    "/api/scans?limit=50",
    fetcher,
    { refreshInterval: 3000 }
  );
  return { scans: data?.scans ?? [], isLoading };
}

interface ScanSearchProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export function ScanSearch({ search, onSearchChange }: ScanSearchProps) {
  return (
    <div className="relative mx-3 mb-2">
      <Search className="pointer-events-none absolute left-2 top-1/2 size-3 -translate-y-1/2 text-sidebar-foreground/35" />
      <input
        type="text"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Filter..."
        className="h-7 w-full rounded-md border border-sidebar-border bg-white pl-6.5 pr-6 text-[11px] text-sidebar-foreground outline-none placeholder:text-sidebar-foreground/35 focus:border-sidebar-primary/40 focus:ring-1 focus:ring-sidebar-primary/20 transition-colors"
      />
      {search && (
        <button
          onClick={() => onSearchChange("")}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-sidebar-foreground/40 hover:text-sidebar-foreground/70"
        >
          <X className="size-3" />
        </button>
      )}
    </div>
  );
}

interface ScanHistoryProps {
  activeScanId?: string;
  search?: string;
}

export function ScanHistory({ activeScanId, search = "" }: ScanHistoryProps) {
  const { scans, isLoading } = useScanHistory();

  const filtered = useMemo(() => {
    if (!search.trim()) return scans;
    const q = search.toLowerCase();
    return scans.filter((s) => {
      const name = getSiteName(s).toLowerCase();
      const host = getHostname(s.url).toLowerCase();
      const url = s.url.toLowerCase();
      return name.includes(q) || host.includes(q) || url.includes(q);
    });
  }, [scans, search]);

  if (isLoading) {
    return (
      <div className="space-y-1 px-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-9 animate-pulse rounded-md bg-sidebar-accent"
            style={{ animationDelay: `${i * 60}ms` }}
          />
        ))}
      </div>
    );
  }

  if (scans.length === 0) {
    return (
      <p className="px-4 py-8 text-center text-[11px] text-sidebar-foreground/40">
        No scans yet
      </p>
    );
  }

  return (
    <TooltipProvider>
      {filtered.length === 0 ? (
        <p className="px-4 py-4 text-center text-[11px] text-sidebar-foreground/35">
          No matches
        </p>
      ) : (
        <div className="px-1.5">
          {filtered.map((scan) => {
            const isActive = scan.id === activeScanId;
            const siteName = getSiteName(scan);
            const score = scan.summary?.overallScore;
            const hasScore = score != null;

            return (
              <Tooltip key={scan.id}>
                <TooltipTrigger
                  render={
                    <Link
                      href={`/dashboard/scan/${scan.id}`}
                      className={cn(
                        "relative flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/60"
                      )}
                    />
                  }
                >
                  {/* Left accent bar for active */}
                  {isActive && (
                    <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-sidebar-primary" />
                  )}

                  {/* Score chip or status dot */}
                  {hasScore ? (
                    <div
                      className="flex h-6 min-w-7 shrink-0 items-center justify-center rounded px-1"
                      style={{
                        backgroundColor: `color-mix(in oklch, ${getScoreColor(score)} 10%, transparent)`,
                      }}
                    >
                      <span
                        className="font-mono text-[10px] font-bold tabular-nums leading-none"
                        style={{ color: getScoreColor(score) }}
                      >
                        {score}
                      </span>
                    </div>
                  ) : (
                    <div className="flex h-6 w-7 shrink-0 items-center justify-center">
                      <StatusDot scan={scan} />
                    </div>
                  )}

                  {/* Text */}
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "truncate text-[12px] font-medium leading-tight",
                        isActive
                          ? "text-sidebar-accent-foreground"
                          : "text-sidebar-foreground"
                      )}
                    >
                      {siteName}
                    </p>
                    <p className="mt-px truncate text-[10px] leading-tight text-sidebar-foreground/50">
                      {getHostname(scan.url)}
                    </p>
                  </div>

                  {/* Time */}
                  <span className="shrink-0 text-[10px] tabular-nums text-sidebar-foreground/40">
                    {relativeTime(scan.createdAt)}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  <span className="font-mono text-xs">{scan.url}</span>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      )}
    </TooltipProvider>
  );
}
