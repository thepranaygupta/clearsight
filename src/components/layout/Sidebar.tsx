"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Globe } from "lucide-react";
import { LogoFull } from "@/components/Logo";
import useSWR from "swr";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ScanHistory, ScanSearch } from "@/components/scan/ScanHistory";
import { cn } from "@/lib/utils";
import type { Site, CrawlStatus } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function getScoreColor(score: number): string {
  if (score >= 80) return "var(--score-good)";
  if (score >= 50) return "var(--score-okay)";
  return "var(--score-bad)";
}

function isCrawlActive(status: CrawlStatus): boolean {
  return status === "queued" || status === "discovering" || status === "scanning";
}

interface SidebarProps {
  activeScanId?: string;
  activeSiteId?: string;
  onNewScan?: () => void;
  onNavigate?: () => void;
}

export function Sidebar({ activeScanId, activeSiteId, onNewScan, onNavigate }: SidebarProps) {
  const [search, setSearch] = useState("");

  const { data: sitesData } = useSWR<{ sites: Site[] }>(
    "/api/sites",
    fetcher,
    { refreshInterval: 5000 }
  );
  const sites = sitesData?.sites ?? [];

  return (
    <aside className="flex h-screen w-[264px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      {/* Header */}
      <div className="flex h-[52px] items-center px-4">
        <LogoFull size={20} />
      </div>

      {/* New scan button */}
      <div className="px-3 pb-3">
        <button
          onClick={onNewScan}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-sidebar-primary px-4 py-2 text-[13px] font-medium text-sidebar-primary-foreground transition-colors hover:bg-sidebar-primary/90 active:scale-[0.98]"
        >
          <Plus className="size-3.5" strokeWidth={2.5} />
          New Scan
        </button>
      </div>

      {/* Separator */}
      <div className="mx-3 h-px bg-sidebar-border" />

      {/* Sites section */}
      {sites.length > 0 && (
        <>
          <div className="flex items-center justify-between px-4 pt-4 pb-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-sidebar-foreground/50">
              Sites
            </span>
            <Link
              href="/dashboard"
              className="flex size-4 items-center justify-center rounded text-sidebar-foreground/40 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground/70"
              title="Add site"
            >
              <Plus className="size-3" strokeWidth={2.5} />
            </Link>
          </div>

          <div className="px-1.5 pb-2">
            {sites.map((site) => {
              const isActive = site.id === activeSiteId;
              const latestCrawl = site.crawls?.[0];
              const score = latestCrawl?.overallScore;
              const hasScore = score != null;
              const crawlActive = latestCrawl ? isCrawlActive(latestCrawl.status) : false;

              return (
                <Link
                  key={site.id}
                  href={`/dashboard/site/${site.id}`}
                  onClick={onNavigate}
                  className={cn(
                    "relative flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/60"
                  )}
                >
                  {/* Left accent bar for active */}
                  {isActive && (
                    <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-sidebar-primary" />
                  )}

                  {/* Score chip or pulsing dot */}
                  {crawlActive ? (
                    <div className="flex h-6 w-7 shrink-0 items-center justify-center">
                      <span className="relative flex size-2">
                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-sidebar-primary opacity-50" />
                        <span className="relative inline-flex size-2 rounded-full bg-sidebar-primary" />
                      </span>
                    </div>
                  ) : hasScore ? (
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
                      <Globe className="size-3.5 text-sidebar-foreground/30" />
                    </div>
                  )}

                  {/* Hostname */}
                  <p
                    className={cn(
                      "min-w-0 flex-1 truncate text-[12px] font-medium leading-tight",
                      isActive
                        ? "text-sidebar-accent-foreground"
                        : "text-sidebar-foreground"
                    )}
                  >
                    {site.hostname}
                  </p>
                </Link>
              );
            })}
          </div>

          {/* Separator between sites and scans */}
          <div className="mx-3 h-px bg-sidebar-border" />
        </>
      )}

      {/* Scans section label */}
      <div className="px-4 pt-4 pb-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-sidebar-foreground/50">
          Scans
        </span>
      </div>

      {/* Search — pinned above scroll */}
      <ScanSearch search={search} onSearchChange={setSearch} />

      {/* Scan history — scrollable */}
      <ScrollArea className="min-h-0 flex-1 pb-2">
        <ScanHistory activeScanId={activeScanId} search={search} />
      </ScrollArea>
    </aside>
  );
}
