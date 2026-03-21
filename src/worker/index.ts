import { prisma } from '@/modules/db/prisma'
import { PrismaScanRepository } from '@/modules/db'
import {
  PipelineOrchestrator,
  ProgressReporter,
  FetchStage,
  AnalyzeStage,
  CustomChecksStage,
  ElementLocateStage,
  IntermediateStoreStage,
  EnrichStage,
  StoreStage,
  CancelledError,
} from '@/modules/pipeline'
import { config } from '@/config'
import type { PipelineContext } from '@/modules/pipeline'

// ─── Configuration ──────────────────────────────────────────────────
const POLL_INTERVAL_MS = config.worker.pollIntervalMs
const STALE_CHECK_INTERVAL_MS = config.worker.staleCheckIntervalMs
const STALE_THRESHOLD_MS = config.worker.staleThresholdMs
const MAX_RETRIES = config.worker.maxRetries

// ─── State ──────────────────────────────────────────────────────────
let isShuttingDown = false
let pollTimer: ReturnType<typeof setTimeout> | null = null
let staleTimer: ReturnType<typeof setInterval> | null = null

// ─── Job Polling ────────────────────────────────────────────────────

async function pollForJob(): Promise<void> {
  if (isShuttingDown) return

  try {
    // Use raw SQL with FOR UPDATE SKIP LOCKED to safely claim a job
    const jobs = await prisma.$queryRawUnsafe<
      Array<{ id: string; url: string }>
    >(
      `SELECT id, url FROM scans WHERE status = 'queued' ORDER BY created_at ASC LIMIT 1 FOR UPDATE SKIP LOCKED`
    )

    if (jobs.length === 0) {
      scheduleNextPoll()
      return
    }

    const job = jobs[0]
    console.log(`[Worker] Picked up scan ${job.id} for ${job.url}`)

    // Set status to running
    const scanRepo = new PrismaScanRepository()
    await scanRepo.updateStatus(job.id, { status: 'running' })

    await processJob(job.id, job.url)
  } catch (error) {
    console.error(
      '[Worker] Error polling for jobs:',
      error instanceof Error ? error.message : String(error)
    )
  }

  scheduleNextPoll()
}

function scheduleNextPoll(): void {
  if (isShuttingDown) return
  pollTimer = setTimeout(pollForJob, POLL_INTERVAL_MS)
}

// ─── Job Processing ─────────────────────────────────────────────────

async function processJob(scanId: string, url: string): Promise<void> {
  const progressReporter = new ProgressReporter(scanId)
  const fetchStage = new FetchStage()
  const storeStage = new StoreStage()

  const stages = [
    fetchStage,
    new AnalyzeStage(),
    new CustomChecksStage(),
    new ElementLocateStage(),
    new IntermediateStoreStage(),
    new EnrichStage(),
    storeStage,
  ]

  const orchestrator = new PipelineOrchestrator(stages, progressReporter)

  // Register renderer cleanup so the browser is closed on success or failure
  orchestrator.onCleanup(async () => {
    const renderer = fetchStage.getRenderer()
    if (renderer) {
      await renderer.close()
    }
  })

  const initialContext: PipelineContext = {
    scanId,
    url,
    rawFindings: [],
    enrichedIssues: [],
  }

  try {
    console.log(`[Worker] Starting pipeline for scan ${scanId}`)
    const result = await orchestrator.run(initialContext)

    console.log(
      `[Worker] Scan ${scanId} completed — ${result.enrichedIssues.length} issues found`
    )
  } catch (error) {
    if (error instanceof CancelledError) {
      console.log(`[Worker] Scan ${scanId} was cancelled`)
      return
    }

    console.error(
      `[Worker] Scan ${scanId} failed:`,
      error instanceof Error ? error.message : String(error)
    )
  }
}

// ─── Stale Job Recovery ─────────────────────────────────────────────

async function recoverStaleJobs(): Promise<void> {
  if (isShuttingDown) return

  try {
    const scanRepo = new PrismaScanRepository()
    const staleJobs = await scanRepo.findStaleJobs(STALE_THRESHOLD_MS)

    for (const job of staleJobs) {
      if (job.retryCount >= MAX_RETRIES) {
        console.log(
          `[Worker] Stale scan ${job.id} exceeded max retries (${MAX_RETRIES}), marking as failed`
        )
        await scanRepo.updateStatus(job.id, {
          status: 'failed',
          errorMessage: `Job stalled after ${MAX_RETRIES} retries`,
        })
      } else {
        console.log(
          `[Worker] Resetting stale scan ${job.id} to queued (retry ${job.retryCount + 1}/${MAX_RETRIES})`
        )
        await scanRepo.incrementRetry(job.id)
        await scanRepo.updateStatus(job.id, { status: 'queued' })
      }
    }
  } catch (error) {
    console.error(
      '[Worker] Error recovering stale jobs:',
      error instanceof Error ? error.message : String(error)
    )
  }
}

// ─── Graceful Shutdown ──────────────────────────────────────────────

function shutdown(signal: string): void {
  if (isShuttingDown) return
  isShuttingDown = true
  console.log(`[Worker] Received ${signal}, shutting down gracefully...`)

  if (pollTimer) {
    clearTimeout(pollTimer)
    pollTimer = null
  }

  if (staleTimer) {
    clearInterval(staleTimer)
    staleTimer = null
  }

  prisma
    .$disconnect()
    .then(() => {
      console.log('[Worker] Database disconnected. Goodbye.')
      process.exit(0)
    })
    .catch((error) => {
      console.error('[Worker] Error disconnecting database:', error)
      process.exit(1)
    })
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

// ─── Start ──────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('[Worker] Starting ClearSight scan worker...')
  console.log(`[Worker] Poll interval: ${POLL_INTERVAL_MS}ms`)
  console.log(`[Worker] Stale check interval: ${STALE_CHECK_INTERVAL_MS}ms`)
  console.log(`[Worker] Stale threshold: ${STALE_THRESHOLD_MS}ms`)
  console.log(`[Worker] Max retries: ${MAX_RETRIES}`)

  // Start polling for jobs
  await pollForJob()

  // Start stale job recovery on a separate interval
  staleTimer = setInterval(recoverStaleJobs, STALE_CHECK_INTERVAL_MS)

  console.log('[Worker] Ready and polling for jobs.')
}

main().catch((error) => {
  console.error('[Worker] Fatal error:', error)
  process.exit(1)
})
