import { Navbar } from "@/components/landing/Navbar";
import { FAQSection } from "@/components/landing/FAQ";
import { CTABand } from "@/components/landing/CTABand";
import { Footer } from "@/components/landing/Footer";

export default function FAQPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-20">
        <FAQSection />
      </main>
      <CTABand />
      <Footer />
    </div>
  );
}
