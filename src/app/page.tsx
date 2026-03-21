import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Metrics } from "@/components/landing/Metrics";
import { Features } from "@/components/landing/Features";
import { FAQSection } from "@/components/landing/FAQ";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Metrics />
      <HowItWorks />
      <Features />
      <FAQSection />
      <Footer />
    </div>
  );
}
