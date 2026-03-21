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
    return new URL(url).origin === new URL(rootUrl).origin
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
