import AxeBuilder from '@axe-core/playwright'
import type { Page } from 'playwright'
import type { RawFinding, ScanEngine } from '../types'

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] as const

/** Maps an axe-core tag like "wcag244" to a criterion string like "2.4.4". */
function extractWcagCriterion(tags: string[]): string {
  for (const tag of tags) {
    const match = tag.match(/^wcag(\d)(\d)(\d+)$/)
    if (match) {
      return `${match[1]}.${match[2]}.${match[3]}`
    }
  }
  return 'unknown'
}

/** Derives the WCAG conformance level from tags. */
function extractWcagLevel(tags: string[]): 'A' | 'AA' {
  for (const tag of tags) {
    if (tag === 'wcag2aa' || tag === 'wcag21aa') return 'AA'
  }
  return 'A'
}

type AxeImpact = 'critical' | 'serious' | 'moderate' | 'minor'

function mapSeverity(
  impact: string | null | undefined
): RawFinding['severity'] {
  const mapping: Record<AxeImpact, RawFinding['severity']> = {
    critical: 'critical',
    serious: 'serious',
    moderate: 'moderate',
    minor: 'minor',
  }
  return mapping[impact as AxeImpact] ?? 'moderate'
}

export class AxeCoreEngine implements ScanEngine {
  readonly name = 'axe-core'

  async run(page: Page): Promise<RawFinding[]> {
    const results = await new AxeBuilder({ page })
      .withTags([...WCAG_TAGS])
      .analyze()

    const findings: RawFinding[] = []

    // Map confirmed violations
    for (const violation of results.violations) {
      for (const node of violation.nodes) {
        findings.push({
          ruleId: violation.id,
          type: 'confirmed',
          severity: mapSeverity(violation.impact),
          wcagCriterion: extractWcagCriterion(violation.tags),
          wcagLevel: extractWcagLevel(violation.tags),
          elementSelector: node.target.join(' '),
          elementHtml: node.html,
          description: violation.help,
          engineName: this.name,
        })
      }
    }

    // Map incomplete (potential) findings
    for (const incomplete of results.incomplete) {
      for (const node of incomplete.nodes) {
        findings.push({
          ruleId: incomplete.id,
          type: 'potential',
          severity: mapSeverity(incomplete.impact),
          wcagCriterion: extractWcagCriterion(incomplete.tags),
          wcagLevel: extractWcagLevel(incomplete.tags),
          elementSelector: node.target.join(' '),
          elementHtml: node.html,
          description: incomplete.help,
          engineName: this.name,
        })
      }
    }

    return findings
  }
}
