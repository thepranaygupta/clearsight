import type { Page } from 'playwright'
import type { RawFinding, ScanEngine } from '../../types'

const NON_DESCRIPTIVE_PATTERNS = [
  /^click\s*here$/i,
  /^read\s*more$/i,
  /^here$/i,
  /^learn\s*more$/i,
  /^more$/i,
  /^link$/i,
]

interface LinkInfo {
  text: string
  selector: string
  outerHtml: string
}

export class LinkTextEngine implements ScanEngine {
  readonly name = 'custom-link-text'

  async run(page: Page): Promise<RawFinding[]> {
    const links: LinkInfo[] = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('a'))
      return anchors.map((a, index) => ({
        text: (a.textContent ?? '').trim(),
        selector: a.id
          ? `#${a.id}`
          : `a:nth-of-type(${index + 1})`,
        outerHtml: a.outerHTML.slice(0, 256),
      }))
    })

    const findings: RawFinding[] = []

    for (const link of links) {
      if (!link.text) continue

      const isNonDescriptive = NON_DESCRIPTIVE_PATTERNS.some((pattern) =>
        pattern.test(link.text)
      )

      if (isNonDescriptive) {
        findings.push({
          ruleId: 'link-text-descriptive',
          type: 'potential',
          severity: 'moderate',
          wcagCriterion: '2.4.4',
          wcagLevel: 'A',
          elementSelector: link.selector,
          elementHtml: link.outerHtml,
          description: `Link text "${link.text}" is not descriptive. Use meaningful link text that describes the destination or purpose.`,
          ruleHelp: 'Links must have discernible text',
          engineName: this.name,
        })
      }
    }

    return findings
  }
}
