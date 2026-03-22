# Full-Site Crawl & Overhaul — Design Spec

**Date:** 2026-03-21
**Branch:** `feat/full-site-crawl`
**Status:** Draft

---

## Overview

Evolve ClearSight from a single-page accessibility scanner into a full-site crawler with issue tracking, concurrent scanning, and a marketing-grade landing page. Modeled after Siteimprove's UX but scoped to ClearSight's single-instance architecture.

### Goals

- Crawl all pages of a site (BFS link discovery + sitemap.xml)
- Scan pages concurrently (configurable Playwright instances)
- Track issues across crawls (new, fixed, recurring, dismissed)
- Add BullMQ + Redis for robust job management
- Add marketing landing page, docs site, and Bull Board admin UI
- Keep standalone single-page scan as a separate feature
- Keep everything modular for future extensibility (auth, scheduling, etc.)

### Non-Goals (for now)

- User authentication / multi-tenancy
- Scheduled recurring crawls
- Horizontal scaling (multiple worker processes)
- robots.txt compliance
- SPA-rendered link discovery (plain HTTP fetch only; JS-rendered SPAs may yield fewer discovered links)

---

## 1. Data Model

### Enums

```prisma
enum CrawlStatus {
  queued
  discovering
  scanning
  completed
  failed
  cancelled
}

enum IssueStatus {
  open
  fixed
  dismissed
  cant_fix
}
```

### New Entities

#### Site

| Column    | Type     | Notes                          |
|-----------|----------|--------------------------------|
| id        | uuid     | PK                             |
| hostname  | string   | Unique, normalized (see below) |
| name      | string   | Display name (defaults to hostname) |
| createdAt | datetime |                                |
| updatedAt | datetime |                                |

Auto-created when user triggers first crawl for a hostname.

**Hostname normalization:** Lowercase, strip `www.` prefix. `www.example.com` and `example.com` resolve to the same Site. Protocol is not stored — the crawl root URL carries the protocol.

#### Crawl

| Column       | Type     | Notes                                        |
|--------------|----------|----------------------------------------------|
| id           | uuid     | PK                                           |
| siteId       | uuid     | FK → Site                                    |
| status       | enum     | queued / discovering / scanning / completed / failed / cancelled |
| totalPages   | int      | Updated during discovery                     |
| scannedPages | int      | Incremented as page scans complete            |
| enrichedPages| int      | Incremented as AI enrichment completes. Used for atomic completion detection. |
| overallScore | float?   | Aggregated after completion                  |
| maxPages     | int?     | Per-crawl cap. Capped by `MAX_CRAWL_PAGES` env var if set (env var is the hard ceiling). null = use env var or unlimited |
| newIssues    | int      | Count vs previous crawl                      |
| fixedIssues  | int      | Count vs previous crawl                      |
| createdAt    | datetime |                                              |
| completedAt  | datetime?|                                              |
| updatedAt    | datetime |                                              |

#### Page

| Column          | Type     | Notes                              |
|-----------------|----------|------------------------------------|
| id              | uuid     | PK                                 |
| siteId          | uuid     | FK → Site                          |
| url             | string   | Full URL, @@unique([siteId, url])  |
| path            | string   | URL path portion                   |
| firstSeenCrawlId| uuid     | FK → Crawl                         |
| createdAt       | datetime |                                    |
| updatedAt       | datetime |                                    |

Persists across crawls. Enables issue tracking over time. `lastScanId` is derived (`SELECT ... FROM scans WHERE pageId = ? ORDER BY createdAt DESC LIMIT 1`) rather than stored, to avoid race conditions during concurrent scans.

### Modified Entities

#### Scan — add columns

| Column  | Type  | Notes                                    |
|---------|-------|------------------------------------------|
| pageId  | uuid? | FK → Page (null for standalone scans)    |
| crawlId | uuid? | FK → Crawl (null for standalone scans)   |

Existing scans continue working with both null.

#### Issue — add columns

| Column          | Type     | Notes                                              |
|-----------------|----------|----------------------------------------------------|
| issueHash       | string   | Deterministic hash (see below). Computed at insert time. |
| status          | enum     | IssueStatus: open / fixed / dismissed / cant_fix (default: open) |
| pageUrl         | string?  | Denormalized from Scan→Page for hash computation + display |
| firstSeenScanId | uuid?    | FK → Scan                                          |
| lastSeenScanId  | uuid?    | FK → Scan                                          |
| fixedAtCrawlId  | uuid?    | FK → Crawl. Set when issue disappears in a crawl.  |

**Issue hash formula:**
```
canonicalRuleId = ruleId ?? axeRuleId ?? "unknown"
issueHash = sha256(canonicalRuleId + "|" + elementSelector + "|" + wcagCriterion + "|" + pageUrl)
```
Uses `ruleId` (custom engines) with fallback to `axeRuleId` (axe-core). The `pageUrl` is denormalized onto the Issue row at insert time so the hash can be computed without joins. Enables tracking the same issue across crawls.

### Relationships

```
Site 1→N Crawl
Site 1→N Page
Crawl 1→N Scan
Page 1→N Scan
Scan 1→N Issue (unchanged)
```

---

## 2. Crawler Module

### Discovery Phase

New module at `src/modules/crawler/`.

**Strategy:** BFS link discovery using lightweight HTTP fetch (not Playwright).

**Discovery sources:**
1. Parse `<a href>`, `<link href>`, `<iframe src>` from HTML
2. Fetch and parse `/sitemap.xml` — catches URLs not in navigation
3. BFS continues until no new URLs found or `MAX_CRAWL_PAGES` cap hit

**URL normalization:**
- Strip fragments (`#section`)
- Strip trailing slashes (`/about/` → `/about`)
- Strip tracking params (`?utm_source=...`, `?ref=...`) — configurable ignore list
- Lowercase hostname
- Keep meaningful query params (e.g. `/search?q=foo` stays unique)

**Same-origin check:** `new URL(href).origin === new URL(rootUrl).origin`

**Cap:** `MAX_CRAWL_PAGES` env var. Empty = unlimited. Set to `50` for testing.

**Throttling:** Configurable delay between discovery fetches via `CRAWL_DELAY_MS` env var (default: 200ms). Prevents aggressive crawling from getting the user's IP blocked. Sets `User-Agent: ClearSight/1.0 Accessibility Scanner`.

**Known limitation:** Plain HTTP fetch won't discover links rendered by JavaScript (SPAs). If discovery finds 0 links from the root page, log a warning. Future enhancement: optional Playwright-based discovery fallback.

### Key Files

```
src/modules/crawler/
├── index.ts              # CrawlOrchestrator
├── discovery.ts          # BFS link discovery (fetch + parse)
├── url-normalizer.ts     # Normalization, dedup, same-origin filter
└── types.ts              # CrawlContext, DiscoveredPage
```

---

## 3. Worker Architecture (BullMQ + Redis)

### Queues

| Queue              | Purpose                              | Concurrency                    |
|--------------------|--------------------------------------|--------------------------------|
| `crawl-discovery`  | BFS link crawling                    | 1 (one crawl at a time)       |
| `page-scan`        | Pipeline stages 1-5 per page         | `WORKER_CONCURRENCY` (default 3) |
| `ai-enrichment`    | LLM enrichment + final store         | `AI_CONCURRENCY` (default 2)  |

### Why Split page-scan and ai-enrichment?

- Page scanning is CPU/memory bound (Playwright browsers)
- AI enrichment is I/O bound (waiting on Azure OpenAI)
- Different concurrency — can run more AI calls than browser instances
- Slow LLM response doesn't block next page from scanning

### Crawl Flow

```
1. POST /api/sites/:id/crawl → creates Crawl (status: queued) → adds job to crawl-discovery queue

2. crawl-discovery processor:
   → BFS fetches links from root URL
   → Updates Crawl.status → "discovering"
   → Creates Page records as URLs are found
   → Updates Crawl.totalPages in real-time
   → When done: queues N jobs to page-scan queue
   → Updates Crawl.status → "scanning"

3. page-scan processor (x3 concurrent):
   → Runs pipeline stages 1-5 (Fetch → Analyze → CustomChecks → ElementLocate → IntermediateStore)
   → Adds job to ai-enrichment queue
   → Increments Crawl.scannedPages

4. ai-enrichment processor (x2 concurrent):
   → Runs Enrich + FinalStore stages
   → On completion: atomically increment enriched count:
     UPDATE crawls SET enriched_pages = enriched_pages + 1 WHERE id = ? RETURNING enriched_pages
   → If enriched_pages === total_pages: this job is the last one
     → Aggregates site score, computes issue diff, marks Crawl → "completed"
   → Atomic RETURNING prevents race conditions when multiple jobs finish simultaneously
```

### Single-Page Scan Flow

Unchanged but goes through the same queues:
```
POST /api/scans → adds job to page-scan queue (no crawlId/pageId) → same pipeline
```

### Retry Strategy

- `page-scan`: 2 retries, exponential backoff (30s, 120s)
- `ai-enrichment`: 3 retries, exponential backoff (10s, 30s, 90s)
- `crawl-discovery`: 1 retry

### Cancellation

- Set Crawl.status → "cancelled"
- Remove pending jobs for that crawlId from page-scan and ai-enrichment queues
- In-flight jobs check Crawl.status at stage boundaries — if cancelled, abort (CancelledError pattern)

### Graceful Shutdown

Worker listens for SIGTERM/SIGINT:
- Stop accepting new jobs
- Wait for in-flight jobs to finish (with timeout)
- Close Playwright browsers
- Close Redis connection

### Key Files

```
src/modules/queue/
├── index.ts                         # Redis connection + queue factory
├── queues.ts                        # Queue instances (crawl, page-scan, ai-enrichment)
└── types.ts                         # Job payload types

src/worker/
├── index.ts                         # Entry — registers all BullMQ processors
└── processors/
    ├── crawl.processor.ts           # Discovery phase
    ├── page-scan.processor.ts       # Pipeline stages 1-5
    └── ai-enrichment.processor.ts   # Enrich + final store
```

Queue definitions live in `src/modules/queue/` (shared between worker and API for job enqueuing). Worker only contains processor logic.

---

## 4. Issue Tracking Across Crawls

### Issue Identity

Deterministic hash:
```
issueHash = sha256(ruleId + "|" + elementSelector + "|" + wcagCriterion + "|" + pageUrl)
```

Same rule violation on same element on same page = same hash across crawls.

### Issue Lifecycle

```
Crawl N finds hash ABC   → status: "open", firstSeenScanId: N's scan, lastSeenScanId: N's scan
Crawl N+1 finds same     → status: "open", lastSeenScanId: updated to N+1's scan (recurring)
Crawl N+2 does NOT find  → status: "fixed", fixedAtCrawlId: N+2's crawl id
```

Note: Issues with status `dismissed` or `cant_fix` are still detected by the scanner but their status is preserved (not overwritten to "open"). They appear in the diff as "recurring (dismissed)" if still present.

### Dismiss / Triage

- **dismissed** — hide from default view, still detected but filtered
- **cant_fix** — acknowledged, visible but muted styling
- **reopen** — undo dismiss

Dismissed issues persist across crawls. Show/hide with toggle.

### Crawl Comparison

On crawl completion, compute diff vs previous crawl:
- **New issues:** hash in current but not previous
- **Fixed issues:** hash in previous but not current
- **Recurring:** hash in both

Stored on Crawl record (newIssues, fixedIssues counts).

---

## 5. API Routes

### New Routes

```
Sites:
  POST   /api/sites                              → Create site
  GET    /api/sites                              → List all sites
  GET    /api/sites/:id                          → Site overview
  DELETE /api/sites/:id                          → Delete site + all data

Crawls:
  POST   /api/sites/:id/crawl                    → Start new crawl
  GET    /api/sites/:id/crawls                   → List crawls (paginated)
  GET    /api/sites/:id/crawls/:crawlId          → Crawl detail
  POST   /api/sites/:id/crawls/:crawlId/cancel   → Cancel crawl
  GET    /api/sites/:id/crawls/:crawlId/export   → Export crawl report

Pages:
  GET    /api/sites/:id/pages                    → List pages (filtered, paginated)
  GET    /api/sites/:id/pages/:pageId            → Page detail + latest scan

Issues (site-level):
  GET    /api/sites/:id/issues                   → All issues (filterable)
  PATCH  /api/sites/:id/issues/:issueId          → Update status (dismiss/reopen)
```

### Existing Routes (Unchanged)

```
  POST   /api/scans                              → Single-page scan
  GET    /api/scans/:id                          → Scan status/results
  POST   /api/scans/:id/cancel                   → Cancel scan
  GET    /api/scans/:id/export                   → Export scan report
```

### Rate Limiting

- Crawl creation: 1 concurrent crawl per site (reject if a crawl is already running for that site)
- Page scans within a crawl bypass the per-IP rate limit (they're internal jobs)
- Standalone single-page scans: existing 10/hour per IP limit unchanged

### Frontend Polling

- Crawl progress: poll `GET /api/sites/:id/crawls/:crawlId` every 2s while discovering/scanning
- Individual page scan: poll scan endpoint every 2s (unchanged)
- Site overview: fetch on load + after crawl completes

---

## 6. UI Routes & Pages

### Route Structure

```
/                                    → Landing page (marketing)
/how-it-works                        → How it works page
/faq                                 → FAQ page
/dashboard                           → App dashboard (sites + quick scan)
/dashboard/scan/:id                  → Single-page scan results
/dashboard/site/:id                  → Site overview
/dashboard/site/:id/crawl/:id       → Crawl detail (live progress + results)
/dashboard/site/:id/issues           → Site-wide issues (filterable)
/dashboard/site/:id/pages            → Pages list with scores
/dashboard/site/:id/page/:id        → Single page results
```

### Redirects (breaking change migration)

- `/scan/:id` → `/dashboard/scan/:id` (301 redirect for existing bookmarks/links)

### Landing Page (`/`)

- **Hero:** Headline + URL input CTA + animated screenshot
- **Stats strip:** "50+ WCAG rules" / "AI fix suggestions" / "Full site crawl" / "PDF & Excel"
- **How it works:** 3-step visual
- **Features grid:** 6 cards (crawl, tracking, AI, inspector, export, WCAG coverage)
- **FAQ accordion**
- **Footer:** Links to docs (docs-site), branding
- **Navbar:** Logo, "How it works", "FAQ", "Docs →" (link to docs-site), "Dashboard" CTA

### Dashboard (`/dashboard`)

- **Left:** Sites list — cards with hostname, score, page count, last crawl, status. "Add site" button.
- **Right:** Quick single-page scan (existing ScanForm). Recent standalone scans below.

### Site Overview (`/dashboard/site/:id`)

- Header: hostname, favicon, last crawl date, "Crawl now" button
- Score gauge (aggregated)
- Stats row: total pages, total issues, critical/serious counts
- Crawl history list
- Worst 5 pages by issue count

### Crawl Detail (`/dashboard/site/:id/crawl/:id`)

**During crawl:**
- Progress bar (scannedPages / totalPages)
- Live log — pages discovered, scanned, enriched
- Real-time stats (issues found so far)
- Cancel button

**After completion:**
- Score + summary
- Issue breakdown by severity, WCAG, page
- "By Issue" vs "By Page" toggle
- Diff vs previous crawl (new / fixed / recurring counts)
- Export button

### Issues View (`/dashboard/site/:id/issues`)

- **Filters:** severity, WCAG criterion, WCAG level, status, page
- **Sort:** severity, occurrences, pages affected, newest
- **Columns:** description, severity, WCAG, pages count, occurrences, status, first/last seen
- **Click row** → issue detail with inspector
- **Bulk actions:** dismiss selected, export filtered
- **Toggle:** show/hide dismissed issues

### Sidebar (Updated)

- Sites section with scores + active crawl indicator
- Recent standalone scans section

---

## 7. File Structure

### New Files

```
src/
├── modules/
│   ├── crawler/
│   │   ├── index.ts
│   │   ├── discovery.ts
│   │   ├── url-normalizer.ts
│   │   └── types.ts
│   ├── queue/
│   │   ├── index.ts
│   │   ├── queues.ts
│   │   └── types.ts
│   └── db/repositories/
│       ├── site.repository.ts
│       ├── crawl.repository.ts
│       └── page.repository.ts
├── worker/
│   ├── index.ts
│   ├── processors/
│   │   ├── crawl.processor.ts
│   │   ├── page-scan.processor.ts
│   │   └── ai-enrichment.processor.ts
│   └── queues.ts
├── app/
│   ├── page.tsx                          # Landing page
│   ├── how-it-works/page.tsx
│   ├── faq/page.tsx
│   ├── dashboard/
│   │   ├── page.tsx                      # Dashboard
│   │   ├── layout.tsx                    # Dashboard layout with sidebar
│   │   ├── scan/[id]/page.tsx            # Single-page scan (moved)
│   │   └── site/[id]/
│   │       ├── page.tsx                  # Site overview
│   │       ├── crawl/[id]/page.tsx       # Crawl detail
│   │       ├── issues/page.tsx           # Issues view
│   │       ├── pages/page.tsx            # Pages list
│   │       └── page/[id]/page.tsx        # Page results
│   └── api/
│       ├── sites/
│       │   ├── route.ts
│       │   └── [id]/
│       │       ├── route.ts
│       │       ├── crawl/route.ts
│       │       ├── crawls/
│       │       │   ├── route.ts
│       │       │   └── [crawlId]/
│       │       │       ├── route.ts
│       │       │       ├── cancel/route.ts
│       │       │       └── export/route.ts
│       │       ├── pages/
│       │       │   ├── route.ts
│       │       │   └── [pageId]/route.ts
│       │       └── issues/
│       │           ├── route.ts
│       │           └── [issueId]/route.ts
│       └── scans/                        # Unchanged

# At repo root (separate apps, own package.json):
bull-board/
├── index.ts                              # Express server, port 3001
├── Dockerfile
└── package.json

docs-site/                                # Nextra 4, port 3002
├── package.json
├── next.config.mjs
├── content/
│   ├── index.mdx
│   ├── getting-started.mdx
│   ├── scanning/
│   ├── results/
│   ├── api/
│   └── faq.mdx
├── public/screenshots/
└── theme.config.tsx

docs-internal/
├── README.md
├── specs/
└── decisions/
```

### Modified Files

```
prisma/schema.prisma              # Site, Crawl, Page models + Issue changes
src/config/index.ts               # REDIS_URL, WORKER_CONCURRENCY, AI_CONCURRENCY, MAX_CRAWL_PAGES, BULL_BOARD_PORT
src/components/layout/Shell.tsx   # Navbar with Docs link, landing vs dashboard layout
src/components/layout/Sidebar.tsx # Sites + recent scans sections
src/lib/types.ts                  # Site, Crawl, Page, CrawlDetail types
docker-compose.yml                # Add redis, bull-board services
docker-compose.dev.yml            # Add docs-site service
```

### Modified (minor)

- `src/modules/pipeline/index.ts` — `PipelineOrchestrator` updated to support running a subset of stages (stages 1-5 or stages 6-7), so processors can invoke partial pipelines. Individual stage files unchanged.

### Unchanged

- `src/modules/pipeline/stages/*` — all individual stages as-is
- `src/modules/ai/` — enrichment logic
- `src/modules/scanner/` — engines
- `src/modules/export/` — PDF/Excel
- `src/components/results/` — all result components reused
- `src/components/inspector/` — inspector fully reused

---

## 8. Environment Variables (New)

```
REDIS_URL=redis://localhost:6379
WORKER_CONCURRENCY=3              # Concurrent Playwright instances (~300MB RAM each)
AI_CONCURRENCY=2                  # Concurrent LLM calls
MAX_CRAWL_PAGES=                  # Empty = unlimited, set to 50 for testing
CRAWL_DELAY_MS=200                # Delay between discovery fetches (ms)
BULL_BOARD_PORT=3001
```

### Browser Pool Strategy

Each concurrent page-scan creates a new Chromium process (~300-500MB RAM). With `WORKER_CONCURRENCY=3`, expect ~1-1.5GB overhead. Future optimization: share a single browser instance with multiple `BrowserContext`s (much lighter). For now, the per-scan browser approach matches existing behavior and is simpler.

---

## 9. Docker Services

```
postgres:5432     PostgreSQL 16
redis:6379        Redis 7 Alpine
next-app:3000     Next.js app (landing + dashboard + API)
worker            BullMQ worker (crawl + page-scan + ai-enrichment processors)
bull-board:3001   Express + Bull Board UI (dev/staging only)
docs-site:3002    Nextra docs (dev/staging only)
```

---

## 10. Implementation Phases

### Migration Strategy

Drop and recreate the database. No data migration needed — existing scan data is disposable.

### Phase 1: Foundation (Data Model + Queue + Crawler)

1. Add Redis to docker-compose
2. Install BullMQ, ioredis, @bull-board/*
3. Prisma schema: add Site, Crawl, Page models; modify Scan + Issue; add CrawlStatus + IssueStatus enums
4. Drop database and run `prisma db push`
5. Implement repositories (site, crawl, page)
6. Implement queue module (Redis connection, queue definitions)
7. Implement crawler module (BFS discovery, URL normalizer)
8. Implement BullMQ processors (crawl, page-scan, ai-enrichment)
9. Refactor worker to use BullMQ instead of polling loop
10. Ensure standalone single-page scan still works through new queue
11. Set up Bull Board Express server

### Phase 2: API + Core UI

1. API routes: sites CRUD, crawl trigger, crawl detail, pages, issues
2. Move current `/` dashboard to `/dashboard`
3. Dashboard layout with sidebar (sites + recent scans)
4. Site overview page
5. Crawl detail page (live progress + results)
6. Issues view with filters/sort
7. Pages list
8. Single page results (reuse existing ResultsView)
9. Issue status management (dismiss, can't fix, reopen)

### Phase 3: Issue Tracking + Crawl Comparison

1. Implement issueHash generation
2. Issue lifecycle (open → fixed → reopen)
3. Crawl diff computation (new/fixed/recurring)
4. Issue history display in UI
5. Bulk actions (dismiss selected)

### Phase 4: Landing Page + Marketing Pages

1. Landing page (hero, features, how it works, FAQ, footer)
2. Navbar with Docs link
3. How it works page
4. FAQ page

### Phase 5: Docs Site

1. Scaffold docs-site with Nextra 4
2. Write content (getting started, scanning, results, API, FAQ)
3. Capture screenshots from localhost
4. Add to docker-compose
5. Set up docs-internal structure

### Phase 6: Polish + Export

1. Crawl-level export (PDF/Excel for full site report)
2. Site-level score aggregation refinement
3. Sidebar refinements
4. Loading states, error states, empty states for all new pages
5. Mobile responsiveness for new pages
