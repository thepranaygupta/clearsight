import type { BoundingBox } from '@/modules/scanner/types'
import type { PipelineContext, PipelineStage } from '../types'

const MAX_PAGE_HTML_SIZE = 5 * 1024 * 1024 // 5 MB

export class ElementLocateStage implements PipelineStage {
  readonly name = 'Locating elements'
  readonly progress = 65

  async execute(context: PipelineContext): Promise<PipelineContext> {
    if (!context.renderedPage) {
      throw new Error('ElementLocateStage requires a rendered page. Did the FetchStage run?')
    }

    const page = context.renderedPage.page

    // Collect unique selectors keyed by ruleId::selector
    const selectorEntries: Array<{ key: string; selector: string }> = []
    const seenKeys = new Set<string>()

    for (const finding of context.rawFindings) {
      const key = `${finding.ruleId}::${finding.elementSelector}`
      if (!seenKeys.has(key)) {
        seenKeys.add(key)
        selectorEntries.push({ key, selector: finding.elementSelector })
      }
    }

    // Batch-query all bounding boxes in a single page.evaluate
    const boundingBoxMap = new Map<string, BoundingBox>()

    if (selectorEntries.length > 0) {
      const results = await page.evaluate(
        (entries: Array<{ key: string; selector: string }>) => {
          const boxes: Array<{ key: string; box: { x: number; y: number; width: number; height: number } | null }> = []

          for (const { key, selector } of entries) {
            try {
              const el = document.querySelector(selector)
              if (el) {
                const rect = el.getBoundingClientRect()
                boxes.push({
                  key,
                  box: {
                    x: Math.round(rect.left + window.scrollX),
                    y: Math.round(rect.top + window.scrollY),
                    width: Math.round(rect.width),
                    height: Math.round(rect.height),
                  },
                })
              } else {
                boxes.push({ key, box: null })
              }
            } catch {
              boxes.push({ key, box: null })
            }
          }

          return boxes
        },
        selectorEntries
      )

      for (const { key, box } of results) {
        if (box) {
          boundingBoxMap.set(key, box)
        }
      }
    }

    // Patch raw findings with bounding boxes
    const patchedFindings = context.rawFindings.map((finding) => {
      const key = `${finding.ruleId}::${finding.elementSelector}`
      const box = boundingBoxMap.get(key)
      return box ? { ...finding, boundingBox: box } : finding
    })

    // Capture full page HTML
    let pageHtml: string | undefined
    try {
      const html = await page.evaluate(() => document.documentElement.outerHTML)
      if (html.length <= MAX_PAGE_HTML_SIZE) {
        pageHtml = html
      } else {
        // Truncate at the last '>' before the cap to avoid splitting mid-tag
        const sliced = html.slice(0, MAX_PAGE_HTML_SIZE)
        const lastClose = sliced.lastIndexOf('>')
        pageHtml = lastClose > 0 ? sliced.slice(0, lastClose + 1) : sliced
      }
    } catch (error) {
      console.warn(
        '[ElementLocateStage] Failed to capture page HTML:',
        error instanceof Error ? error.message : String(error)
      )
    }

    return {
      ...context,
      rawFindings: patchedFindings,
      pageHtml,
    }
  }
}
