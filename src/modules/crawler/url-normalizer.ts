const TRACKING_PARAMS = new Set([
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'fbclid', 'gclid', 'ref', 'source', 'mc_cid', 'mc_eid',
])

export function normalizeUrl(rawUrl: string, baseUrl: string): string | null {
  try {
    const url = new URL(rawUrl, baseUrl)
    url.hash = ''
    for (const param of TRACKING_PARAMS) {
      url.searchParams.delete(param)
    }
    url.searchParams.sort()
    let normalized = url.origin + url.pathname.replace(/\/+$/, '') + url.search
    if (url.pathname === '/' && !url.search) {
      normalized = url.origin + '/'
    }
    return normalized
  } catch {
    return null
  }
}

export function isSameOrigin(url: string, rootUrl: string): boolean {
  try {
    const a = new URL(url)
    const b = new URL(rootUrl)
    // Treat www.example.com and example.com as same origin
    return normalizeHostname(a.hostname) === normalizeHostname(b.hostname) && a.protocol === b.protocol
  } catch {
    return false
  }
}

export function normalizeHostname(hostname: string): string {
  return hostname.toLowerCase().replace(/^www\./, '')
}

export function extractPath(url: string): string {
  try {
    return new URL(url).pathname
  } catch {
    return '/'
  }
}

/**
 * Returns a key for deduplication that ignores locale params.
 * The actual URL (with locale) is preserved for scanning —
 * this only determines whether two URLs point to the same page.
 */
const LOCALE_PARAMS = new Set(['language', 'lang', 'locale'])

export function dedupKey(normalizedUrl: string): string {
  try {
    const url = new URL(normalizedUrl)
    for (const param of LOCALE_PARAMS) {
      url.searchParams.delete(param)
    }
    url.searchParams.sort()
    const key = url.origin + url.pathname.replace(/\/+$/, '') + url.search
    return url.pathname === '/' && !url.search ? url.origin + '/' : key
  } catch {
    return normalizedUrl
  }
}
