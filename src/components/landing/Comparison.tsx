const rows = [
  { feature: "AI-driven Remediation", clearsight: "yes", free: "no", manual: "no" },
  { feature: "WCAG 2.1 A & AA Coverage", clearsight: "yes", free: "partial", manual: "yes" },
  { feature: "Automated Full-site Crawling", clearsight: "yes", free: "no", manual: "Manual (slow)" },
  { feature: "Issue Regression Tracking", clearsight: "yes", free: "no", manual: "no" },
  { feature: "Interactive Visual Inspector", clearsight: "yes", free: "no", manual: "no" },
  { feature: "Time to Complete", clearsight: "< 5 Minutes", free: "Instant (Per Page)", manual: "2–4 Weeks" },
  { feature: "Average Cost", clearsight: "Free / Open Source", free: "Free", manual: "$5,000+" },
];

function Cell({ value }: { value: string }) {
  if (value === "yes") return <span className="text-xl font-bold text-green-500" aria-label="Yes">✔</span>;
  if (value === "no") return <span className="text-xl text-gray-300" aria-label="No">✕</span>;
  if (value === "partial") return <span className="font-bold text-yellow-500">— Partial</span>;
  // Custom text values — check if it's a "weak" value (contains slow/manual/weeks/$)
  const isWeak = /slow|week|manual|\$/i.test(value);
  return <span className={`text-sm font-bold ${isWeak ? "text-yellow-500" : value.toLowerCase().includes("free") ? "text-green-600" : "text-foreground"}`}>{value}</span>;
}

export function Comparison() {
  return (
    <section className="border-y border-border/30 bg-muted/20 py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-20 text-center">
          <h2 className="mb-6 text-4xl font-bold tracking-tight text-foreground">
            Why teams choose ClearSight
          </h2>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            Deeper than free scanners. Faster than manual audits. Built for modern developer workflows.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="py-8 font-medium text-muted-foreground">Capabilities</th>
                <th className="w-1/4 px-6 py-8 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-xl font-bold text-[#E90029]">ClearSight</span>
                    <span className="rounded bg-[#E90029]/10 px-2 py-1 text-[10px] font-bold text-[#E90029]">RECOMMENDED</span>
                  </div>
                </th>
                <th className="w-1/4 px-6 py-8 text-center font-medium text-muted-foreground">Lighthouse / WAVE</th>
                <th className="w-1/4 px-6 py-8 text-center font-medium text-muted-foreground">Manual Agency</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {rows.map((row) => (
                <tr key={row.feature} className="border-b border-border/30 transition-colors hover:bg-card">
                  <td className="py-6 font-medium text-foreground">{row.feature}</td>
                  <td className="px-6 py-6 text-center"><Cell value={row.clearsight} /></td>
                  <td className="px-6 py-6 text-center"><Cell value={row.free} /></td>
                  <td className="px-6 py-6 text-center"><Cell value={row.manual} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
