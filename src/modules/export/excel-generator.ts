import ExcelJS from 'exceljs'
import type { ReportGenerator, ExportOptions } from './types'

const RED = 'FFE90029'
const DARK = 'FF1A1A1A'
const WHITE = 'FFFFFFFF'
const LIGHT_BG = 'FFF8F8F8'

const severityFills: Record<string, string> = {
  critical: 'FFDC2626',
  serious: 'FFEA580C',
  moderate: 'FFCA8A04',
  minor: 'FF3B82F6',
}

export class ExcelReportGenerator implements ReportGenerator {
  contentType =
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  fileExtension = 'xlsx'

  async generate(options: ExportOptions): Promise<Buffer> {
    const { scan, executiveSummary } = options
    const issues = scan.issues ?? []
    const summary = scan.summary

    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'ClearSight'
    workbook.created = new Date()

    // ─── Overview Sheet ───────────────────────────────────────────
    const overview = workbook.addWorksheet('Overview', {
      properties: { tabColor: { argb: RED } },
    })

    overview.columns = [
      { width: 24 },
      { width: 60 },
    ]

    // Title
    overview.mergeCells('A1:B1')
    const titleCell = overview.getCell('A1')
    titleCell.value = 'ClearSight — Accessibility Report'
    titleCell.font = { size: 16, bold: true, color: { argb: WHITE } }
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: DARK },
    }
    titleCell.alignment = { vertical: 'middle' }
    overview.getRow(1).height = 36

    // Info rows
    const infoRows = [
      ['URL', scan.url],
      ['Page Title', scan.pageTitle || 'N/A'],
      [
        'Scanned',
        scan.completedAt
          ? new Date(scan.completedAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })
          : 'N/A',
      ],
      ['Overall Score', summary ? `${summary.overallScore}/100` : 'N/A'],
      ['Total Issues', String(issues.length)],
      [
        'Confirmed',
        String(issues.filter((i) => i.type === 'confirmed').length),
      ],
      [
        'Potential',
        String(issues.filter((i) => i.type === 'potential').length),
      ],
      [
        'Critical',
        String(issues.filter((i) => i.severity === 'critical').length),
      ],
      [
        'Serious',
        String(issues.filter((i) => i.severity === 'serious').length),
      ],
      [
        'Moderate',
        String(issues.filter((i) => i.severity === 'moderate').length),
      ],
      [
        'Minor',
        String(issues.filter((i) => i.severity === 'minor').length),
      ],
    ]

    infoRows.forEach(([label, value], i) => {
      const row = overview.getRow(i + 3)
      row.getCell(1).value = label
      row.getCell(1).font = { bold: true, size: 10, color: { argb: DARK.slice(2) } }
      row.getCell(2).value = value
      row.getCell(2).font = { size: 10 }
      if (i % 2 === 0) {
        row.getCell(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: LIGHT_BG },
        }
        row.getCell(2).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: LIGHT_BG },
        }
      }
    })

    // Summary text
    if (summary) {
      const summaryStartRow = infoRows.length + 5
      overview.mergeCells(`A${summaryStartRow}:B${summaryStartRow}`)
      const summaryHeader = overview.getCell(`A${summaryStartRow}`)
      summaryHeader.value = 'Summary'
      summaryHeader.font = { size: 12, bold: true, color: { argb: RED.slice(2) } }

      overview.mergeCells(`A${summaryStartRow + 1}:B${summaryStartRow + 1}`)
      const summaryCell = overview.getCell(`A${summaryStartRow + 1}`)
      summaryCell.value = summary.summary
      summaryCell.font = { size: 10 }
      summaryCell.alignment = { wrapText: true }
      overview.getRow(summaryStartRow + 1).height = 60
    }

    // Executive summary from LLM
    if (executiveSummary) {
      const execRow = (summary ? infoRows.length + 8 : infoRows.length + 5)
      overview.mergeCells(`A${execRow}:B${execRow}`)
      const execHeader = overview.getCell(`A${execRow}`)
      execHeader.value = 'Executive Summary'
      execHeader.font = { size: 12, bold: true, color: { argb: RED.slice(2) } }

      overview.mergeCells(`A${execRow + 1}:B${execRow + 1}`)
      const execCell = overview.getCell(`A${execRow + 1}`)
      execCell.value = executiveSummary
      execCell.font = { size: 10 }
      execCell.alignment = { wrapText: true }
      overview.getRow(execRow + 1).height = 120
    }

    // ─── Issues Sheet ─────────────────────────────────────────────
    const issuesSheet = workbook.addWorksheet('Issues', {
      properties: { tabColor: { argb: 'FFDC2626' } },
    })

    const headers = [
      'Type',
      'Severity',
      'WCAG Criterion',
      'WCAG Level',
      'Description',
      'Element Selector',
      'Element HTML',
      'Fix Suggestion',
      'Confidence',
      'Axe Rule ID',
    ]

    issuesSheet.columns = [
      { header: headers[0], key: 'type', width: 12 },
      { header: headers[1], key: 'severity', width: 12 },
      { header: headers[2], key: 'wcagCriterion', width: 14 },
      { header: headers[3], key: 'wcagLevel', width: 10 },
      { header: headers[4], key: 'description', width: 50 },
      { header: headers[5], key: 'elementSelector', width: 30 },
      { header: headers[6], key: 'elementHtml', width: 40 },
      { header: headers[7], key: 'fixSuggestion', width: 50 },
      { header: headers[8], key: 'confidence', width: 12 },
      { header: headers[9], key: 'axeRuleId', width: 16 },
    ]

    // Header styling
    const headerRow = issuesSheet.getRow(1)
    headerRow.height = 28
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, size: 10, color: { argb: WHITE.slice(2) } }
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: DARK },
      }
      cell.alignment = { vertical: 'middle' }
    })

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
      const row = issuesSheet.addRow({
        type: issue.type,
        severity: issue.severity,
        wcagCriterion: issue.wcagCriterion,
        wcagLevel: issue.wcagLevel,
        description: issue.description,
        elementSelector: issue.elementSelector,
        elementHtml: issue.elementHtml,
        fixSuggestion: issue.fixSuggestion,
        confidence:
          issue.confidenceScore != null
            ? `${Math.round(issue.confidenceScore * 100)}%`
            : '',
        axeRuleId: issue.axeRuleId || '',
      })

      row.alignment = { wrapText: true, vertical: 'top' }
      row.font = { size: 9 }

      // Severity cell coloring
      const sevCell = row.getCell('severity')
      const sevColor = severityFills[issue.severity]
      if (sevColor) {
        sevCell.font = {
          bold: true,
          size: 9,
          color: { argb: WHITE.slice(2) },
        }
        sevCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: sevColor },
        }
      }
    })

    // Auto-filter
    issuesSheet.autoFilter = {
      from: 'A1',
      to: `J${sorted.length + 1}`,
    }

    // Freeze header
    issuesSheet.views = [{ state: 'frozen', ySplit: 1 }]

    // ─── Priorities Sheet ─────────────────────────────────────────
    if (
      summary?.topPriorities &&
      (summary.topPriorities as Array<{ title: string; reason: string }>).length > 0
    ) {
      const prioritiesSheet = workbook.addWorksheet('Priorities', {
        properties: { tabColor: { argb: RED } },
      })

      prioritiesSheet.columns = [
        { header: '#', key: 'num', width: 6 },
        { header: 'Priority', key: 'title', width: 40 },
        { header: 'Reason', key: 'reason', width: 60 },
      ]

      const pHeaderRow = prioritiesSheet.getRow(1)
      pHeaderRow.height = 28
      pHeaderRow.eachCell((cell) => {
        cell.font = { bold: true, size: 10, color: { argb: WHITE.slice(2) } }
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: RED },
        }
        cell.alignment = { vertical: 'middle' }
      })

      const priorities = summary.topPriorities as Array<{
        title: string
        reason: string
      }>

      priorities.forEach((p, i) => {
        const row = prioritiesSheet.addRow({
          num: i + 1,
          title: p.title,
          reason: p.reason,
        })
        row.alignment = { wrapText: true, vertical: 'top' }
        row.font = { size: 10 }
      })
    }

    // ─── Positive Findings Sheet ──────────────────────────────────
    if (
      summary?.positiveFindings &&
      (summary.positiveFindings as Array<{ category: string; detail: string }>).length > 0
    ) {
      const posSheet = workbook.addWorksheet('Positive Findings', {
        properties: { tabColor: { argb: 'FF16A34A' } },
      })

      posSheet.columns = [
        { header: 'Category', key: 'category', width: 24 },
        { header: 'Detail', key: 'detail', width: 60 },
      ]

      const posHeaderRow = posSheet.getRow(1)
      posHeaderRow.height = 28
      posHeaderRow.eachCell((cell) => {
        cell.font = { bold: true, size: 10, color: { argb: WHITE.slice(2) } }
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF16A34A' },
        }
        cell.alignment = { vertical: 'middle' }
      })

      const findings = summary.positiveFindings as Array<{
        category: string
        detail: string
      }>

      findings.forEach((f) => {
        const row = posSheet.addRow({
          category: f.category,
          detail: f.detail,
        })
        row.alignment = { wrapText: true, vertical: 'top' }
        row.font = { size: 10 }
      })
    }

    const buffer = await workbook.xlsx.writeBuffer()
    return Buffer.from(buffer)
  }
}
