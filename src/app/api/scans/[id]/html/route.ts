import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/modules/db/prisma'

// GET /api/scans/:id/html — Return the captured page HTML for the inspector
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const scan = await prisma.scan.findUnique({
      where: { id },
      select: { pageHtml: true, status: true },
    })

    if (!scan) {
      return NextResponse.json({ error: 'Scan not found' }, { status: 404 })
    }

    if (scan.status !== 'completed' && scan.status !== 'completed_partial') {
      return NextResponse.json({ error: 'Scan not complete' }, { status: 400 })
    }

    if (!scan.pageHtml) {
      return NextResponse.json({ error: 'No HTML available' }, { status: 404 })
    }

    return new NextResponse(scan.pageHtml, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  } catch (error) {
    console.error('GET /api/scans/[id]/html error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
