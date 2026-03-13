interface UrlValidationResult {
  valid: boolean
  error?: string
}

const MAX_URL_LENGTH = 2048

/**
 * Regular expressions for private/internal IP ranges.
 * Covers: 127.x.x.x, 10.x.x.x, 172.16-31.x.x, 192.168.x.x, 0.0.0.0
 */
const PRIVATE_IP_PATTERNS = [
  /^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,    // 127.0.0.0/8
  /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,      // 10.0.0.0/8
  /^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/, // 172.16.0.0/12
  /^192\.168\.\d{1,3}\.\d{1,3}$/,          // 192.168.0.0/16
  /^0\.0\.0\.0$/,                           // 0.0.0.0
]

const PRIVATE_HOSTNAMES = ['localhost', '[::1]']

function isPrivateHost(hostname: string): boolean {
  const lower = hostname.toLowerCase()

  // Check well-known private hostnames
  if (PRIVATE_HOSTNAMES.includes(lower)) return true

  // Check IPv6 loopback without brackets (URL.hostname strips them for IPv6)
  if (lower === '::1' || lower === '[::1]') return true

  // Check private IP ranges
  return PRIVATE_IP_PATTERNS.some((pattern) => pattern.test(lower))
}

export function validateUrl(url: string): UrlValidationResult {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL is required' }
  }

  const trimmed = url.trim()

  if (trimmed.length === 0) {
    return { valid: false, error: 'URL is required' }
  }

  if (trimmed.length > MAX_URL_LENGTH) {
    return { valid: false, error: `URL must not exceed ${MAX_URL_LENGTH} characters` }
  }

  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    return { valid: false, error: 'URL is not valid' }
  }

  // Must be http or https
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { valid: false, error: 'URL must use http or https protocol' }
  }

  // Must have a hostname
  if (!parsed.hostname) {
    return { valid: false, error: 'URL must have a valid hostname' }
  }

  // Must not be a private/internal address
  if (isPrivateHost(parsed.hostname)) {
    return { valid: false, error: 'URL must not point to a private or internal address' }
  }

  return { valid: true }
}
