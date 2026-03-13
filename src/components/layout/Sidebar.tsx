"use client";

import { Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ScanHistory } from "@/components/scan/ScanHistory";

interface SidebarProps {
  activeScanId?: string;
  onNewScan?: () => void;
}

export function Sidebar({ activeScanId, onNewScan }: SidebarProps) {
  return (
    <aside className="flex h-screen w-[280px] shrink-0 flex-col bg-sidebar text-sidebar-foreground">
      {/* Wordmark */}
      <div className="flex h-14 items-center px-5">
        <span className="text-base font-bold tracking-tight">
          <span className="text-white">Clear</span>
          <span className="text-sidebar-primary">Sight</span>
        </span>
      </div>

      {/* New scan button */}
      <div className="px-3 pb-3">
        <button
          onClick={onNewScan}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-sidebar-primary px-4 py-2 text-sm font-medium text-sidebar-primary-foreground transition-all hover:bg-sidebar-primary/85 active:scale-[0.98]"
        >
          <Plus className="size-4" />
          New Scan
        </button>
      </div>

      {/* Divider */}
      <div className="mx-3 border-t border-sidebar-border" />

      {/* Scan history header */}
      <div className="flex items-center px-4 pt-4 pb-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
          Recent Scans
        </span>
      </div>

      {/* Scan history */}
      <ScrollArea className="flex-1 px-1 pb-4">
        <ScanHistory activeScanId={activeScanId} />
      </ScrollArea>
    </aside>
  );
}
