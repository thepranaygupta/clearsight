import { Queue } from 'bullmq'
import { config } from '@/config'
import { QUEUE_NAMES } from './types'
import type { CrawlJobData, PageScanJobData, AiEnrichmentJobData } from './types'

const redisUrl = new URL(config.redis.url)
const connection = {
  host: redisUrl.hostname,
  port: parseInt(redisUrl.port || '6379', 10),
}

export const crawlQueue = new Queue<CrawlJobData>(QUEUE_NAMES.CRAWL_DISCOVERY, {
  connection,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'exponential', delay: 30000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 200 },
  },
})

export const pageScanQueue = new Queue<PageScanJobData>(QUEUE_NAMES.PAGE_SCAN, {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 30000 },
    removeOnComplete: { count: 500 },
    removeOnFail: { count: 500 },
  },
})

export const aiEnrichmentQueue = new Queue<AiEnrichmentJobData>(QUEUE_NAMES.AI_ENRICHMENT, {
  connection,
  defaultJobOptions: {
    attempts: 4,
    backoff: { type: 'exponential', delay: 10000 },
    removeOnComplete: { count: 500 },
    removeOnFail: { count: 500 },
  },
})

export { connection as redisConnection }
