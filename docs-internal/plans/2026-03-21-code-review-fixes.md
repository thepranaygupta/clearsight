# Code Review Fixes Plan

## Phase 1: Critical Infrastructure (will crash in production)
1. **W1+W2:** Fix Redis connection — add `maxRetriesPerRequest: null`, extract password/username from URL
2. **P2:** Fix crawl hanging — track failed scans, finalize when `enriched + failed >= total`
3. **P1:** Fix LLM fallback status — propagate `llmFailed` flag through pipeline context

## Phase 2: Security Hardening
4. **S1:** Add SSRF validation to `POST /api/sites`
5. **S3:** Validate/clamp `maxPages` on crawl trigger
6. **S4:** Add rate limiting to crawl trigger
7. **S6:** Clamp pagination params on crawls/pages/issues routes
8. **S7+S8:** Add try/catch and enum validation on API routes

## Phase 3: Data Integrity
9. **W3:** Make `scannedPages` increment idempotent on retry
10. **D2:** Fix `Site.findOrCreate` race condition (use upsert)
11. **D3:** Add null guard on `$queryRaw` results
12. **P3:** Remove dead redirect check in playwright.ts

## Phase 4: Robustness
13. **W5:** Add shutdown timeout
14. **W7:** Use `UnrecoverableError` for permanent failures
15. **P4:** Fix www vs non-www same-origin check

## Phase 5: Documentation
16. **DD-1 to DD-5:** Update CLAUDE.md, .env.example
