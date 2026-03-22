# ClearSight — ADA/WCAG Compliance Checker

**Date:** 2026-03-22 (updated from 2026-03-13)
**Status:** Approved Design — Full-Site Crawl Implemented

---

## 1. Overview

ClearSight is a web application that checks websites for ADA compliance against WCAG 2.1 Level A and AA standards. Users enter a URL, and ClearSight crawls the entire site (or scans a single page), analyzes accessibility issues using axe-core + custom checks, enriches findings with AI (Azure OpenAI), and presents actionable reports with issue tracking across crawls.

### Target Audience
- Developers checking their own sites during development
- Non-technical users (business owners, content editors) auditing sites
- Agencies/consultants auditing client websites

### Current Scope
- **Full-site crawling** — BFS link discovery + sitemap parsing, concurrent page scanning
- **Single-page scan** — quick one-off accessibility check
- **Issue tracking across crawls** — new, fixed, recurring, dismissed
- **AI-enriched reports** — descriptions, fix suggestions, confidence scores
- **PDF & Excel export** — executive summaries, filterable spreadsheets
- **Visual element inspector** — screenshot + HTML view with issue highlighting
- **Marketing landing page** — homepage, how it works, FAQ
- **Customer-facing docs site** — Nextra 4
- **Bull Board admin UI** — queue monitoring

---

## 2. Architecture

BullMQ-based async job model with 3 queues, all in Docker Compose:

### Services
1. **Next.js App** — serves the dashboard UI + marketing pages + API routes (port 3000)
2. **Worker Process** — BullMQ processors for crawl-discovery, page-scan, ai-enrichment
3. **PostgreSQL 16** — stores sites, crawls, pages, scans, issues, summaries
4. **Redis 7** — BullMQ job queue backend
5. **Bull Board** — Express server for queue monitoring (port 3001, dev only)
6. **Docs Site** — Nextra 4 customer docs (port 3002, dev only)

### Request Flow

#### Full-Site Crawl
1. User enters a URL → `POST /api/sites` (creates/finds site) → `POST /api/sites/:id/crawl`
2. Job added to `crawl-discovery` queue
3. Discovery processor: BFS fetches links + parses sitemap.xml → creates Page records → queues N page-scan jobs
4. Page-scan processors (3 concurrent): Playwright + axe-core pipeline → queues ai-enrichment jobs
5. AI-enrichment processors (2 concurrent): LLM enrichment + final store → atomic crawl completion detection
6. Frontend polls `GET /api/sites/:id/crawls/:crawlId` for live progress

#### Single-Page Scan
1. User enters a URL → `POST /api/scans`
2. Job added to `page-scan` queue → same pipeline as crawl pages
3. Frontend polls `GET /api/scans/:id` for progress

### BullMQ Queues

| Queue | Concurrency | Purpose |
|-------|------------|---------|
| `crawl-discovery` | 1 | BFS link discovery |
| `page-scan` | `WORKER_CONCURRENCY` (default 3) | Playwright + axe-core per page |
| `ai-enrichment` | `AI_CONCURRENCY` (default 2) | LLM enrichment per page |

### Retry Strategy
- `page-scan`: 3 attempts, exponential backoff (30s base)
- `ai-enrichment`: 4 attempts, exponential backoff (10s base)
- `crawl-discovery`: 2 attempts, exponential backoff (30s base)
- Permanent failures use `UnrecoverableError` to skip retries

### Crawl Completion Detection
Atomic SQL `UPDATE crawls SET enriched_pages = enriched_pages + 1 RETURNING enriched_pages, total_pages`. The last enrichment job to complete triggers `finalizeCrawl()` which aggregates scores and computes issue diff.

If page scans fail permanently, they increment both `scannedPages` and `enrichedPages` to prevent crawl hanging.

### API Contracts

#### Sites & Crawls

| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/sites | Create/find site (with SSRF validation) |
| GET | /api/sites | List all sites |
| GET | /api/sites/:id | Site detail |
| DELETE | /api/sites/:id | Delete site + cascade |
| POST | /api/sites/:id/crawl | Start crawl (rate-limited, 1 concurrent per site) |
| GET | /api/sites/:id/crawls | List crawls (paginated, clamped) |
| GET | /api/sites/:id/crawls/:crawlId | Crawl detail |
| POST | /api/sites/:id/crawls/:crawlId/cancel | Cancel crawl |
| GET | /api/sites/:id/crawls/:crawlId/export | Export crawl report (PDF/Excel) |
| GET | /api/sites/:id/pages | List pages (paginated, clamped) |
| GET | /api/sites/:id/pages/:pageId | Page detail |
| GET | /api/sites/:id/issues | List issues (filterable by severity/wcagLevel/status, validated, paginated) |
| PATCH | /api/sites/:id/issues/:issueId | Update issue status (open/dismissed/cant_fix) |

#### Legacy Single-Page Scan

| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/scans | Create scan (rate-limited: 10/hr per IP) |
| GET | /api/scans | List scans (paginated, clamped) |
| GET | /api/scans/:id | Scan status/results |
| POST | /api/scans/:id/cancel | Cancel scan |
| GET | /api/scans/:id/export | Export (PDF/Excel) |

### Rate Limiting
- Single-page scans: 10 per hour per IP (in-memory sliding window)
- Crawl creation: rate-limited + 1 concurrent crawl per site
- Page scans within a crawl bypass IP rate limit

---

## 3. Scan Worker Pipeline

The worker processes each page through 7 stages split across 2 queues:

### page-scan queue (stages 1-5)

#### Stage 1: Fetch & Render (Progress: 20%)
- Playwright launches headless Chromium (1280x720), navigates to URL
- Captures screenshot, extracts page title, meta info
- Edge cases: redirect chains (max 5), 30s timeout, SSL errors

#### Stage 2: axe-core Analysis (Progress: 40%)
- Runs `@axe-core/playwright` with WCAG 2.1 A+AA ruleset
- Collects violations (→ confirmed) and incomplete results (→ potential)

#### Stage 3: Custom Checks (Progress: 55%)
- Link text quality analysis
- Touch target sizing (WCAG 2.5.5 AA, 48x48px minimum)

#### Stage 4: Element Locate (Progress: 65%)
- Computes bounding boxes for every flagged element
- Serializes DOM tree for HTML inspector view

#### Stage 5: Intermediate Store (Progress: 70%)
- Saves preliminary issues + screenshot + pageHtml + metadata to DB
- Enables progressive results — frontend shows findings before AI enrichment

### ai-enrichment queue (stages 6-7)

#### Stage 6: LLM Enrichment (Progress: 80%)
- Reconstructs context from DB (issues, metadata, screenshot)
- Sends to Azure OpenAI for descriptions, fix suggestions, confidence scores, summary
- Falls back to raw axe-core descriptions if LLM fails → sets `context.llmFailed = true`

#### Stage 7: Final Store (Progress: 100%)
- Atomically replaces preliminary issues with enriched ones
- Creates scan summary
- Sets status to `completed` or `completed_partial` (if `llmFailed`)
- Saves page title, screenshot, pageHtml, metadata

---

## 4. Issue Classification & Tracking

### Two-Tier Model
- **Confirmed Issues** — definitive WCAG failures (axe-core violations + LLM-promoted)
- **Potential Issues** — require human judgment (axe-core incomplete + LLM-flagged), with confidence scores

### Cross-Crawl Issue Tracking
Each issue gets a deterministic SHA-256 hash: `sha256(canonicalRuleId | elementSelector | wcagCriterion | pageUrl)`

**Issue Lifecycle:**
```
Crawl N finds hash ABC   → status: open, firstSeenScanId set
Crawl N+1 finds same     → status: open, lastSeenScanId updated (recurring)
Crawl N+2 does NOT find  → status: fixed, fixedAtCrawlId set
```

**Dismiss/Triage:**
- `dismissed` — hidden from default view, persists across crawls
- `cant_fix` — acknowledged, visible but muted
- `open` — reopen a dismissed issue

### Crawl Comparison
On crawl completion: compare issue hashes vs previous crawl → compute newIssues, fixedIssues, recurring counts. Dismissed/cant_fix statuses carry over automatically.

---

## 5. Database Schema

### Models

- **Site** — `id, hostname (unique), name, createdAt, updatedAt` (table: `sites`)
- **Crawl** — `id, siteId, status, totalPages, scannedPages, enrichedPages, overallScore, maxPages, newIssues, fixedIssues, createdAt, completedAt` (table: `crawls`)
- **Page** — `id, siteId, url (unique per site), path, firstSeenCrawlId` (table: `pages`)
- **Scan** — `id, url, status, progress, currentStage, pageId?, crawlId?, pageTitle, pageScreenshot, pageHtml, errorMessage, retryCount, metadata` (table: `scans`)
- **Issue** — `id, scanId, type, severity, confidenceScore, wcagCriterion, wcagLevel, elementSelector, elementHtml, description, fixSuggestion, axeRuleId, ruleId, ruleHelp, elementBoundingBox, issueHash, issueStatus, pageUrl, firstSeenScanId, lastSeenScanId, fixedAtCrawlId` (table: `issues`)
- **ScanSummary** — `id, scanId (unique), overallScore, summary, topPriorities, positiveFindings` (table: `scan_summaries`)

### Enums
- `ScanStatus`: queued, running, completed, failed, completed_partial, cancelled
- `CrawlStatus`: queued, discovering, scanning, completed, failed, cancelled
- `IssueStatus`: open, fixed, dismissed, cant_fix
- `IssueType`: confirmed, potential
- `Severity`: critical, serious, moderate, minor
- `WcagLevel`: A, AA

### Key Relations
```
Site 1→N Crawl (cascade delete)
Site 1→N Page (cascade delete)
Crawl 1→N Scan (cascade delete)
Page 1→N Scan (set null on delete)
Scan 1→N Issue (cascade delete)
Scan 1→1 ScanSummary (cascade delete)
```

All models use `@map()` for snake_case column names and `@@map()` for snake_case table names.

---

## 6. Project Structure

```
clearsight/
├── prisma/schema.prisma
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── page.tsx                 # Landing page
│   │   ├── how-it-works/            # Marketing page
│   │   ├── faq/                     # Marketing page
│   │   ├── dashboard/               # App dashboard (with Shell/Sidebar)
│   │   │   ├── page.tsx             # ScanForm (crawl/page toggle)
│   │   │   ├── scan/[id]/           # Single-page scan results
│   │   │   └── site/[id]/           # Site overview, crawl detail, pages, issues
│   │   ├── scan/[id]/               # Redirect → /dashboard/scan/[id]
│   │   └── api/
│   │       ├── scans/               # Legacy single-page scan API
│   │       └── sites/               # Full-site crawl API
│   ├── components/
│   │   ├── layout/                  # Shell, Sidebar
│   │   ├── scan/                    # ScanForm, ScanProgress, ScanHistory
│   │   ├── results/                 # ScoreGauge, SummaryCard, IssueTabs, IssueCard, etc.
│   │   ├── inspector/               # InspectorPanel, ScreenshotViewer, HtmlViewer
│   │   ├── landing/                 # Hero, Features, HowItWorks, FAQ, Footer, Navbar, etc.
│   │   ├── ui/                      # shadcn components + SeverityBadge, WcagPill
│   │   └── Logo.tsx
│   ├── modules/
│   │   ├── ai/                      # Azure OpenAI provider, prompts, fallback
│   │   ├── scanner/                 # Playwright renderer, axe-core + custom engines
│   │   ├── crawler/                 # BFS discovery, URL normalizer, issue tracker
│   │   ├── queue/                   # BullMQ queue definitions (3 queues)
│   │   ├── pipeline/                # PipelineOrchestrator + 7 stages + issue hash
│   │   ├── export/                  # PDFReportGenerator, ExcelReportGenerator
│   │   └── db/                      # Prisma client, repositories (scan, site, crawl, page, issue, summary)
│   ├── worker/
│   │   ├── index.ts                 # BullMQ worker entry (3 workers + graceful shutdown)
│   │   └── processors/              # crawl, page-scan, ai-enrichment processors
│   ├── config/index.ts              # Centralized env config
│   └── lib/
│       ├── types.ts                 # Client-side TypeScript interfaces
│       ├── design-tokens.ts         # Centralized severity config, score helpers
│       ├── api-utils.ts             # Shared parsePagination utility
│       ├── url-validation.ts        # URL format + SSRF prevention
│       ├── rate-limit.ts            # In-memory sliding window
│       ├── relative-time.ts         # Human-readable time formatting
│       └── utils.ts                 # cn() — clsx + tailwind-merge
├── bull-board/                      # Standalone Express + Bull Board UI
├── docs-site/                       # Nextra 4 customer docs
├── docs-internal/                   # Specs, plans, decisions
├── docker-compose.dev.yml           # Dev: postgres, redis, app, worker, bull-board, docs
└── docker-compose.yml               # Prod: postgres, redis, app, worker
```

---

## 7. Tech Stack

| Technology | Purpose |
|-----------|---------|
| Next.js 16 (App Router, Turbopack) | Full-stack framework |
| TypeScript (strict mode) | Type safety throughout |
| Tailwind CSS v4 | Utility-first styling |
| shadcn/ui | Component primitives |
| Lucide React | Icon set |
| Motion (Framer Motion) | Animations |
| PostgreSQL 16 | Database |
| Prisma 7.5 | ORM |
| Redis 7 | BullMQ job queue backend |
| BullMQ | Job queues (3 queues, concurrent processing) |
| Playwright 1.58 | Headless Chromium for page rendering |
| axe-core | Accessibility scanning engine |
| Azure OpenAI | LLM for report enrichment |
| PDFKit | PDF report generation |
| ExcelJS | Excel report generation |
| SWR | Client-side data fetching |
| Nextra 4 | Customer docs site |
| Bull Board | Queue monitoring UI |
| Docker Compose | Container orchestration |
| pnpm | Package manager |

---

## 8. UI & UX Design

### Theme
- **Primary accent:** `#E90029` (ClearSight red)
- **Base:** Light theme with neutral grays
- **Border radius:** `--radius: 0.25rem` (sharp, professional)
- **Severity colors:** Critical `#DC2626`, Serious `#D97706`, Moderate `#EAB308`, Minor `#3B82F6`
- **Score gauge:** 0-49 red, 50-79 yellow, 80-100 green

### Layout
- **Landing pages** (`/`, `/how-it-works`, `/faq`) — full-width, no sidebar
- **Dashboard** (`/dashboard/*`) — sidebar + main content area

### Dashboard Pages
- **Dashboard home** — ScanForm with crawl/page toggle + animated SVG visualizations
- **Site overview** — score gauge, total issues, severity breakdown, pages list, crawl history
- **Crawl detail** — live progress (during crawl), two-column issues + pages (after completion)
- **Issues list** — filterable by severity/status, left accent borders, severity badges, WCAG pills
- **Pages list** — score + issue count per page
- **Page detail** — latest scan summary, scan history, "View full results" link
- **Scan results** — score, AI summary, positive findings, top priorities, tabbed issue list, inspector

### Sidebar
- ClearSight logo (links to homepage)
- "New Scan" button → navigates to dashboard
- Sites section with score badges + active crawl indicators
- Scans section with filterable history
- Collapsible on mobile (hamburger toggle)

### Design System
- Centralized severity config in `src/lib/design-tokens.ts`
- Shared components: `<SeverityBadge>`, `<WcagPill>`
- Shared API utility: `parsePagination()` in `src/lib/api-utils.ts`
- Issue cards have 3px left accent border colored by severity

---

## 9. Environment & Configuration

### Docker Compose Services (Dev)
1. **postgres** — PostgreSQL 16 (port 5432)
2. **redis** — Redis 7 Alpine (port 6379)
3. **app** — Next.js dev server (port 3000)
4. **worker** — BullMQ worker (crawl + page-scan + ai-enrichment)
5. **bull-board** — Queue monitoring UI (port 3001)
6. **docs** — Nextra docs site (port 3002)

### Environment Variables
```
DATABASE_URL=postgresql://clearsight:clearsight@localhost:5432/clearsight
REDIS_URL=redis://localhost:6379
AZURE_OPENAI_ENDPOINT=<full chat completions URL>
AZURE_OPENAI_API_KEY=<your-api-key>
AZURE_OPENAI_API_VERSION=2025-01-01-preview
WORKER_CONCURRENCY=3          # Concurrent Playwright instances
AI_CONCURRENCY=2              # Concurrent LLM calls
MAX_CRAWL_PAGES=               # Empty = unlimited, set to 50 for testing
CRAWL_DELAY_MS=200            # Delay between discovery fetches
BULL_BOARD_PORT=3001
```

### Commands
```
pnpm dev              # Next.js dev server
pnpm worker           # BullMQ worker
pnpm build            # Production build
pnpm lint             # ESLint
pnpm db:push          # Push Prisma schema
pnpm db:generate      # Generate Prisma client
pnpm bull-board       # Bull Board admin UI
pnpm docs:dev         # Nextra docs site
pnpm docker:dev       # Docker dev (all 6 services)
pnpm docker:dev:down  # Stop dev Docker
```

---

## 10. Security

- **SSRF prevention** — URL validation blocks private IPs on both `/api/scans` and `/api/sites`
- **Rate limiting** — 10 scans/hour per IP, 1 concurrent crawl per site
- **Input validation** — enum validation on filter params, pagination clamping, JSON body parsing
- **SQL injection** — Prisma parameterized queries throughout, `$queryRaw` uses tagged templates
- **Error handling** — try/catch on all API routes, clean error responses
- **Graceful shutdown** — 30s timeout on worker shutdown
- **No authentication** — acceptable for single-user/dev, documented as future enhancement

---

## 11. Future Enhancements
- User authentication / multi-tenancy
- Scheduled recurring crawls
- Playwright-based discovery fallback for SPAs
- CI/CD integration (API endpoint for automated checks)
- Browser extension improvements
- WCAG 2.2 and AAA level support
- Authentication-aware scanning (login flows)
- Dark mode
- Horizontal scaling (multiple worker processes)
