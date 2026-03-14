import PDFDocument from 'pdfkit'
import type { ReportGenerator, ExportOptions } from './types'

// Brand color
const RED = '#E90029'
const DARK = '#1a1a1a'
const GRAY = '#666666'
const LIGHT_GRAY = '#999999'
const BG_GRAY = '#f5f5f5'

const severityColors: Record<string, string> = {
  critical: '#dc2626',
  serious: '#ea580c',
  moderate: '#ca8a04',
  minor: '#3b82f6',
}

function scoreColor(score: number): string {
  if (score >= 80) return '#16a34a'
  if (score >= 50) return '#ca8a04'
  return '#dc2626'
}

export class PDFReportGenerator implements ReportGenerator {
  contentType = 'application/pdf'
  fileExtension = 'pdf'

  async generate(options: ExportOptions): Promise<Buffer> {
    const { scan, executiveSummary } = options
    const issues = scan.issues ?? []
    const summary = scan.summary

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
        bufferPages: true,
        info: {
          Title: `Accessibility Report — ${scan.url}`,
          Author: 'ClearSight',
          Subject: 'WCAG 2.1 Compliance Report',
        },
      })

      const chunks: Uint8Array[] = []
      doc.on('data', (chunk: Uint8Array) => chunks.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      const pageWidth = doc.page.width - 100 // margins

      // ─── Cover / Header ─────────────────────────────────────────
      doc
        .rect(0, 0, doc.page.width, 140)
        .fill(DARK)

      doc
        .font('Helvetica-Bold')
        .fontSize(22)
        .fillColor('#ffffff')
        .text('ClearSight', 50, 40)

      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor('#cccccc')
        .text('WCAG 2.1 Level A & AA Compliance Report', 50, 68)

      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor('#cccccc')
        .text(
          `Generated ${new Date().toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}`,
          50,
          85,
          { align: 'left' },
        )

      // Score badge
      if (summary) {
        const scoreStr = String(summary.overallScore)
        doc
          .roundedRect(doc.page.width - 150, 35, 100, 60, 8)
          .fill(scoreColor(summary.overallScore))

        doc
          .font('Helvetica-Bold')
          .fontSize(28)
          .fillColor('#ffffff')
          .text(scoreStr, doc.page.width - 150, 42, {
            width: 100,
            align: 'center',
          })

        doc
          .font('Helvetica')
          .fontSize(8)
          .fillColor('#ffffff')
          .text('/100', doc.page.width - 150, 72, {
            width: 100,
            align: 'center',
          })
      }

      // ─── Page Info ──────────────────────────────────────────────
      let y = 160

      doc
        .font('Helvetica-Bold')
        .fontSize(11)
        .fillColor(DARK)
        .text('Page Scanned', 50, y)

      y += 18
      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor(GRAY)
        .text(scan.url, 50, y, { width: pageWidth })

      if (scan.pageTitle) {
        y += 16
        doc.text(scan.pageTitle, 50, y, { width: pageWidth })
      }

      y += 16
      doc.text(
        `Completed: ${
          scan.completedAt
            ? new Date(scan.completedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })
            : 'N/A'
        }`,
        50,
        y,
        { width: pageWidth },
      )

      // ─── Quick Stats ────────────────────────────────────────────
      y += 35

      const confirmed = issues.filter((i) => i.type === 'confirmed').length
      const potential = issues.filter((i) => i.type === 'potential').length
      const critical = issues.filter((i) => i.severity === 'critical').length

      const statBoxWidth = (pageWidth - 20) / 3

      // Stat boxes
      const stats = [
        { label: 'Confirmed', value: String(confirmed), color: DARK },
        { label: 'Potential', value: String(potential), color: DARK },
        { label: 'Critical', value: String(critical), color: severityColors.critical },
      ]

      stats.forEach((stat, i) => {
        const x = 50 + i * (statBoxWidth + 10)
        doc.roundedRect(x, y, statBoxWidth, 50, 4).fill(BG_GRAY)

        doc
          .font('Helvetica-Bold')
          .fontSize(20)
          .fillColor(stat.color)
          .text(stat.value, x, y + 8, { width: statBoxWidth, align: 'center' })

        doc
          .font('Helvetica')
          .fontSize(8)
          .fillColor(LIGHT_GRAY)
          .text(stat.label, x, y + 34, { width: statBoxWidth, align: 'center' })
      })

      y += 70

      // ─── Executive Summary (LLM-generated) ──────────────────────
      if (executiveSummary) {
        doc
          .font('Helvetica-Bold')
          .fontSize(13)
          .fillColor(RED)
          .text('Executive Summary', 50, y)

        y += 22
        doc
          .font('Helvetica')
          .fontSize(10)
          .fillColor(DARK)
          .text(executiveSummary, 50, y, {
            width: pageWidth,
            lineGap: 4,
          })

        y = doc.y + 25
      }

      // ─── Summary from scan ──────────────────────────────────────
      if (summary) {
        if (!executiveSummary) {
          this.sectionHeading(doc, 'Summary', y)
          y += 22
          doc
            .font('Helvetica')
            .fontSize(10)
            .fillColor(DARK)
            .text(summary.summary, 50, y, {
              width: pageWidth,
              lineGap: 4,
            })
          y = doc.y + 20
        }

        // Top priorities
        if (summary.topPriorities && (summary.topPriorities as Array<{ title: string; reason: string }>).length > 0) {
          if (y > 650) {
            doc.addPage()
            y = 50
          }

          this.sectionHeading(doc, 'Top Priorities', y)
          y += 22

          const priorities = summary.topPriorities as Array<{
            title: string
            reason: string
          }>

          priorities.forEach((p, i) => {
            if (y > 720) {
              doc.addPage()
              y = 50
            }

            // Number circle
            doc.circle(62, y + 7, 8).fill(RED)
            doc
              .font('Helvetica-Bold')
              .fontSize(9)
              .fillColor('#ffffff')
              .text(String(i + 1), 54, y + 3, { width: 16, align: 'center' })

            doc
              .font('Helvetica-Bold')
              .fontSize(10)
              .fillColor(DARK)
              .text(p.title, 78, y, { width: pageWidth - 28 })

            y = doc.y + 2
            doc
              .font('Helvetica')
              .fontSize(9)
              .fillColor(GRAY)
              .text(p.reason, 78, y, { width: pageWidth - 28 })

            y = doc.y + 12
          })
        }

        // Positive findings
        if (summary.positiveFindings && (summary.positiveFindings as Array<{ category: string; detail: string }>).length > 0) {
          if (y > 650) {
            doc.addPage()
            y = 50
          }

          this.sectionHeading(doc, 'Positive Findings', y)
          y += 22

          const findings = summary.positiveFindings as Array<{
            category: string
            detail: string
          }>

          findings.forEach((f) => {
            if (y > 720) {
              doc.addPage()
              y = 50
            }

            doc
              .font('Helvetica-Bold')
              .fontSize(9)
              .fillColor('#16a34a')
              .text(`✓ ${f.category}`, 50, y, { continued: true })
              .font('Helvetica')
              .fillColor(GRAY)
              .text(` — ${f.detail}`, { width: pageWidth })

            y = doc.y + 8
          })
        }
      }

      // ─── Issues Detail ──────────────────────────────────────────
      if (issues.length > 0) {
        doc.addPage()
        y = 50

        this.sectionHeading(doc, `Issues (${issues.length})`, y)
        y += 25

        // Sort: critical first
        const sorted = [...issues].sort((a, b) => {
          const order: Record<string, number> = {
            critical: 0,
            serious: 1,
            moderate: 2,
            minor: 3,
          }
          return (order[a.severity] ?? 4) - (order[b.severity] ?? 4)
        })

        sorted.forEach((issue) => {
          if (y > 680) {
            doc.addPage()
            y = 50
          }

          const sevColor = severityColors[issue.severity] || GRAY

          // Severity + WCAG badge line
          doc
            .roundedRect(50, y, 60, 14, 3)
            .fill(sevColor)

          doc
            .font('Helvetica-Bold')
            .fontSize(7)
            .fillColor('#ffffff')
            .text(issue.severity.toUpperCase(), 50, y + 3, {
              width: 60,
              align: 'center',
            })

          doc
            .font('Helvetica')
            .fontSize(8)
            .fillColor(LIGHT_GRAY)
            .text(
              `${issue.wcagCriterion} Level ${issue.wcagLevel}${
                issue.type === 'potential' && issue.confidenceScore != null
                  ? ` • ${Math.round(issue.confidenceScore * 100)}% confidence`
                  : ''
              }`,
              118,
              y + 3,
            )

          y += 22

          // Description
          doc
            .font('Helvetica')
            .fontSize(9)
            .fillColor(DARK)
            .text(issue.description, 50, y, {
              width: pageWidth,
              lineGap: 2,
            })

          y = doc.y + 6

          // Element
          if (issue.elementSelector) {
            doc
              .font('Helvetica')
              .fontSize(7)
              .fillColor(LIGHT_GRAY)
              .text(`Selector: ${issue.elementSelector}`, 50, y, {
                width: pageWidth,
              })
            y = doc.y + 4
          }

          // Fix suggestion
          if (issue.fixSuggestion) {
            doc
              .font('Helvetica-Bold')
              .fontSize(8)
              .fillColor('#b45309')
              .text('Fix: ', 50, y, { continued: true })
              .font('Helvetica')
              .fontSize(8)
              .fillColor(GRAY)
              .text(issue.fixSuggestion, { width: pageWidth - 20 })
            y = doc.y + 6
          }

          // Separator
          y += 6
          doc
            .moveTo(50, y)
            .lineTo(50 + pageWidth, y)
            .strokeColor('#e5e5e5')
            .lineWidth(0.5)
            .stroke()

          y += 12
        })
      }

      // ─── Footer on all pages ────────────────────────────────────
      const pages = doc.bufferedPageRange()
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i)
        doc
          .font('Helvetica')
          .fontSize(7)
          .fillColor(LIGHT_GRAY)
          .text(
            `ClearSight Accessibility Report • Page ${i + 1} of ${pages.count}`,
            50,
            doc.page.height - 35,
            { width: pageWidth, align: 'center', lineBreak: false, height: 20 },
          )
      }

      doc.end()
    })
  }

  private sectionHeading(doc: PDFKit.PDFDocument, title: string, y: number) {
    doc
      .font('Helvetica-Bold')
      .fontSize(13)
      .fillColor(RED)
      .text(title, 50, y)

    doc
      .moveTo(50, y + 18)
      .lineTo(150, y + 18)
      .strokeColor(RED)
      .lineWidth(1.5)
      .stroke()
  }
}
