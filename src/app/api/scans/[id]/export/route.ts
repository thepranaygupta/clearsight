import { NextRequest, NextResponse } from 'next/server'
import { PrismaScanRepository } from '@/modules/db'
import { PDFReportGenerator, ExcelReportGenerator } from '@/modules/export'
import type { ExportFormat } from '@/modules/export'
import { config } from '@/config'
import { buildReportNarrativePrompt } from '@/modules/ai/prompts/report-narrative'

const scanRepo = new PrismaScanRepository()

interface AzureOpenAIResponse {
  choices: Array<{
    message: { content: string }
    finish_reason: string
  }>
}

async function generateExecutiveSummary(
  scan: NonNullable<Awaited<ReturnType<typeof scanRepo.findById>>>,
): Promise<string | null> {
  const summary = scan.summary
  if (!summary) return null

  const issues = scan.issues ?? []
  const topPriorities = (summary.topPriorities ?? []) as Array<{
    title: string
    reason: string
  }>
  const positiveFindings = (summary.positiveFindings ?? []) as Array<{
    category: string
    detail: string
  }>

  try {
    const { system, user } = buildReportNarrativePrompt({
      url: scan.url,
      pageTitle: scan.pageTitle,
      scannedAt: scan.completedAt
        ? new Date(scan.completedAt).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })
        : 'N/A',
      overallScore: summary.overallScore,
      summary: summary.summary,
      confirmedCount: issues.filter((i) => i.type === 'confirmed').length,
      potentialCount: issues.filter((i) => i.type === 'potential').length,
      criticalCount: issues.filter((i) => i.severity === 'critical').length,
      seriousCount: issues.filter((i) => i.severity === 'serious').length,
      moderateCount: issues.filter((i) => i.severity === 'moderate').length,
      minorCount: issues.filter((i) => i.severity === 'minor').length,
      topPriorities,
      positiveFindings,
    })

    const response = await fetch(config.ai.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': config.ai.apiKey,
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: 0.3,
        max_tokens: 2048,
      }),
    })

    if (!response.ok) {
      console.error('LLM narrative generation failed:', response.status)
      return null
    }

    const data = (await response.json()) as AzureOpenAIResponse
    return data.choices?.[0]?.message?.content?.trim() ?? null
  } catch (error) {
    console.error('Failed to generate executive summary:', error)
    return null
  }
}

// ─── GET /api/scans/:id/export?format=pdf|excel ──────────────────

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const format = (request.nextUrl.searchParams.get('format') ||
      'pdf') as ExportFormat

    if (format !== 'pdf' && format !== 'excel') {
      return NextResponse.json(
        { error: 'Invalid format. Use "pdf" or "excel".' },
        { status: 400 },
      )
    }

    const scan = await scanRepo.findById(id)

    if (!scan) {
      return NextResponse.json({ error: 'Scan not found' }, { status: 404 })
    }

    if (scan.status !== 'completed' && scan.status !== 'completed_partial') {
      return NextResponse.json(
        { error: 'Scan is not complete yet' },
        { status: 400 },
      )
    }

    // Generate LLM executive summary in parallel with nothing — it's the bottleneck
    const executiveSummary = await generateExecutiveSummary(scan)

    const generator =
      format === 'pdf' ? new PDFReportGenerator() : new ExcelReportGenerator()

    const buffer = await generator.generate({ scan, executiveSummary })

    let hostname = scan.url
    try {
      hostname = new URL(scan.url).hostname
    } catch {
      // keep raw
    }

    const filename = `clearsight-${hostname}-${new Date().toISOString().slice(0, 10)}.${generator.fileExtension}`

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': generator.contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 },
    )
  }
}
