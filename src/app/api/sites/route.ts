import { NextResponse } from 'next/server'
import { PrismaSiteRepository } from '@/modules/db'
import { normalizeHostname } from '@/modules/crawler'

const siteRepo = new PrismaSiteRepository()

// ─── POST /api/sites — Create or find a site ─────────────────────────

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { url } = body
    if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 })

    const hostname = normalizeHostname(new URL(url).hostname)
    const site = await siteRepo.findOrCreate(hostname)
    return NextResponse.json(site, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }
}

// ─── GET /api/sites — List all sites ──────────────────────────────────

export async function GET() {
  const sites = await siteRepo.findMany()
  return NextResponse.json({ sites })
}
