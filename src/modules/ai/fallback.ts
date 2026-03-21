import type { RawFinding } from '../scanner/types'
import type { EnrichedIssue, ScanSummary } from './types'

/** Convert raw findings to basic enriched issues without LLM. */
export function rawFindingsToFallbackIssues(rawFindings: RawFinding[]): EnrichedIssue[] {
  return rawFindings.map((finding) => ({
    ruleId: finding.ruleId,
    ruleHelp: finding.ruleHelp,
    type: finding.type,
    severity: finding.severity,
    confidenceScore: finding.type === 'potential' ? 0.5 : null,
    wcagCriterion: finding.wcagCriterion,
    wcagLevel: finding.wcagLevel,
    elementSelector: finding.elementSelector,
    elementHtml: finding.elementHtml,
    description: finding.description,
    fixSuggestion: `Review and fix the ${finding.severity} accessibility issue for WCAG ${finding.wcagCriterion}.`,
    axeRuleId: finding.engineName === 'axe-core' ? finding.ruleId : null,
    boundingBox: finding.boundingBox ?? null,
  }))
}

/** Generate a basic summary without LLM. */
export function generateFallbackSummary(
  rawFindings: RawFinding[],
  fallbackIssues: EnrichedIssue[],
): ScanSummary {
  return {
    overallScore: calculateFallbackScore(rawFindings.length),
    summary: `Accessibility scan found ${rawFindings.length} issue(s). AI enrichment was unavailable; results contain basic descriptions only.`,
    topPriorities: fallbackIssues
      .filter((i) => i.severity === 'critical' || i.severity === 'serious')
      .slice(0, 3)
      .map((i, idx) => ({
        issueId: `priority-${idx}`,
        title: `${i.severity} ${i.wcagCriterion} violation`,
        reason: i.description,
      })),
    positiveFindings: [],
  }
}

export function calculateFallbackScore(issueCount: number): number {
  return Math.max(0, 100 - issueCount * 5)
}
