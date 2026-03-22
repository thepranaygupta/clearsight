import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to common questions about ClearSight — how scanning works, what WCAG rules are checked, and how to interpret your results.",
  alternates: { canonical: "https://clearsight.pranaygupta.in/faq" },
  openGraph: {
    title: "FAQ · ClearSight",
    description: "Answers to common questions about ClearSight accessibility scanning.",
    url: "https://clearsight.pranaygupta.in/faq",
  },
};
import { CTABand } from "@/components/landing/CTABand";
import { Footer } from "@/components/landing/Footer";
import { allFaqs } from "@/components/landing/FAQ";

export default function FAQPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-28 sm:pt-36">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-16 max-w-md">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              Frequently asked questions
            </h1>
            <p className="mt-3 text-[15px] leading-[1.7] text-muted-foreground">
              Everything you need to know about ClearSight.
            </p>
          </div>

          <div className="space-y-12">
            {allFaqs.map((faq, i) => (
              <div key={i} className="grid gap-8 md:grid-cols-3">
                <h4 className="col-span-1 font-bold text-foreground">{faq.q}</h4>
                <p className="col-span-2 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
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
