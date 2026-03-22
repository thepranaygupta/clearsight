import { NextRequest, NextResponse } from 'next/server'
import { PrismaSiteRepository, PrismaCrawlRepository } from '@/modules/db'
import { crawlQueue } from '@/modules/queue'
import { checkRateLimit } from '@/lib/rate-limit'
import { config } from '@/config'

const siteRepo = new PrismaSiteRepository()
const crawlRepo = new PrismaCrawlRepository()

const MAX_PAGES_LIMIT = 500

// ─── POST /api/sites/:id/crawl — Start a new crawl ───────────────────

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const site = await siteRepo.findById(id)
    if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 })

    // Rate limiting (reuse scan rate limiter)
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || '127.0.0.1'
    const rateLimit = checkRateLimit(ip)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)) } },
      )
    }

    // Check for active crawl (1 concurrent per site)
    const activeCrawl = await crawlRepo.findActiveCrawl(id)
    if (activeCrawl) {
      return NextResponse.json(
        { error: 'A crawl is already running for this site', crawlId: activeCrawl.id },
        { status: 409 },
      )
    }

    // Parse and validate maxPages
    let maxPages: number | null = null
    try {
      const body = await request.json()
      if (body.maxPages != null) {
        const parsed = parseInt(String(body.maxPages), 10)
        if (!isNaN(parsed) && parsed > 0) {
          maxPages = Math.min(parsed, MAX_PAGES_LIMIT)
        }
      }
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
  } catch (error) {
    console.error('POST /api/sites/:id/crawl error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
