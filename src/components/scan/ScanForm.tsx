"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";

export function ScanForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmed = url.trim();
    if (!trimmed) {
      setError("Please enter a URL");
      return;
    }

    setLoading(true);

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

  return (
    <section className="flex min-h-[50vh] flex-col items-center justify-center px-4">
      {/* Decorative background element */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[40vh] overflow-hidden opacity-[0.03]">
        <div
          className="absolute -top-1/2 left-1/2 size-[600px] -translate-x-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(circle, oklch(0.52 0.22 25) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Heading */}
      <h1 className="relative mb-3 text-center text-4xl font-light tracking-tight text-foreground sm:text-5xl">
        Check any page for
        <br />
        <span className="font-medium text-primary">accessibility</span>
      </h1>
      <p className="relative mb-12 max-w-md text-center text-base leading-relaxed text-muted-foreground">
        Enter a URL to scan for WCAG 2.1 Level A &amp; AA compliance.
        Get actionable results in seconds.
      </p>

      {/* Search bar */}
      <form onSubmit={handleSubmit} className="relative w-full max-w-2xl">
        <div className="group relative flex items-center rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 focus-within:border-primary/30 focus-within:shadow-lg focus-within:shadow-primary/[0.04] focus-within:ring-4 focus-within:ring-primary/[0.06]">
          <input
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError(null);
            }}
            placeholder="https://example.com"
            disabled={loading}
            className="h-14 flex-1 rounded-l-2xl bg-transparent px-5 text-base text-foreground outline-none placeholder:text-muted-foreground/50 disabled:opacity-60 sm:h-16 sm:text-lg"
            autoFocus
          />
          <button
            type="submit"
            disabled={loading}
            className="mr-2 flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.97] disabled:opacity-60 sm:h-11 sm:px-6"
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
          <p className="mt-3 text-center text-sm text-[var(--severity-critical)]">
            {error}
          </p>
        )}

        {/* Subtle hint */}
        <p className="mt-4 text-center text-xs text-muted-foreground/50">
          Powered by axe-core engine + AI analysis
        </p>
      </form>
    </section>
  );
}
