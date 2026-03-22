"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Loader2, Globe, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

type ScanMode = "crawl" | "page";

// ─── Crawl Viz: animated site tree ────────────────────────────────

function CrawlViz() {
  const nodes = [
    { label: "/", x: 140, y: 28, delay: 0, root: true },
    { label: "/about", x: 40, y: 90, delay: 0.3 },
    { label: "/blog", x: 140, y: 90, delay: 0.5 },
    { label: "/pricing", x: 240, y: 90, delay: 0.7 },
    { label: "/blog/1", x: 90, y: 148, delay: 1.0 },
    { label: "/blog/2", x: 190, y: 148, delay: 1.2 },
  ];

  const edges = [
    { from: 0, to: 1, delay: 0.2 },
    { from: 0, to: 2, delay: 0.4 },
    { from: 0, to: 3, delay: 0.6 },
    { from: 2, to: 4, delay: 0.9 },
    { from: 2, to: 5, delay: 1.1 },
  ];

  return (
    <svg viewBox="0 0 280 175" className="h-full w-full" overflow="visible">
      {edges.map((edge, i) => {
        const from = nodes[edge.from];
        const to = nodes[edge.to];
        return (
          <motion.line
            key={`e${i}`}
            x1={from.x} y1={from.y + 12} x2={to.x} y2={to.y - 12}
            stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="4 3"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.6 }}
            transition={{ duration: 0.5, delay: edge.delay }}
          />
        );
      })}
      {nodes.map((node, i) => (
        <motion.g key={i}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, delay: node.delay, type: "spring", stiffness: 250, damping: 20 }}
        >
          <rect
            x={node.x - (node.root ? 28 : 32)} y={node.y - 12}
            width={node.root ? 56 : 64} height={24} rx="4"
            fill={node.root ? "#E90029" : "white"}
            stroke={node.root ? "#E90029" : "#e2e8f0"}
            strokeWidth="1.5"
          />
          <text
            x={node.x} y={node.y + 1}
            textAnchor="middle" dominantBaseline="middle"
            fill={node.root ? "white" : "#64748b"}
            fontSize="10" fontFamily="ui-monospace, monospace" fontWeight="500"
          >
            {node.label}
          </text>
          {/* no checkmark — the tree structure speaks for itself */}
        </motion.g>
      ))}
    </svg>
  );
}

// ─── Page Viz: single page scan beam ──────────────────────────────

function PageViz() {
  const issues = [
    { y: 55, color: "#dc2626", delay: 1.0 },
    { y: 85, color: "#d97706", delay: 1.4 },
    { y: 112, color: "#d97706", delay: 1.8 },
  ];

  return (
    <svg viewBox="0 0 280 175" className="h-full w-full" overflow="visible">
      {/* Browser frame */}
      <motion.rect
        x="60" y="8" width="160" height="155" rx="6"
        fill="white" stroke="#e2e8f0" strokeWidth="1.5"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      />
      {/* Title bar */}
      <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
        <circle cx="74" cy="20" r="3" fill="#e2e8f0" />
        <circle cx="84" cy="20" r="3" fill="#e2e8f0" />
        <circle cx="94" cy="20" r="3" fill="#e2e8f0" />
        <rect x="106" y="16" width="100" height="8" rx="2" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.5" />
        <line x1="60" y1="32" x2="220" y2="32" stroke="#e2e8f0" strokeWidth="1" />
      </motion.g>
      {/* Content lines */}
      {[44, 58, 72, 86, 100, 114, 128].map((y, i) => (
        <motion.rect
          key={i} x="75" y={y} width={90 - (i % 3) * 18} height="5" rx="2" fill="#f1f5f9"
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
          transition={{ delay: 0.25 + i * 0.07, duration: 0.3 }}
          style={{ transformOrigin: "75px center" }}
        />
      ))}
      {/* Scan beam */}
      <motion.rect
        x="60" y="38" width="160" height="5" rx="0" fill="#E90029" opacity="0.15"
        animate={{ y: [38, 130, 38] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.3 }}
      />
      {/* Issue markers */}
      {issues.map((issue, i) => (
        <motion.g key={i}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: issue.delay, type: "spring", stiffness: 300 }}
        >
          <circle cx="195" cy={issue.y} r="6" fill={issue.color} />
          <text x="195" y={issue.y + 1} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="7" fontWeight="bold">!</text>
        </motion.g>
      ))}
      {/* 3 issues found label inside frame */}
      <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2 }}>
        <text x="140" y="150" textAnchor="middle" dominantBaseline="middle" fill="#64748b" fontSize="7">
          3 issues found
        </text>
      </motion.g>
    </svg>
  );
}

// ─── Main ScanForm ────────────────────────────────────────────────

export function ScanForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const autoScanUrl = searchParams.get("autoScan");
  const [url, setUrl] = useState(autoScanUrl ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<ScanMode>(autoScanUrl ? "page" : "crawl");
  const autoScanTriggered = useRef(false);

  async function submitCrawl(targetUrl: string) {
    const trimmed = targetUrl.trim();
    if (!trimmed) { setError("Please enter a URL"); return; }
    setLoading(true); setError(null);
    try {
      const siteRes = await fetch("/api/sites", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: trimmed }) });
      if (!siteRes.ok) { const data = await siteRes.json().catch(() => ({})); setError(data.error || `Failed (${siteRes.status})`); setLoading(false); return; }
      const site = await siteRes.json();
      const crawlRes = await fetch(`/api/sites/${site.id}/crawl`, { method: "POST" });
      if (!crawlRes.ok) { if (crawlRes.status === 409) { router.push(`/dashboard/site/${site.id}`); return; } const data = await crawlRes.json().catch(() => ({})); setError(data.error || `Failed (${crawlRes.status})`); setLoading(false); return; }
      const crawl = await crawlRes.json();
      router.push(`/dashboard/site/${site.id}/crawl/${crawl.id}`);
    } catch { setError("Network error. Please try again."); setLoading(false); }
  }

  async function submitSinglePage(targetUrl: string) {
    const trimmed = targetUrl.trim();
    if (!trimmed) { setError("Please enter a URL"); return; }
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/scans", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: trimmed }) });
      if (!res.ok) { const data = await res.json().catch(() => ({})); setError(data.error || `Failed (${res.status})`); setLoading(false); return; }
      const scan = await res.json();
      router.push(`/dashboard/scan/${scan.id}`);
    } catch { setError("Network error. Please try again."); setLoading(false); }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "crawl") submitCrawl(url); else submitSinglePage(url);
  }

  useEffect(() => {
    if (autoScanUrl && !autoScanTriggered.current) { autoScanTriggered.current = true; submitSinglePage(autoScanUrl); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="flex flex-col items-center pt-10 pb-4">
      {/* Heading + toggle */}
      <div className="mb-6 flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-1">
        <button type="button" onClick={() => setMode("crawl")}
          className={cn("flex items-center gap-1.5 rounded-md px-3.5 py-2 text-[13px] font-medium transition-all", mode === "crawl" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
          <Globe className="size-3.5" /> Full site crawl
        </button>
        <button type="button" onClick={() => setMode("page")}
          className={cn("flex items-center gap-1.5 rounded-md px-3.5 py-2 text-[13px] font-medium transition-all", mode === "page" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
          <FileText className="size-3.5" /> Single page
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={mode} className="w-full max-w-xl text-center"
          initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}>
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground">
            {mode === "crawl" ? "Scan your entire site" : "Scan a single page"}
          </h1>
          <p className="mb-6 text-[14px] text-muted-foreground">
            {mode === "crawl" ? "Enter your site URL. We'll discover every page and scan each one." : "Enter a page URL for a quick accessibility check."}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* URL input */}
      <form onSubmit={handleSubmit} className="w-full max-w-xl">
        <div className="flex gap-2">
          <input type="url" value={url}
            onChange={(e) => { setUrl(e.target.value); if (error) setError(null); }}
            placeholder={mode === "crawl" ? "https://example.com" : "https://example.com/about"}
            disabled={loading}
            className="h-13 flex-1 rounded-lg border border-border bg-background px-5 text-[15px] text-foreground outline-none placeholder:text-muted-foreground/40 focus:border-primary/30 focus:ring-2 focus:ring-primary/10 disabled:opacity-60"
            autoFocus
          />
          <button type="submit" disabled={loading}
            className="flex h-13 shrink-0 items-center gap-2 rounded-lg bg-primary px-7 text-[14px] font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60">
            {loading ? <Loader2 className="size-4 animate-spin" /> : <>{mode === "crawl" ? "Crawl" : "Scan"}<ArrowRight className="size-4" /></>}
          </button>
        </div>
        {error && <p className="mt-2 text-center text-sm font-medium text-[var(--severity-critical)]">{error}</p>}
      </form>

      {/* Visualization below input */}
      <div className="mt-8 w-full max-w-xl">
        <AnimatePresence mode="wait">
          <motion.div key={mode} className="mx-auto h-[240px] max-w-[440px]"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}>
            {mode === "crawl" ? <CrawlViz /> : <PageViz />}
          </motion.div>
        </AnimatePresence>

        {/* Feature tags */}
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {(mode === "crawl"
            ? ["BFS + sitemap discovery", "3 concurrent scanners", "Issue tracking", "Site-level score"]
            : ["Real Chromium browser", "50+ WCAG rules", "AI fix suggestions", "~30s results"]
          ).map((feat) => (
            <span key={feat} className="rounded border border-border/40 bg-muted/20 px-2 py-0.5 text-[11px] text-muted-foreground">
              {feat}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
