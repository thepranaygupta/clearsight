import { NextResponse } from 'next/server'
import { prisma } from '@/modules/db/prisma'

const VALID_STATUSES = ['open', 'dismissed', 'cant_fix']

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; issueId: string }> },
) {
  try {
    const { id: siteId, issueId } = await params

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { issueStatus } = body as { issueStatus?: string }
    if (!issueStatus || !VALID_STATUSES.includes(issueStatus)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 },
      )
    }

    // Verify issue belongs to this site before updating
    const existing = await prisma.issue.findFirst({
      where: {
        id: issueId,
        scan: { page: { siteId } },
      },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
    }

    const issue = await prisma.issue.update({
      where: { id: issueId },
      data: { issueStatus: issueStatus as 'open' | 'dismissed' | 'cant_fix' },
    })

    return NextResponse.json(issue)
  } catch (error) {
    console.error('PATCH /api/sites/:id/issues/:issueId error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
