// ─── Client-side types for API responses ─────────────────────────────

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type ScanStatus =
  | "queued"
  | "running"
  | "completed"
  | "completed_partial"
  | "failed"
  | "cancelled";

export type CrawlStatus =
  | "queued"
  | "discovering"
  | "scanning"
  | "completed"
  | "failed"
  | "cancelled";

export type IssueStatusType = "open" | "fixed" | "dismissed" | "cant_fix";
export type IssueType = "confirmed" | "potential";
export type Severity = "critical" | "serious" | "moderate" | "minor";
export type WcagLevel = "A" | "AA" | "AAA";

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
  ruleId: string | null;
  ruleHelp: string | null;
  elementBoundingBox: BoundingBox | null;
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

// ─── Site / Crawl / Page types ──────────────────────────────────────

export interface Site {
  id: string;
  hostname: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  crawls?: CrawlSummary[];
  _count?: { pages: number; crawls: number };
}

export interface CrawlSummary {
  id: string;
  status: CrawlStatus;
  totalPages: number;
  scannedPages: number;
  enrichedPages: number;
  overallScore: number | null;
  createdAt: string;
  completedAt: string | null;
}

export interface CrawlDetail extends CrawlSummary {
  siteId: string;
  maxPages: number | null;
  newIssues: number;
  fixedIssues: number;
  site?: Site;
}

export interface PageSummary {
  id: string;
  siteId: string;
  url: string;
  path: string;
  createdAt: string;
  scans?: Array<{
    id: string;
    status: ScanStatus;
    summary?: { overallScore: number } | null;
    _count?: { issues: number };
  }>;
}
