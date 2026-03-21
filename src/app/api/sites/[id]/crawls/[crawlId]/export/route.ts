import { NextRequest, NextResponse } from 'next/server'
import { PrismaCrawlRepository } from '@/modules/db'
import { prisma } from '@/modules/db/prisma'
import { PDFReportGenerator, ExcelReportGenerator } from '@/modules/export'
import type { ExportFormat } from '@/modules/export'

const crawlRepo = new PrismaCrawlRepository()

// ─── GET /api/sites/:id/crawls/:crawlId/export?format=pdf|excel ────

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; crawlId: string }> },
) {
  try {
    const { crawlId } = await params
    const format = (request.nextUrl.searchParams.get('format') ||
      'pdf') as ExportFormat

    if (format !== 'pdf' && format !== 'excel') {
      return NextResponse.json(
        { error: 'Invalid format. Use "pdf" or "excel".' },
        { status: 400 },
      )
    }

    const crawl = await crawlRepo.findById(crawlId)

    if (!crawl) {
      return NextResponse.json({ error: 'Crawl not found' }, { status: 404 })
    }

    if (crawl.status !== 'completed') {
      return NextResponse.json(
        { error: 'Crawl is not complete yet' },
        { status: 400 },
      )
    }

    // Get the first completed scan with its issues and summary to use as the "representative" scan
    // For crawl-level export, we aggregate all issues across all scans
    const scans = await prisma.scan.findMany({
      where: {
        crawlId,
        status: { in: ['completed', 'completed_partial'] },
      },
      include: {
        issues: true,
        summary: true,
      },
      orderBy: { createdAt: 'asc' },
    })

    if (scans.length === 0) {
      return NextResponse.json(
        { error: 'No completed scans in this crawl' },
        { status: 400 },
      )
    }

    // Build an aggregated "scan" object for the export generator
    const allIssues = scans.flatMap((s) => s.issues)
    const firstScan = scans[0]

    // Use crawl-level score, fall back to first scan's summary
    const aggregatedScan = {
      ...firstScan,
      url: `https://${crawl.site?.hostname ?? 'site'}`,
      pageTitle: `${crawl.site?.hostname ?? 'Site'} — Full Crawl Report (${scans.length} pages)`,
      issues: allIssues,
      summary: firstScan.summary
        ? {
            ...firstScan.summary,
            overallScore: crawl.overallScore ?? firstScan.summary.overallScore,
            summary: `Full-site accessibility crawl of ${crawl.site?.hostname ?? 'site'} covering ${scans.length} pages. Found ${allIssues.length} total issues across all pages. Overall score: ${crawl.overallScore ?? 'N/A'}/100.`,
          }
        : null,
    }

    const generator =
      format === 'pdf' ? new PDFReportGenerator() : new ExcelReportGenerator()

    const buffer = await generator.generate({
      scan: aggregatedScan,
      executiveSummary: null,
    })

    const hostname = crawl.site?.hostname ?? 'site'
    const filename = `clearsight-crawl-${hostname}-${new Date().toISOString().slice(0, 10)}.${generator.fileExtension}`

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': generator.contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Crawl export error:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 },
    )
  }
}
