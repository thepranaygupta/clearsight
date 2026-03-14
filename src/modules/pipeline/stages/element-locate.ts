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

    // Capture pretty-printed DOM tree (like Chrome DevTools)
    let pageHtml: string | undefined
    try {
      const html = await page.evaluate(() => {
        const SELF_CLOSING = new Set([
          'area','base','br','col','embed','hr','img','input',
          'link','meta','param','source','track','wbr',
        ])
        const INLINE_TAGS = new Set([
          'a','abbr','b','bdi','bdo','br','cite','code','data','dfn',
          'em','i','kbd','mark','q','rp','rt','ruby','s','samp',
          'small','span','strong','sub','sup','time','u','var','wbr',
        ])
        const MAX_LEN = 5 * 1024 * 1024
        let out = ''
        let stopped = false

        function serialize(node: Node, depth: number): void {
          if (stopped) return
          if (out.length > MAX_LEN) { stopped = true; return }

          if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent ?? ''
            const trimmed = text.trim()
            if (!trimmed) return
            // For short inline text, keep it on one line
            if (trimmed.length < 120) {
              out += '  '.repeat(depth) + trimmed + '\n'
            } else {
              // Truncate very long text nodes (inline scripts, JSON blobs)
              out += '  '.repeat(depth) + trimmed.slice(0, 200) + '...\n'
            }
            return
          }

          if (node.nodeType === Node.COMMENT_NODE) {
            const text = (node as Comment).data.trim()
            if (text.length < 200) {
              out += '  '.repeat(depth) + '<!--' + text + '-->\n'
            }
            return
          }

          if (node.nodeType !== Node.ELEMENT_NODE) return
          const el = node as Element
          const tag = el.tagName.toLowerCase()

          // Skip script/style content to keep output manageable
          if (tag === 'script' || tag === 'noscript') {
            const attrs = serializeAttrs(el)
            out += '  '.repeat(depth) + '<' + tag + attrs + '>...</' + tag + '>\n'
            return
          }
          if (tag === 'style') {
            const attrs = serializeAttrs(el)
            out += '  '.repeat(depth) + '<' + tag + attrs + '>...</' + tag + '>\n'
            return
          }

          const attrs = serializeAttrs(el)

          if (SELF_CLOSING.has(tag)) {
            out += '  '.repeat(depth) + '<' + tag + attrs + '>\n'
            return
          }

          const children = Array.from(el.childNodes)
          const hasOnlyText = children.length === 1 && children[0].nodeType === Node.TEXT_NODE
          const text = hasOnlyText ? (children[0].textContent ?? '').trim() : ''

          // Inline elements with short text: keep on one line
          if (hasOnlyText && text.length < 100 && (INLINE_TAGS.has(tag) || text.length < 60)) {
            out += '  '.repeat(depth) + '<' + tag + attrs + '>' + text + '</' + tag + '>\n'
            return
          }

          out += '  '.repeat(depth) + '<' + tag + attrs + '>\n'
          for (const child of children) {
            serialize(child, depth + 1)
          }
          out += '  '.repeat(depth) + '</' + tag + '>\n'
        }

        function serializeAttrs(el: Element): string {
          let s = ''
          for (const attr of Array.from(el.attributes)) {
            const val = attr.value
            if (val.length > 200) {
              s += ' ' + attr.name + '="' + val.slice(0, 200) + '..."'
            } else {
              s += ' ' + attr.name + '="' + val.replace(/"/g, '&quot;') + '"'
            }
          }
          return s
        }

        serialize(document.documentElement, 0)
        return out
      })

      if (html.length <= MAX_PAGE_HTML_SIZE) {
        pageHtml = html
      } else {
        const sliced = html.slice(0, MAX_PAGE_HTML_SIZE)
        const lastNewline = sliced.lastIndexOf('\n')
        pageHtml = lastNewline > 0 ? sliced.slice(0, lastNewline) : sliced
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
