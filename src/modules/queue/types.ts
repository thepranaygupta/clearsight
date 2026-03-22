export interface CrawlJobData {
  crawlId: string
  siteId: string
  rootUrl: string
  maxPages: number | null
}

export interface PageScanJobData {
  scanId: string
  url: string
  crawlId?: string
  pageId?: string
  siteId?: string
}

export interface AiEnrichmentJobData {
  scanId: string
  crawlId?: string
  siteId?: string
}

export const QUEUE_NAMES = {
  CRAWL_DISCOVERY: 'crawl-discovery',
  PAGE_SCAN: 'page-scan',
  AI_ENRICHMENT: 'ai-enrichment',
} as const
