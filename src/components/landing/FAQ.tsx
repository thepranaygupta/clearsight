"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "What WCAG levels do you check?",
    a: "ClearSight checks against WCAG 2.1 Level A and AA criteria using axe-core (50+ rules) plus custom engines for link text quality and touch target sizing.",
  },
  {
    q: "How long does a full site crawl take?",
    a: "It depends on the number of pages. A 10-page site typically completes in under 2 minutes. We run up to 3 concurrent browsers and 2 parallel AI enrichment calls to maximize throughput.",
  },
  {
    q: "What's the difference between confirmed and potential issues?",
    a: "Confirmed issues are definite WCAG violations detected automatically (e.g., missing alt text). Potential issues need human review — the tool suspects a violation but can't be certain without manual verification.",
  },
  {
    q: "How does AI enrichment work?",
    a: "After axe-core identifies issues, we send them to Azure OpenAI. The AI generates human-readable descriptions, actionable fix suggestions, and confidence scores for each issue. If AI is unavailable, scans still complete with basic descriptions.",
  },
  {
    q: "Can I track issues across multiple crawls?",
    a: "Yes. Each issue gets a deterministic hash based on the rule, element, and page. When you re-crawl, ClearSight shows which issues are new, fixed, or recurring — and carries over any dismissals.",
  },
  {
    q: "What export formats are available?",
    a: "PDF reports with AI-generated executive summaries, and Excel spreadsheets with filterable issue data across multiple sheets. Both include full issue details, WCAG references, and fix suggestions.",
  },
];

export function FAQSection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-12 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E90029]">
            FAQ
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Common questions
          </h2>
        </div>

        <Accordion className="space-y-2">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="rounded-xl border border-border/50 bg-card px-6 transition-colors data-[state=open]:border-[#E90029]/20 data-[state=open]:bg-card/80"
            >
              <AccordionTrigger className="py-5 text-left text-[15px] font-semibold text-foreground hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-[14px] leading-[1.7] text-muted-foreground">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
