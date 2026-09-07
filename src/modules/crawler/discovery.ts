import type { CrawlConfig, DiscoveredPage } from './types'
import { normalizeUrl, isSameOrigin, extractPath, dedupKey } from './url-normalizer'

export async function discoverPages(
  rootUrl: string,
  crawlConfig: CrawlConfig,
  onProgress?: (discovered: number) => void | Promise<void>,
): Promise<DiscoveredPage[]> {
  const visited = new Set<string>()
  const queue: string[] = [rootUrl]
  const pages: DiscoveredPage[] = []

  const normalizedRoot = normalizeUrl(rootUrl, rootUrl)
  if (!normalizedRoot) throw new Error(`Invalid root URL: ${rootUrl}`)
  visited.add(dedupKey(normalizedRoot))

  // Also discover from sitemap (sitemap URLs take priority — they often include locale params)
  const sitemapUrls = await fetchSitemap(rootUrl, crawlConfig)
  for (const sitemapUrl of sitemapUrls) {
    const normalized = normalizeUrl(sitemapUrl, rootUrl)
    if (!normalized) continue
    const key = dedupKey(normalized)
    if (isSameOrigin(normalized, rootUrl) && !visited.has(key)) {
      visited.add(key)
      queue.push(normalized)
    }
  }

  while (queue.length > 0) {
    const url = queue.shift()!
    if (crawlConfig.maxPages != null && pages.length >= crawlConfig.maxPages) break

    pages.push({ url, path: extractPath(url) })
    await onProgress?.(pages.length)

    if (crawlConfig.delayMs > 0) {
      await new Promise((r) => setTimeout(r, crawlConfig.delayMs))
    }

    const links = await fetchAndExtractLinks(url, crawlConfig)
    for (const link of links) {
      const normalized = normalizeUrl(link, url)
      if (!normalized) continue
      if (!isSameOrigin(normalized, rootUrl)) continue
      const key = dedupKey(normalized)
      if (visited.has(key)) continue
      if (isNonPageUrl(normalized)) continue
      visited.add(key)
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
  const origin = new URL(rootUrl).origin

  // 1. Check robots.txt for Sitemap: directives (most reliable)
  const robotsSitemaps = await fetchSitemapsFromRobots(origin, config)

  // 2. Fallback candidates: /sitemap.xml and path-relative sitemap
  const candidates = [`${origin}/sitemap.xml`]
  const rootPath = new URL(rootUrl).pathname
  if (rootPath !== '/' && rootPath !== '') {
    const base = rootPath.endsWith('/') ? rootPath : rootPath.split('/').slice(0, -1).join('/') + '/'
    candidates.push(`${origin}${base}sitemap.xml`)
  }

  const allSitemaps = robotsSitemaps.length > 0 ? robotsSitemaps : candidates
  const allUrls: string[] = []
  for (const sitemapUrl of allSitemaps) {
    const urls = await fetchSitemapUrl(sitemapUrl, config, rootUrl)
    allUrls.push(...urls)
  }
  return [...new Set(allUrls)]
}

async function fetchSitemapsFromRobots(origin: string, config: CrawlConfig): Promise<string[]> {
  try {
    const response = await fetch(`${origin}/robots.txt`, {
      headers: { 'User-Agent': config.userAgent },
      signal: AbortSignal.timeout(5000),
    })
    if (!response.ok) return []
    const text = await response.text()
    const sitemaps: string[] = []
    const sitemapRegex = /^Sitemap:\s*(.+)$/gim
    let match: RegExpExecArray | null
    while ((match = sitemapRegex.exec(text)) !== null) {
      if (match[1]) sitemaps.push(match[1].trim())
    }
    return [...new Set(sitemaps)]
  } catch {
    return []
  }
}

async function fetchSitemapUrl(sitemapUrl: string, config: CrawlConfig, rootUrl: string, depth = 0): Promise<string[]> {
  if (depth > 3) return [] // prevent infinite recursion
  try {
    const response = await fetch(sitemapUrl, {
      headers: { 'User-Agent': config.userAgent },
      signal: AbortSignal.timeout(10000),
    })
    if (!response.ok) return []
    const xml = await response.text()

    // Detect sitemap index — contains <sitemap> elements
    const isSitemapIndex = /<sitemap[\s>]/i.test(xml)
    if (isSitemapIndex) {
      // Extract sub-sitemap URLs and fetch each recursively
      const subSitemapUrls: string[] = []
      const locRegex = /<sitemap[\s\S]*?<loc>([^<]+)<\/loc>/gi
      let match: RegExpExecArray | null
      while ((match = locRegex.exec(xml)) !== null) {
        if (match[1]) subSitemapUrls.push(match[1].trim())
      }
      const results = await Promise.all(
        subSitemapUrls.map((url) => fetchSitemapUrl(url, config, rootUrl, depth + 1))
      )
      return results.flat()
    }

    // Regular sitemap — extract <loc> page URLs
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
  if (skipExtensions.some((ext) => path.endsWith(ext))) return true

  // Skip static asset paths (CDN, file serving endpoints)
  const skipPatterns = [
    '/sfsites/c/file-asset/',  // Salesforce static assets
    '/sfsites/c/resource/',
    '/_next/static/',
    '/static/',
    '/assets/',
    '/cdn-cgi/',
  ]
  return skipPatterns.some((pattern) => path.includes(pattern))
}
