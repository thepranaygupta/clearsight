export interface ReportNarrativePrompt {
  system: string
  user: string
}

interface ReportInput {
  url: string
  pageTitle: string | null
  scannedAt: string
  overallScore: number
  summary: string
  confirmedCount: number
  potentialCount: number
  criticalCount: number
  seriousCount: number
  moderateCount: number
  minorCount: number
  topPriorities: Array<{ title: string; reason: string }>
  positiveFindings: Array<{ category: string; detail: string }>
}

export function buildReportNarrativePrompt(
  input: ReportInput,
): ReportNarrativePrompt {
  const system = `You are an expert accessibility consultant writing the executive summary section of a formal WCAG 2.1 compliance report. Your audience is executives, product managers, and legal/compliance teams who may not be technical.

Write a 3-5 paragraph executive narrative that:
1. Opens with the page scanned, the date, and the overall compliance posture (score).
2. Summarizes the most critical risks in business terms — what real users with disabilities cannot do.
3. Highlights what the site does well (positive findings).
4. Ends with a clear recommendation paragraph on next steps.

Guidelines:
- Use professional, clear language. No jargon without explanation.
- Be specific about impact: "Screen reader users cannot navigate the page" is better than "heading structure issues exist".
- Keep it under 400 words.
- Do NOT use markdown formatting — output plain text with paragraph breaks only.
- Do NOT include a title or heading — just the body paragraphs.`

  const user = `## Scan Data
- URL: ${input.url}
- Page Title: ${input.pageTitle || 'N/A'}
- Scanned: ${input.scannedAt}
- Overall Score: ${input.overallScore}/100

## Issue Breakdown
- Confirmed violations: ${input.confirmedCount}
- Potential issues: ${input.potentialCount}
- Critical: ${input.criticalCount} | Serious: ${input.seriousCount} | Moderate: ${input.moderateCount} | Minor: ${input.minorCount}

## Existing Summary
${input.summary}

## Top Priorities
${input.topPriorities.map((p, i) => `${i + 1}. ${p.title} — ${p.reason}`).join('\n')}

## Positive Findings
${input.positiveFindings.map((f) => `- ${f.category}: ${f.detail}`).join('\n')}

Write the executive narrative now. Plain text only, no markdown.`

  return { system, user }
}
