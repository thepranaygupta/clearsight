import Link from "next/link";
import { LogoFull } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="border-t border-border/30 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 sm:flex-row">
        <LogoFull size={20} className="text-muted-foreground" />

        <div className="flex items-center gap-6">
          <Link
            href="/how-it-works"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            How it works
          </Link>
          <Link
            href="/faq"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            FAQ
          </Link>
          <Link
            href="http://localhost:3002"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Docs
          </Link>
          <Link
            href="/dashboard"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Dashboard
          </Link>
        </div>

        <p className="text-[11px] text-muted-foreground/50">
          WCAG 2.1 A & AA Compliance
        </p>
      </div>
    </footer>
  );
}
