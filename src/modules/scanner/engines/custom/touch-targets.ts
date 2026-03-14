import type { Page } from 'playwright'
import type { RawFinding, ScanEngine } from '../../types'

const MIN_TARGET_SIZE_PX = 24

interface TargetInfo {
  selector: string
  outerHtml: string
  width: number
  height: number
  tagName: string
}

export class TouchTargetEngine implements ScanEngine {
  readonly name = 'custom-touch-targets'

  async run(page: Page): Promise<RawFinding[]> {
    const targets: TargetInfo[] = await page.evaluate((minSize: number) => {
      const interactiveSelectors = [
        'a[href]',
        'button',
        'input:not([type="hidden"])',
        'select',
        'textarea',
        '[role="button"]',
        '[role="link"]',
        '[tabindex]:not([tabindex="-1"])',
      ]

      const elements = document.querySelectorAll(
        interactiveSelectors.join(', ')
      )

      const undersized: TargetInfo[] = []

      elements.forEach((el, index) => {
        const rect = el.getBoundingClientRect()

        // Skip elements that are not visible
        if (rect.width === 0 || rect.height === 0) return

        if (rect.width < minSize || rect.height < minSize) {
          const tagName = el.tagName.toLowerCase()
          const id = el.id ? `#${el.id}` : ''
          const selector = id || `${tagName}:nth-of-type(${index + 1})`

          undersized.push({
            selector,
            outerHtml: el.outerHTML.slice(0, 256),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            tagName,
          })
        }
      })

      return undersized
    }, MIN_TARGET_SIZE_PX)

    return targets.map((target) => ({
      ruleId: 'touch-target-size',
      type: 'potential' as const,
      severity: 'moderate' as const,
      wcagCriterion: '2.5.5',
      wcagLevel: 'AA' as const,
      elementSelector: target.selector,
      elementHtml: target.outerHtml,
      description: `Interactive element <${target.tagName}> has a touch target size of ${target.width}x${target.height}px, which is below the minimum ${MIN_TARGET_SIZE_PX}x${MIN_TARGET_SIZE_PX}px recommended for AA conformance.`,
      ruleHelp: 'Touch targets must be large enough for interaction',
      engineName: this.name,
    }))
  }
}
