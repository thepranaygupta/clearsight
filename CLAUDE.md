# ClearSight

ADA/WCAG compliance checker — scans web pages for WCAG 2.1 Level A & AA violations with AI-enriched reports.

## Stack

- **Framework:** Next.js 16.1.6 (App Router, Turbopack), TypeScript (strict mode)
- **UI:** Tailwind CSS v4, shadcn/ui, Lucide React
- **Database:** PostgreSQL 16, Prisma 7.5 ORM
- **Scanner:** Playwright 1.58 (headless Chromium), axe-core
- **AI:** Azure OpenAI via raw fetch (no SDK)
- **Export:** PDFKit (PDF), ExcelJS (Excel)
- **Client data fetching:** SWR
- **Package manager:** pnpm (not npm/yarn)
- **Runtime:** Node 20

## Architecture

Async job model with two processes:

- **Next.js app** — UI + REST API (`src/app/`)
- **Worker** — background scan jobs (`src/worker/`), polls every 2s for queued scans

Worker uses `FOR UPDATE SKIP LOCKED` for safe job claiming. Stale jobs (running > 120s) are recovered automatically (max 3 retries).

### Pipeline Stages (sequential)

1. **Fetch** (20%) — Render page with Playwright, capture screenshot
2. **Analyze** (40%) — Run axe-core accessibility checks
3. **CustomChecks** (55%) — Link text + touch target engines
4. **Enrich** (80%) — AI enrichment (descriptions, fix suggestions, scoring)
5. **Store** (100%) — Save issues, summary, metadata to DB

If AI enrichment fails, falls back to raw findings and sets status to `completed_partial`.

### Data Flow

Client submits URL → POST /api/scans creates queued scan → Worker claims it → Runs pipeline → Frontend polls GET /api/scans/:id via SWR → Renders results → User can export PDF/Excel

## Commands

```
pnpm dev              # Next.js dev server (port 3000)
pnpm worker           # Background scan worker
pnpm build            # Production build
pnpm start            # Production server
pnpm lint             # ESLint
pnpm db:push          # Push Prisma schema to database
pnpm db:migrate       # Run Prisma migrations
pnpm db:generate      # Generate Prisma client
pnpm docker:dev       # Docker dev environment (with volume mounts)
pnpm docker:dev:down  # Stop dev Docker services
pnpm docker:up        # Docker production environment (standalone build)
pnpm docker:down      # Stop production Docker services
```

## Project Structure

```
src/
├── app/                        # Next.js pages & API routes
│   ├── api/scans/              # REST API
│   │   ├── route.ts            #   POST (create), GET (list with pagination)
│   │   └── [id]/
│   │       ├── route.ts        #   GET (status/results)
│   │       ├── cancel/route.ts #   POST (cancel running scan)
│   │       └── export/route.ts #   GET (PDF/Excel download, ?format=pdf|excel)
│   ├── scan/[id]/page.tsx      # Scan results page
│   └── page.tsx                # Dashboard
├── components/
│   ├── layout/                 # Shell, Sidebar (with scan history)
│   ├── scan/                   # ScanForm, ScanProgress, ScanHistory
│   ├── results/                # ScoreGauge, SummaryCard, IssueTabs, IssueCard,
│   │                           #   TopPriorities, ExportButtons
│   └── ui/                     # shadcn components (button, card, dialog, tabs, etc.)
├── modules/
│   ├── ai/
│   │   ├── providers/azure-openai.ts  # LLM provider (enrichIssues, generateSummary)
│   │   └── prompts/                   # enrich-issues, generate-summary, report-narrative
│   ├── scanner/
│   │   ├── renderer/playwright.ts     # Browser automation (Chromium, 1280x720)
│   │   └── engines/                   # AxeCoreEngine, LinkTextEngine, TouchTargetEngine
│   ├── pipeline/                      # PipelineOrchestrator + 5 stages
│   ├── export/                        # PDFReportGenerator, ExcelReportGenerator
│   └── db/
│       └── repositories/              # PrismaScanRepository, PrismaIssueRepository,
│                                      #   PrismaSummaryRepository
├── config/index.ts             # Centralized env config
├── worker/index.ts             # Job poller with graceful shutdown
└── lib/
    ├── url-validation.ts       # URL format + private IP blocking (SSRF prevention)
    ├── rate-limit.ts           # In-memory sliding window (10 scans/hour per IP)
    ├── relative-time.ts        # Human-readable time formatting
    ├── types.ts                # Client-side TypeScript interfaces
    └── utils.ts                # cn() — clsx + tailwind-merge
```

## Data Model (Prisma)

- **Scan** — id, url, status (queued/running/completed/failed/completed_partial/cancelled), progress (0-100), currentStage, pageTitle, pageScreenshot, metadata (JSON), retryCount
- **Issue** — scanId (FK, CASCADE), type (confirmed/potential), severity (critical/serious/moderate/minor), confidenceScore, wcagCriterion, wcagLevel (A/AA), elementSelector, elementHtml, description, fixSuggestion, axeRuleId
- **ScanSummary** — scanId (unique FK, CASCADE), overallScore (0-100), summary text, topPriorities (JSON), positiveFindings (JSON)

## Environment Variables

```
DATABASE_URL          # PostgreSQL connection string
AZURE_OPENAI_ENDPOINT # FULL chat completions URL (including deployment + api-version)
AZURE_OPENAI_API_KEY  # Azure OpenAI API key
AZURE_OPENAI_API_VERSION  # Default: 2025-01-01-preview
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
- `pdfkit` **must** be in `serverExternalPackages` in next.config.ts — Turbopack hardcodes `/ROOT` absolute paths for `fs.readFileSync` calls, breaking .afm font file resolution at runtime
- `outputFileTracingIncludes` must include `./node_modules/pdfkit/**/*` to copy the full module into standalone output
- PDF footer text needs `{ lineBreak: false, height: 20 }` to prevent PDFKit from creating ghost pages when using `bufferPages` + `switchToPage()`
- Rate limiter is in-memory (resets on restart) — fine for single-instance, not for horizontal scaling
- URL validation blocks private IPs to prevent SSRF

### Docker
- **Production:** Multi-stage Dockerfile, standalone Next.js output, runs `prisma migrate deploy` on startup
- **Dev:** Volume mounts (`.:/app`), anonymous volume for node_modules, uses `Dockerfile.dev` with Playwright/Chromium pre-installed
- **Worker:** Separate `Dockerfile.worker` with Playwright + Chromium
- docker-compose: postgres (with healthcheck) → app (with healthcheck) → worker (depends on app)
