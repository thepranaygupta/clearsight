/**
 * Parse and clamp pagination params from URL search params.
 * Matches the pattern used in GET /api/scans.
 */
export function parsePagination(searchParams: URLSearchParams, defaults?: { limit?: number; maxLimit?: number }) {
  const maxLimit = defaults?.maxLimit ?? 100
  const defaultLimit = defaults?.limit ?? 20

  const limitParam = parseInt(searchParams.get('limit') || String(defaultLimit), 10)
  const offsetParam = parseInt(searchParams.get('offset') || '0', 10)

  return {
    take: Math.min(Math.max(isNaN(limitParam) ? defaultLimit : limitParam, 1), maxLimit),
    skip: Math.max(isNaN(offsetParam) ? 0 : offsetParam, 0),
  }
}

/**
 * Wrap an API handler with try/catch to return clean 500 errors.
 */
export function withErrorHandler(handler: () => Promise<Response>, label: string): Promise<Response> {
  return handler().catch((error) => {
    console.error(`${label} error:`, error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  })
}
