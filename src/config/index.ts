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
}
