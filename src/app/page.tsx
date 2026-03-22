import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { BuiltWith } from "@/components/landing/Metrics";
import { Features } from "@/components/landing/Features";
import { AiFixSection } from "@/components/landing/AiFixSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Comparison } from "@/components/landing/Comparison";
import { FAQSection } from "@/components/landing/FAQ";
import { CTABand } from "@/components/landing/CTABand";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
      <Hero />
      <BuiltWith />
      <Features />
      <AiFixSection />
      <HowItWorks />
      <Comparison />
      <FAQSection />
      <CTABand />
      </main>
      <Footer />
    </div>
  );
}
