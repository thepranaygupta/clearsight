"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";

const allFaqs = [
  {
    q: "Is the scan really free?",
    a: "Yes. ClearSight is open source. You run it on your own infrastructure. The scan is free, unlimited, and requires no account.",
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
    q: "How does AI enrichment work?",
    a: "After axe-core flags issues, ClearSight sends them to Azure OpenAI with page context. The AI writes a plain-English description and a specific fix suggestion for each issue. If AI is unavailable, scans still complete with basic descriptions.",
  },
  {
    q: "Can I scan pages behind a login?",
    a: "Not yet. ClearSight currently scans publicly accessible pages only. Authenticated scanning is on the roadmap.",
  },
  {
    q: "What's the difference between confirmed and potential issues?",
    a: "Confirmed issues are definite WCAG violations (e.g., missing alt text). Potential issues need human review — the scanner suspects a problem but can't be certain.",
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

function FAQList({ faqs }: { faqs: typeof allFaqs }) {
  return (
    <Accordion className="space-y-2">
      {faqs.map((faq, i) => (
        <AccordionItem
          key={i}
          value={`faq-${i}`}
          className="rounded-xl border border-border bg-card px-6 transition-colors data-[state=open]:border-[#E90029]/20 data-[state=open]:shadow-sm"
        >
          <AccordionTrigger className="py-4 text-left text-[15px] font-semibold text-foreground hover:no-underline">
            {faq.q}
          </AccordionTrigger>
          <AccordionContent className="pb-4 text-[14px] leading-[1.7] text-muted-foreground">
            {faq.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

/** Homepage FAQ — 2-column grid with visible answers (like Silktide) */
export function FAQSection() {
  const topFaqs = allFaqs.slice(0, 6);

  return (
    <section className="border-t border-border/30 bg-muted/20 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-10 flex items-end justify-between">
          <h2 className="text-2xl font-extrabold tracking-[-0.02em] text-foreground">
            Frequently asked questions
          </h2>
          <Link
            href="/faq"
            className="text-[13px] font-semibold text-[#E90029] transition-colors hover:text-[#D10025]"
          >
            See all &rarr;
          </Link>
        </div>
        <div className="grid gap-x-12 gap-y-8 sm:grid-cols-2">
          {topFaqs.map((faq, i) => (
            <div key={i}>
              <h3 className="mb-2 text-[15px] font-bold text-foreground">
                {faq.q}
              </h3>
              <p className="text-[14px] leading-[1.7] text-muted-foreground">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Full FAQ for /faq page */
export function FAQFull() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 max-w-md">
          <h1 className="text-3xl font-extrabold tracking-[-0.02em] text-foreground">
            Frequently asked questions
          </h1>
          <p className="mt-3 text-[15px] leading-[1.7] text-muted-foreground">
            Everything you need to know about ClearSight.
          </p>
        </div>
        <div className="max-w-3xl">
          <FAQList faqs={allFaqs} />
        </div>
      </div>
    </section>
  );
}
