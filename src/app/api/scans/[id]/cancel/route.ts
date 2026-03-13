import { NextRequest, NextResponse } from 'next/server'
import { PrismaScanRepository } from '@/modules/db'
import type { ScanStatus } from '@/generated/prisma/client'

const scanRepo = new PrismaScanRepository()

const TERMINAL_STATUSES: ScanStatus[] = ['completed', 'completed_partial', 'failed', 'cancelled']

// ─── POST /api/scans/:id/cancel — Cancel a scan ────────────────────

export async function POST(
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

    if (TERMINAL_STATUSES.includes(scan.status)) {
      return NextResponse.json(
        { error: `Scan cannot be cancelled because it is already ${scan.status}` },
        { status: 400 }
      )
    }

    const updated = await scanRepo.updateStatus(id, { status: 'cancelled' })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('POST /api/scans/[id]/cancel error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
