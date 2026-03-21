import { NextResponse } from 'next/server'
import { PrismaPageRepository } from '@/modules/db'

const pageRepo = new PrismaPageRepository()

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const url = new URL(request.url)
  const take = parseInt(url.searchParams.get('limit') || '50', 10)
  const skip = parseInt(url.searchParams.get('offset') || '0', 10)

  const { pages, total } = await pageRepo.findBySite(id, { take, skip })
  return NextResponse.json({ pages, total })
}
