"use client";

import { useState } from "react";
import { Plus, Scan } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ScanHistory, ScanSearch } from "@/components/scan/ScanHistory";

interface SidebarProps {
  activeScanId?: string;
  onNewScan?: () => void;
}

export function Sidebar({ activeScanId, onNewScan }: SidebarProps) {
  const [search, setSearch] = useState("");

  return (
    <aside className="flex h-screen w-[264px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      {/* Header */}
      <div className="flex h-[52px] items-center gap-2 px-4">
        <Scan className="size-4 text-sidebar-primary" strokeWidth={2.5} />
        <span className="text-[14px] font-semibold tracking-tight text-sidebar-foreground">
          ClearSight
        </span>
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

      {/* Section label */}
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
