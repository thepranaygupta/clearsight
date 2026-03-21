import { NextResponse } from 'next/server'
import { prisma } from '@/modules/db/prisma'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: siteId } = await params
  const url = new URL(request.url)

  const severity = url.searchParams.get('severity')
  const wcagLevel = url.searchParams.get('wcagLevel')
  const issueStatus = url.searchParams.get('status')
  const pageId = url.searchParams.get('pageId')
  const take = parseInt(url.searchParams.get('limit') || '50', 10)
  const skip = parseInt(url.searchParams.get('offset') || '0', 10)

  // Build where clause: issues belonging to scans of pages of this site
  const where: Record<string, unknown> = {
    scan: {
      page: { siteId },
    },
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
}
