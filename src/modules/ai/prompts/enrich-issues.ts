import type { RawFinding } from '../../scanner/types'
import type { PageContext } from '../types'

export interface EnrichIssuesPrompt {
  system: string
  user: string
}

export function buildEnrichIssuesPrompt(
  rawFindings: RawFinding[],
  pageContext: PageContext,
): EnrichIssuesPrompt {
  const system = `You are an expert web accessibility auditor with deep knowledge of WCAG 2.2 guidelines, ARIA patterns, and assistive technology behavior. Your task is to enrich raw accessibility findings with human-readable descriptions and actionable fix suggestions.

Rules:
1. For each raw finding, produce an enriched issue with a clear, jargon-free description that explains WHY the issue matters to users with disabilities.
2. Provide a specific, actionable fix suggestion with concrete code changes when possible.
3. For issues with type "potential", assign a confidenceScore between 0 and 1 indicating how likely this is a real accessibility barrier. Set confidenceScore to null for "confirmed" issues.
4. IMPORTANT: If a "potential" issue is clearly a real violation, promote it to "confirmed" by changing the type field. Examples of when to promote:
   - An image alt text is obviously a filename (e.g., "IMG_20231015.jpg", "hero-banner.png")
   - An ARIA role is clearly misused (e.g., role="button" on a div with no keyboard handler)
   - A form input has a label that is clearly placeholder text (e.g., "enter value here")
5. Preserve the original ruleId, severity, wcagCriterion, wcagLevel, elementSelector, and elementHtml from the raw finding.
6. Map the engineName-based ruleId to axeRuleId if the finding originated from axe-core, otherwise set axeRuleId to null.

You MUST respond with a valid JSON object containing a single key "issues" whose value is the array of enriched issues. Do not include any text outside the JSON.`

  const user = `## Page Context
- URL: ${pageContext.url}
- Title: ${pageContext.title}
- Meta Description: ${pageContext.metaDescription}
- Total DOM Elements: ${pageContext.totalElements}

## Raw Findings (${rawFindings.length} total)
${JSON.stringify(rawFindings, null, 2)}

## Required Output Format
Respond with a JSON array where each element matches this schema:
\`\`\`json
{
  "ruleId": "string (from raw finding)",
  "type": "confirmed | potential",
  "severity": "critical | serious | moderate | minor",
  "confidenceScore": "number (0-1) for potential issues, null for confirmed",
  "wcagCriterion": "string (e.g., '1.1.1')",
  "wcagLevel": "A | AA | AAA",
  "elementSelector": "string (CSS selector from raw finding)",
  "elementHtml": "string (HTML snippet from raw finding)",
  "description": "string (human-readable explanation of the issue and its impact)",
  "fixSuggestion": "string (specific, actionable fix with code example if applicable)",
  "axeRuleId": "string | null (axe-core rule ID if applicable)"
}
\`\`\`

Return ONLY a JSON object like: { "issues": [ ... ] }`

  return { system, user }
}
