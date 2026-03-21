import { NextResponse } from 'next/server'
import { prisma } from '@/modules/db/prisma'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; issueId: string }> },
) {
  const { issueId } = await params
  const body = await request.json()
  const { issueStatus } = body

  const valid = ['open', 'dismissed', 'cant_fix']
  if (!valid.includes(issueStatus)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const issue = await prisma.issue.update({
    where: { id: issueId },
    data: { issueStatus },
  })

  return NextResponse.json(issue)
}
