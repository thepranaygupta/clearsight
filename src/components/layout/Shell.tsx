"use client";

import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";

interface ShellProps {
  children: React.ReactNode;
}

function extractIds(pathname: string | null) {
  if (!pathname) return { scanId: undefined, siteId: undefined };

  // /dashboard/site/:siteId (and sub-routes like /crawl/:crawlId, /pages, etc.)
  const siteMatch = pathname.match(/^\/dashboard\/site\/([^/]+)/);
  if (siteMatch) return { scanId: undefined, siteId: siteMatch[1] };

  // /dashboard/scan/:scanId
  const scanMatch = pathname.match(/^\/dashboard\/scan\/([^/]+)/);
  if (scanMatch) return { scanId: scanMatch[1], siteId: undefined };

  return { scanId: undefined, siteId: undefined };
}

export function Shell({ children }: ShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { scanId: activeScanId, siteId: activeSiteId } = extractIds(pathname);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        activeScanId={activeScanId}
        activeSiteId={activeSiteId}
        onNewScan={() => router.push("/dashboard")}
      />
      <main className="relative flex-1 overflow-y-auto">
        {/* Subtle top gradient wash */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-primary/[0.015] to-transparent" />
        <div className="relative mx-auto w-full max-w-5xl px-8 py-8 sm:px-12 sm:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
