import { createAIProvider } from '@/modules/ai'
import type { PageContext, EnrichedIssue, ScanSummary } from '@/modules/ai/types'
import type { BoundingBox } from '@/modules/scanner/types'
import type { PipelineContext, PipelineStage } from '../types'

export class EnrichStage implements PipelineStage {
  readonly name = 'Generating report'
  readonly progress = 80

  async execute(context: PipelineContext): Promise<PipelineContext> {
    if (!context.renderedPage) {
      throw new Error('EnrichStage requires a rendered page. Did the FetchStage run?')
    }

    const pageContext: PageContext = {
      url: context.renderedPage.url,
      title: context.renderedPage.title,
      metaDescription: context.renderedPage.metaDescription,
      totalElements: context.renderedPage.totalElements,
    }

    try {
      const aiProvider = createAIProvider()

      const enrichedIssues = await aiProvider.enrichIssues(
        context.rawFindings,
        pageContext
      )

      // Merge bounding boxes from raw findings into enriched issues
      const enrichedWithBoxes = mergeBoundingBoxes(enrichedIssues, context)

      const summary = await aiProvider.generateSummary(enrichedWithBoxes, pageContext)

      return {
        ...context,
        enrichedIssues: enrichedWithBoxes,
        summary,
      }
    } catch (error) {
      console.warn(
        '[EnrichStage] LLM enrichment failed, falling back to raw findings:',
        error instanceof Error ? error.message : String(error)
      )

      // Fall back: convert raw findings to enriched issues without LLM
      const fallbackIssues: EnrichedIssue[] = context.rawFindings.map((finding) => ({
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

      const fallbackSummary: ScanSummary = {
        overallScore: calculateFallbackScore(context.rawFindings.length),
        summary: `Accessibility scan found ${context.rawFindings.length} issue(s). AI enrichment was unavailable; results contain basic descriptions only.`,
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

      return {
        ...context,
        enrichedIssues: fallbackIssues,
        summary: fallbackSummary,
      }
    }
  }
}

function calculateFallbackScore(issueCount: number): number {
  // Simple heuristic: start at 100 and subtract points per issue
  const score = Math.max(0, 100 - issueCount * 5)
  return score
}

/** Merge bounding boxes from raw findings into enriched issues by matching ruleId + selector. */
function mergeBoundingBoxes(
  enrichedIssues: EnrichedIssue[],
  context: PipelineContext
): EnrichedIssue[] {
  const boxMap = new Map<string, BoundingBox>()
  for (const finding of context.rawFindings) {
    if (finding.boundingBox) {
      const key = `${finding.ruleId}::${finding.elementSelector}`
      boxMap.set(key, finding.boundingBox)
    }
  }

  return enrichedIssues.map((issue) => {
    const key = `${issue.ruleId ?? issue.axeRuleId}::${issue.elementSelector}`
    return {
      ...issue,
      boundingBox: boxMap.get(key) ?? null,
    }
  })
}
