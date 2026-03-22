import { Navbar } from "@/components/landing/Navbar";
import { CTABand } from "@/components/landing/CTABand";
import { Footer } from "@/components/landing/Footer";
import { allFaqs } from "@/components/landing/FAQ";

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

          <div className="grid gap-4 sm:grid-cols-2">
            {allFaqs.map((faq, i) => (
              <div key={i} className="rounded-lg border border-border/50 bg-card p-5">
                <h3 className="mb-2 text-[14px] font-bold text-foreground">
                  {faq.q}
                </h3>
                <p className="text-[13px] leading-[1.7] text-muted-foreground">
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
