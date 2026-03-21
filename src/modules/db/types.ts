import type {
  Scan,
  Issue,
  ScanSummary,
  ScanStatus,
  CrawlStatus,
  IssueType,
  Severity,
  WcagLevel,
} from '@/generated/prisma/client'
import type { InputJsonValue } from '@/generated/prisma/internal/prismaNamespace'

// ─── Scan with relations ────────────────────────────────────────────

export type ScanWithRelations = Omit<Scan, 'pageHtml'> & {
  issues: Issue[]
  summary: ScanSummary | null
}

// ─── Create / Update DTOs ───────────────────────────────────────────

export interface CreateScanInput {
  url: string
  metadata?: InputJsonValue
  pageId?: string
  crawlId?: string
}

export interface UpdateScanStatusInput {
  status: ScanStatus
  errorMessage?: string | null
  completedAt?: Date | null
  pageTitle?: string | null
  pageScreenshot?: string | null
  pageHtml?: string | null
}

export interface UpdateScanProgressInput {
  progress: number
  currentStage?: string | null
}

export interface CreateIssueInput {
  scanId: string
  type: IssueType
  severity: Severity
  confidenceScore?: number | null
  wcagCriterion: string
  wcagLevel: WcagLevel
  elementSelector: string
  elementHtml: string
  description: string
  fixSuggestion: string
  axeRuleId?: string | null
  ruleId?: string | null
  ruleHelp?: string | null
  elementBoundingBox?: { x: number; y: number; width: number; height: number } | null
}

export interface CreateSummaryInput {
  scanId: string
  overallScore: number
  summary: string
  topPriorities: InputJsonValue
  positiveFindings: InputJsonValue
}

export interface FindManyScansOptions {
  skip?: number
  take?: number
  orderBy?: 'createdAt' | 'updatedAt'
  order?: 'asc' | 'desc'
  status?: ScanStatus
}

export interface FindManyScansResult {
  scans: Scan[]
  total: number
}

// ─── Repository interfaces ──────────────────────────────────────────

export interface ScanRepository {
  create(input: CreateScanInput): Promise<Scan>
  findById(id: string): Promise<ScanWithRelations | null>
  findMany(options?: FindManyScansOptions): Promise<FindManyScansResult>
  updateStatus(id: string, input: UpdateScanStatusInput): Promise<Scan>
  updateProgress(id: string, input: UpdateScanProgressInput): Promise<Scan>
  findStaleJobs(thresholdMs: number): Promise<Scan[]>
  incrementRetry(id: string): Promise<Scan>
}

export interface IssueRepository {
  createMany(issues: CreateIssueInput[]): Promise<{ count: number }>
}

export interface SummaryRepository {
  create(input: CreateSummaryInput): Promise<ScanSummary>
}

// ─── Site ────────────────────────────────────────────────────────────

export interface CreateSiteInput {
  hostname: string
  name: string
}

// ─── Crawl ───────────────────────────────────────────────────────────

export interface CreateCrawlInput {
  siteId: string
  maxPages?: number | null
}

export interface UpdateCrawlInput {
  status?: CrawlStatus
  totalPages?: number
  scannedPages?: number
  enrichedPages?: number
  overallScore?: number
  maxPages?: number
  newIssues?: number
  fixedIssues?: number
  completedAt?: Date
}

// ─── Page ────────────────────────────────────────────────────────────

export interface CreatePageInput {
  siteId: string
  url: string
  path: string
  firstSeenCrawlId: string
}
