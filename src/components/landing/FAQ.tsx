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
    q: "What WCAG levels does ClearSight check?",
    a: "WCAG 2.1 Level A and Level AA — the standard most legal frameworks (ADA, Section 508, EN 301 549) require. We use axe-core's 50+ rules plus custom engines for link text and touch targets.",
  },
  {
    q: "How long does a full site crawl take?",
    a: "A 10-page site completes in under 2 minutes. ClearSight runs 3 concurrent browsers and 2 parallel AI enrichment calls. You see preliminary results as each page finishes — no waiting for the full crawl.",
  },
  {
    q: "What's the difference between confirmed and potential issues?",
    a: "Confirmed issues are definite WCAG violations (e.g., missing alt text). Potential issues need human review — the scanner suspects a problem but can't be certain without manual verification.",
  },
  {
    q: "How does AI enrichment work?",
    a: "After axe-core flags issues, ClearSight sends them to Azure OpenAI with page context. The AI generates a plain-English explanation, a fix suggestion, and a confidence score for each issue. If the AI is unavailable, scans still complete with basic descriptions.",
  },
  {
    q: "Can I track issues across multiple crawls?",
    a: "Yes. Every issue gets a deterministic hash. When you re-crawl, ClearSight shows what's new, fixed, or recurring — and carries over any dismissals automatically.",
  },
  {
    q: "What export formats are available?",
    a: "PDF reports with an AI-generated executive summary, and Excel spreadsheets with filterable multi-sheet data. Both include full issue details, WCAG references, and fix suggestions.",
  },
  {
    q: "Can I scan sites behind authentication?",
    a: "Not yet. ClearSight currently scans publicly accessible pages only. Authenticated scanning is on the roadmap.",
  },
  {
    q: "Does ClearSight respect robots.txt?",
    a: "No. ClearSight scans all same-origin pages it discovers. Accessibility issues exist regardless of crawler directives.",
  },
  {
    q: "Is ClearSight free?",
    a: "ClearSight is open source — you run it on your own infrastructure. You need a PostgreSQL database, Redis, and optionally an Azure OpenAI API key for AI enrichment.",
  },
  {
    q: "What browsers does ClearSight use?",
    a: "Headless Chromium via Playwright at 1280x720. This captures the page as a real desktop user would see it, including JavaScript-rendered content.",
  },
];

function FAQList({ faqs }: { faqs: typeof allFaqs }) {
  return (
    <Accordion className="space-y-2">
      {faqs.map((faq, i) => (
        <AccordionItem
          key={i}
          value={`faq-${i}`}
          className="rounded-xl border border-border bg-card px-6 transition-colors data-[state=open]:border-[#E90029]/25 data-[state=open]:shadow-sm"
        >
          <AccordionTrigger className="py-5 text-left text-[15px] font-semibold text-foreground hover:no-underline">
            {faq.q}
          </AccordionTrigger>
          <AccordionContent className="pb-5 text-[14px] leading-[1.75] text-muted-foreground">
            {faq.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

/** Compact FAQ for homepage — top 5 questions + link to full FAQ */
export function FAQSection() {
  const topFaqs = allFaqs.slice(0, 5);

  return (
    <section className="py-24">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E90029]">
              FAQ
            </p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.02em] text-foreground">
              Common questions
            </h2>
          </div>
          <Link
            href="/faq"
            className="text-[13px] font-semibold text-[#E90029] transition-colors hover:text-[#D10025]"
          >
            See all &rarr;
          </Link>
        </div>
        <FAQList faqs={topFaqs} />
      </div>
    </section>
  );
}

/** Full FAQ for /faq page — all questions */
export function FAQFull() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E90029]">
            FAQ
          </p>
          <h2 className="mt-3 text-[clamp(1.8rem,3.5vw,2.5rem)] font-extrabold tracking-[-0.02em] text-foreground">
            Frequently asked questions
          </h2>
          <p className="mt-3 max-w-md text-[15px] leading-[1.7] text-muted-foreground">
            Everything you need to know about ClearSight.
          </p>
        </div>
        <FAQList faqs={allFaqs} />
      </div>
    </section>
  );
}
