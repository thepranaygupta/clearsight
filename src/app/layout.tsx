import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Shell } from "@/components/layout/Shell";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ClearSight — WCAG Accessibility Checker",
    template: "%s · ClearSight",
  },
  description:
    "Scan any webpage for ADA/WCAG 2.1 A & AA accessibility violations. AI-powered analysis with actionable fix suggestions.",
  keywords: ["accessibility", "WCAG", "ADA", "a11y", "compliance", "axe-core"],
  authors: [{ name: "ClearSight" }],
  metadataBase: new URL("http://localhost:3000"),
  openGraph: {
    title: "ClearSight — WCAG Accessibility Checker",
    description:
      "Scan any webpage for ADA/WCAG 2.1 A & AA accessibility violations. AI-powered analysis with actionable fix suggestions.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "ClearSight — WCAG Accessibility Checker",
    description:
      "Scan any webpage for ADA/WCAG 2.1 A & AA accessibility violations.",
  },
  other: {
    "theme-color": "#E90029",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <TooltipProvider>
          <Shell>{children}</Shell>
        </TooltipProvider>
      </body>
    </html>
  );
}
