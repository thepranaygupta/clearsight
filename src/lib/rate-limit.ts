import { config } from '@/config'

interface RateLimitEntry {
  count: number
  resetAt: number
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

const WINDOW_MS = config.rateLimit.windowMs
const MAX_REQUESTS = config.rateLimit.maxScansPerHour

// Clean up expired entries every 5 minutes
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000

let cleanupTimer: ReturnType<typeof setInterval> | null = null

function startCleanup() {
  if (cleanupTimer) return
  cleanupTimer = setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store) {
      if (now >= entry.resetAt) {
        store.delete(key)
      }
    }
  }, CLEANUP_INTERVAL_MS)
  // Allow the process to exit even if the timer is still running
  if (cleanupTimer && typeof cleanupTimer === 'object' && 'unref' in cleanupTimer) {
    cleanupTimer.unref()
  }
}

startCleanup()

export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now()
  const entry = store.get(ip)

  // No existing entry or window has expired — start a new window
  if (!entry || now >= entry.resetAt) {
    const resetAt = now + WINDOW_MS
    store.set(ip, { count: 1, resetAt })
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetAt }
  }

  // Within the current window
  if (entry.count < MAX_REQUESTS) {
    entry.count += 1
    return { allowed: true, remaining: MAX_REQUESTS - entry.count, resetAt: entry.resetAt }
  }

  // Rate limit exceeded
  return { allowed: false, remaining: 0, resetAt: entry.resetAt }
}
