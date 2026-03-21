"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Sidebar } from "./Sidebar";

interface ShellProps {
  children: React.ReactNode;
}

function extractIds(pathname: string | null) {
  if (!pathname) return { scanId: undefined, siteId: undefined };

  const siteMatch = pathname.match(/^\/dashboard\/site\/([^/]+)/);
  if (siteMatch) return { scanId: undefined, siteId: siteMatch[1] };

  const scanMatch = pathname.match(/^\/dashboard\/scan\/([^/]+)/);
  if (scanMatch) return { scanId: scanMatch[1], siteId: undefined };

  return { scanId: undefined, siteId: undefined };
}

export function Shell({ children }: ShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { scanId: activeScanId, siteId: activeSiteId } = extractIds(pathname);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — hidden on mobile, shown on lg+ */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar
          activeScanId={activeScanId}
          activeSiteId={activeSiteId}
          onNewScan={() => {
            router.push("/dashboard");
            setSidebarOpen(false);
          }}
          onNavigate={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main content */}
      <main className="relative flex-1 overflow-y-auto">
        {/* Mobile header with hamburger */}
        <div className="sticky top-0 z-30 flex h-12 items-center gap-3 border-b border-border/40 bg-background/95 px-4 backdrop-blur-sm lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Menu className="size-5" />
          </button>
          <span className="text-sm font-semibold text-foreground">ClearSight</span>
        </div>

        {/* Subtle top gradient wash */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-primary/[0.015] to-transparent" />
        <div className="relative mx-auto w-full max-w-5xl px-4 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
