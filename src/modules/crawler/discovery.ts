import type { CrawlConfig, DiscoveredPage } from './types'
import { normalizeUrl, isSameOrigin, extractPath } from './url-normalizer'

export async function discoverPages(
  rootUrl: string,
  crawlConfig: CrawlConfig,
  onProgress?: (discovered: number) => void,
): Promise<DiscoveredPage[]> {
  const visited = new Set<string>()
  const queue: string[] = [rootUrl]
  const pages: DiscoveredPage[] = []

  const normalizedRoot = normalizeUrl(rootUrl, rootUrl)
  if (!normalizedRoot) throw new Error(`Invalid root URL: ${rootUrl}`)
  visited.add(normalizedRoot)

  // Also discover from sitemap
  const sitemapUrls = await fetchSitemap(rootUrl, crawlConfig)
  for (const sitemapUrl of sitemapUrls) {
    if (isSameOrigin(sitemapUrl, rootUrl) && !visited.has(sitemapUrl)) {
      visited.add(sitemapUrl)
      queue.push(sitemapUrl)
    }
  }

  while (queue.length > 0) {
    const url = queue.shift()!
    if (crawlConfig.maxPages && pages.length >= crawlConfig.maxPages) break

    pages.push({ url, path: extractPath(url) })
    onProgress?.(pages.length)

    if (crawlConfig.delayMs > 0) {
      await new Promise((r) => setTimeout(r, crawlConfig.delayMs))
    }

    const links = await fetchAndExtractLinks(url, crawlConfig)
    for (const link of links) {
      const normalized = normalizeUrl(link, url)
      if (!normalized) continue
      if (!isSameOrigin(normalized, rootUrl)) continue
      if (visited.has(normalized)) continue
      if (isNonPageUrl(normalized)) continue
      visited.add(normalized)
      queue.push(normalized)
    }
  }

  return pages
}

async function fetchAndExtractLinks(url: string, config: CrawlConfig): Promise<string[]> {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': config.userAgent },
      redirect: 'follow',
      signal: AbortSignal.timeout(15000),
    })
    if (!response.ok) return []
    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('text/html')) return []
    const html = await response.text()
    return extractLinksFromHtml(html, url)
  } catch {
    return []
  }
}

function extractLinksFromHtml(html: string, baseUrl: string): string[] {
  const links: string[] = []
  const hrefRegex = /<(?:a|link)\s[^>]*href=["']([^"'#]+)["']/gi
  const srcRegex = /<iframe\s[^>]*src=["']([^"'#]+)["']/gi

  let match: RegExpExecArray | null
  while ((match = hrefRegex.exec(html)) !== null) {
    const href = match[1]
    if (href && !href.startsWith('javascript:') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
      try { links.push(new URL(href, baseUrl).href) } catch {}
    }
  }
  while ((match = srcRegex.exec(html)) !== null) {
    if (match[1]) {
      try { links.push(new URL(match[1], baseUrl).href) } catch {}
    }
  }
  return links
}

async function fetchSitemap(rootUrl: string, config: CrawlConfig): Promise<string[]> {
  try {
    const origin = new URL(rootUrl).origin
    const response = await fetch(`${origin}/sitemap.xml`, {
      headers: { 'User-Agent': config.userAgent },
      signal: AbortSignal.timeout(10000),
    })
    if (!response.ok) return []
    const xml = await response.text()
    const urls: string[] = []
    const locRegex = /<loc>([^<]+)<\/loc>/gi
    let match: RegExpExecArray | null
    while ((match = locRegex.exec(xml)) !== null) {
      if (match[1]) urls.push(match[1].trim())
    }
    return urls
  } catch {
    return []
  }
}

function isNonPageUrl(url: string): boolean {
  const path = new URL(url).pathname.toLowerCase()
  const skipExtensions = [
    '.pdf', '.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.ico',
    '.css', '.js', '.json', '.xml', '.zip', '.tar', '.gz',
    '.mp3', '.mp4', '.avi', '.mov', '.woff', '.woff2', '.ttf', '.eot',
  ]
  return skipExtensions.some((ext) => path.endsWith(ext))
}
