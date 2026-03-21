import type { Job } from 'bullmq'
import type { PageScanJobData } from '@/modules/queue'
import { aiEnrichmentQueue } from '@/modules/queue'
import {
  PipelineOrchestrator,
  ProgressReporter,
  FetchStage,
  AnalyzeStage,
  CustomChecksStage,
  ElementLocateStage,
  IntermediateStoreStage,
  STAGE_SPLIT,
  CancelledError,
} from '@/modules/pipeline'
import { PrismaScanRepository, PrismaCrawlRepository } from '@/modules/db'

const scanRepo = new PrismaScanRepository()
const crawlRepo = new PrismaCrawlRepository()

export async function processPageScan(job: Job<PageScanJobData>) {
  const { scanId, url, crawlId, pageId, siteId } = job.data

  await scanRepo.updateStatus(scanId, { status: 'running' })

  const fetchStage = new FetchStage()
  const reporter = new ProgressReporter(scanId)

  const stages = [
    fetchStage,
    new AnalyzeStage(),
    new CustomChecksStage(),
    new ElementLocateStage(),
    new IntermediateStoreStage(),
  ]

  const orchestrator = new PipelineOrchestrator(stages, reporter)

  orchestrator.onCleanup(async () => {
    const renderer = fetchStage.getRenderer()
    if (renderer) {
      await renderer.close()
    }
  })

  try {
    await orchestrator.run(
      {
        scanId,
        url,
        crawlId,
        pageId,
        siteId,
        rawFindings: [],
        enrichedIssues: [],
      },
      { toStage: STAGE_SPLIT.SCAN_END }
    )

    if (crawlId) {
      await crawlRepo.incrementScannedPages(crawlId)
    }

    await aiEnrichmentQueue.add(`enrich-${scanId}`, {
      scanId,
      crawlId,
      siteId,
    })

    await job.updateProgress(70)
  } catch (error) {
    if (error instanceof CancelledError) {
      console.log(`[PageScan] Scan ${scanId} was cancelled`)
      return
    }
    await scanRepo.updateStatus(scanId, {
      status: 'failed',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    })
    throw error
  }
}
