import type { Job } from 'bullmq'
import type { CrawlJobData } from '@/modules/queue'
import { pageScanQueue } from '@/modules/queue'
import { discoverPages } from '@/modules/crawler'
import { config } from '@/config'
import {
  PrismaCrawlRepository,
  PrismaPageRepository,
  PrismaScanRepository,
} from '@/modules/db'

const crawlRepo = new PrismaCrawlRepository()
const pageRepo = new PrismaPageRepository()
const scanRepo = new PrismaScanRepository()

export async function processCrawlDiscovery(job: Job<CrawlJobData>) {
  const { crawlId, siteId, rootUrl, maxPages } = job.data

  await crawlRepo.update(crawlId, { status: 'discovering' })

  // Resolve effective max pages (per-crawl cap, capped by env var ceiling)
  const envMax = config.crawler.maxPages
  let effectiveMax = maxPages
  if (envMax !== null) {
    effectiveMax = effectiveMax !== null ? Math.min(effectiveMax, envMax) : envMax
  }

  const pages = await discoverPages(
    rootUrl,
    {
      maxPages: effectiveMax,
      delayMs: config.crawler.delayMs,
      userAgent: config.crawler.userAgent,
    },
    async (discovered) => {
      await crawlRepo.update(crawlId, { totalPages: discovered })
      await job.updateProgress(Math.min(discovered, 100))
    },
  )

  if (pages.length === 0) {
    await crawlRepo.update(crawlId, {
      status: 'completed',
      totalPages: 0,
      completedAt: new Date(),
    })
    console.log(`[Crawl] No pages found for ${rootUrl}`)
    return
  }

  await crawlRepo.update(crawlId, {
    totalPages: pages.length,
    status: 'scanning',
  })

  for (const page of pages) {
    const pageRecord = await pageRepo.findOrCreate({
      siteId,
      url: page.url,
      path: page.path,
      firstSeenCrawlId: crawlId,
    })

    const scan = await scanRepo.create({
      url: page.url,
      pageId: pageRecord.id,
      crawlId,
    })

    await pageScanQueue.add(`scan-${scan.id}`, {
      scanId: scan.id,
      url: page.url,
      crawlId,
      pageId: pageRecord.id,
      siteId,
    })
  }

  console.log(`[Crawl] Discovered ${pages.length} pages for ${rootUrl}, queued scans`)
}
