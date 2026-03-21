# Validation Review Agent

Review input validation, URL sanitization, and API request/response validation in ClearSight.

## What to Check

### URL Validation (`src/lib/url-validation.ts`)
- Validates URL format (parseable, has hostname)
- Blocks private/internal IPs (SSRF prevention)
- Blocks non-HTTP(S) schemes
- Handles edge cases: unicode domains, punycode, IP-as-hostname
- Validates URL before every use (not just at API entry point)

### API Request Validation
- POST body validated before processing (required fields, types)
- Query params (`limit`, `offset`, `format`) validated and bounded
- UUID route params validated format before DB lookup
- Missing/malformed params return 400, not 500
- No trusting client-sent data without validation

### API Response Consistency
- All API routes return consistent JSON shape
- Error responses have consistent format: `{ error: string }`
- Success responses include appropriate data
- Pagination responses include `total` count
- No leaking of internal error details (stack traces, SQL errors)

### Data Validation
- Scan URLs validated before queuing
- Crawl `maxPages` validated as positive integer or null
- Severity values match enum (critical/serious/moderate/minor)
- Score values clamped to valid ranges (0-100 for overall, 0-1 for confidence)
- Issue HTML snippets truncated to reasonable size

### Type-Level Validation
- Prisma enums enforce valid values at DB level
- TypeScript types match validation logic (no mismatch between what's validated and what's typed)
- Optional fields (`?`) are truly optional in the validation path

### Configuration Validation (`src/config/index.ts`)
- Required env vars fail fast with clear error if missing
- `parseInt` calls have fallback defaults
- URL format validated for `DATABASE_URL`, `REDIS_URL`, `AZURE_OPENAI_ENDPOINT`

## Files to Focus On
- `src/lib/url-validation.ts` — URL validation
- `src/lib/rate-limit.ts` — Rate limiting
- `src/app/api/**/*.ts` — All API routes (input validation)
- `src/config/index.ts` — Config validation
- `src/modules/queue/types.ts` — Job data shapes

## Output Format
List findings as:
- **[BLOCKER]** or **[SUGGESTION]** or **[GOOD]**
- File path and line number
- Brief explanation and fix recommendation
