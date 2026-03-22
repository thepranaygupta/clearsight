import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";

export const metadata: Metadata = {
  title: "ClearSight — WCAG Accessibility Checker",
  description: "Scan any webpage for ADA/WCAG 2.1 A & AA accessibility violations. AI-powered analysis with actionable fix suggestions and full-site crawl.",
  alternates: { canonical: "https://clearsight.pranaygupta.in" },
  openGraph: {
    title: "ClearSight — WCAG Accessibility Checker",
    description: "Scan any webpage for ADA/WCAG 2.1 A & AA accessibility violations. AI-powered analysis with actionable fix suggestions.",
    url: "https://clearsight.pranaygupta.in",
  },
};
import { Hero } from "@/components/landing/Hero";
import { TheProblem } from "@/components/landing/TheProblem";
import { AiFixSection } from "@/components/landing/AiFixSection";
import { Features } from "@/components/landing/Features";
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
        <TheProblem />
        <AiFixSection />
        <Features />
        <Comparison />
        <FAQSection />
        <CTABand />
      </main>
      <Footer />
    </div>
  );
}
