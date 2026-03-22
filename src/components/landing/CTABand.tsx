import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CTABand() {
  return (
    <section className="mt-12 bg-[#1a0a0e] py-24">
      <div className="relative mx-auto max-w-4xl px-6 text-center">
        {/* Glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/2 left-1/2 h-[300px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#E90029]/[0.06] blur-[80px]" />
        </div>

        <div className="relative">
          <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-extrabold tracking-[-0.02em] text-white">
            Ready to make the web accessible?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[15px] leading-[1.7] text-white/60">
            Join developers building inclusive experiences. Get started for free,
            upgrade as you grow.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="group flex items-center gap-2 rounded-lg bg-[#E90029] px-6 py-3 text-[14px] font-semibold text-white shadow-lg shadow-[#E90029]/25 transition-all hover:bg-[#D10025]"
            >
              Start scanning free
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <p className="mt-4 text-[12px] text-white/50">
            No credit card required. Free and open source.
          </p>
        </div>
      </div>
    </section>
  );
}
