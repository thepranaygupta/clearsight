import type { BoundingBox } from '@/modules/scanner/types'
import type { PipelineContext, PipelineStage } from '../types'

const MAX_PAGE_HTML_SIZE = 5 * 1024 * 1024 // 5 MB

/**
 * DOM serialization script executed inside the browser via page.evaluate().
 * Defined as a string literal to prevent tsx/esbuild from transforming
 * function declarations and injecting __name() calls that don't exist
 * in the browser context.
 */
const SERIALIZE_DOM_SCRIPT = `(() => {
  const SELF_CLOSING = new Set([
    'area','base','br','col','embed','hr','img','input',
    'link','meta','param','source','track','wbr'
  ]);
  const INLINE = new Set([
    'a','abbr','b','bdi','bdo','br','cite','code','data','dfn',
    'em','i','kbd','mark','q','rp','rt','ruby','s','samp',
    'small','span','strong','sub','sup','time','u','var','wbr'
  ]);
  const MAX = 5 * 1024 * 1024;
  var out = '';
  var stopped = false;

  var getAttrs = function(el) {
    var s = '';
    for (var i = 0; i < el.attributes.length; i++) {
      var attr = el.attributes[i];
      var val = attr.value;
      var escaped = val.replace(/"/g, '&quot;');
      if (escaped.length > 200) {
        s += ' ' + attr.name + '="' + escaped.slice(0, 200) + '..."';
      } else {
        s += ' ' + attr.name + '="' + escaped + '"';
      }
    }
    return s;
  };

  var indent = function(d) {
    return '  '.repeat(d);
  };

  var walk = function(node, depth) {
    if (stopped) return;
    if (out.length > MAX) { stopped = true; return; }

    if (node.nodeType === 3) {
      var text = (node.textContent || '').trim();
      if (!text) return;
      if (text.length < 120) {
        out += indent(depth) + text + '\\n';
      } else {
        out += indent(depth) + text.slice(0, 200) + '...\\n';
      }
      return;
    }

    if (node.nodeType === 8) {
      var cmt = node.data.trim();
      if (cmt.length < 200) {
        out += indent(depth) + '<!--' + cmt + '-->\\n';
      }
      return;
    }

    if (node.nodeType !== 1) return;
    var tag = node.tagName.toLowerCase();
    var attrs = getAttrs(node);

    if (tag === 'script' || tag === 'noscript' || tag === 'style') {
      out += indent(depth) + '<' + tag + attrs + '>...</' + tag + '>\\n';
      return;
    }

    if (SELF_CLOSING.has(tag)) {
      out += indent(depth) + '<' + tag + attrs + '>\\n';
      return;
    }

    var children = node.childNodes;
    var hasOnlyText = children.length === 1 && children[0].nodeType === 3;
    var txt = hasOnlyText ? (children[0].textContent || '').trim() : '';

    if (hasOnlyText && txt.length < 100 && (INLINE.has(tag) || txt.length < 60)) {
      out += indent(depth) + '<' + tag + attrs + '>' + txt + '</' + tag + '>\\n';
      return;
    }

    out += indent(depth) + '<' + tag + attrs + '>\\n';
    for (var i = 0; i < children.length; i++) {
      walk(children[i], depth + 1);
    }
    out += indent(depth) + '</' + tag + '>\\n';
  };

  walk(document.documentElement, 0);
  return out;
})()`

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

    // Batch-query all bounding boxes.
    // ALL code inside page.evaluate must be a string to avoid tsx/esbuild
    // injecting __name() decorators — this affects function declarations,
    // const arrow functions, and any named binding inside the callback.
    // We JSON-encode the entries and embed them in the script string.
    const boundingBoxMap = new Map<string, BoundingBox>()

    if (selectorEntries.length > 0) {
      const entriesJson = JSON.stringify(selectorEntries)
      const results = await page.evaluate(`(() => {
        var entries = ${entriesJson};
        var boxes = [];
        for (var i = 0; i < entries.length; i++) {
          var key = entries[i].key;
          var selector = entries[i].selector;
          try {
            var el = null;
            var parts = selector.split(',');
            if (parts.length > 1) {
              var root = document;
              for (var p = 0; p < parts.length; p++) {
                var part = parts[p].trim();
                if (!part) continue;
                var found = root.querySelector(part);
                if (!found) { el = null; break; }
                if (p < parts.length - 1 && found.shadowRoot) {
                  root = found.shadowRoot;
                } else {
                  el = found;
                }
              }
            } else {
              el = document.querySelector(selector);
            }
            if (el) {
              var rect = el.getBoundingClientRect();
              boxes.push({
                key: key,
                box: {
                  x: Math.round(rect.left + window.scrollX),
                  y: Math.round(rect.top + window.scrollY),
                  width: Math.round(rect.width),
                  height: Math.round(rect.height)
                }
              });
            } else {
              boxes.push({ key: key, box: null });
            }
          } catch(e) {
            boxes.push({ key: key, box: null });
          }
        }
        return boxes;
      })()`) as Array<{ key: string; box: BoundingBox | null }>

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
    // NOTE: Uses page.evaluate with a string expression to avoid tsx/esbuild
    // injecting __name() decorators into named function declarations, which
    // causes ReferenceError in the browser context.
    let pageHtml: string | undefined
    try {
      const html = await page.evaluate(SERIALIZE_DOM_SCRIPT) as string

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
