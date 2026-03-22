export interface DiscoveredPage {
  url: string
  path: string
}

export interface CrawlConfig {
  maxPages: number | null
  delayMs: number
  userAgent: string
}

export interface DiscoveryResult {
  pages: DiscoveredPage[]
  totalDiscovered: number
}
