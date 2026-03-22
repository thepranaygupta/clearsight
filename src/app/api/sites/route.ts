import { NextResponse } from 'next/server'
import { PrismaSiteRepository } from '@/modules/db'
import { normalizeHostname } from '@/modules/crawler'
import { validateUrl } from '@/lib/url-validation'

const siteRepo = new PrismaSiteRepository()

// ─── POST /api/sites — Create or find a site ─────────────────────────

export async function POST(request: Request) {
  try {
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { url } = body as { url?: string }
    if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 })

    // Validate URL format and block private IPs (SSRF prevention)
    const validation = validateUrl(url)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const hostname = normalizeHostname(new URL(url).hostname)
    const site = await siteRepo.findOrCreate(hostname)
    return NextResponse.json(site, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }
}

// ─── GET /api/sites — List all sites ──────────────────────────────────

export async function GET() {
  try {
    const sites = await siteRepo.findMany()
    return NextResponse.json({ sites })
  } catch (error) {
    console.error('GET /api/sites error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
