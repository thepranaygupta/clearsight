import { NextResponse } from 'next/server'
import { PrismaCrawlRepository } from '@/modules/db'
import { parsePagination } from '@/lib/api-utils'

const crawlRepo = new PrismaCrawlRepository()

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const { take, skip } = parsePagination(new URL(request.url).searchParams)
    const { crawls, total } = await crawlRepo.findBySite(id, { take, skip })
    return NextResponse.json({ crawls, total })
  } catch (error) {
    console.error('GET /api/sites/:id/crawls error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
