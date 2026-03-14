import type { RawFinding, BoundingBox } from '../scanner/types'

export interface PageContext {
  url: string
  title: string
  metaDescription: string
  totalElements: number
}

export interface EnrichedIssue {
  ruleId: string
  ruleHelp: string
  type: 'confirmed' | 'potential'
  severity: 'critical' | 'serious' | 'moderate' | 'minor'
  confidenceScore: number | null // null for confirmed issues
  wcagCriterion: string
  wcagLevel: 'A' | 'AA' | 'AAA'
  elementSelector: string
  elementHtml: string
  description: string // LLM-generated human-readable
  fixSuggestion: string // LLM-generated actionable fix
  axeRuleId: string | null
  boundingBox?: BoundingBox | null
}

export interface ScanSummary {
  overallScore: number // 0-100
  summary: string // plain-English overview
  topPriorities: Array<{ issueId: string; title: string; reason: string }>
  positiveFindings: Array<{ category: string; detail: string }>
}

export interface AIProvider {
  enrichIssues(
    rawFindings: RawFinding[],
    pageContext: PageContext,
  ): Promise<EnrichedIssue[]>
  generateSummary(
    issues: EnrichedIssue[],
    pageContext: PageContext,
  ): Promise<ScanSummary>
}
