"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Loader2, Shield } from "lucide-react";

export function ScanForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const autoScanUrl = searchParams.get("autoScan");
  const [url, setUrl] = useState(autoScanUrl ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const autoScanTriggered = useRef(false);

  async function submitScan(targetUrl: string) {
    const trimmed = targetUrl.trim();
    if (!trimmed) {
      setError("Please enter a URL");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/scans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || `Request failed (${res.status})`);
        setLoading(false);
        return;
      }

      const scan = await res.json();
      router.push(`/scan/${scan.id}`);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  // Auto-scan when opened from Chrome extension with ?autoScan=<url>
  useEffect(() => {
    if (autoScanUrl && !autoScanTriggered.current) {
      autoScanTriggered.current = true;
      submitScan(autoScanUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount when autoScanUrl is present
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    submitScan(url);
  }

  return (
    <section className="flex min-h-[46vh] flex-col items-center justify-center">
      {/* Badge */}
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.04] px-3.5 py-1.5">
        <Shield className="size-3.5 text-primary" />
        <span className="text-xs font-medium text-primary">
          WCAG 2.1 Level A & AA
        </span>
      </div>

      {/* Heading */}
      <h1 className="mb-4 text-center text-[2.5rem] font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl">
        Scan any page for
        <br />
        <span className="bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
          accessibility
        </span>
      </h1>
      <p className="mb-10 max-w-lg text-center text-[15px] leading-relaxed text-muted-foreground">
        Enter a URL and get a detailed compliance report with
        AI-powered fix suggestions — in under a minute.
      </p>

      {/* Search bar */}
      <form onSubmit={handleSubmit} className="w-full max-w-2xl">
        <div className="group relative flex items-center rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 focus-within:border-primary/25 focus-within:shadow-xl focus-within:shadow-primary/[0.04]">
          <input
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError(null);
            }}
            placeholder="https://pranaygupta.in"
            disabled={loading}
            className="h-14 flex-1 rounded-l-2xl bg-transparent px-6 font-mono text-[15px] text-foreground outline-none placeholder:font-sans placeholder:text-muted-foreground/40 disabled:opacity-60 sm:h-[60px]"
            autoFocus
          />
          <button
            type="submit"
            disabled={loading}
            className="mr-2 flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-md hover:shadow-primary/30 active:scale-[0.97] disabled:opacity-60 sm:h-11 sm:px-6"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                Scan
                <ArrowRight className="size-4" />
              </>
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <p className="mt-3 text-center text-sm font-medium text-[var(--severity-critical)]">
            {error}
          </p>
        )}
      </form>
    </section>
  );
}
