import { NextRequest, NextResponse } from 'next/server'
import { PrismaScanRepository } from '@/modules/db'

const scanRepo = new PrismaScanRepository()

// ─── GET /api/scans/:id — Get scan by ID ────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const scan = await scanRepo.findById(id)

    if (!scan) {
      return NextResponse.json(
        { error: 'Scan not found' },
        { status: 404 }
      )
    }

    switch (scan.status) {
      case 'queued':
      case 'running':
        return NextResponse.json({
          id: scan.id,
          url: scan.url,
          status: scan.status,
          progress: scan.progress,
          currentStage: scan.currentStage,
          createdAt: scan.createdAt,
          updatedAt: scan.updatedAt,
        })

      case 'completed':
      case 'completed_partial':
        return NextResponse.json({
          id: scan.id,
          url: scan.url,
          status: scan.status,
          progress: scan.progress,
          currentStage: scan.currentStage,
          createdAt: scan.createdAt,
          updatedAt: scan.updatedAt,
          completedAt: scan.completedAt,
          pageTitle: scan.pageTitle,
          pageScreenshot: scan.pageScreenshot,
          issues: scan.issues,
          summary: scan.summary,
        })

      case 'failed':
        return NextResponse.json({
          id: scan.id,
          url: scan.url,
          status: scan.status,
          errorMessage: scan.errorMessage,
          createdAt: scan.createdAt,
          updatedAt: scan.updatedAt,
        })

      case 'cancelled':
        return NextResponse.json({
          id: scan.id,
          url: scan.url,
          status: scan.status,
          createdAt: scan.createdAt,
          updatedAt: scan.updatedAt,
        })

      default:
        return NextResponse.json(scan)
    }
  } catch (error) {
    console.error('GET /api/scans/[id] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
