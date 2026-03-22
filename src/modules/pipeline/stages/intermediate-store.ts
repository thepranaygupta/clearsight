import { prisma } from '@/modules/db/prisma'
import { rawFindingsToFallbackIssues } from '@/modules/ai/fallback'
import { computeIssueHash } from '../issue-hash'
import type { CreateIssueInput } from '@/modules/db'
import type { PipelineContext, PipelineStage } from '../types'

/**
 * Saves preliminary (unenriched) issues to the database so the frontend
 * can display results while the LLM enrichment stage is still running.
 */
export class IntermediateStoreStage implements PipelineStage {
  readonly name = 'Preparing results'
  readonly progress = 70

  async execute(context: PipelineContext): Promise<PipelineContext> {
    // Convert raw findings to fallback-quality enriched issues
    const fallbackIssues = rawFindingsToFallbackIssues(context.rawFindings)

    // Map to DB input format
    const issueInputs: CreateIssueInput[] = fallbackIssues.map((issue) => ({
      scanId: context.scanId,
      type: issue.type,
      severity: issue.severity,
      confidenceScore: issue.confidenceScore,
      wcagCriterion: issue.wcagCriterion,
      wcagLevel: issue.wcagLevel,
      elementSelector: issue.elementSelector,
      elementHtml: issue.elementHtml,
      description: issue.description,
      fixSuggestion: issue.fixSuggestion,
      axeRuleId: issue.axeRuleId,
      ruleId: issue.ruleId,
      ruleHelp: issue.ruleHelp,
      elementBoundingBox: issue.boundingBox ?? null,
      issueHash: computeIssueHash(issue.ruleId, issue.axeRuleId, issue.elementSelector, issue.wcagCriterion, context.url),
      pageUrl: context.url,
      firstSeenScanId: context.scanId,
      lastSeenScanId: context.scanId,
    }))

    // Atomically replace any existing issues (handles stale job re-runs)
    await prisma.$transaction([
      prisma.issue.deleteMany({ where: { scanId: context.scanId } }),
      prisma.issue.createMany({
        data: issueInputs.map((issue) => ({
          scanId: issue.scanId,
          type: issue.type,
          severity: issue.severity,
          confidenceScore: issue.confidenceScore ?? null,
          wcagCriterion: issue.wcagCriterion,
          wcagLevel: issue.wcagLevel,
          elementSelector: issue.elementSelector,
          elementHtml: issue.elementHtml,
          description: issue.description,
          fixSuggestion: issue.fixSuggestion,
          axeRuleId: issue.axeRuleId ?? null,
          ruleId: issue.ruleId ?? null,
          ruleHelp: issue.ruleHelp ?? null,
          elementBoundingBox: issue.elementBoundingBox ?? undefined,
          issueHash: issue.issueHash ?? null,
          pageUrl: issue.pageUrl ?? null,
          firstSeenScanId: issue.firstSeenScanId ?? null,
          lastSeenScanId: issue.lastSeenScanId ?? null,
        })),
      }),
    ])

    // Save page title and screenshot so the API can return them during enrichment
    const screenshotBase64 = context.screenshot
      ? context.screenshot.toString('base64')
      : null

    const pageTitle = context.renderedPage?.title ?? null

    // Build metadata for ai-enrichment processor to reconstruct renderedPage
    const metadata = context.renderedPage ? {
      pageLoadTimeMs: context.renderedPage.pageLoadTimeMs,
      totalElements: context.renderedPage.totalElements,
      redirectCount: context.renderedPage.redirectCount,
      metaDescription: context.renderedPage.metaDescription,
    } : undefined

    await prisma.scan.update({
      where: { id: context.scanId },
      data: {
        pageTitle,
        pageScreenshot: screenshotBase64,
        pageHtml: context.pageHtml ?? null,
        ...(metadata ? { metadata } : {}),
      },
    })

    console.log(
      `[IntermediateStore] Saved ${issueInputs.length} preliminary issues for scan ${context.scanId}`
    )

    return context
  }
}
