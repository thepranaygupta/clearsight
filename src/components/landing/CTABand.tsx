"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";

export function CTABand() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    try {
      const siteRes = await fetch("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      if (siteRes.ok) {
        const site = await siteRes.json();
        const crawlRes = await fetch(`/api/sites/${site.id}/crawl`, { method: "POST" });
        if (crawlRes.ok) {
          const crawl = await crawlRes.json();
          router.push(`/dashboard/site/${site.id}/crawl/${crawl.id}`);
          return;
        }
      }
      router.push(`/dashboard`);
    } catch {
      router.push(`/dashboard`);
    }
    setLoading(false);
  }

  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="rounded-2xl border border-border/50 bg-card px-8 py-14 text-center sm:px-16">
          <h2 className="text-2xl font-extrabold tracking-[-0.02em] text-foreground sm:text-3xl">
            Your users deserve an accessible web.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[15px] leading-[1.7] text-muted-foreground">
            Scan your site for free. No signup, no credit card, no setup.
          </p>
          <form onSubmit={handleSubmit} className="mx-auto mt-8 flex max-w-lg gap-2">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-site.com"
              className="h-12 flex-1 rounded-xl border border-border bg-background px-5 text-[15px] text-foreground shadow-sm placeholder:text-muted-foreground/30 focus:border-[#E90029]/30 focus:outline-none focus:ring-2 focus:ring-[#E90029]/10"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="group flex h-12 shrink-0 items-center gap-2 rounded-xl bg-[#E90029] px-6 text-[14px] font-semibold text-white shadow-lg shadow-[#E90029]/10 transition-all hover:bg-[#D10025] disabled:opacity-40"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : <>Scan now <ArrowRight className="size-4" /></>}
            </button>
          </form>
          <p className="mt-3 text-[12px] text-muted-foreground/40">
            Free scan. Results in under 2 minutes.
          </p>
        </div>
      </div>
    </section>
  );
}
