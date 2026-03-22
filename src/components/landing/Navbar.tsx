"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { LogoFull } from "@/components/Logo";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/solutions", label: "Solutions" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/faq", label: "FAQ" },
  { href: process.env.NEXT_PUBLIC_DOCS_URL || "http://localhost:3002", label: "Docs", external: true },
];

export function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header className={cn(
      "fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl",
      isHome
        ? "border-white/[0.06] bg-[#1a0a0e]/80"
        : "border-border/40 bg-background/80"
    )}>
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="transition-opacity hover:opacity-80">
          <LogoFull size={28} className={isHome ? "text-white" : ""} />
        </Link>

        <div className="hidden items-center gap-1 sm:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              {...("external" in link && link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className={cn(
                "rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors",
                isHome
                  ? pathname === link.href
                    ? "bg-white/10 text-white"
                    : "text-white/50 hover:text-white/80"
                  : pathname === link.href
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <Link
          href="/dashboard"
          className={cn(
            "group flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-[13px] font-semibold transition-all",
            isHome
              ? "bg-[#E90029] text-white hover:bg-[#D10025]"
              : "bg-foreground text-background hover:opacity-90"
          )}
        >
          Get Started
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </nav>
    </header>
  );
}
