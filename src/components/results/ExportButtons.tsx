"use client";

import { useState } from "react";
import { FileText, Sheet, Loader2, Download } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ExportButtonsProps {
  scanId: string;
}

export function ExportButtons({ scanId }: ExportButtonsProps) {
  const [loading, setLoading] = useState<"pdf" | "excel" | null>(null);

  async function handleExport(format: "pdf" | "excel") {
    setLoading(format);
    try {
      const res = await fetch(
        `/api/scans/${scanId}/export?format=${format}`
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Export failed");
        return;
      }

      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition");
      const filenameMatch = disposition?.match(/filename="(.+?)"/);
      const filename =
        filenameMatch?.[1] || `report.${format === "pdf" ? "pdf" : "xlsx"}`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert("Network error during export");
    } finally {
      setLoading(null);
    }
  }

  const isLoading = loading !== null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            disabled={isLoading}
            className="gap-2"
          />
        }
      >
        {isLoading ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Download className="size-3.5" />
        )}
        {loading === "pdf"
          ? "Generating PDF..."
          : loading === "excel"
            ? "Generating Excel..."
            : "Export"}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={6} className="min-w-[260px]">
        <DropdownMenuGroup>
          <span className="px-1.5 py-1 text-xs font-medium text-muted-foreground">
            Export report
          </span>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleExport("pdf")}
          disabled={isLoading}
        >
          <FileText
            className={cn(
              "size-4",
              loading === "pdf" ? "animate-pulse text-primary" : "text-red-500"
            )}
          />
          <div className="flex flex-col">
            <span className="text-sm font-medium">PDF Report</span>
            <span className="text-[11px] text-muted-foreground">
              Formatted report with AI executive summary
            </span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport("excel")}
          disabled={isLoading}
        >
          <Sheet
            className={cn(
              "size-4",
              loading === "excel"
                ? "animate-pulse text-primary"
                : "text-green-600"
            )}
          />
          <div className="flex flex-col">
            <span className="text-sm font-medium">Excel Spreadsheet</span>
            <span className="text-[11px] text-muted-foreground">
              Filterable issue data with multiple sheets
            </span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
