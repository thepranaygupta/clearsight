# Crawler & Issue Tracking Review Agent

Review BFS page discovery, URL normalization, and cross-crawl issue tracking in ClearSight.

## What to Check

### BFS Discovery (`src/modules/crawler/discovery.ts`)
- Breadth-first search correctly traverses all same-origin pages
- Visited URL set prevents infinite loops
- Same-origin check is strict (no subdomain confusion)
- Sitemap.xml parsing discovers pages not linked in navigation
- External links are correctly filtered out
- Fragment URLs (#section) are deduplicated
- Crawler respects `robots.txt` (or documents why it doesn't)
- Discovery uses lightweight HTTP fetch (not full Playwright) for link extraction
- HTML parsing extracts `<a href>` links reliably
- Relative URLs resolved to absolute correctly

### URL Normalization (`src/modules/crawler/url-normalizer.ts`)
- Trailing slashes normalized (`/about/` → `/about` or vice versa, consistently)
- Query parameter sorting (or stripping tracking params like `utm_*`)
- Fragment removal (`#section` stripped)
- Protocol normalization (http vs https)
- Case normalization for hostname
- No information loss that would cause different pages to collide

### Issue Tracking (`src/modules/crawler/issue-tracker.ts`)
- `issueHash` computed consistently from element + rule + page
- Same issue on same element produces same hash across crawls
- New issues (hash not seen before) correctly identified
- Fixed issues (hash in previous crawl but not current) correctly identified
- Recurring issues (hash in both crawls) correctly identified
- `newIssues` and `fixedIssues` counts on Crawl are accurate
- Issue status transitions: open → fixed, open → dismissed, etc.
- `firstSeenScanId` / `lastSeenScanId` tracked correctly

### Page Management
- Pages are created on first discovery, not duplicated
- `@@unique([siteId, url])` constraint prevents duplicates
- `firstSeenCrawlId` correctly set
- Page paths extracted from URLs consistently

### Edge Cases
- Sites with JavaScript-rendered content (SPA) — crawler may miss pages
- Very large sites — `maxPages` limit prevents runaway crawls
- Sites with auth walls — graceful failure, not infinite redirect loop
- Malformed HTML — parser doesn't crash
- Empty sitemaps — handled gracefully

## Files to Focus On
- `src/modules/crawler/discovery.ts` — BFS page discovery
- `src/modules/crawler/url-normalizer.ts` — URL normalization
- `src/modules/crawler/issue-tracker.ts` — Cross-crawl issue tracking
- `src/modules/crawler/types.ts` — Crawler types
- `src/modules/pipeline/issue-hash.ts` — Issue hash computation

## Output Format
List findings as:
- **[BLOCKER]** or **[SUGGESTION]** or **[GOOD]**
- File path and line number
- Brief explanation and fix recommendation
