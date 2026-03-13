import type {
  Scan,
  Issue,
  ScanSummary,
  ScanStatus,
  IssueType,
  Severity,
  WcagLevel,
} from '@/generated/prisma/client'
import type { InputJsonValue } from '@/generated/prisma/internal/prismaNamespace'

// ─── Scan with relations ────────────────────────────────────────────

export type ScanWithRelations = Scan & {
  issues: Issue[]
  summary: ScanSummary | null
}

// ─── Create / Update DTOs ───────────────────────────────────────────

export interface CreateScanInput {
  url: string
  metadata?: InputJsonValue
}

export interface UpdateScanStatusInput {
  status: ScanStatus
  errorMessage?: string | null
  completedAt?: Date | null
  pageTitle?: string | null
  pageScreenshot?: string | null
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
