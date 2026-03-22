# ClearSight

ADA/WCAG compliance checker — full-site crawl & scan for WCAG 2.1 Level A & AA violations with AI-enriched reports.

## Stack

- **Framework:** Next.js 16.1.6 (App Router, Turbopack), TypeScript (strict mode)
- **UI:** Tailwind CSS v4, shadcn/ui, Lucide React, Motion (Framer Motion)
- **Database:** PostgreSQL 16, Prisma 7.5 ORM
- **Job Queues:** BullMQ + ioredis (Redis-backed)
- **Scanner:** Playwright 1.58 (headless Chromium), axe-core
- **AI:** Azure OpenAI via raw fetch (no SDK)
- **Export:** PDFKit (PDF), ExcelJS (Excel)
- **Client data fetching:** SWR
- **Docs:** Nextra (separate package in `docs-site/`)
- **Queue monitoring:** bull-board (separate package in `bull-board/`)
- **Package manager:** pnpm (not npm/yarn)
- **Runtime:** Node 20

## Architecture

BullMQ-based async job model with 3 queues:

1. **crawl-discovery** — BFS link discovery (lightweight HTTP fetch + sitemap.xml)
2. **page-scan** — Playwright + axe-core per page (concurrency: 3)
3. **ai-enrichment** — Azure OpenAI enrichment per page (concurrency: 2)

Processes:

- **Next.js app** — UI + REST API (`src/app/`)
- **Worker** — BullMQ processors for all 3 queues (`src/worker/`)

### Full-Site Crawl Flow

POST /api/sites/:id/crawl → crawl-discovery queue → page-scan queue → ai-enrichment queue → crawl finalization

### Legacy Single-Page Scan

POST /api/scans still works — now routes through BullMQ (page-scan → ai-enrichment).

### Per-Page Pipeline Stages (sequential)

1. **Fetch** (20%) — Render page with Playwright, capture screenshot
2. **Analyze** (40%) — Run axe-core accessibility checks
3. **CustomChecks** (55%) — Link text + touch target engines
4. **Enrich** (80%) — AI enrichment (descriptions, fix suggestions, scoring)
5. **Store** (100%) — Save issues, summary, metadata to DB

If AI enrichment fails, falls back to raw findings and sets status to `completed_partial`.

## Commands

```
pnpm dev              # Next.js dev server (port 3000)
pnpm worker           # Background scan worker (BullMQ processors)
pnpm build            # Production build
pnpm start            # Production server
pnpm lint             # ESLint
pnpm db:push          # Push Prisma schema to database
pnpm db:migrate       # Run Prisma migrations
pnpm db:generate      # Generate Prisma client
pnpm bull-board       # Start Bull Board admin UI
pnpm docs:dev         # Start docs site dev server
pnpm docker:dev       # Docker dev environment (with volume mounts)
pnpm docker:dev:down  # Stop dev Docker services
pnpm docker:up        # Docker production environment (standalone build)
pnpm docker:down      # Stop production Docker services
```

## Project Structure

```
src/
├── app/                        # Next.js pages & API routes
│   ├── api/
│   │   ├── scans/              # Legacy single-page scan API
│   │   │   ├── route.ts        #   POST (create), GET (list)
│   │   │   └── [id]/
│   │   │       ├── route.ts    #   GET (status/results)
│   │   │       ├── cancel/route.ts
│   │   │       └── export/route.ts
│   │   └── sites/              # Full-site crawl API
│   │       ├── route.ts        #   POST (create site), GET (list sites)
│   │       └── [id]/
│   │           ├── route.ts    #   GET (site detail)
│   │           ├── crawl/route.ts        # POST (trigger crawl)
│   │           ├── crawls/               # GET (list), [crawlId]/ (detail, cancel, export)
│   │           ├── pages/                # GET (list), [pageId]/ (detail)
│   │           └── issues/               # GET (list/filter), [issueId]/ (detail)
│   ├── dashboard/              # Dashboard shell
│   │   ├── site/[id]/          # Site overview, crawl detail, pages, issues
│   │   └── scan/[id]/          # Legacy scan detail
│   ├── how-it-works/           # Marketing page
│   ├── faq/                    # FAQ page
│   └── page.tsx                # Landing page
├── components/
│   ├── layout/                 # Shell, Sidebar
│   ├── scan/                   # ScanForm, ScanProgress, ScanHistory
│   ├── results/                # ScoreGauge, SummaryCard, IssueTabs, IssueCard,
│   │                           #   TopPriorities, ExportButtons
│   ├── landing/                # Hero, Features, HowItWorks, Comparison, FAQ,
│   │                           #   Footer, Navbar, CTABand, Metrics
│   ├── Logo.tsx
│   └── ui/                     # shadcn components
├── modules/
│   ├── ai/
│   │   ├── providers/azure-openai.ts
│   │   └── prompts/
│   ├── scanner/
│   │   ├── renderer/playwright.ts
│   │   └── engines/            # AxeCoreEngine, LinkTextEngine, TouchTargetEngine
│   ├── crawler/                # Full-site crawl logic
│   │   ├── discovery.ts        # BFS link discovery + sitemap.xml
│   │   ├── url-normalizer.ts
│   │   ├── issue-tracker.ts    # Cross-crawl issue tracking (open/fixed/dismissed)
│   │   └── types.ts
│   ├── queue/                  # BullMQ queue definitions
│   │   ├── queues.ts
│   │   └── types.ts
│   ├── pipeline/               # PipelineOrchestrator + 5 stages
│   ├── export/                 # PDFReportGenerator, ExcelReportGenerator
│   └── db/
│       └── repositories/       # PrismaScanRepository, PrismaIssueRepository,
│                               #   PrismaSummaryRepository
├── config/index.ts             # Centralized env config
├── worker/
│   ├── index.ts                # Worker entry point with graceful shutdown
│   └── processors/             # BullMQ job processors
│       ├── crawl.processor.ts
│       ├── page-scan.processor.ts
│       └── ai-enrichment.processor.ts
└── lib/
    ├── url-validation.ts       # URL format + private IP blocking (SSRF prevention)
    ├── rate-limit.ts           # In-memory sliding window (10 scans/hour per IP)
    ├── relative-time.ts        # Human-readable time formatting
    ├── types.ts                # Client-side TypeScript interfaces
    └── utils.ts                # cn() — clsx + tailwind-merge

bull-board/                     # Standalone Bull Board admin UI (separate package)
docs-site/                      # Nextra docs site (separate package)
extension/                      # Chrome extension — one-click single-page scan
├── manifest.json               #   Manifest V3, activeTab permission only
├── popup.html                  #   Popup UI (shows current URL, scan button)
├── popup.js                    #   Opens /dashboard?autoScan=<url> in new tab
└── icons/                      #   Extension icons (16/48/128 PNG + SVG)
```

## Data Model (Prisma)

- **Site** — id, hostname, name, createdAt, updatedAt
- **Crawl** — id, siteId (FK), status (queued/discovering/scanning/completed/failed/cancelled), totalPages, scannedPages, enrichedPages, overallScore, maxPages, newIssues, fixedIssues
- **Page** — id, siteId (FK), url, path, firstSeenCrawlId
- **Scan** — id, url, status (queued/running/completed/failed/completed_partial/cancelled), progress (0-100), currentStage, pageTitle, pageScreenshot, metadata (JSON), retryCount
- **Issue** — scanId (FK, CASCADE), issueHash, issueStatus (open/fixed/dismissed/cant_fix), pageUrl, firstSeenScanId, lastSeenScanId, fixedAtCrawlId, type (confirmed/potential), severity (critical/serious/moderate/minor), confidenceScore, wcagCriterion, wcagLevel (A/AA), elementSelector, elementHtml, description, fixSuggestion, axeRuleId
- **ScanSummary** — scanId (unique FK, CASCADE), overallScore (0-100), summary text, topPriorities (JSON), positiveFindings (JSON)

## API Routes

### Sites & Crawls (full-site)

| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/sites | Create site |
| GET | /api/sites | List sites |
| GET | /api/sites/:id | Site detail |
| POST | /api/sites/:id/crawl | Trigger crawl |
| GET | /api/sites/:id/crawls | List crawls |
| GET | /api/sites/:id/crawls/:crawlId | Crawl detail |
| POST | /api/sites/:id/crawls/:crawlId/cancel | Cancel crawl |
| GET | /api/sites/:id/crawls/:crawlId/export | Export crawl report |
| GET | /api/sites/:id/pages | List pages |
| GET | /api/sites/:id/pages/:pageId | Page detail |
| GET | /api/sites/:id/issues | List/filter issues |
| GET | /api/sites/:id/issues/:issueId | Issue detail |

### Legacy Single-Page Scan

| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/scans | Create scan |
| GET | /api/scans | List scans |
| GET | /api/scans/:id | Scan status/results |
| POST | /api/scans/:id/cancel | Cancel scan |
| GET | /api/scans/:id/export | Export (PDF/Excel) |

## Environment Variables

```
DATABASE_URL              # PostgreSQL connection string
REDIS_URL                 # Redis connection string (default: redis://localhost:6379)
AZURE_OPENAI_ENDPOINT     # FULL chat completions URL (including deployment + api-version)
AZURE_OPENAI_API_KEY      # Azure OpenAI API key
AZURE_OPENAI_API_VERSION  # Default: 2025-01-01-preview
MAX_CRAWL_PAGES           # Optional limit on pages per crawl
CRAWL_DELAY_MS            # Delay between crawl requests (default: 200)
WORKER_CONCURRENCY        # Playwright instances for page scanning (default: 3)
AI_CONCURRENCY            # Concurrent AI enrichment workers (default: 2)
BULL_BOARD_PORT           # Bull Board admin UI port (default: 3001)
```

**Important:** `AZURE_OPENAI_ENDPOINT` must be the complete URL like `https://xxx.openai.azure.com/openai/deployments/model-name/chat/completions?api-version=2025-01-01-preview`. The code uses it directly as the fetch URL — it does NOT append any path.

## Key Conventions & Gotchas

### Code Style
- Strict TypeScript with `@/*` path alias → `./src/*`
- `"use client"` on interactive pages; API routes are server-side
- Type imports separated: `import type { ... }`
- Repository pattern for all DB access (modules/db/repositories/)
- Promise.allSettled for parallel scan engines (fault-tolerant)

### Important Gotchas
- BullMQ requires Redis — start Redis before the worker
- `bull-board/` has its own package.json and node_modules (separate package)
- `docs-site/` has its own package.json and node_modules (separate Nextra package)
- `pdfkit` **must** be in `serverExternalPackages` in next.config.ts — Turbopack hardcodes `/ROOT` absolute paths for `fs.readFileSync` calls, breaking .afm font file resolution at runtime
- `outputFileTracingIncludes` must include `./node_modules/pdfkit/**/*` to copy the full module into standalone output
- PDF footer text needs `{ lineBreak: false, height: 20 }` to prevent PDFKit from creating ghost pages when using `bufferPages` + `switchToPage()`
- Rate limiter is in-memory (resets on restart) — fine for single-instance, not for horizontal scaling
- URL validation blocks private IPs to prevent SSRF

### Docker
- **Production:** Multi-stage Dockerfile, standalone Next.js output, runs `prisma migrate deploy` on startup
- **Dev:** 5 services — postgres, redis, app, worker, bull-board, docs. Volume mounts (`.:/app`), anonymous volume for node_modules, uses `Dockerfile.dev` with Playwright/Chromium pre-installed
- **Dev image:** `app` service builds the `clearsight-dev` image; worker + bull-board reuse it via `image: clearsight-dev`. docs uses `node:20-slim`.
- **Worker:** Separate `Dockerfile.worker` with Playwright + Chromium
- docker-compose: postgres + redis (with healthchecks) → app → worker + bull-board + docs
