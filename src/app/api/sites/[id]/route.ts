import { NextResponse } from 'next/server'
import { PrismaSiteRepository } from '@/modules/db'

const siteRepo = new PrismaSiteRepository()

// ─── GET /api/sites/:id — Get site detail ─────────────────────────────

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const site = await siteRepo.findById(id)
  if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 })
  return NextResponse.json(site)
}

// ─── DELETE /api/sites/:id — Delete a site ────────────────────────────

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  try {
    await siteRepo.delete(id)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Site not found' }, { status: 404 })
  }
}
