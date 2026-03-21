import {
  PrismaScanRepository,
  PrismaSummaryRepository,
} from '@/modules/db'
import { prisma } from '@/modules/db/prisma'
import type { CreateIssueInput } from '@/modules/db'
import type { PipelineContext, PipelineStage } from '../types'

export class StoreStage implements PipelineStage {
  readonly name = 'Saving results'
  readonly progress = 100

  private llmFailed: boolean

  constructor(options?: { llmFailed?: boolean }) {
    this.llmFailed = options?.llmFailed ?? false
  }

  /** Mark whether the LLM enrichment failed (used to set completed_partial status). */
  setLlmFailed(failed: boolean): void {
    this.llmFailed = failed
  }

  async execute(context: PipelineContext): Promise<PipelineContext> {
    const scanRepo = new PrismaScanRepository()
    const summaryRepo = new PrismaSummaryRepository()

    // Map enriched issues to database records
    const issueInputs: CreateIssueInput[] = context.enrichedIssues.map((issue) => ({
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
    }))

    // Atomically replace preliminary issues with enriched ones
    await prisma.$transaction(async (tx) => {
      await tx.issue.deleteMany({ where: { scanId: context.scanId } })
      await tx.issue.createMany({
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
        })),
      })
    })

    // Create scan summary
    if (context.summary) {
      await summaryRepo.create({
        scanId: context.scanId,
        overallScore: context.summary.overallScore,
        summary: context.summary.summary,
        topPriorities: context.summary.topPriorities as unknown as import('@/generated/prisma/internal/prismaNamespace').InputJsonValue,
        positiveFindings: context.summary.positiveFindings as unknown as import('@/generated/prisma/internal/prismaNamespace').InputJsonValue,
      })
    }

    // Update scan with screenshot, page title, and final status
    const screenshotBase64 = context.screenshot
      ? context.screenshot.toString('base64')
      : null

    const pageTitle = context.renderedPage?.title ?? null

    await scanRepo.updateStatus(context.scanId, {
      status: this.llmFailed ? 'completed_partial' : 'completed',
      completedAt: new Date(),
      pageTitle,
      pageScreenshot: screenshotBase64,
      pageHtml: context.pageHtml ?? null,
    })

    // Update scan metadata (page load time, total elements, etc.)
    if (context.renderedPage) {
      const metadata = {
        pageLoadTimeMs: context.renderedPage.pageLoadTimeMs,
        totalElements: context.renderedPage.totalElements,
        redirectCount: context.renderedPage.redirectCount,
        metaDescription: context.renderedPage.metaDescription,
      }

      await prisma.scan.update({
        where: { id: context.scanId },
        data: { metadata },
      })
    }

    return context
  }
}
