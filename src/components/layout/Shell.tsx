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
        onNewScan={() => router.push("/")}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-5xl px-6 py-6 sm:px-10 sm:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
