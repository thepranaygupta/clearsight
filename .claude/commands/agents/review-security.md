# Security Review Agent

Review security practices in ClearSight — input validation, injection prevention, and attack surface.

## What to Check

### SSRF Prevention
- URL validation blocks private/internal IPs (127.0.0.1, 10.x, 172.16-31.x, 192.168.x, ::1, etc.)
- URL validation rejects non-HTTP(S) schemes (file://, ftp://, data://, javascript:)
- DNS rebinding protection — resolve hostname before making request, validate the resolved IP
- Redirect following is limited (`maxRedirects` config)
- Playwright navigation targets are validated before use

### Input Validation
- All API routes validate request body/params before use
- URL inputs are validated and sanitized
- Pagination params (`limit`, `offset`) have bounds
- UUID params are validated format before DB queries
- No user input directly interpolated into SQL or shell commands

### Injection Prevention
- SQL: All queries use Prisma or parameterized `$queryRaw` (never string concatenation)
- XSS: No `dangerouslySetInnerHTML` without sanitization
- Command injection: No `child_process.exec` with user input
- Path traversal: No user-controlled file paths

### Rate Limiting
- API endpoints that create resources have rate limits
- Rate limiter implementation is correct (sliding window, per-IP)
- Rate limit headers returned in responses
- Consider: rate limiter is in-memory (resets on restart)

### Secrets & Configuration
- No hardcoded API keys, passwords, or secrets in source code
- `.env.example` has placeholder values, not real credentials
- Sensitive env vars not logged or exposed in error messages
- Docker compose doesn't expose unnecessary ports

### Authentication & Authorization
- (Currently no auth) — but verify no sensitive operations are accidentally public
- Export endpoints (PDF/Excel) could leak data if URLs are guessable
- Consider: scan results may contain sensitive page content (HTML, screenshots)

## Files to Focus On
- `src/lib/url-validation.ts` — SSRF prevention
- `src/lib/rate-limit.ts` — Rate limiting
- `src/app/api/**/*.ts` — All API route handlers
- `src/modules/scanner/renderer/playwright.ts` — Browser automation
- `src/modules/crawler/discovery.ts` — URL crawling
- `src/config/index.ts` — Configuration
- `docker-compose*.yml` — Port exposure

## Output Format
List findings as:
- **[BLOCKER]** or **[SUGGESTION]** or **[GOOD]**
- File path and line number
- Brief explanation and fix recommendation
