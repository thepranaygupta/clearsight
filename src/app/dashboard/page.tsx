"use client";

import { Suspense } from "react";
import { ScanForm } from "@/components/scan/ScanForm";

export default function DashboardPage() {
  return (
    <Suspense>
      <ScanForm />
    </Suspense>
  );
}
