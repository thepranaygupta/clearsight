import Link from "next/link";

const techStack = [
  { name: "axe-core", description: "Industry-standard a11y engine" },
  { name: "Playwright", description: "Real browser rendering" },
  { name: "Azure OpenAI", description: "AI-powered analysis" },
  { name: "BullMQ + Redis", description: "Concurrent job queues" },
];

export function Metrics() {
  return (
    <section className="border-y border-border/40 bg-muted/30 py-10">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <p className="shrink-0 text-[12px] font-bold uppercase tracking-[0.12em] text-muted-foreground/50">
            Powered by
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {techStack.map((tech, i) => (
              <div key={tech.name} className="flex items-center gap-8">
                <div className="text-center">
                  <div className="text-[15px] font-bold text-foreground">{tech.name}</div>
                  <div className="text-[11px] text-muted-foreground/60">{tech.description}</div>
                </div>
                {i < techStack.length - 1 && (
                  <div className="hidden h-8 w-px bg-border/50 sm:block" />
                )}
              </div>
            ))}
          </div>
          <Link
            href="/how-it-works"
            className="shrink-0 text-[13px] font-semibold text-[#E90029] transition-colors hover:text-[#D10025]"
          >
            How it works &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
