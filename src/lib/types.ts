// ─── Client-side types for API responses ─────────────────────────────

export type ScanStatus =
  | "queued"
  | "running"
  | "completed"
  | "completed_partial"
  | "failed"
  | "cancelled";

export type IssueType = "confirmed" | "potential";
export type Severity = "critical" | "serious" | "moderate" | "minor";
export type WcagLevel = "A" | "AA";

export interface ScanListItem {
  id: string;
  url: string;
  status: ScanStatus;
  progress: number;
  currentStage: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  pageTitle: string | null;
  summary?: {
    overallScore: number;
  } | null;
}

export interface Issue {
  id: string;
  scanId: string;
  type: IssueType;
  severity: Severity;
  confidenceScore: number | null;
  wcagCriterion: string;
  wcagLevel: WcagLevel;
  elementSelector: string;
  elementHtml: string;
  description: string;
  fixSuggestion: string;
  axeRuleId: string | null;
  createdAt: string;
}

export interface ScanSummary {
  id: string;
  scanId: string;
  overallScore: number;
  summary: string;
  topPriorities: Array<{ issueId: string; title: string; reason: string }>;
  positiveFindings: Array<{ category: string; detail: string }>;
  createdAt: string;
}

export interface ScanDetail {
  id: string;
  url: string;
  status: ScanStatus;
  progress: number;
  currentStage: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
  pageTitle?: string | null;
  pageScreenshot?: string | null;
  errorMessage?: string | null;
  issues?: Issue[];
  summary?: ScanSummary | null;
}
