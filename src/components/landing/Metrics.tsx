import Link from "next/link";

const techStack = [
  { name: "axe-core", description: "Industry-standard accessibility engine" },
  { name: "Playwright", description: "Real browser rendering" },
  { name: "Azure OpenAI", description: "AI-powered analysis" },
  { name: "BullMQ", description: "Concurrent job processing" },
];

export function Metrics() {
  return (
    <section className="border-y border-border/30 bg-muted/20 py-14">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center justify-between gap-8 sm:flex-row">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground/40">
              Built with
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {techStack.map((tech) => (
              <div key={tech.name} className="text-center">
                <div className="text-[13px] font-semibold text-foreground/70">{tech.name}</div>
                <div className="text-[10px] text-muted-foreground/40">{tech.description}</div>
              </div>
            ))}
          </div>
          <div>
            <Link
              href="/how-it-works"
              className="text-[12px] font-medium text-[#E90029] transition-colors hover:text-[#D10025]"
            >
              How it works &rarr;
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
