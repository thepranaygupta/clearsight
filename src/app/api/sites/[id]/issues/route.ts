import { NextResponse } from 'next/server'
import { prisma } from '@/modules/db/prisma'
import { parsePagination } from '@/lib/api-utils'

const VALID_SEVERITIES = ['critical', 'serious', 'moderate', 'minor']
const VALID_WCAG_LEVELS = ['A', 'AA', 'AAA']
const VALID_STATUSES = ['open', 'fixed', 'dismissed', 'cant_fix']

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: siteId } = await params
    const url = new URL(request.url)
    const { take, skip } = parsePagination(url.searchParams, { limit: 50 })

    const severity = url.searchParams.get('severity')
    const wcagLevel = url.searchParams.get('wcagLevel')
    const issueStatus = url.searchParams.get('status')
    const pageId = url.searchParams.get('pageId')

    // Validate enum values
    if (severity && !VALID_SEVERITIES.includes(severity)) {
      return NextResponse.json({ error: `Invalid severity. Must be one of: ${VALID_SEVERITIES.join(', ')}` }, { status: 400 })
    }
    if (wcagLevel && !VALID_WCAG_LEVELS.includes(wcagLevel)) {
      return NextResponse.json({ error: `Invalid wcagLevel. Must be one of: ${VALID_WCAG_LEVELS.join(', ')}` }, { status: 400 })
    }
    if (issueStatus && !VALID_STATUSES.includes(issueStatus)) {
      return NextResponse.json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` }, { status: 400 })
    }

    // Build where clause
    const where: Record<string, unknown> = {
      scan: { page: { siteId } },
    }

    if (severity) where.severity = severity
    if (wcagLevel) where.wcagLevel = wcagLevel
    if (issueStatus) where.issueStatus = issueStatus
    if (pageId) {
      where.scan = { ...(where.scan as Record<string, unknown>), pageId }
    }

    const [issues, total] = await Promise.all([
      prisma.issue.findMany({
        where,
        take,
        skip,
        orderBy: [
          { severity: 'asc' },
          { createdAt: 'desc' },
        ],
        include: {
          scan: { select: { url: true, pageId: true } },
        },
      }),
      prisma.issue.count({ where }),
    ])

    return NextResponse.json({ issues, total })
  } catch (error) {
    console.error('GET /api/sites/:id/issues error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
