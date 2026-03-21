import { Navbar } from "@/components/landing/Navbar";
import { CTABand } from "@/components/landing/CTABand";
import { Footer } from "@/components/landing/Footer";

const faqs = [
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

export default function FAQPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="pt-28 pb-0 sm:pt-36">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 max-w-md">
            <h1 className="text-3xl font-extrabold tracking-[-0.02em] text-foreground sm:text-4xl">
              Frequently asked questions
            </h1>
            <p className="mt-3 text-[15px] leading-[1.7] text-muted-foreground">
              Everything you need to know about ClearSight.
            </p>
          </div>

          <div className="grid gap-x-12 gap-y-10 sm:grid-cols-2">
            {faqs.map((faq, i) => (
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
      </main>

      <CTABand />
      <Footer />
    </div>
  );
}
