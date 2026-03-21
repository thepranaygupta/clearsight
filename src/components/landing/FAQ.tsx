"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "What WCAG levels does ClearSight check?",
    a: "ClearSight checks against WCAG 2.1 Level A and Level AA success criteria. This covers the requirements most legal frameworks (ADA, Section 508, EN 301 549) mandate. We use axe-core's 50+ rules plus custom engines for link text quality and touch target sizing.",
  },
  {
    q: "How long does a full site crawl take?",
    a: "It depends on the number of pages. A 10-page site completes in under 2 minutes. ClearSight runs up to 3 concurrent Playwright browsers and 2 parallel AI enrichment calls. You see preliminary results as soon as each page is scanned — no waiting for the full crawl to finish.",
  },
  {
    q: "What's the difference between confirmed and potential issues?",
    a: "Confirmed issues are definite WCAG violations detected automatically — for example, an image with no alt attribute. Potential issues need human review — the scanner suspects a problem but can't be certain. Both include AI-generated descriptions and fix suggestions.",
  },
  {
    q: "How does AI enrichment work?",
    a: "After axe-core flags issues, ClearSight sends them to Azure OpenAI with the page context. The AI generates a plain-English explanation, a step-by-step fix suggestion, and a confidence score (0-100) for each issue. If the AI is unavailable, scans still complete with axe-core's built-in descriptions.",
  },
  {
    q: "Can I track issues across multiple crawls?",
    a: "Yes. Every issue gets a deterministic SHA-256 hash based on its rule, element selector, WCAG criterion, and page URL. When you re-crawl, ClearSight compares hashes to show which issues are new, which were fixed, and which are recurring. Dismissed issues stay dismissed across crawls.",
  },
  {
    q: "What export formats are available?",
    a: "PDF reports with an AI-generated executive summary — suitable for sharing with stakeholders and leadership. Excel spreadsheets with filterable multi-sheet data — suitable for development teams tracking remediation. Both include full issue details, WCAG references, and fix suggestions.",
  },
  {
    q: "Can I scan sites behind authentication?",
    a: "Not yet. ClearSight currently scans publicly accessible pages only. Authenticated scanning is planned for a future release.",
  },
  {
    q: "Does ClearSight respect robots.txt?",
    a: "No. ClearSight scans all same-origin pages it discovers via link following and sitemap parsing. This is by design — accessibility issues exist regardless of crawler directives.",
  },
  {
    q: "Is ClearSight free?",
    a: "ClearSight is open source. You run it on your own infrastructure. You'll need a PostgreSQL database, Redis instance, and an Azure OpenAI API key for AI enrichment. Without the API key, scans still work but produce basic descriptions instead of AI-generated ones.",
  },
  {
    q: "What browsers does ClearSight use for scanning?",
    a: "Headless Chromium via Playwright, rendering at a 1280x720 viewport. This captures the page as a real desktop user would see it, including JavaScript-rendered content.",
  },
];

export function FAQSection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E90029]">
            FAQ
          </p>
          <h2 className="mt-3 text-[clamp(1.8rem,3.5vw,2.5rem)] font-extrabold tracking-[-0.02em] text-foreground">
            Common questions
          </h2>
        </div>

        <Accordion className="space-y-2">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="rounded-xl border border-border/50 bg-card px-6 transition-colors data-[state=open]:border-[#E90029]/15"
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
      </div>
    </section>
  );
}
