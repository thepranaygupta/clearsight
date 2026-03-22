import { NextRequest, NextResponse } from 'next/server'
import { PrismaScanRepository } from '@/modules/db'
import { pageScanQueue } from '@/modules/queue'
import { validateUrl } from '@/lib/url-validation'
import { checkRateLimit } from '@/lib/rate-limit'

const scanRepo = new PrismaScanRepository()

// ─── POST /api/scans — Create a new scan ────────────────────────────

export async function POST(request: NextRequest) {
  try {
    // Parse body
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      )
    }

    const { url } = body as { url?: string }

    // Validate URL
    const validation = validateUrl(url as string)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Rate limiting
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || '127.0.0.1'
    const rateLimit = checkRateLimit(ip)

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': String(rateLimit.remaining),
            'X-RateLimit-Reset': String(rateLimit.resetAt),
            'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)),
          },
        }
      )
    }

    // Create scan and enqueue via BullMQ
    const scan = await scanRepo.create({ url: url!.trim() })

    await pageScanQueue.add(`scan-${scan.id}`, {
      scanId: scan.id,
      url: scan.url,
    })

    return NextResponse.json(scan, {
      status: 201,
      headers: {
        'X-RateLimit-Remaining': String(rateLimit.remaining),
        'X-RateLimit-Reset': String(rateLimit.resetAt),
      },
    })
  } catch (error) {
    console.error('POST /api/scans error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ─── GET /api/scans — List scans ────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl

    // Parse and clamp pagination params
    const limitParam = parseInt(searchParams.get('limit') || '20', 10)
    const offsetParam = parseInt(searchParams.get('offset') || '0', 10)

    const limit = Math.min(Math.max(isNaN(limitParam) ? 20 : limitParam, 1), 100)
    const offset = Math.max(isNaN(offsetParam) ? 0 : offsetParam, 0)

    const result = await scanRepo.findMany({
      take: limit,
      skip: offset,
      orderBy: 'createdAt',
      order: 'desc',
    })

    return NextResponse.json({
      scans: result.scans,
      total: result.total,
    })
  } catch (error) {
    console.error('GET /api/scans error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
