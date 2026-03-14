"use client";

import { Eye, Code2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ViewMode } from "./useInspectorState";

interface InspectorViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function InspectorViewToggle({
  viewMode,
  onViewModeChange,
}: InspectorViewToggleProps) {
  return (
    <div className="inline-flex h-8 items-center gap-0.5 rounded-lg bg-white/[0.08] p-0.5">
      <button
        className={cn(
          "inline-flex h-7 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-all duration-150",
          viewMode === "page"
            ? "bg-white/[0.12] text-white shadow-sm"
            : "text-white/50 hover:text-white/80"
        )}
        onClick={() => onViewModeChange("page")}
      >
        <Eye className="size-3" />
        View page content
      </button>
      <button
        className={cn(
          "inline-flex h-7 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-all duration-150",
          viewMode === "html"
            ? "bg-white/[0.12] text-white shadow-sm"
            : "text-white/50 hover:text-white/80"
        )}
        onClick={() => onViewModeChange("html")}
      >
        <Code2 className="size-3" />
        View HTML
      </button>
    </div>
  );
}
