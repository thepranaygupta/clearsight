import Link from "next/link";
import { LogoFull } from "@/components/Logo";

const links = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/faq", label: "FAQ" },
  { href: "http://localhost:3002", label: "Docs", external: true },
  { href: "/dashboard", label: "Dashboard" },
];

export function Footer() {
  return (
    <footer className="border-t border-border/30">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          {/* Brand */}
          <div>
            <LogoFull size={22} />
            <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-muted-foreground/60">
              AI-powered WCAG 2.1 accessibility checker. Scan any site, find every issue, get fix suggestions.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-12">
            <div>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/40">
                Product
              </p>
              <div className="flex flex-col gap-2">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/40">
                Standards
              </p>
              <div className="flex flex-col gap-2">
                <a href="https://www.w3.org/TR/WCAG21/#conformance-level-a" target="_blank" rel="noopener noreferrer" className="text-[13px] text-muted-foreground transition-colors hover:text-foreground">WCAG 2.1 Level A</a>
                <a href="https://www.w3.org/TR/WCAG21/#conformance-level-aa" target="_blank" rel="noopener noreferrer" className="text-[13px] text-muted-foreground transition-colors hover:text-foreground">WCAG 2.1 Level AA</a>
                <a href="https://www.section508.gov/" target="_blank" rel="noopener noreferrer" className="text-[13px] text-muted-foreground transition-colors hover:text-foreground">Section 508</a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-2 border-t border-border/20 pt-6 sm:flex-row">
          <p className="text-[12px] text-muted-foreground/40">
            Built with axe-core, Playwright, and Azure OpenAI
          </p>
          <div className="flex items-center gap-1.5">
            <div className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_1px_rgba(16,185,129,0.4)]" />
            <span className="text-[12px] text-muted-foreground/40">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
