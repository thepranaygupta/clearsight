import { NextResponse } from 'next/server'
import { PrismaSiteRepository, PrismaCrawlRepository } from '@/modules/db'
import { crawlQueue } from '@/modules/queue'
import { config } from '@/config'

const siteRepo = new PrismaSiteRepository()
const crawlRepo = new PrismaCrawlRepository()

// ─── POST /api/sites/:id/crawl — Start a new crawl ───────────────────

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const site = await siteRepo.findById(id)
  if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 })

  const activeCrawl = await crawlRepo.findActiveCrawl(id)
  if (activeCrawl) {
    return NextResponse.json(
      { error: 'A crawl is already running for this site', crawlId: activeCrawl.id },
      { status: 409 },
    )
  }

  let maxPages: number | null = null
  try {
    const body = await request.json()
    if (body.maxPages) maxPages = parseInt(body.maxPages, 10)
  } catch { /* no body is fine */ }

  const crawl = await crawlRepo.create({ siteId: id, maxPages })
  const rootUrl = `https://${site.hostname}`

  await crawlQueue.add(`crawl-${crawl.id}`, {
    crawlId: crawl.id,
    siteId: id,
    rootUrl,
    maxPages: maxPages ?? config.crawler.maxPages,
  })

  return NextResponse.json(crawl, { status: 201 })
}
