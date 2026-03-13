"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import useSWR from "swr";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
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

function ScoreDot({ scan }: { scan: ScanListItem }) {
  const score = scan.summary?.overallScore;

  if (scan.status === "running" || scan.status === "queued") {
    return (
      <span className="relative flex size-2.5">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-sidebar-primary opacity-50" />
        <span className="relative inline-flex size-2.5 rounded-full bg-sidebar-primary" />
      </span>
    );
  }

  if (scan.status === "failed") {
    return <span className="inline-block size-2.5 rounded-full bg-red-500" />;
  }

  if (score == null) {
    return (
      <span className="inline-block size-2.5 rounded-full bg-sidebar-foreground/20" />
    );
  }

  const color =
    score >= 80
      ? "var(--score-good)"
      : score >= 50
        ? "var(--score-okay)"
        : "var(--score-bad)";

  return (
    <span
      className="inline-block size-2.5 rounded-full"
      style={{ backgroundColor: color }}
    />
  );
}

interface ScanHistoryProps {
  activeScanId?: string;
}

export function ScanHistory({ activeScanId }: ScanHistoryProps) {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useSWR<{ scans: ScanListItem[] }>(
    "/api/scans?limit=50",
    fetcher,
    { refreshInterval: 3000 }
  );
  const scans = data?.scans ?? [];

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
      <div className="space-y-2 px-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-9 animate-pulse rounded-md bg-sidebar-accent/50"
          />
        ))}
      </div>
    );
  }

  if (scans.length === 0) {
    return (
      <p className="px-4 py-6 text-center text-xs text-sidebar-foreground/40">
        No scans yet
      </p>
    );
  }

  return (
    <TooltipProvider>
      <div>
        {/* Search */}
        <div className="relative mx-2 mb-2">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3 -translate-y-1/2 text-sidebar-foreground/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="h-7 w-full rounded-md border border-sidebar-border bg-sidebar-accent/30 pl-7 pr-7 text-[11px] text-sidebar-foreground outline-none placeholder:text-sidebar-foreground/30 focus:border-sidebar-primary/40 focus:bg-sidebar-accent/50"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-sidebar-foreground/30 hover:text-sidebar-foreground/60"
            >
              <X className="size-3" />
            </button>
          )}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <p className="px-4 py-4 text-center text-[11px] text-sidebar-foreground/30">
            No matches
          </p>
        ) : (
          <div className="space-y-0.5">
            {filtered.map((scan) => {
              const isActive = scan.id === activeScanId;
              const siteName = getSiteName(scan);

              return (
                <Tooltip key={scan.id}>
                  <TooltipTrigger
                    render={
                      <Link
                        href={`/scan/${scan.id}`}
                        className={`
                          group flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors
                          ${
                            isActive
                              ? "bg-sidebar-accent text-sidebar-accent-foreground"
                              : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                          }
                        `}
                      />
                    }
                  >
                    <ScoreDot scan={scan} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium leading-tight">
                        {siteName}
                      </p>
                      <p className="truncate text-[10px] leading-tight text-sidebar-foreground/35">
                        {getHostname(scan.url)}
                      </p>
                    </div>
                    <span className="shrink-0 text-[10px] text-sidebar-foreground/30">
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
      </div>
    </TooltipProvider>
  );
}
