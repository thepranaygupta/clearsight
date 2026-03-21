import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CTABand() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="relative overflow-hidden rounded-3xl border border-[#E90029]/10 bg-[#E90029]/[0.02] px-8 py-16 text-center sm:px-16">
          {/* Subtle glow */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute top-0 left-1/2 h-[200px] w-[400px] -translate-x-1/2 rounded-full bg-[#E90029]/[0.04] blur-[80px]" />
          </div>

          <div className="relative">
            <h2 className="text-[clamp(1.6rem,3vw,2.2rem)] font-extrabold tracking-[-0.02em] text-foreground">
              Your users deserve an accessible web.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[15px] leading-[1.7] text-muted-foreground">
              Start scanning your site for free. No account required, no credit card,
              no setup. Just paste a URL and get results.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                className="group flex items-center gap-2 rounded-xl bg-[#E90029] px-7 py-3 text-[14px] font-semibold text-white shadow-lg shadow-[#E90029]/10 transition-all hover:bg-[#D10025] hover:shadow-xl hover:shadow-[#E90029]/20"
              >
                Start scanning
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/how-it-works"
                className="flex items-center gap-2 rounded-xl border border-border px-7 py-3 text-[14px] font-semibold text-foreground transition-colors hover:bg-muted"
              >
                See how it works
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
