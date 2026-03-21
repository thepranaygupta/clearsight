const metrics = [
  { value: "50+", label: "WCAG rules", sublabel: "axe-core + custom engines" },
  { value: "3x", label: "Concurrent scanners", sublabel: "Parallel Playwright instances" },
  { value: "<2m", label: "Per site", sublabel: "Average crawl time for 10 pages" },
  { value: "2", label: "Export formats", sublabel: "PDF reports & Excel sheets" },
];

export function Metrics() {
  return (
    <section className="border-y border-border/30 bg-muted/20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-2 divide-x divide-border/30 lg:grid-cols-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="px-4 py-12 text-center sm:px-8">
              <div className="text-[clamp(2rem,4vw,3rem)] font-extrabold tracking-tight text-foreground">
                {metric.value}
              </div>
              <div className="mt-1 text-[13px] font-semibold text-foreground/80">
                {metric.label}
              </div>
              <div className="mt-0.5 text-[11px] text-muted-foreground/50">
                {metric.sublabel}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
