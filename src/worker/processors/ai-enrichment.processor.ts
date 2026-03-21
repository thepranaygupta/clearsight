import type { Job } from 'bullmq'
import type { AiEnrichmentJobData } from '@/modules/queue'
import type { RenderedPage } from '@/modules/scanner/renderer/types'
import type { RawFinding, BoundingBox } from '@/modules/scanner/types'
import {
  PipelineOrchestrator,
  ProgressReporter,
  EnrichStage,
  StoreStage,
  CancelledError,
} from '@/modules/pipeline'
import { PrismaCrawlRepository } from '@/modules/db'
import { computeIssueDiff } from '@/modules/crawler'
import { prisma } from '@/modules/db/prisma'

const crawlRepo = new PrismaCrawlRepository()

export async function processAiEnrichment(job: Job<AiEnrichmentJobData>) {
  const { scanId, crawlId, siteId } = job.data

  const scan = await prisma.scan.findUnique({
    where: { id: scanId },
    include: { issues: true },
  })

  if (!scan) {
    throw new Error(`Scan ${scanId} not found`)
  }

  if (scan.status === 'cancelled') {
    console.log(`[AiEnrichment] Scan ${scanId} was cancelled, skipping`)
    return
  }

  const reporter = new ProgressReporter(scanId)
  const storeStage = new StoreStage()
  const enrichStage = new EnrichStage()

  const stages = [enrichStage, storeStage]
  const orchestrator = new PipelineOrchestrator(stages, reporter)

  try {
    const rawFindings = reconstructRawFindings(scan.issues)
    const metadata = (scan.metadata as Record<string, unknown>) ?? {}

    // EnrichStage requires renderedPage to be defined (throws otherwise).
    // We reconstruct the scalar fields from DB; the Playwright `page` handle
    // is not needed because neither EnrichStage nor StoreStage call browser APIs.
    const renderedPage = {
      url: scan.url,
      title: scan.pageTitle ?? '',
      metaDescription: (metadata.metaDescription as string) ?? '',
      pageLoadTimeMs: (metadata.pageLoadTimeMs as number) ?? 0,
      totalElements: (metadata.totalElements as number) ?? 0,
      redirectCount: (metadata.redirectCount as number) ?? 0,
    } as unknown as RenderedPage

    await orchestrator.run({
      scanId,
      url: scan.url,
      crawlId: crawlId ?? undefined,
      pageId: scan.pageId ?? undefined,
      siteId: siteId ?? undefined,
      rawFindings,
      enrichedIssues: [],
      renderedPage,
      screenshot: scan.pageScreenshot ? Buffer.from(scan.pageScreenshot, 'base64') : undefined,
      pageHtml: scan.pageHtml ?? undefined,
    })

    // If part of a crawl, atomically increment enriched count and check completion
    if (crawlId) {
      const { enrichedPages, totalPages } = await crawlRepo.incrementEnrichedPages(crawlId)

      if (enrichedPages >= totalPages) {
        await finalizeCrawl(crawlId)
      }
    }
  } catch (error) {
    if (error instanceof CancelledError) return
    throw error
  }
}

/** Reconstruct RawFinding[] from the preliminary issues saved by IntermediateStoreStage. */
function reconstructRawFindings(
  issues: Array<{
    ruleId: string | null
    axeRuleId: string | null
    ruleHelp: string | null
    type: string
    severity: string
    wcagCriterion: string
    wcagLevel: string
    elementSelector: string
    elementHtml: string
    description: string
    elementBoundingBox: unknown
  }>
): RawFinding[] {
  return issues.map((issue) => ({
    ruleId: issue.ruleId ?? issue.axeRuleId ?? 'unknown',
    ruleHelp: issue.ruleHelp ?? '',
    engineName: issue.axeRuleId ? 'axe-core' : 'custom',
    type: issue.type as 'confirmed' | 'potential',
    severity: issue.severity as 'critical' | 'serious' | 'moderate' | 'minor',
    wcagCriterion: issue.wcagCriterion,
    wcagLevel: issue.wcagLevel as 'A' | 'AA' | 'AAA',
    elementSelector: issue.elementSelector,
    elementHtml: issue.elementHtml,
    description: issue.description,
    boundingBox: issue.elementBoundingBox as BoundingBox | undefined,
  }))
}

/** Aggregate per-page scores and finalize a completed crawl. */
async function finalizeCrawl(crawlId: string) {
  const scans = await prisma.scan.findMany({
    where: { crawlId },
    include: { summary: true },
  })

  const scores = scans
    .map((s) => s.summary?.overallScore)
    .filter((s): s is number => s != null)

  const overallScore =
    scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : null

  // Compute issue diff vs previous crawl
  const crawl = await crawlRepo.findById(crawlId)
  const diff = crawl
    ? await computeIssueDiff(crawl.siteId, crawlId)
    : { newIssues: 0, fixedIssues: 0, recurring: 0 }

  await crawlRepo.update(crawlId, {
    status: 'completed',
    overallScore: overallScore ?? undefined,
    newIssues: diff.newIssues,
    fixedIssues: diff.fixedIssues,
    completedAt: new Date(),
  })

  console.log(
    `[AiEnrichment] Crawl ${crawlId} completed. Score: ${overallScore}, New: ${diff.newIssues}, Fixed: ${diff.fixedIssues}, Recurring: ${diff.recurring}`
  )
}
