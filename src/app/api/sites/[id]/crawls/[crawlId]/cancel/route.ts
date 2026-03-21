import { NextResponse } from 'next/server'
import { PrismaCrawlRepository } from '@/modules/db'

const crawlRepo = new PrismaCrawlRepository()

// ─── POST /api/sites/:id/crawls/:crawlId/cancel — Cancel a crawl ─────

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string; crawlId: string }> },
) {
  const { crawlId } = await params
  const crawl = await crawlRepo.findById(crawlId)

  if (!crawl) return NextResponse.json({ error: 'Crawl not found' }, { status: 404 })
  if (crawl.status === 'completed' || crawl.status === 'cancelled' || crawl.status === 'failed') {
    return NextResponse.json({ error: 'Crawl is not active' }, { status: 400 })
  }

  await crawlRepo.update(crawlId, { status: 'cancelled' })
  return NextResponse.json({ success: true })
}
