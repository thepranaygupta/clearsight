import type { EnrichedIssue, PageContext } from '../types'

export interface GenerateSummaryPrompt {
  system: string
  user: string
}

export function buildGenerateSummaryPrompt(
  issues: EnrichedIssue[],
  pageContext: PageContext,
): GenerateSummaryPrompt {
  const confirmedCount = issues.filter((i) => i.type === 'confirmed').length
  const potentialCount = issues.filter((i) => i.type === 'potential').length

  const severityCounts = {
    critical: issues.filter((i) => i.severity === 'critical').length,
    serious: issues.filter((i) => i.severity === 'serious').length,
    moderate: issues.filter((i) => i.severity === 'moderate').length,
    minor: issues.filter((i) => i.severity === 'minor').length,
  }

  const system = `You are an expert web accessibility consultant generating an executive summary of an accessibility audit. Your audience includes both technical developers and non-technical stakeholders.

Rules:
1. Calculate an overall accessibility score from 0 to 100 where:
   - 100 means no issues found
   - Each critical issue deducts ~8-12 points
   - Each serious issue deducts ~4-6 points
   - Each moderate issue deducts ~2-3 points
   - Each minor issue deducts ~1 point
   - The score should never go below 0
   - Adjust based on the ratio of issues to total DOM elements (more elements = lower per-issue impact)
2. Write a plain-English summary (2-4 sentences) that a non-technical person can understand. Mention the most impactful issues and their effect on real users.
3. Identify the top 5 (or fewer) priorities to fix first, ordered by impact. For each priority, provide:
   - An issueId matching one of the enriched issues' ruleId
   - A short title describing the issue
   - A reason explaining why it should be fixed first
4. Identify positive findings -- things the page does well for accessibility (e.g., good heading structure, proper landmarks, sufficient color contrast). List at least 1, up to 5. If nothing positive is found, note that the page has room for improvement.

You MUST respond with valid JSON. Do not include any text outside the JSON.`

  const user = `## Page Context
- URL: ${pageContext.url}
- Title: ${pageContext.title}
- Meta Description: ${pageContext.metaDescription}
- Total DOM Elements: ${pageContext.totalElements}

## Issue Statistics
- Total issues: ${issues.length}
- Confirmed: ${confirmedCount}
- Potential: ${potentialCount}
- Critical: ${severityCounts.critical}
- Serious: ${severityCounts.serious}
- Moderate: ${severityCounts.moderate}
- Minor: ${severityCounts.minor}

## Enriched Issues
${JSON.stringify(issues, null, 2)}

## Required Output Format
Respond with a JSON object matching this schema:
\`\`\`json
{
  "overallScore": "number (0-100)",
  "summary": "string (2-4 sentence plain-English overview)",
  "topPriorities": [
    {
      "issueId": "string (matching a ruleId from the issues)",
      "title": "string (short description)",
      "reason": "string (why fix this first)"
    }
  ],
  "positiveFindings": [
    {
      "category": "string (e.g., 'Heading Structure', 'Color Contrast')",
      "detail": "string (what the page does well)"
    }
  ]
}
\`\`\`

Return ONLY the JSON object, no surrounding text or markdown.`

  return { system, user }
}
