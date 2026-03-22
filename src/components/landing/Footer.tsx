import Link from "next/link";
import { LogoFull } from "@/components/Logo";

const docsUrl = process.env.NEXT_PUBLIC_DOCS_URL || "http://localhost:3002";

export function Footer() {
  return (
    <footer className="border-t border-border/30 bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-24 grid gap-16 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2">
            <div className="mb-8">
              <LogoFull size={24} />
            </div>
            <p className="max-w-sm leading-relaxed text-muted-foreground">
              ClearSight is an open-source AI-powered accessibility platform.
              We help engineering teams build inclusive web experiences at scale.
            </p>
          </div>

          {/* Platform links */}
          <div>
            <h5 className="mb-8 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
              Platform
            </h5>
            <ul className="space-y-4 text-sm font-medium text-muted-foreground">
              <li><Link href={docsUrl} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-[#E90029]">Documentation</Link></li>
              <li><Link href="/how-it-works" className="transition-colors hover:text-[#E90029]">How it works</Link></li>
              <li><Link href="/solutions" className="transition-colors hover:text-[#E90029]">Solutions</Link></li>
              <li><Link href="/dashboard" className="transition-colors hover:text-[#E90029]">Dashboard</Link></li>
            </ul>
          </div>

          {/* Standards links */}
          <div>
            <h5 className="mb-8 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
              Standards
            </h5>
            <ul className="space-y-4 text-sm font-medium text-muted-foreground">
              <li><a href="https://www.w3.org/TR/WCAG21/#conformance-level-a" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-[#E90029]">WCAG 2.1 Level A</a></li>
              <li><a href="https://www.w3.org/TR/WCAG21/#conformance-level-aa" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-[#E90029]">WCAG 2.1 Level AA</a></li>
              <li><a href="https://www.section508.gov/" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-[#E90029]">Section 508</a></li>
              <li><Link href="/faq" className="transition-colors hover:text-[#E90029]">FAQ</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-8 border-t border-border/20 pt-12 md:flex-row">
          <div className="flex items-center gap-8 text-xs text-muted-foreground/50">
            <span>&copy; {new Date().getFullYear()} ClearSight. Open source.</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="size-2 animate-pulse rounded-full bg-emerald-500" />
            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground/50">
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
