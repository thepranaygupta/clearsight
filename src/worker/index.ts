import { Worker } from 'bullmq'
import { config } from '@/config'
import { QUEUE_NAMES, redisConnection, crawlQueue, pageScanQueue, aiEnrichmentQueue } from '@/modules/queue'
import { processPageScan } from './processors/page-scan.processor'
import { processAiEnrichment } from './processors/ai-enrichment.processor'
import { processCrawlDiscovery } from './processors/crawl.processor'

const connection = redisConnection

console.log('[Worker] Starting BullMQ workers...')

const crawlWorker = new Worker(
  QUEUE_NAMES.CRAWL_DISCOVERY,
  processCrawlDiscovery,
  { connection, concurrency: 1 },
)

const pageScanWorker = new Worker(
  QUEUE_NAMES.PAGE_SCAN,
  processPageScan,
  { connection, concurrency: config.workerConcurrency.pageScan },
)

const aiEnrichmentWorker = new Worker(
  QUEUE_NAMES.AI_ENRICHMENT,
  processAiEnrichment,
  { connection, concurrency: config.workerConcurrency.aiEnrichment },
)

const workers = [
  { name: 'crawl-discovery', worker: crawlWorker },
  { name: 'page-scan', worker: pageScanWorker },
  { name: 'ai-enrichment', worker: aiEnrichmentWorker },
]

for (const { name, worker } of workers) {
  worker.on('completed', (job) => {
    console.log(`[${name}] Job ${job.id} completed`)
  })
  worker.on('failed', (job, err) => {
    console.error(`[${name}] Job ${job?.id} failed:`, err.message)
  })
  worker.on('error', (err) => {
    console.error(`[${name}] Worker error:`, err.message)
  })
}

console.log(
  `[Worker] Running — page-scan concurrency: ${config.workerConcurrency.pageScan}, ai-enrichment concurrency: ${config.workerConcurrency.aiEnrichment}`,
)

const SHUTDOWN_TIMEOUT_MS = 30_000

async function shutdown() {
  console.log('[Worker] Shutting down (30s timeout)...')
  const closeAll = Promise.all([
    crawlWorker.close(),
    pageScanWorker.close(),
    aiEnrichmentWorker.close(),
    crawlQueue.close(),
    pageScanQueue.close(),
    aiEnrichmentQueue.close(),
  ])

  await Promise.race([
    closeAll,
    new Promise<void>((resolve) => setTimeout(() => {
      console.warn('[Worker] Shutdown timed out, forcing exit')
      resolve()
    }, SHUTDOWN_TIMEOUT_MS)),
  ])

  console.log('[Worker] Shutdown complete')
  process.exit(0)
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
