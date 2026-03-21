import type { Severity } from "./types";

// ─── Severity ────────────────────────────────────────────────────────

export const SEVERITY_CONFIG: Record<
  Severity,
  {
    label: string;
    dot: string;
    bg: string;
    text: string;
    border: string;
    accent: string;
  }
> = {
  critical: {
    label: "Critical",
    dot: "bg-red-600",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    accent: "border-l-red-600",
  },
  serious: {
    label: "Serious",
    dot: "bg-orange-500",
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    accent: "border-l-orange-500",
  },
  moderate: {
    label: "Moderate",
    dot: "bg-yellow-500",
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    border: "border-yellow-200",
    accent: "border-l-yellow-500",
  },
  minor: {
    label: "Minor",
    dot: "bg-blue-400",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    accent: "border-l-blue-400",
  },
};

// ─── Score ────────────────────────────────────────────────────────────

export function getScoreColor(score: number): string {
  if (score >= 80) return "var(--score-good)";
  if (score >= 50) return "var(--score-okay)";
  return "var(--score-bad)";
}

export function getScoreLabel(score: number): string {
  if (score >= 90) return "Good";
  if (score >= 80) return "Fair";
  if (score >= 50) return "Needs Work";
  return "Poor";
}
