import express from 'express'
import { createBullBoard } from '@bull-board/api'
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { ExpressAdapter } from '@bull-board/express'
import { Queue } from 'bullmq'

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'
const PORT = parseInt(process.env.BULL_BOARD_PORT || '3001', 10)

const redisUrl = new URL(REDIS_URL)
const connection = {
  host: redisUrl.hostname,
  port: parseInt(redisUrl.port || '6379', 10),
}

const crawlQueue = new Queue('crawl-discovery', { connection })
const pageScanQueue = new Queue('page-scan', { connection })
const aiEnrichmentQueue = new Queue('ai-enrichment', { connection })

const serverAdapter = new ExpressAdapter()
serverAdapter.setBasePath('/')

createBullBoard({
  queues: [
    new BullMQAdapter(crawlQueue),
    new BullMQAdapter(pageScanQueue),
    new BullMQAdapter(aiEnrichmentQueue),
  ],
  serverAdapter,
})

const app = express()
app.use('/', serverAdapter.getRouter())

app.listen(PORT, () => {
  console.log(`[BullBoard] Running at http://localhost:${PORT}`)
})
