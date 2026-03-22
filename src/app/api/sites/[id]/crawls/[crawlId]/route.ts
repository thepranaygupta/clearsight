import { NextResponse } from 'next/server'
import { PrismaCrawlRepository } from '@/modules/db'

const crawlRepo = new PrismaCrawlRepository()

// ─── GET /api/sites/:id/crawls/:crawlId — Get crawl detail ───────────

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string; crawlId: string }> },
) {
  const { crawlId } = await params
  const crawl = await crawlRepo.findById(crawlId)
  if (!crawl) return NextResponse.json({ error: 'Crawl not found' }, { status: 404 })
  return NextResponse.json(crawl)
}
