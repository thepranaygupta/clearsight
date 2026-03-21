"use client";

import { useRouter, useParams } from "next/navigation";
import { Sidebar } from "./Sidebar";

interface ShellProps {
  children: React.ReactNode;
}

export function Shell({ children }: ShellProps) {
  const router = useRouter();
  const params = useParams();
  const activeScanId = params?.id as string | undefined;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        activeScanId={activeScanId}
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
