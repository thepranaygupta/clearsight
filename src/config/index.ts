export const config = {
  db: { url: process.env.DATABASE_URL! },
  ai: {
    endpoint: process.env.AZURE_OPENAI_ENDPOINT!,
    apiKey: process.env.AZURE_OPENAI_API_KEY!,
    apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2025-01-01-preview',
  },
  scanner: {
    navigationTimeout: 30000,
    maxRedirects: 5,
    maxElements: 5000,
  },
  worker: {
    pollIntervalMs: 2000,
    staleCheckIntervalMs: 60000,
    staleThresholdMs: 120000,
    maxRetries: 3,
  },
  rateLimit: {
    maxScansPerHour: 10,
    windowMs: 3600000,
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  crawler: {
    maxPages: process.env.MAX_CRAWL_PAGES ? parseInt(process.env.MAX_CRAWL_PAGES, 10) : null,
    delayMs: parseInt(process.env.CRAWL_DELAY_MS || '200', 10),
    userAgent: 'ClearSight/1.0 Accessibility Scanner',
  },
  workerConcurrency: {
    pageScan: parseInt(process.env.WORKER_CONCURRENCY || '3', 10),
    aiEnrichment: parseInt(process.env.AI_CONCURRENCY || '2', 10),
  },
  bullBoard: {
    port: parseInt(process.env.BULL_BOARD_PORT || '3001', 10),
  },
}
