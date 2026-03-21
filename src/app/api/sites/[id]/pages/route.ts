import { NextResponse } from 'next/server'
import { PrismaPageRepository } from '@/modules/db'
import { parsePagination } from '@/lib/api-utils'

const pageRepo = new PrismaPageRepository()

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const { take, skip } = parsePagination(new URL(request.url).searchParams, { limit: 50 })
    const { pages, total } = await pageRepo.findBySite(id, { take, skip })
    return NextResponse.json({ pages, total })
  } catch (error) {
    console.error('GET /api/sites/:id/pages error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
