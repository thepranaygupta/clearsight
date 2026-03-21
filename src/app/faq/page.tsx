import { Navbar } from "@/components/landing/Navbar";
import { FAQFull } from "@/components/landing/FAQ";
import { CTABand } from "@/components/landing/CTABand";
import { Footer } from "@/components/landing/Footer";

export default function FAQPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-20">
        <FAQFull />
      </main>
      <CTABand />
      <Footer />
    </div>
  );
}
