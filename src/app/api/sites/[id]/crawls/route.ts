import { NextResponse } from 'next/server'
import { PrismaCrawlRepository } from '@/modules/db'

const crawlRepo = new PrismaCrawlRepository()

// ─── GET /api/sites/:id/crawls — List crawls for a site ──────────────

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const url = new URL(request.url)
  const take = parseInt(url.searchParams.get('limit') || '20', 10)
  const skip = parseInt(url.searchParams.get('offset') || '0', 10)

  const { crawls, total } = await crawlRepo.findBySite(id, { take, skip })
  return NextResponse.json({ crawls, total })
}
