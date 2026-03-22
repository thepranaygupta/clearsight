import { createHash } from 'crypto'

/**
 * Compute a deterministic hash for an issue to enable tracking across crawls.
 * Same rule violation on same element on same page = same hash.
 */
export function computeIssueHash(
  ruleId: string | null | undefined,
  axeRuleId: string | null | undefined,
  elementSelector: string,
  wcagCriterion: string,
  pageUrl: string,
): string {
  const canonicalRuleId = ruleId ?? axeRuleId ?? 'unknown'
  const input = `${canonicalRuleId}|${elementSelector}|${wcagCriterion}|${pageUrl}`
  return createHash('sha256').update(input).digest('hex')
}
