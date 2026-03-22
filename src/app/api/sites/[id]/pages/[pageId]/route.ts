import { NextResponse } from 'next/server'
import { PrismaPageRepository } from '@/modules/db'

const pageRepo = new PrismaPageRepository()

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string; pageId: string }> },
) {
  const { pageId } = await params
  const page = await pageRepo.findById(pageId)
  if (!page) return NextResponse.json({ error: 'Page not found' }, { status: 404 })
  return NextResponse.json(page)
}
