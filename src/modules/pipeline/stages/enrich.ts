import { createAIProvider } from '@/modules/ai'
import { rawFindingsToFallbackIssues, generateFallbackSummary } from '@/modules/ai/fallback'
import type { PageContext, EnrichedIssue } from '@/modules/ai/types'
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
      const fallbackIssues = rawFindingsToFallbackIssues(context.rawFindings)
      const fallbackSummary = generateFallbackSummary(context.rawFindings, fallbackIssues)

      return {
        ...context,
        enrichedIssues: fallbackIssues,
        summary: fallbackSummary,
      }
    }
  }
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
