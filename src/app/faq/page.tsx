import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { FAQSection } from "@/components/landing/FAQ";

export default function FAQPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-14">
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
}
