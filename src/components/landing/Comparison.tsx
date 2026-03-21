import { Check, X, Minus } from "lucide-react";

const rows = [
  { feature: "AI-generated fix suggestions", clearsight: true, free: false, manual: false },
  { feature: "WCAG 2.1 A & AA coverage", clearsight: true, free: "partial", manual: true },
  { feature: "Full-site crawling", clearsight: true, free: false, manual: true },
  { feature: "Issue tracking across scans", clearsight: true, free: false, manual: false },
  { feature: "Severity scoring", clearsight: true, free: "partial", manual: true },
  { feature: "Visual element inspector", clearsight: true, free: false, manual: true },
  { feature: "PDF & Excel export", clearsight: true, free: false, manual: true },
  { feature: "Time to results", clearsight: "< 2 min", free: "Instant (shallow)", manual: "2-4 weeks" },
  { feature: "Cost", clearsight: "Free", free: "Free", manual: "$5,000+" },
];

function Cell({ value }: { value: boolean | string }) {
  if (value === true) return <Check className="mx-auto size-4 text-emerald-600" />;
  if (value === false) return <X className="mx-auto size-4 text-muted-foreground/30" />;
  if (value === "partial") return <Minus className="mx-auto size-4 text-amber-500" />;
  return <span className="text-[13px] font-medium text-foreground">{value}</span>;
}

export function Comparison() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-10 max-w-md">
          <h2 className="text-2xl font-extrabold tracking-[-0.02em] text-foreground">
            Why teams choose ClearSight
          </h2>
          <p className="mt-2 text-[15px] leading-[1.7] text-muted-foreground">
            Deeper than free scanners. Faster than manual audits. AI-powered.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3 pr-4 text-[13px] font-medium text-muted-foreground" />
                <th className="pb-3 px-4 text-center text-[13px] font-bold text-[#E90029]">ClearSight</th>
                <th className="pb-3 px-4 text-center text-[13px] font-medium text-muted-foreground">Free scanners</th>
                <th className="pb-3 px-4 text-center text-[13px] font-medium text-muted-foreground">Manual audits</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.feature} className="border-b border-border/40">
                  <td className="py-3.5 pr-4 text-[14px] text-foreground">{row.feature}</td>
                  <td className="py-3.5 px-4 text-center"><Cell value={row.clearsight} /></td>
                  <td className="py-3.5 px-4 text-center"><Cell value={row.free} /></td>
                  <td className="py-3.5 px-4 text-center"><Cell value={row.manual} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
