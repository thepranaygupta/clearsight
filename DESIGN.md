# ClearSight — ADA/WCAG Compliance Checker

**Date:** 2026-03-13
**Status:** Approved Design

---

## 1. Overview

ClearSight is a web application that checks websites for ADA compliance against WCAG 2.1 Level A and AA standards. Users enter a URL, and ClearSight scans the page, analyzes accessibility issues using axe-core + custom checks, enriches findings with AI (Azure OpenAI GPT-4.1), and presents a clear, actionable report.

### Target Audience
- Developers checking their own sites during development
- Non-technical users (business owners, content editors) auditing sites
- Agencies/consultants auditing client websites

### MVP Scope
- Single-page scan (multi-page crawling is a future feature)
- On-screen report (PDF/CSV export is a future feature)
- Dashboard-style UI with scan history

---

## 2. Architecture

Three-layer system, all in Docker Compose:

1. **Next.js App** — serves the dashboard UI + exposes API routes
2. **Worker Process** — Node.js service that picks up scan jobs, runs the analysis pipeline
3. **PostgreSQL** — stores scan jobs, results, and history

### Request Flow

1. User enters a URL on the dashboard → hits `POST /api/scans`
2. API validates the URL, creates a scan record in Postgres (status: `queued`)
3. Worker polls for queued jobs, picks one up (status: `running`), and executes the pipeline
4. Frontend polls `GET /api/scans/:id` to show real-time progress → renders the report when complete

### Async Job Model (Approach B)

Scans run asynchronously via a background worker. This provides:
- Responsive UI with progress indicators
- No HTTP timeout issues
- Scan history naturally falls out of the job model
- Better scalability

### Worker Polling Mechanism

The worker polls Postgres every 2 seconds for queued jobs:

```sql
SELECT * FROM scans
WHERE status = 'queued'
ORDER BY created_at ASC
LIMIT 1
FOR UPDATE SKIP LOCKED
```

`FOR UPDATE SKIP LOCKED` ensures safe concurrency — if multiple workers run, they won't pick the same job. The worker immediately sets status to `running` within the same transaction.

**Stale job recovery:** A periodic check (every 60s) resets jobs stuck in `running` for >2 minutes back to `queued` (if `retry_count < 3`). If retries exhausted, status set to `failed`.

### API Contracts

#### `POST /api/scans` — Create a new scan

**Request:**
```json
{ "url": "https://example.com" }
```

**URL Validation Rules:**
- Must be HTTP or HTTPS (no `ftp://`, `file://`, etc.)
- Must not resolve to private/internal IPs (localhost, 10.x, 172.16.x, 192.168.x) — prevents SSRF
- Maximum URL length: 2048 characters

**Responses:**
- `201 Created` → `{ "id": "uuid", "url": "...", "status": "queued", "created_at": "..." }`
- `400 Bad Request` → `{ "error": "Invalid URL", "detail": "..." }`
- `429 Too Many Requests` → `{ "error": "Rate limit exceeded", "detail": "Maximum 10 scans per IP per hour" }`

#### `GET /api/scans/:id` — Get scan status and results

**Responses:**
- `200 OK` (queued/running) → `{ "id": "...", "status": "running", "progress": 40, "current_stage": "Analyzing accessibility" }`
- `200 OK` (completed) → `{ "id": "...", "status": "completed", "summary": {...}, "issues": [...], "metadata": {...} }`
- `200 OK` (failed) → `{ "id": "...", "status": "failed", "error_message": "..." }`
- `404 Not Found` → `{ "error": "Scan not found" }`

#### `GET /api/scans` — List recent scans

**Query params:** `?limit=20&offset=0`

**Response:**
- `200 OK` → `{ "scans": [{ "id": "...", "url": "...", "status": "...", "overall_score": 72, "created_at": "..." }], "total": 45 }`

#### `POST /api/scans/:id/cancel` — Cancel a scan

**Responses:**
- `200 OK` → `{ "id": "...", "status": "cancelled" }`
- `400 Bad Request` → `{ "error": "Scan already completed" }`
- `404 Not Found` → `{ "error": "Scan not found" }`

The worker checks for `cancelled` status between pipeline stages and aborts gracefully if detected.

### Rate Limiting

10 scans per IP per hour, tracked via an in-memory store (Map with TTL). Simple for MVP, can upgrade to Redis later.

---

## 3. Scan Worker Pipeline

The worker processes each job through 5 stages with progress reported at each step:

### Stage 1: Fetch & Render (Progress: 20%)
- Playwright launches headless Chromium, navigates to URL
- Waits for network idle (page fully loaded)
- Takes a screenshot
- Extracts page title, meta info
- Edge cases: redirect chains followed (max 5), timeout at 30s, SSL errors reported gracefully

### Stage 2: axe-core Analysis (Progress: 40%)
- Runs `@axe-core/playwright` with WCAG 2.1 A+AA ruleset
- Collects violations (→ confirmed issues) and incomplete results (→ potential issues)
- Captures element selectors + HTML snippets for each finding

### Stage 3: Custom Checks (Progress: 55%)
- Meaningful link text analysis (not just "click here", "read more") — highest value, simplest to implement
- Touch target sizing (WCAG 2.5.5 AA)
- Future: animation/motion detection, reading level analysis (AAA — stretch goal)
- Results feed into the LLM enrichment stage as additional raw findings

### Stage 4: LLM Enrichment (Progress: 80%)
- Sends all raw findings (axe-core + custom) to Azure OpenAI GPT-4.1 with page context
- LLM generates:
  - Human-readable descriptions and fix suggestions for each issue
  - Confidence scores (0.0–1.0) for potential issues
  - Promotes clear-cut potential issues to confirmed (e.g., alt text that's obviously a filename)
  - Overall summary, accessibility score (0–100), top priorities, and positive findings
- Uses structured JSON output for reliable parsing

### Stage 5: Store Results (Progress: 100%)
- Writes all issues + scan summary to Postgres in a single transaction
- Updates scan status to `completed`

### Edge Cases
- **Invalid/unreachable URLs** — validated before creating a job, with clear error messages
- **Timeout** — Playwright navigation gets a 30s timeout; if exceeded, job marked `failed` with explanation
- **Sites that block bots** — detect common blocking patterns, report gracefully
- **Worker crashes** — jobs stuck in `running` for >2 minutes get automatically reset to `queued` for retry (max 3 attempts)
- **Rate limiting** — prevent abuse by limiting scans per IP/session
- **SPA/JS-heavy sites** — Playwright waits for network idle, handles dynamic content
- **Login-protected pages** — MVP won't handle auth; clear message: "This page appears to require login"
- **Very large pages** — cap analysis at 5000 elements to prevent memory/time blowout
- **LLM failure** — fall back to axe-core's built-in descriptions, mark scan as `completed_partial`

---

## 4. Issue Classification

Two-tier model:

### Confirmed Issues
Definitive accessibility failures — axe-core violations + LLM-promoted potential issues.
- Actionable and fixable with clear instructions
- Example: "Image missing alt text on line 42"

### Potential Issues
Findings that may be problems but require human judgment — axe-core's `incomplete` results + LLM-flagged concerns.
- Each has a confidence score (0.0–1.0) assigned by the LLM
- Example: "Alt text says 'image1.png' — this may not be descriptive enough"

### LLM Value-Add
- Promotes some potential issues to confirmed when clearly wrong
- Provides context on why something is flagged
- Assigns confidence scores for prioritization
- Generates human-readable descriptions and actionable fix suggestions

---

## 5. Database Schema

### `scans`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Primary key |
| url | text | Scanned URL |
| status | enum | `queued`, `running`, `completed`, `failed`, `completed_partial`, `cancelled` |
| progress | int (default 0) | Pipeline progress percentage (0–100) |
| current_stage | text (nullable) | Current pipeline stage name (e.g., "Analyzing accessibility") |
| created_at | timestamp | Job creation time |
| updated_at | timestamp | Last update |
| completed_at | timestamp (nullable) | Completion time |
| page_title | text | Extracted page title |
| page_screenshot | text | Base64-encoded PNG, stored in DB (simple for MVP; migrate to blob storage later) |
| error_message | text (nullable) | Populated on failure |
| retry_count | int (default 0) | Number of retry attempts |
| metadata | jsonb | Structured as: `{ pageLoadTimeMs: number, totalElements: number, redirectCount: number, contentType: string }` |

### `issues`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Primary key |
| scan_id | UUID (FK → scans) | Parent scan |
| type | enum | `confirmed`, `potential` |
| severity | enum | `critical`, `serious`, `moderate`, `minor` |
| confidence_score | float (nullable) | 0.0–1.0, LLM-assigned. `null` for confirmed issues (they are definitive). Only displayed for potential issues. |
| wcag_criterion | text | e.g., "1.1.1 Non-text Content" |
| wcag_level | enum | `A`, `AA` |
| element_selector | text | CSS selector of offending element |
| element_html | text | Snippet of actual HTML |
| description | text | LLM-generated human-readable explanation |
| fix_suggestion | text | LLM-generated actionable fix |
| axe_rule_id | text | Original axe-core rule reference |
| created_at | timestamp | Creation time |

### `scan_summaries`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Primary key |
| scan_id | UUID (FK → scans, unique) | Parent scan |
| overall_score | int | 0–100 accessibility score |
| summary | text | LLM-generated plain-English overview |
| top_priorities | jsonb | Ranked array: `[{ issueId: string, title: string, reason: string }]` |
| positive_findings | jsonb | Array of positive notes: `[{ category: string, detail: string }]` |
| created_at | timestamp | Creation time |

---

## 6. Modular Project Structure

Every integration is behind an interface. Nothing depends on a concrete implementation directly.

```
clearsight/
├── docker-compose.yml
├── Dockerfile
├── Dockerfile.worker
├── .env.example
├── .env                         # gitignored
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/                     # Next.js App Router (UI only)
│   │   ├── page.tsx
│   │   ├── scan/[id]/page.tsx
│   │   ├── api/
│   │   │   └── scans/
│   │   │       ├── route.ts         # POST /api/scans
│   │   │       └── [id]/route.ts    # GET /api/scans/:id
│   │   └── layout.tsx
│   │
│   ├── components/              # Presentational UI components
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Shell.tsx
│   │   │   └── ThemeProvider.tsx
│   │   ├── scan/
│   │   │   ├── ScanForm.tsx
│   │   │   ├── ScanProgress.tsx
│   │   │   └── ScanHistory.tsx
│   │   ├── results/
│   │   │   ├── ScoreGauge.tsx
│   │   │   ├── IssueTabs.tsx
│   │   │   ├── IssueCard.tsx
│   │   │   ├── SummaryCard.tsx
│   │   │   └── TopPriorities.tsx
│   │   └── ui/                  # shadcn/ui primitives
│   │
│   ├── modules/                 # Core business logic, fully modular
│   │   ├── ai/                  # AI Provider abstraction
│   │   │   ├── types.ts             # AIProvider interface
│   │   │   ├── index.ts             # Factory — returns provider based on config
│   │   │   ├── providers/
│   │   │   │   ├── azure-openai.ts  # Azure OpenAI GPT-4.1 implementation
│   │   │   │   └── ...              # Future: Anthropic, local models, etc.
│   │   │   └── prompts/
│   │   │       ├── enrich-issues.ts     # Prompt for issue enrichment
│   │   │       ├── generate-summary.ts  # Prompt for scan summary
│   │   │       └── confidence-score.ts  # Prompt for scoring potential issues
│   │   │
│   │   ├── scanner/             # Scan engine abstraction
│   │   │   ├── types.ts             # ScanEngine interface, RawFinding type
│   │   │   ├── index.ts             # Orchestrator — runs all engines
│   │   │   ├── engines/
│   │   │   │   ├── axe-core.ts      # axe-core engine
│   │   │   │   └── custom/          # Custom check engines
│   │   │   │       ├── link-text.ts
│   │   │   │       └── touch-targets.ts
│   │   │   └── renderer/
│   │   │       ├── types.ts         # PageRenderer interface
│   │   │       └── playwright.ts    # Playwright implementation
│   │   │
│   │   ├── pipeline/            # Scan job pipeline
│   │   │   ├── types.ts             # PipelineStage interface
│   │   │   ├── index.ts             # Pipeline orchestrator (stage 1→2→3→4→5)
│   │   │   ├── stages/
│   │   │   │   ├── fetch.ts
│   │   │   │   ├── analyze.ts
│   │   │   │   ├── custom-checks.ts
│   │   │   │   ├── enrich.ts        # LLM enrichment
│   │   │   │   └── store.ts
│   │   │   └── progress.ts          # Progress reporting
│   │   │
│   │   └── db/                  # Database abstraction
│   │       ├── types.ts             # Repository interfaces
│   │       ├── repositories/
│   │       │   ├── scan.repository.ts
│   │       │   ├── issue.repository.ts
│   │       │   └── summary.repository.ts
│   │       └── prisma.ts            # Prisma client singleton
│   │
│   ├── config/                  # Centralized configuration
│   │   ├── index.ts                 # Validates & exports all config from env
│   │   ├── ai.config.ts
│   │   ├── scanner.config.ts
│   │   └── db.config.ts
│   │
│   └── worker/
│       └── index.ts             # Worker entry — pulls from pipeline module
│
└── package.json
```

### Key Interfaces

```typescript
// modules/ai/types.ts
interface AIProvider {
  enrichIssues(rawFindings: RawFinding[], pageContext: PageContext): Promise<EnrichedIssue[]>
  generateSummary(issues: EnrichedIssue[], pageContext: PageContext): Promise<ScanSummary>
}

// modules/scanner/types.ts
interface ScanEngine {
  name: string
  run(page: Page): Promise<RawFinding[]>
}

interface RawFinding {
  ruleId: string
  type: 'confirmed' | 'potential'
  severity: 'critical' | 'serious' | 'moderate' | 'minor'
  wcagCriterion: string
  wcagLevel: 'A' | 'AA'
  elementSelector: string
  elementHtml: string
  description: string       // engine-provided description (axe-core or custom)
  engineName: string        // which engine produced this finding
}

// modules/scanner/renderer/types.ts
interface PageRenderer {
  render(url: string): Promise<RenderedPage>
  screenshot(): Promise<Buffer>
  close(): Promise<void>
}

interface RenderedPage {
  page: Page                // Playwright Page handle for engines to run against
  title: string
  metaDescription: string
  url: string               // final URL after redirects
  redirectCount: number
  pageLoadTimeMs: number
  totalElements: number
}

// modules/pipeline/types.ts
interface PipelineStage {
  name: string
  progress: number
  execute(context: PipelineContext): Promise<PipelineContext>
}

interface PipelineContext {
  scanId: string
  url: string
  renderedPage?: RenderedPage
  screenshot?: Buffer
  rawFindings: RawFinding[]
  enrichedIssues: EnrichedIssue[]
  summary?: ScanSummary
}
```

### Database Migrations

Prisma migrations run on the **app** container startup via `prisma migrate deploy` in the Docker entrypoint. The worker waits for the app to be healthy before starting (Docker Compose `depends_on` with healthcheck).

### Modularity Benefits
- **Swap AI providers** — implement `AIProvider`, register in the factory. Zero changes elsewhere.
- **Add new accessibility checks** — create a new `ScanEngine`, drop it in `engines/`. The orchestrator picks it up.
- **Replace Playwright** — implement `PageRenderer` with Puppeteer or anything else.
- **Prompts are isolated** — each AI task has its own prompt file, easy to iterate independently.
- **Pipeline is composable** — stages are independent units, easy to add/remove/reorder.

---

## 7. Tech Stack

| Technology | Purpose |
|-----------|---------|
| Next.js 14+ (App Router) | Full-stack framework |
| TypeScript | Type safety throughout |
| Tailwind CSS | Utility-first styling |
| shadcn/ui | Component primitives |
| Lucide React | Icon set |
| PostgreSQL 16 | Database |
| Prisma | ORM |
| Playwright | Headless browser for page rendering |
| axe-core (`@axe-core/playwright`) | Accessibility scanning engine |
| Azure OpenAI GPT-4.1 | LLM for report enrichment |
| Docker Compose | Containerization (app, worker, postgres) |

---

## 8. UI & UX Design

### Theme
- **Primary accent:** `#E90029` (ClearSight red)
- **Base:** Light theme with neutral grays
- **Severity colors:** Critical `#E90029`, Serious `#F97316`, Moderate `#EAB308`, Minor `#3B82F6`
- **Score gauge:** 0-49 red, 50-79 yellow, 80-100 green

### Layout
Sidebar + main content area.

**Sidebar:**
- ClearSight logo/branding
- "New Scan" button (always accessible)
- Scan history list (recent scans with URL, date, score badge)
- Active scan shows a progress indicator in the list

### Views

#### Home / New Scan
- Large URL input field centered
- "Scan" button with clear call-to-action
- Below: recent scan cards showing URL, score, date, issue count

#### Scan In Progress
- Progress bar with labeled stages (Fetching → Analyzing → Enriching → Complete)
- Current stage description (e.g., "Analyzing accessibility...")
- Cancel button (sets status to `cancelled`, worker checks between stages)

#### Scan Results
- **Top bar:** URL, date, page screenshot thumbnail, overall accessibility score (0-100, color-coded)
- **Summary card:** LLM-generated plain-English overview + positive findings
- **Two tabs:** "Confirmed Issues" (count badge) | "Potential Issues" (count badge)
- **Issue cards:** severity tag, WCAG criterion + level badge, confidence score (potential issues), human-readable description, expandable fix suggestion + code snippet
- **Sortable/filterable** by severity, WCAG criterion, confidence
- **Top Priorities** section: LLM-ranked "fix these first" list

### shadcn/ui Components
- `Card` — scan history, issue cards, summary
- `Button` — primary actions, secondary filters
- `Badge` — severity tags, WCAG level, confidence
- `Tabs` — confirmed vs potential issues
- `Progress` — scan progress bar
- `Tooltip` — truncated URLs, WCAG explanations
- `Dialog` — scan details, errors
- `Input` — URL input
- `Skeleton` — loading states
- `ScrollArea` — sidebar scan history

### UX Edge Cases
- **Empty state** — welcoming prompt for first-time users
- **Failed scan** — clear error message with suggested actions
- **Long URLs** — truncated with tooltip on hover
- **Zero issues found** — celebratory message, not just empty list
- **Loading** — skeleton placeholders, not spinners
- **Responsive** — works on tablet, desktop-first for MVP

---

## 9. Environment & Configuration

### Docker Compose Services
1. **app** — Next.js server (port 3000)
2. **worker** — Node.js scan pipeline worker
3. **postgres** — PostgreSQL 16 with named volume

### Environment Variables
```
DATABASE_URL=postgresql://clearsight:clearsight@postgres:5432/clearsight
AZURE_OPENAI_ENDPOINT=https://your-endpoint.openai.azure.com/openai/deployments/your-model/chat/completions?api-version=2025-01-01-preview
AZURE_OPENAI_API_KEY=<your-api-key>
AZURE_OPENAI_API_VERSION=2025-01-01-preview
```

---

## 10. Future Enhancements (Out of MVP Scope)
- Multi-page crawling (follow links, site-wide report)
- PDF/CSV export of reports
- User accounts and saved scan history
- Browser extension
- CI/CD integration (API endpoint for automated checks)
- WCAG 2.2 and AAA level support
- Authentication-aware scanning (login flows)
- Scheduled recurring scans
