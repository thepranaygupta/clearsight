import Link from "next/link";

export const allFaqs = [
  {
    q: "Is it really free?",
    a: "Yes. ClearSight is open-source. You can run the entire engine on your own infrastructure for free. We provide the scanning engine, AI enrichment, and reporting — all self-hosted.",
  },
  {
    q: "What WCAG criteria do you check?",
    a: "WCAG 2.1 Level A and Level AA — 50+ rules via axe-core plus custom engines for link text quality and touch target sizing (48x48px minimum).",
  },
  {
    q: "How is this different from WAVE or Lighthouse?",
    a: "ClearSight crawls your entire site (not just one page), enriches every issue with AI-generated fix suggestions, tracks issues across crawls, and exports to PDF/Excel. Free scanners check one page at a time with no AI analysis.",
  },
  {
    q: "How accurate is the AI?",
    a: "Our AI engine has a high success rate on common violations like alt text and ARIA labels. For complex structural issues, it provides multiple annotated options for your team to review.",
  },
  {
    q: "How does AI enrichment work?",
    a: "After axe-core flags issues, ClearSight's AI engine analyzes each one with full page context. It writes a plain-English description and a specific fix suggestion for every issue. If the AI engine is unavailable, scans still complete with basic descriptions.",
  },
  {
    q: "Can I scan pages behind a login?",
    a: "Not yet. ClearSight currently scans publicly accessible pages only. Authenticated scanning is on the roadmap.",
  },
  {
    q: "How long does a full site crawl take?",
    a: "A 10-page site completes in under 2 minutes. ClearSight runs 3 concurrent browsers and 2 parallel AI enrichment calls.",
  },
  {
    q: "Does ClearSight respect robots.txt?",
    a: "No. ClearSight scans all same-origin pages it discovers. Accessibility issues exist regardless of crawler directives.",
  },
  {
    q: "Can I track issues across multiple crawls?",
    a: "Yes. Every issue gets a deterministic hash. Re-crawls show what's new, fixed, or recurring — and dismissed issues stay dismissed.",
  },
  {
    q: "What export formats are available?",
    a: "PDF reports with an AI-generated executive summary, and Excel spreadsheets with filterable multi-sheet data.",
  },
];

/** Homepage FAQ — 3-column layout (question left, answer right) */
export function FAQSection() {
  const topFaqs = allFaqs.slice(0, 4);

  return (
    <section className="bg-white py-32">
      <div className="mx-auto max-w-4xl px-6">
        <h2 className="mb-16 text-center text-4xl font-bold tracking-tight text-foreground">
          Common questions
        </h2>
        <div className="space-y-12">
          {topFaqs.map((faq, i) => (
            <div key={i} className="grid gap-8 md:grid-cols-3">
              <h4 className="col-span-1 font-bold text-foreground">{faq.q}</h4>
              <p className="col-span-2 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link href="/faq" className="text-sm font-semibold text-[#E90029] transition-colors hover:text-[#D10025]">
            See all questions &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
