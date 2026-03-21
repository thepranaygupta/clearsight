# Full-Site Crawl Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Evolve ClearSight from a single-page scanner into a full-site crawler with BullMQ job queues, concurrent page scanning, issue tracking across crawls, a marketing landing page, and a Nextra docs site.

**Architecture:** Three BullMQ queues (crawl-discovery, page-scan, ai-enrichment) backed by Redis replace the Postgres polling worker. A lightweight BFS crawler discovers pages via HTTP fetch, then queues concurrent page scans through the existing pipeline. New Site/Crawl/Page entities sit above the existing Scan/Issue model. The frontend adds a `/dashboard` app shell with site management alongside the existing single-page scan flow.

**Tech Stack:** Next.js 16 (App Router), BullMQ + Redis, Prisma 7.5, Playwright, axe-core, Azure OpenAI, Bull Board (Express), Nextra 4

**Spec:** `docs-internal/specs/2026-03-21-full-site-crawl-design.md`

---

## Phase 1: Foundation (Data Model + Redis + BullMQ + Worker Refactor)

Everything depends on this phase. It replaces the Postgres polling worker with BullMQ, adds the new data model, and ensures the existing single-page scan still works through the new queue system.

---

### Task 1.1: Add Redis to Docker Compose

**Files:**
- Modify: `docker-compose.dev.yml`
- Modify: `docker-compose.yml`

- [ ] **Step 1: Add Redis service to dev compose**

Add redis service before the app service in `docker-compose.dev.yml`:

```yaml
redis:
  image: redis:7-alpine
  ports:
    - "6379:6379"
  healthcheck:
    test: ["CMD", "redis-cli", "ping"]
    interval: 5s
    timeout: 3s
    retries: 5
```

Make `app` and `worker` depend on `redis` (service_healthy).

- [ ] **Step 2: Add Redis service to production compose**

Same redis service in `docker-compose.yml`. Add dependency to app and worker.

- [ ] **Step 3: Add REDIS_URL to both compose files**

Add `REDIS_URL=redis://redis:6379` to environment for both `app` and `worker` services in both compose files.

- [ ] **Step 4: Verify Redis starts**

Run: `docker compose -f docker-compose.dev.yml up redis -d`
Expected: Redis container running, `docker compose -f docker-compose.dev.yml exec redis redis-cli ping` returns `PONG`

- [ ] **Step 5: Commit**

```bash
git add docker-compose.dev.yml docker-compose.yml
git commit -m "infra: add Redis service to Docker Compose"
```

---

### Task 1.2: Install BullMQ and Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install BullMQ and ioredis**

Run: `pnpm add bullmq ioredis`

- [ ] **Step 2: Install Bull Board packages**

Run: `pnpm add @bull-board/api @bull-board/express`

Note: Bull Board Express server is a separate app (Task 1.11), but the packages are installed in the main project for now to share types.

- [ ] **Step 3: Verify installation**

Run: `pnpm list bullmq ioredis @bull-board/api @bull-board/express`
Expected: All packages listed with versions

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "deps: add BullMQ, ioredis, and Bull Board packages"
```

---

### Task 1.3: Update Prisma Schema

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add CrawlStatus and IssueStatus enums**

Add after existing enums:

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

- [ ] **Step 2: Add Site model**

```prisma
model Site {
  id        String   @id @default(uuid())
  hostname  String   @unique
  name      String
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  crawls Crawl[]
  pages  Page[]

  @@map("sites")
}
```

- [ ] **Step 3: Add Crawl model**

```prisma
model Crawl {
  id            String      @id @default(uuid())
  siteId        String      @map("site_id")
  status        CrawlStatus @default(queued)
  totalPages    Int         @default(0) @map("total_pages")
  scannedPages  Int         @default(0) @map("scanned_pages")
  enrichedPages Int         @default(0) @map("enriched_pages")
  overallScore  Float?      @map("overall_score")
  maxPages      Int?        @map("max_pages")
  newIssues     Int         @default(0) @map("new_issues")
  fixedIssues   Int         @default(0) @map("fixed_issues")
  createdAt     DateTime    @default(now()) @map("created_at")
  completedAt   DateTime?   @map("completed_at")
  updatedAt     DateTime    @updatedAt @map("updated_at")

  site  Site   @relation(fields: [siteId], references: [id], onDelete: Cascade)
  scans Scan[]
  pages Page[] @relation("firstSeenCrawl")

  @@index([siteId])
  @@index([status])
  @@map("crawls")
}
```

- [ ] **Step 4: Add Page model**

```prisma
model Page {
  id               String   @id @default(uuid())
  siteId           String   @map("site_id")
  url              String
  path             String
  firstSeenCrawlId String   @map("first_seen_crawl_id")
  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @updatedAt @map("updated_at")

  site           Site   @relation(fields: [siteId], references: [id], onDelete: Cascade)
  firstSeenCrawl Crawl  @relation("firstSeenCrawl", fields: [firstSeenCrawlId], references: [id])
  scans          Scan[]

  @@unique([siteId, url])
  @@index([siteId])
  @@map("pages")
}
```

- [ ] **Step 5: Add new columns to Scan model**

Add to existing Scan model:

```prisma
pageId  String? @map("page_id")
crawlId String? @map("crawl_id")

page  Page?  @relation(fields: [pageId], references: [id], onDelete: SetNull)
crawl Crawl? @relation(fields: [crawlId], references: [id], onDelete: Cascade)
```

Note: `crawl` uses `onDelete: Cascade` so deleting a Site cascades to Crawls which cascades to Scans. `page` uses `SetNull` to preserve scans if a page is removed.

Add indexes:
```prisma
@@index([pageId])
@@index([crawlId])
```

- [ ] **Step 6: Add new columns to Issue model**

Add to existing Issue model:

```prisma
issueHash       String?      @map("issue_hash")
issueStatus     IssueStatus  @default(open) @map("issue_status")
pageUrl         String?      @map("page_url")
firstSeenScanId String?      @map("first_seen_scan_id")
lastSeenScanId  String?      @map("last_seen_scan_id")
fixedAtCrawlId  String?      @map("fixed_at_crawl_id")
```

Note: Use `issueStatus` instead of `status` to avoid conflict with any existing field. Add indexes:
```prisma
@@index([issueHash])
@@index([issueStatus])
@@index([scanId, issueHash])
```

- [ ] **Step 7: Drop database and push schema**

Run:
```bash
pnpm db:push -- --force-reset
pnpm db:generate
```

Expected: Schema pushed successfully, client generated.

- [ ] **Step 8: Verify schema**

Run: `pnpm db:push` (should say "already in sync")

- [ ] **Step 9: Commit**

```bash
git add prisma/schema.prisma
git commit -m "schema: add Site, Crawl, Page models and Issue tracking columns"
```

---

### Task 1.4: Update Config Module

**Files:**
- Modify: `src/config/index.ts`

- [ ] **Step 1: Add Redis and worker concurrency config**

Add to the config object:

```typescript
redis: {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
},
crawler: {
  maxPages: process.env.MAX_CRAWL_PAGES ? parseInt(process.env.MAX_CRAWL_PAGES, 10) : null,
  delayMs: parseInt(process.env.CRAWL_DELAY_MS || '200', 10),
  userAgent: 'ClearSight/1.0 Accessibility Scanner',
},
workerConcurrency: {
  pageScan: parseInt(process.env.WORKER_CONCURRENCY || '3', 10),
  aiEnrichment: parseInt(process.env.AI_CONCURRENCY || '2', 10),
},
bullBoard: {
  port: parseInt(process.env.BULL_BOARD_PORT || '3001', 10),
},
```

- [ ] **Step 2: Add env vars to .env.example (if exists) or .env**

```
REDIS_URL=redis://localhost:6379
WORKER_CONCURRENCY=3
AI_CONCURRENCY=2
MAX_CRAWL_PAGES=50
CRAWL_DELAY_MS=200
BULL_BOARD_PORT=3001
```

- [ ] **Step 3: Commit**

```bash
git add src/config/index.ts
git commit -m "config: add Redis, crawler, and worker concurrency settings"
```

---

### Task 1.5: Implement Queue Module

**Files:**
- Create: `src/modules/queue/index.ts`
- Create: `src/modules/queue/queues.ts`
- Create: `src/modules/queue/types.ts`

- [ ] **Step 1: Create queue types**

Create `src/modules/queue/types.ts`:

```typescript
export interface CrawlJobData {
  crawlId: string
  siteId: string
  rootUrl: string
  maxPages: number | null
}

export interface PageScanJobData {
  scanId: string
  url: string
  // Optional: set when part of a crawl
  crawlId?: string
  pageId?: string
  siteId?: string
}

export interface AiEnrichmentJobData {
  scanId: string
  crawlId?: string
  siteId?: string
}

export const QUEUE_NAMES = {
  CRAWL_DISCOVERY: 'crawl-discovery',
  PAGE_SCAN: 'page-scan',
  AI_ENRICHMENT: 'ai-enrichment',
} as const
```

- [ ] **Step 2: Create Redis connection and queue instances**

Create `src/modules/queue/queues.ts`:

```typescript
import { Queue } from 'bullmq'
import { config } from '@/config'
import { QUEUE_NAMES } from './types'
import type { CrawlJobData, PageScanJobData, AiEnrichmentJobData } from './types'

const connection = {
  host: new URL(config.redis.url).hostname,
  port: parseInt(new URL(config.redis.url).port || '6379', 10),
}

export const crawlQueue = new Queue<CrawlJobData>(QUEUE_NAMES.CRAWL_DISCOVERY, {
  connection,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'exponential', delay: 30000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 200 },
  },
})

export const pageScanQueue = new Queue<PageScanJobData>(QUEUE_NAMES.PAGE_SCAN, {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 30000 },
    removeOnComplete: { count: 500 },
    removeOnFail: { count: 500 },
  },
})

export const aiEnrichmentQueue = new Queue<AiEnrichmentJobData>(QUEUE_NAMES.AI_ENRICHMENT, {
  connection,
  defaultJobOptions: {
    attempts: 4,
    backoff: { type: 'exponential', delay: 10000 },
    removeOnComplete: { count: 500 },
    removeOnFail: { count: 500 },
  },
})

export { connection as redisConnection }
```

- [ ] **Step 3: Create queue module index**

Create `src/modules/queue/index.ts`:

```typescript
export { crawlQueue, pageScanQueue, aiEnrichmentQueue, redisConnection } from './queues'
export { QUEUE_NAMES } from './types'
export type { CrawlJobData, PageScanJobData, AiEnrichmentJobData } from './types'
```

- [ ] **Step 4: Verify module resolves**

Run: `pnpm exec tsx -e "import { crawlQueue } from './src/modules/queue'; console.log(crawlQueue.name)"`
Expected: `crawl-discovery`

- [ ] **Step 5: Commit**

```bash
git add src/modules/queue/
git commit -m "feat: add BullMQ queue module with crawl, page-scan, and ai-enrichment queues"
```

---

### Task 1.6: Implement New Repositories

**Files:**
- Create: `src/modules/db/repositories/site.repository.ts`
- Create: `src/modules/db/repositories/crawl.repository.ts`
- Create: `src/modules/db/repositories/page.repository.ts`
- Modify: `src/modules/db/index.ts`
- Modify: `src/modules/db/types.ts`

- [ ] **Step 1: Add new types to db/types.ts**

Add to `src/modules/db/types.ts`:

```typescript
// Site
export interface CreateSiteInput {
  hostname: string
  name: string
}

// Crawl
export interface CreateCrawlInput {
  siteId: string
  maxPages?: number | null
}

export interface UpdateCrawlInput {
  status?: CrawlStatus
  totalPages?: number
  scannedPages?: number
  enrichedPages?: number
  overallScore?: number
  maxPages?: number
  newIssues?: number
  fixedIssues?: number
  completedAt?: Date
}

// Page
export interface CreatePageInput {
  siteId: string
  url: string
  path: string
  firstSeenCrawlId: string
}
```

Import `CrawlStatus` from Prisma client at the top.

- [ ] **Step 2: Create SiteRepository**

Create `src/modules/db/repositories/site.repository.ts`:

```typescript
import { prisma } from '../prisma'
import type { CreateSiteInput } from '../types'

export class PrismaSiteRepository {
  async create(input: CreateSiteInput) {
    return prisma.site.create({ data: input })
  }

  async findById(id: string) {
    return prisma.site.findUnique({
      where: { id },
      include: {
        crawls: { orderBy: { createdAt: 'desc' }, take: 1 },
        _count: { select: { pages: true } },
      },
    })
  }

  async findByHostname(hostname: string) {
    return prisma.site.findUnique({ where: { hostname } })
  }

  async findMany() {
    return prisma.site.findMany({
      include: {
        crawls: { orderBy: { createdAt: 'desc' }, take: 1 },
        _count: { select: { pages: true, crawls: true } },
      },
      orderBy: { updatedAt: 'desc' },
    })
  }

  async findOrCreate(hostname: string, name?: string) {
    const existing = await this.findByHostname(hostname)
    if (existing) return existing
    return this.create({ hostname, name: name ?? hostname })
  }

  async delete(id: string) {
    return prisma.site.delete({ where: { id } })
  }
}
```

- [ ] **Step 3: Create CrawlRepository**

Create `src/modules/db/repositories/crawl.repository.ts`:

```typescript
import { prisma } from '../prisma'
import type { CreateCrawlInput, UpdateCrawlInput } from '../types'

export class PrismaCrawlRepository {
  async create(input: CreateCrawlInput) {
    return prisma.crawl.create({
      data: {
        siteId: input.siteId,
        maxPages: input.maxPages ?? null,
      },
    })
  }

  async findById(id: string) {
    return prisma.crawl.findUnique({
      where: { id },
      include: { site: true },
    })
  }

  async findBySite(siteId: string, options?: { take?: number; skip?: number }) {
    const [crawls, total] = await Promise.all([
      prisma.crawl.findMany({
        where: { siteId },
        orderBy: { createdAt: 'desc' },
        take: options?.take ?? 20,
        skip: options?.skip ?? 0,
      }),
      prisma.crawl.count({ where: { siteId } }),
    ])
    return { crawls, total }
  }

  async update(id: string, input: UpdateCrawlInput) {
    return prisma.crawl.update({ where: { id }, data: input })
  }

  /** Atomically increment enrichedPages and return new value. Used for crawl completion detection. */
  async incrementEnrichedPages(id: string): Promise<number> {
    const result = await prisma.$queryRaw<[{ enriched_pages: number }]>`
      UPDATE crawls
      SET enriched_pages = enriched_pages + 1, updated_at = NOW()
      WHERE id = ${id}
      RETURNING enriched_pages
    `
    return result[0].enriched_pages
  }

  /** Atomically increment scannedPages. */
  async incrementScannedPages(id: string): Promise<number> {
    const result = await prisma.$queryRaw<[{ scanned_pages: number }]>`
      UPDATE crawls
      SET scanned_pages = scanned_pages + 1, updated_at = NOW()
      WHERE id = ${id}
      RETURNING scanned_pages
    `
    return result[0].scanned_pages
  }

  /** Find active crawl for a site (for rate limiting: 1 concurrent crawl per site). */
  async findActiveCrawl(siteId: string) {
    return prisma.crawl.findFirst({
      where: {
        siteId,
        status: { in: ['queued', 'discovering', 'scanning'] },
      },
    })
  }
}
```

- [ ] **Step 4: Create PageRepository**

Create `src/modules/db/repositories/page.repository.ts`:

```typescript
import { prisma } from '../prisma'
import type { CreatePageInput } from '../types'

export class PrismaPageRepository {
  async create(input: CreatePageInput) {
    return prisma.page.create({ data: input })
  }

  async findOrCreate(input: CreatePageInput) {
    return prisma.page.upsert({
      where: {
        siteId_url: { siteId: input.siteId, url: input.url },
      },
      update: { updatedAt: new Date() },
      create: input,
    })
  }

  async findBySite(siteId: string, options?: { take?: number; skip?: number }) {
    const [pages, total] = await Promise.all([
      prisma.page.findMany({
        where: { siteId },
        orderBy: { updatedAt: 'desc' },
        take: options?.take ?? 50,
        skip: options?.skip ?? 0,
        include: {
          scans: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: { summary: true, _count: { select: { issues: true } } },
          },
        },
      }),
      prisma.page.count({ where: { siteId } }),
    ])
    return { pages, total }
  }

  async findById(id: string) {
    return prisma.page.findUnique({
      where: { id },
      include: {
        scans: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: { summary: true },
        },
      },
    })
  }
}
```

- [ ] **Step 5: Update CreateScanInput and PrismaScanRepository to support pageId/crawlId**

In `src/modules/db/types.ts`, update `CreateScanInput`:

```typescript
export interface CreateScanInput {
  url: string
  metadata?: Record<string, unknown>
  pageId?: string
  crawlId?: string
}
```

In `src/modules/db/repositories/scan.repository.ts`, update `create` method to pass through the new fields:

```typescript
async create(input: CreateScanInput) {
  return prisma.scan.create({
    data: {
      url: input.url,
      metadata: input.metadata ?? {},
      pageId: input.pageId ?? null,
      crawlId: input.crawlId ?? null,
    },
  })
}
```

- [ ] **Step 6: Update DB module exports**

Add to `src/modules/db/index.ts`:

```typescript
export { PrismaSiteRepository } from './repositories/site.repository'
export { PrismaCrawlRepository } from './repositories/crawl.repository'
export { PrismaPageRepository } from './repositories/page.repository'
```

Export the new types from `types.ts` as well.

- [ ] **Step 7: Commit**

```bash
git add src/modules/db/
git commit -m "feat: add Site, Crawl, and Page repositories"
```

---

### Task 1.7: Update Pipeline Orchestrator for Partial Execution

**Files:**
- Modify: `src/modules/pipeline/index.ts`
- Modify: `src/modules/pipeline/types.ts`

- [ ] **Step 1: Add crawl context to PipelineContext**

In `src/modules/pipeline/types.ts`, add optional fields:

```typescript
export interface PipelineContext {
  scanId: string
  url: string
  // New: crawl-related context
  crawlId?: string
  pageId?: string
  siteId?: string
  // Existing fields
  renderedPage?: RenderedPage
  screenshot?: Buffer
  rawFindings: RawFinding[]
  enrichedIssues: EnrichedIssue[]
  summary?: ScanSummary
  pageHtml?: string
}
```

- [ ] **Step 2: Add stage range support to PipelineOrchestrator**

In `src/modules/pipeline/index.ts`, modify the `run` method to accept optional `fromStage` and `toStage` indices:

```typescript
async run(
  initialContext: PipelineContext,
  options?: { fromStage?: number; toStage?: number }
): Promise<PipelineContext> {
  const from = options?.fromStage ?? 0
  const to = options?.toStage ?? this.stages.length - 1
  let context = initialContext

  for (let i = from; i <= to; i++) {
    const stage = this.stages[i]
    // ... existing cancellation check and stage execution logic
  }

  return context
}
```

Keep the existing full-run behavior as default (from=0, to=last).

- [ ] **Step 3: Export IntermediateStoreStage index for split point reference**

Add a comment or constant to `src/modules/pipeline/index.ts`:

```typescript
/** Stage indices for partial execution */
export const STAGE_SPLIT = {
  /** Stages 0-4: Fetch → Analyze → CustomChecks → ElementLocate → IntermediateStore */
  SCAN_END: 4,
  /** Stages 5-6: Enrich → Store */
  ENRICH_START: 5,
} as const
```

- [ ] **Step 4: Commit**

```bash
git add src/modules/pipeline/
git commit -m "feat: support partial stage execution in PipelineOrchestrator"
```

---

### Task 1.8: Implement Page-Scan Processor

**Files:**
- Create: `src/worker/processors/page-scan.processor.ts`

- [ ] **Step 1: Create page-scan processor**

```typescript
import type { Job } from 'bullmq'
import type { PageScanJobData } from '@/modules/queue'
import { aiEnrichmentQueue } from '@/modules/queue'
import {
  PipelineOrchestrator,
  ProgressReporter,
  FetchStage,
  AnalyzeStage,
  CustomChecksStage,
  ElementLocateStage,
  IntermediateStoreStage,
  EnrichStage,
  StoreStage,
  STAGE_SPLIT,
  CancelledError,
} from '@/modules/pipeline'
import { PrismaScanRepository, PrismaCrawlRepository } from '@/modules/db'

const scanRepo = new PrismaScanRepository()
const crawlRepo = new PrismaCrawlRepository()

export async function processPageScan(job: Job<PageScanJobData>) {
  const { scanId, url, crawlId, pageId, siteId } = job.data

  // Update scan to running
  await scanRepo.updateStatus(scanId, { status: 'running' })

  const fetchStage = new FetchStage()
  const storeStage = new StoreStage()
  const reporter = new ProgressReporter(scanId)

  const stages = [
    fetchStage,
    new AnalyzeStage(),
    new CustomChecksStage(),
    new ElementLocateStage(),
    new IntermediateStoreStage(),
    new EnrichStage(),
    storeStage,
  ]

  const orchestrator = new PipelineOrchestrator(stages, reporter)

  // Register renderer cleanup
  orchestrator.onCleanup(() => {
    const renderer = fetchStage.getRenderer?.()
    if (renderer) return renderer.close()
  })

  try {
    // Run stages 0-4 (Fetch through IntermediateStore)
    const context = await orchestrator.run(
      {
        scanId,
        url,
        crawlId,
        pageId,
        siteId,
        rawFindings: [],
        enrichedIssues: [],
      },
      { toStage: STAGE_SPLIT.SCAN_END }
    )

    // Increment crawl scanned pages if part of a crawl
    if (crawlId) {
      await crawlRepo.incrementScannedPages(crawlId)
    }

    // Queue AI enrichment as separate job
    await aiEnrichmentQueue.add(`enrich-${scanId}`, {
      scanId,
      crawlId,
      siteId,
    })

    await job.updateProgress(70)
  } catch (error) {
    if (error instanceof CancelledError) {
      console.log(`[PageScan] Scan ${scanId} was cancelled`)
      return
    }
    // Mark scan as failed
    await scanRepo.updateStatus(scanId, {
      status: 'failed',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    })
    throw error
  }
}
```

Note: This processor runs stages 0-4 only. The AI enrichment is handled by a separate processor (Task 1.9). The orchestrator's `run` method with `toStage` handles partial execution. The `context` from stages 0-4 is not passed to the enrichment job — the enrichment processor reconstructs what it needs from the DB (the IntermediateStore stage already saved everything).

- [ ] **Step 2: Commit**

```bash
git add src/worker/processors/page-scan.processor.ts
git commit -m "feat: add BullMQ page-scan processor"
```

---

### Task 1.9: Implement AI-Enrichment Processor

**Files:**
- Create: `src/worker/processors/ai-enrichment.processor.ts`

- [ ] **Step 1: Create ai-enrichment processor**

```typescript
import type { Job } from 'bullmq'
import type { AiEnrichmentJobData } from '@/modules/queue'
import {
  PipelineOrchestrator,
  ProgressReporter,
  FetchStage,
  AnalyzeStage,
  CustomChecksStage,
  ElementLocateStage,
  IntermediateStoreStage,
  EnrichStage,
  StoreStage,
  STAGE_SPLIT,
  CancelledError,
} from '@/modules/pipeline'
import { PrismaScanRepository, PrismaCrawlRepository } from '@/modules/db'
import { prisma } from '@/modules/db/prisma'

const scanRepo = new PrismaScanRepository()
const crawlRepo = new PrismaCrawlRepository()

export async function processAiEnrichment(job: Job<AiEnrichmentJobData>) {
  const { scanId, crawlId, siteId } = job.data

  // Load scan with its existing data (raw findings were saved by IntermediateStore)
  const scan = await prisma.scan.findUnique({
    where: { id: scanId },
    include: { issues: true },
  })

  if (!scan) {
    throw new Error(`Scan ${scanId} not found`)
  }

  // Check if scan was cancelled
  if (scan.status === 'cancelled') {
    console.log(`[AiEnrichment] Scan ${scanId} was cancelled, skipping`)
    return
  }

  const reporter = new ProgressReporter(scanId)
  const storeStage = new StoreStage()
  const enrichStage = new EnrichStage()

  // Build stages array — only enrich + store
  const stages = [enrichStage, storeStage]
  const orchestrator = new PipelineOrchestrator(stages, reporter)

  try {
    // Reconstruct pipeline context from DB state
    const rawFindings = await reconstructRawFindings(scanId)
    const metadata = (scan.metadata as Record<string, unknown>) ?? {}

    await orchestrator.run({
      scanId,
      url: scan.url,
      crawlId: crawlId ?? undefined,
      pageId: scan.pageId ?? undefined,
      siteId: siteId ?? undefined,
      rawFindings,
      enrichedIssues: [],
      // Always provide renderedPage — EnrichStage throws if undefined.
      // Use fallback values for missing fields (e.g. pages with no title).
      renderedPage: {
        url: scan.url,
        title: scan.pageTitle ?? '',
        metaDescription: (metadata.metaDescription as string) ?? '',
        pageLoadTimeMs: (metadata.pageLoadTimeMs as number) ?? 0,
        totalElements: (metadata.totalElements as number) ?? 0,
        redirectCount: (metadata.redirectCount as number) ?? 0,
      },
      screenshot: scan.pageScreenshot ? Buffer.from(scan.pageScreenshot, 'base64') : undefined,
      pageHtml: scan.pageHtml ?? undefined,
    })

    // If part of a crawl, check if this is the last enrichment
    if (crawlId) {
      const enrichedCount = await crawlRepo.incrementEnrichedPages(crawlId)
      const crawl = await crawlRepo.findById(crawlId)

      if (crawl && enrichedCount >= crawl.totalPages) {
        // This is the last page — finalize crawl
        await finalizeCrawl(crawlId)
      }
    }
  } catch (error) {
    if (error instanceof CancelledError) return
    throw error
  }
}

/** Reconstruct RawFinding[] from intermediate issues in DB. */
async function reconstructRawFindings(scanId: string) {
  const issues = await prisma.issue.findMany({ where: { scanId } })
  // Map Issue records back to RawFinding shape for the EnrichStage
  return issues.map((issue) => ({
    ruleId: issue.ruleId ?? issue.axeRuleId ?? 'unknown',
    ruleHelp: issue.ruleHelp ?? '',
    engineName: issue.axeRuleId ? 'axe-core' : 'custom',
    type: issue.type as 'confirmed' | 'potential',
    severity: issue.severity as 'critical' | 'serious' | 'moderate' | 'minor',
    wcagCriterion: issue.wcagCriterion,
    wcagLevel: issue.wcagLevel as 'A' | 'AA' | 'AAA',
    elementSelector: issue.elementSelector,
    elementHtml: issue.elementHtml,
    description: issue.description,
    boundingBox: issue.elementBoundingBox as { x: number; y: number; width: number; height: number } | null,
  }))
}

/** Aggregate scores and finalize a completed crawl. */
async function finalizeCrawl(crawlId: string) {
  // Get all scans for this crawl
  const scans = await prisma.scan.findMany({
    where: { crawlId },
    include: { summary: true },
  })

  // Calculate average score from scan summaries
  const scores = scans
    .map((s) => s.summary?.overallScore)
    .filter((s): s is number => s != null)

  const overallScore = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : null

  // TODO: Issue diff computation (Phase 3 — Task 3.x)

  await crawlRepo.update(crawlId, {
    status: 'completed',
    overallScore: overallScore ?? undefined,
    completedAt: new Date(),
  })

  console.log(`[AiEnrichment] Crawl ${crawlId} completed. Score: ${overallScore}`)
}
```

- [ ] **Step 2: Commit**

```bash
git add src/worker/processors/ai-enrichment.processor.ts
git commit -m "feat: add BullMQ ai-enrichment processor with crawl finalization"
```

---

### Task 1.10: Implement Crawl-Discovery Processor

**Files:**
- Create: `src/modules/crawler/types.ts`
- Create: `src/modules/crawler/url-normalizer.ts`
- Create: `src/modules/crawler/discovery.ts`
- Create: `src/modules/crawler/index.ts`
- Create: `src/worker/processors/crawl.processor.ts`

- [ ] **Step 1: Create crawler types**

Create `src/modules/crawler/types.ts`:

```typescript
export interface DiscoveredPage {
  url: string
  path: string
}

export interface CrawlConfig {
  maxPages: number | null
  delayMs: number
  userAgent: string
}

export interface DiscoveryResult {
  pages: DiscoveredPage[]
  totalDiscovered: number
}
```

- [ ] **Step 2: Create URL normalizer**

Create `src/modules/crawler/url-normalizer.ts`:

```typescript
const TRACKING_PARAMS = new Set([
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'fbclid', 'gclid', 'ref', 'source', 'mc_cid', 'mc_eid',
])

export function normalizeUrl(rawUrl: string, baseUrl: string): string | null {
  try {
    const url = new URL(rawUrl, baseUrl)

    // Strip fragments
    url.hash = ''

    // Strip tracking params
    for (const param of TRACKING_PARAMS) {
      url.searchParams.delete(param)
    }

    // Sort remaining params for consistent dedup
    url.searchParams.sort()

    // Normalize: lowercase hostname, strip trailing slash (except root)
    let normalized = url.origin + url.pathname.replace(/\/+$/, '') + url.search
    if (url.pathname === '/' && !url.search) {
      normalized = url.origin + '/'
    }

    return normalized
  } catch {
    return null
  }
}

export function isSameOrigin(url: string, rootUrl: string): boolean {
  try {
    return new URL(url).origin === new URL(rootUrl).origin
  } catch {
    return false
  }
}

export function normalizeHostname(hostname: string): string {
  return hostname.toLowerCase().replace(/^www\./, '')
}

export function extractPath(url: string): string {
  try {
    return new URL(url).pathname
  } catch {
    return '/'
  }
}
```

- [ ] **Step 3: Create BFS discovery module**

Create `src/modules/crawler/discovery.ts`:

```typescript
import type { CrawlConfig, DiscoveredPage } from './types'
import { normalizeUrl, isSameOrigin, extractPath } from './url-normalizer'

/**
 * BFS link discovery using lightweight HTTP fetch.
 * Discovers all same-origin pages from a root URL.
 */
export async function discoverPages(
  rootUrl: string,
  crawlConfig: CrawlConfig,
  onProgress?: (discovered: number) => void,
): Promise<DiscoveredPage[]> {
  const visited = new Set<string>()
  const queue: string[] = [rootUrl]
  const pages: DiscoveredPage[] = []

  // Normalize root
  const normalizedRoot = normalizeUrl(rootUrl, rootUrl)
  if (!normalizedRoot) throw new Error(`Invalid root URL: ${rootUrl}`)
  visited.add(normalizedRoot)

  // Also try to discover from sitemap
  const sitemapUrls = await fetchSitemap(rootUrl, crawlConfig)
  for (const sitemapUrl of sitemapUrls) {
    if (isSameOrigin(sitemapUrl, rootUrl) && !visited.has(sitemapUrl)) {
      visited.add(sitemapUrl)
      queue.push(sitemapUrl)
    }
  }

  while (queue.length > 0) {
    const url = queue.shift()!

    // Check cap
    if (crawlConfig.maxPages && pages.length >= crawlConfig.maxPages) break

    // Add this page to results
    pages.push({ url, path: extractPath(url) })
    onProgress?.(pages.length)

    // Throttle
    if (crawlConfig.delayMs > 0) {
      await new Promise((r) => setTimeout(r, crawlConfig.delayMs))
    }

    // Fetch and extract links
    const links = await fetchAndExtractLinks(url, crawlConfig)

    for (const link of links) {
      const normalized = normalizeUrl(link, url)
      if (!normalized) continue
      if (!isSameOrigin(normalized, rootUrl)) continue
      if (visited.has(normalized)) continue
      if (isNonPageUrl(normalized)) continue

      visited.add(normalized)
      queue.push(normalized)
    }
  }

  return pages
}

async function fetchAndExtractLinks(url: string, config: CrawlConfig): Promise<string[]> {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': config.userAgent },
      redirect: 'follow',
      signal: AbortSignal.timeout(15000),
    })

    if (!response.ok) return []

    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('text/html')) return []

    const html = await response.text()
    return extractLinksFromHtml(html, url)
  } catch {
    return []
  }
}

function extractLinksFromHtml(html: string, baseUrl: string): string[] {
  const links: string[] = []

  // Match <a href="...">, <link href="...">, <iframe src="...">
  const hrefRegex = /<(?:a|link)\s[^>]*href=["']([^"'#]+)["']/gi
  const srcRegex = /<iframe\s[^>]*src=["']([^"'#]+)["']/gi

  let match: RegExpExecArray | null
  while ((match = hrefRegex.exec(html)) !== null) {
    const href = match[1]
    if (href && !href.startsWith('javascript:') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
      try {
        links.push(new URL(href, baseUrl).href)
      } catch { /* ignore invalid URLs */ }
    }
  }
  while ((match = srcRegex.exec(html)) !== null) {
    if (match[1]) {
      try {
        links.push(new URL(match[1], baseUrl).href)
      } catch { /* ignore */ }
    }
  }

  return links
}

async function fetchSitemap(rootUrl: string, config: CrawlConfig): Promise<string[]> {
  try {
    const origin = new URL(rootUrl).origin
    const response = await fetch(`${origin}/sitemap.xml`, {
      headers: { 'User-Agent': config.userAgent },
      signal: AbortSignal.timeout(10000),
    })
    if (!response.ok) return []
    const xml = await response.text()

    // Simple XML parsing — extract <loc> tags
    const urls: string[] = []
    const locRegex = /<loc>([^<]+)<\/loc>/gi
    let match: RegExpExecArray | null
    while ((match = locRegex.exec(xml)) !== null) {
      if (match[1]) urls.push(match[1].trim())
    }
    return urls
  } catch {
    return []
  }
}

/** Skip non-page URLs (images, documents, etc.) */
function isNonPageUrl(url: string): boolean {
  const path = new URL(url).pathname.toLowerCase()
  const skipExtensions = [
    '.pdf', '.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.ico',
    '.css', '.js', '.json', '.xml', '.zip', '.tar', '.gz',
    '.mp3', '.mp4', '.avi', '.mov', '.woff', '.woff2', '.ttf', '.eot',
  ]
  return skipExtensions.some((ext) => path.endsWith(ext))
}
```

- [ ] **Step 4: Create crawler module index**

Create `src/modules/crawler/index.ts`:

```typescript
export { discoverPages } from './discovery'
export { normalizeUrl, isSameOrigin, normalizeHostname, extractPath } from './url-normalizer'
export type { DiscoveredPage, CrawlConfig, DiscoveryResult } from './types'
```

- [ ] **Step 5: Create crawl processor**

Create `src/worker/processors/crawl.processor.ts`:

```typescript
import type { Job } from 'bullmq'
import type { CrawlJobData } from '@/modules/queue'
import { pageScanQueue } from '@/modules/queue'
import { discoverPages } from '@/modules/crawler'
import { config } from '@/config'
import {
  PrismaCrawlRepository,
  PrismaPageRepository,
  PrismaScanRepository,
} from '@/modules/db'

const crawlRepo = new PrismaCrawlRepository()
const pageRepo = new PrismaPageRepository()
const scanRepo = new PrismaScanRepository()

export async function processCrawlDiscovery(job: Job<CrawlJobData>) {
  const { crawlId, siteId, rootUrl, maxPages } = job.data

  // Update crawl status to discovering
  await crawlRepo.update(crawlId, { status: 'discovering' })

  // Resolve effective max pages (per-crawl cap, capped by env var ceiling)
  const envMax = config.crawler.maxPages
  let effectiveMax = maxPages
  if (envMax !== null) {
    effectiveMax = effectiveMax !== null ? Math.min(effectiveMax, envMax) : envMax
  }

  // Run BFS discovery
  const pages = await discoverPages(
    rootUrl,
    {
      maxPages: effectiveMax,
      delayMs: config.crawler.delayMs,
      userAgent: config.crawler.userAgent,
    },
    async (discovered) => {
      // Update progress during discovery
      await crawlRepo.update(crawlId, { totalPages: discovered })
      await job.updateProgress(Math.min(discovered, 100))
    },
  )

  if (pages.length === 0) {
    await crawlRepo.update(crawlId, {
      status: 'completed',
      totalPages: 0,
      completedAt: new Date(),
    })
    console.log(`[Crawl] No pages found for ${rootUrl}`)
    return
  }

  // Update crawl with final page count and switch to scanning
  await crawlRepo.update(crawlId, {
    totalPages: pages.length,
    status: 'scanning',
  })

  // Create Page records and queue page scans
  for (const page of pages) {
    // Create or find page record
    const pageRecord = await pageRepo.findOrCreate({
      siteId,
      url: page.url,
      path: page.path,
      firstSeenCrawlId: crawlId,
    })

    // Create scan record for this page
    const scan = await scanRepo.create({
      url: page.url,
      pageId: pageRecord.id,
      crawlId,
    })

    // Queue page scan job
    await pageScanQueue.add(`scan-${scan.id}`, {
      scanId: scan.id,
      url: page.url,
      crawlId,
      pageId: pageRecord.id,
      siteId,
    })
  }

  console.log(`[Crawl] Discovered ${pages.length} pages for ${rootUrl}, queued scans`)
}
```

Note: The `scanRepo.create` call needs to support the new `pageId` and `crawlId` fields. Update `CreateScanInput` in `src/modules/db/types.ts` to include these optional fields:

```typescript
export interface CreateScanInput {
  url: string
  metadata?: Record<string, unknown>
  pageId?: string
  crawlId?: string
}
```

And update `PrismaScanRepository.create` to pass them through.

- [ ] **Step 6: Commit**

```bash
git add src/modules/crawler/ src/worker/processors/crawl.processor.ts src/modules/db/types.ts
git commit -m "feat: add BFS crawler module and crawl-discovery processor"
```

---

### Task 1.11: Refactor Worker Entry Point

**Files:**
- Modify: `src/worker/index.ts`

- [ ] **Step 1: Rewrite worker to use BullMQ**

Replace the entire `src/worker/index.ts` with a BullMQ-based worker:

```typescript
import { Worker } from 'bullmq'
import { config } from '@/config'
import { QUEUE_NAMES, redisConnection } from '@/modules/queue'
import { processPageScan } from './processors/page-scan.processor'
import { processAiEnrichment } from './processors/ai-enrichment.processor'
import { processCrawlDiscovery } from './processors/crawl.processor'

const connection = redisConnection

console.log('[Worker] Starting BullMQ workers...')

// Crawl discovery worker — 1 concurrent
const crawlWorker = new Worker(
  QUEUE_NAMES.CRAWL_DISCOVERY,
  processCrawlDiscovery,
  { connection, concurrency: 1 },
)

// Page scan worker — configurable concurrency
const pageScanWorker = new Worker(
  QUEUE_NAMES.PAGE_SCAN,
  processPageScan,
  { connection, concurrency: config.workerConcurrency.pageScan },
)

// AI enrichment worker — configurable concurrency
const aiEnrichmentWorker = new Worker(
  QUEUE_NAMES.AI_ENRICHMENT,
  processAiEnrichment,
  { connection, concurrency: config.workerConcurrency.aiEnrichment },
)

// Logging
const workers = [
  { name: 'crawl-discovery', worker: crawlWorker },
  { name: 'page-scan', worker: pageScanWorker },
  { name: 'ai-enrichment', worker: aiEnrichmentWorker },
]

for (const { name, worker } of workers) {
  worker.on('completed', (job) => {
    console.log(`[${name}] Job ${job.id} completed`)
  })
  worker.on('failed', (job, err) => {
    console.error(`[${name}] Job ${job?.id} failed:`, err.message)
  })
  worker.on('error', (err) => {
    console.error(`[${name}] Worker error:`, err.message)
  })
}

console.log(`[Worker] Running — page-scan concurrency: ${config.workerConcurrency.pageScan}, ai-enrichment concurrency: ${config.workerConcurrency.aiEnrichment}`)

// Graceful shutdown
async function shutdown() {
  console.log('[Worker] Shutting down...')
  await Promise.all([
    crawlWorker.close(),
    pageScanWorker.close(),
    aiEnrichmentWorker.close(),
  ])
  console.log('[Worker] Shutdown complete')
  process.exit(0)
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
```

- [ ] **Step 2: Remove old polling files if any separate helper files existed**

The old worker logic (pollForJob, recoverStaleJobs) is fully replaced. The stale job recovery is now handled by BullMQ's built-in stalled job detection.

- [ ] **Step 3: Verify worker starts**

Run: `pnpm worker`
Expected: Logs showing "Starting BullMQ workers..." and "Running — page-scan concurrency: 3, ai-enrichment concurrency: 2"

- [ ] **Step 4: Commit**

```bash
git add src/worker/
git commit -m "refactor: replace Postgres polling worker with BullMQ workers"
```

---

### Task 1.12: Update Scan Creation API to Use Queue

**Files:**
- Modify: `src/app/api/scans/route.ts`

- [ ] **Step 1: Update POST /api/scans to enqueue via BullMQ**

In the POST handler, after creating the scan record, replace the old "just create and let worker poll" approach with explicit queue enqueuing:

```typescript
import { pageScanQueue } from '@/modules/queue'

// ... existing validation, rate limiting, scan creation ...

// Queue the scan job
await pageScanQueue.add(`scan-${scan.id}`, {
  scanId: scan.id,
  url: scan.url,
  // No crawlId/pageId — this is a standalone scan
})
```

The worker no longer polls for queued scans — BullMQ delivers them.

- [ ] **Step 2: Verify standalone scan flow works end-to-end**

1. Start Redis: `docker compose -f docker-compose.dev.yml up redis postgres -d`
2. Start app: `pnpm dev`
3. Start worker: `pnpm worker`
4. Submit a URL via the dashboard
5. Verify scan progresses through stages and completes

- [ ] **Step 3: Commit**

```bash
git add src/app/api/scans/route.ts
git commit -m "feat: enqueue standalone scans via BullMQ instead of DB polling"
```

---

### Task 1.13: Set Up Bull Board

**Files:**
- Create: `bull-board/index.ts`
- Create: `bull-board/package.json`
- Create: `bull-board/tsconfig.json`
- Modify: `docker-compose.dev.yml`

- [ ] **Step 1: Create Bull Board package.json**

Create `bull-board/package.json`:

```json
{
  "name": "clearsight-bull-board",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "start": "tsx index.ts"
  },
  "dependencies": {
    "@bull-board/api": "^6.0.0",
    "@bull-board/express": "^6.0.0",
    "bullmq": "^5.0.0",
    "express": "^4.21.0",
    "ioredis": "^5.0.0"
  },
  "devDependencies": {
    "tsx": "^4.0.0",
    "@types/express": "^5.0.0",
    "typescript": "^5.0.0"
  }
}
```

- [ ] **Step 2: Create Bull Board server**

Create `bull-board/index.ts`:

```typescript
import express from 'express'
import { createBullBoard } from '@bull-board/api'
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { ExpressAdapter } from '@bull-board/express'
import { Queue } from 'bullmq'

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'
const PORT = parseInt(process.env.BULL_BOARD_PORT || '3001', 10)

const redisUrl = new URL(REDIS_URL)
const connection = {
  host: redisUrl.hostname,
  port: parseInt(redisUrl.port || '6379', 10),
}

const crawlQueue = new Queue('crawl-discovery', { connection })
const pageScanQueue = new Queue('page-scan', { connection })
const aiEnrichmentQueue = new Queue('ai-enrichment', { connection })

const serverAdapter = new ExpressAdapter()
serverAdapter.setBasePath('/')

createBullBoard({
  queues: [
    new BullMQAdapter(crawlQueue),
    new BullMQAdapter(pageScanQueue),
    new BullMQAdapter(aiEnrichmentQueue),
  ],
  serverAdapter,
})

const app = express()
app.use('/', serverAdapter.getRouter())

app.listen(PORT, () => {
  console.log(`[BullBoard] Running at http://localhost:${PORT}`)
})
```

- [ ] **Step 3: Create tsconfig.json**

Create `bull-board/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "strict": true,
    "outDir": "dist"
  },
  "include": ["*.ts"]
}
```

- [ ] **Step 4: Install Bull Board dependencies**

Run: `cd bull-board && pnpm install && cd ..`

- [ ] **Step 5: Add Bull Board service to docker-compose.dev.yml**

```yaml
bull-board:
  build:
    context: ./bull-board
    dockerfile: ../Dockerfile.dev
  ports:
    - "3001:3001"
  environment:
    - REDIS_URL=redis://redis:6379
    - BULL_BOARD_PORT=3001
  depends_on:
    redis:
      condition: service_healthy
  command: pnpm --prefix /app/bull-board start
```

Or simpler: run locally with `cd bull-board && pnpm start` during dev.

- [ ] **Step 6: Add pnpm script to root package.json**

Add: `"bull-board": "cd bull-board && tsx index.ts"`

- [ ] **Step 7: Verify Bull Board runs**

Run: `pnpm bull-board`
Open: `http://localhost:3001`
Expected: Bull Board UI showing 3 queues

- [ ] **Step 8: Commit**

```bash
git add bull-board/ package.json
git commit -m "feat: add Bull Board admin UI on port 3001"
```

---

## Phase 2: Site API + Core UI

Adds the site management API routes, moves the dashboard to `/dashboard`, and builds the site/crawl UI pages.

---

### Task 2.1: Add Client-Side Types

**Files:**
- Modify: `src/lib/types.ts`

- [ ] **Step 1: Add Site, Crawl, Page, and CrawlDetail types**

```typescript
export type CrawlStatus = 'queued' | 'discovering' | 'scanning' | 'completed' | 'failed' | 'cancelled'
export type IssueStatusType = 'open' | 'fixed' | 'dismissed' | 'cant_fix'

export interface Site {
  id: string
  hostname: string
  name: string
  createdAt: string
  updatedAt: string
  latestCrawl?: CrawlSummary | null
  _count?: { pages: number; crawls: number }
}

export interface CrawlSummary {
  id: string
  status: CrawlStatus
  totalPages: number
  scannedPages: number
  enrichedPages: number
  overallScore: number | null
  createdAt: string
  completedAt: string | null
}

export interface CrawlDetail extends CrawlSummary {
  siteId: string
  maxPages: number | null
  newIssues: number
  fixedIssues: number
  site?: Site
}

export interface PageSummary {
  id: string
  siteId: string
  url: string
  path: string
  createdAt: string
  latestScan?: {
    id: string
    status: ScanStatus
    summary?: { overallScore: number } | null
    _count?: { issues: number }
  } | null
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/types.ts
git commit -m "types: add Site, Crawl, Page client-side types"
```

---

### Task 2.2: Sites API Routes

**Files:**
- Create: `src/app/api/sites/route.ts`
- Create: `src/app/api/sites/[id]/route.ts`
- Create: `src/app/api/sites/[id]/crawl/route.ts`
- Create: `src/app/api/sites/[id]/crawls/route.ts`
- Create: `src/app/api/sites/[id]/crawls/[crawlId]/route.ts`
- Create: `src/app/api/sites/[id]/crawls/[crawlId]/cancel/route.ts`

- [ ] **Step 1: Create POST/GET /api/sites**

Create `src/app/api/sites/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { PrismaSiteRepository } from '@/modules/db'
import { normalizeHostname } from '@/modules/crawler'

const siteRepo = new PrismaSiteRepository()

// POST — create site (or return existing)
export async function POST(request: Request) {
  const body = await request.json()
  const { url } = body

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  try {
    const hostname = normalizeHostname(new URL(url).hostname)
    const site = await siteRepo.findOrCreate(hostname)
    return NextResponse.json(site, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }
}

// GET — list all sites
export async function GET() {
  const sites = await siteRepo.findMany()
  return NextResponse.json({ sites })
}
```

- [ ] **Step 2: Create GET/DELETE /api/sites/:id**

Create `src/app/api/sites/[id]/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { PrismaSiteRepository } from '@/modules/db'

const siteRepo = new PrismaSiteRepository()

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const site = await siteRepo.findById(id)
  if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 })
  return NextResponse.json(site)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    await siteRepo.delete(id)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Site not found' }, { status: 404 })
  }
}
```

- [ ] **Step 3: Create POST /api/sites/:id/crawl**

Create `src/app/api/sites/[id]/crawl/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { PrismaSiteRepository, PrismaCrawlRepository } from '@/modules/db'
import { crawlQueue } from '@/modules/queue'
import { config } from '@/config'

const siteRepo = new PrismaSiteRepository()
const crawlRepo = new PrismaCrawlRepository()

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const site = await siteRepo.findById(id)
  if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 })

  // Check for active crawl (1 concurrent per site)
  const activeCrawl = await crawlRepo.findActiveCrawl(id)
  if (activeCrawl) {
    return NextResponse.json(
      { error: 'A crawl is already running for this site', crawlId: activeCrawl.id },
      { status: 409 },
    )
  }

  // Parse optional body for maxPages override
  let maxPages: number | null = null
  try {
    const body = await request.json()
    if (body.maxPages) maxPages = parseInt(body.maxPages, 10)
  } catch { /* no body is fine */ }

  const crawl = await crawlRepo.create({ siteId: id, maxPages })

  // Determine root URL (use https by default)
  const rootUrl = `https://${site.hostname}`

  await crawlQueue.add(`crawl-${crawl.id}`, {
    crawlId: crawl.id,
    siteId: id,
    rootUrl,
    maxPages: maxPages ?? config.crawler.maxPages,
  })

  return NextResponse.json(crawl, { status: 201 })
}
```

- [ ] **Step 4: Create GET /api/sites/:id/crawls and GET /api/sites/:id/crawls/:crawlId**

Create `src/app/api/sites/[id]/crawls/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { PrismaCrawlRepository } from '@/modules/db'

const crawlRepo = new PrismaCrawlRepository()

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const url = new URL(request.url)
  const take = parseInt(url.searchParams.get('limit') || '20', 10)
  const skip = parseInt(url.searchParams.get('offset') || '0', 10)

  const { crawls, total } = await crawlRepo.findBySite(id, { take, skip })
  return NextResponse.json({ crawls, total })
}
```

Create `src/app/api/sites/[id]/crawls/[crawlId]/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { PrismaCrawlRepository } from '@/modules/db'

const crawlRepo = new PrismaCrawlRepository()

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string; crawlId: string }> },
) {
  const { crawlId } = await params
  const crawl = await crawlRepo.findById(crawlId)
  if (!crawl) return NextResponse.json({ error: 'Crawl not found' }, { status: 404 })
  return NextResponse.json(crawl)
}
```

- [ ] **Step 5: Create POST /api/sites/:id/crawls/:crawlId/cancel**

Create `src/app/api/sites/[id]/crawls/[crawlId]/cancel/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { PrismaCrawlRepository } from '@/modules/db'

const crawlRepo = new PrismaCrawlRepository()

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string; crawlId: string }> },
) {
  const { crawlId } = await params
  const crawl = await crawlRepo.findById(crawlId)

  if (!crawl) return NextResponse.json({ error: 'Crawl not found' }, { status: 404 })
  if (crawl.status === 'completed' || crawl.status === 'cancelled' || crawl.status === 'failed') {
    return NextResponse.json({ error: 'Crawl is not active' }, { status: 400 })
  }

  await crawlRepo.update(crawlId, { status: 'cancelled' })

  // TODO: Remove pending BullMQ jobs for this crawlId (enhancement)

  return NextResponse.json({ success: true })
}
```

- [ ] **Step 6: Commit**

```bash
git add src/app/api/sites/
git commit -m "feat: add sites and crawls API routes"
```

---

### Task 2.3: Pages and Issues API Routes

**Files:**
- Create: `src/app/api/sites/[id]/pages/route.ts`
- Create: `src/app/api/sites/[id]/pages/[pageId]/route.ts`
- Create: `src/app/api/sites/[id]/issues/route.ts`
- Create: `src/app/api/sites/[id]/issues/[issueId]/route.ts`

- [ ] **Step 1: Create pages routes**

Create `src/app/api/sites/[id]/pages/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { PrismaPageRepository } from '@/modules/db'

const pageRepo = new PrismaPageRepository()

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const url = new URL(request.url)
  const take = parseInt(url.searchParams.get('limit') || '50', 10)
  const skip = parseInt(url.searchParams.get('offset') || '0', 10)

  const { pages, total } = await pageRepo.findBySite(id, { take, skip })
  return NextResponse.json({ pages, total })
}
```

Create `src/app/api/sites/[id]/pages/[pageId]/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { PrismaPageRepository } from '@/modules/db'

const pageRepo = new PrismaPageRepository()

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string; pageId: string }> },
) {
  const { pageId } = await params
  const page = await pageRepo.findById(pageId)
  if (!page) return NextResponse.json({ error: 'Page not found' }, { status: 404 })
  return NextResponse.json(page)
}
```

- [ ] **Step 2: Create issues routes**

Create `src/app/api/sites/[id]/issues/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/modules/db/prisma'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: siteId } = await params
  const url = new URL(request.url)

  const severity = url.searchParams.get('severity')
  const wcagLevel = url.searchParams.get('wcagLevel')
  const issueStatus = url.searchParams.get('status')
  const pageId = url.searchParams.get('pageId')
  const take = parseInt(url.searchParams.get('limit') || '50', 10)
  const skip = parseInt(url.searchParams.get('offset') || '0', 10)

  // Build where clause: issues belonging to scans of pages of this site
  const where: Record<string, unknown> = {
    scan: {
      page: { siteId },
    },
  }

  if (severity) where.severity = severity
  if (wcagLevel) where.wcagLevel = wcagLevel
  if (issueStatus) where.issueStatus = issueStatus
  if (pageId) where.scan = { ...where.scan as Record<string, unknown>, pageId }

  const [issues, total] = await Promise.all([
    prisma.issue.findMany({
      where,
      take,
      skip,
      orderBy: [
        { severity: 'asc' }, // critical first
        { createdAt: 'desc' },
      ],
      include: {
        scan: { select: { url: true, pageId: true } },
      },
    }),
    prisma.issue.count({ where }),
  ])

  return NextResponse.json({ issues, total })
}
```

Create `src/app/api/sites/[id]/issues/[issueId]/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/modules/db/prisma'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; issueId: string }> },
) {
  const { issueId } = await params
  const body = await request.json()
  const { issueStatus } = body

  const valid = ['open', 'dismissed', 'cant_fix']
  if (!valid.includes(issueStatus)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const issue = await prisma.issue.update({
    where: { id: issueId },
    data: { issueStatus },
  })

  return NextResponse.json(issue)
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/sites/
git commit -m "feat: add pages and issues API routes"
```

---

### Task 2.4: Dashboard Layout and Route Restructure

**Files:**
- Create: `src/app/dashboard/layout.tsx`
- Create: `src/app/dashboard/page.tsx`
- Modify: `src/app/page.tsx` (becomes landing page — Phase 4, for now redirect to /dashboard)
- Create: `src/app/dashboard/scan/[id]/page.tsx`
- Create: `src/app/scan/[id]/redirect.ts` (redirect old URL)

- [ ] **Step 1: Create dashboard layout**

Create `src/app/dashboard/layout.tsx`:

```typescript
import { Shell } from '@/components/layout/Shell'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <Shell>{children}</Shell>
}
```

- [ ] **Step 2: Create dashboard page**

Create `src/app/dashboard/page.tsx`. This will be the main app view with sites list on the left and quick scan on the right. For now, move the existing dashboard content here:

- Copy the current `src/app/page.tsx` content to `src/app/dashboard/page.tsx`
- Add a sites list section that fetches from `GET /api/sites`
- Keep the existing ScanForm for quick scans

- [ ] **Step 3: Move scan results page**

Copy `src/app/scan/[id]/page.tsx` to `src/app/dashboard/scan/[id]/page.tsx`.

Update the back button link from `/` to `/dashboard`.

- [ ] **Step 4: Add redirect from old /scan/:id**

Update `src/app/scan/[id]/page.tsx` to redirect:

```typescript
import { redirect } from 'next/navigation'

export default async function ScanRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/dashboard/scan/${id}`)
}
```

- [ ] **Step 5: Refactor root layout — remove Shell wrapper**

**Critical:** The current `src/app/layout.tsx` wraps everything in `<Shell>`. Move the Shell wrapping into `src/app/dashboard/layout.tsx` only (created in Step 1). The root layout should be minimal: `<html>`, `<body>`, font loading, global CSS — no `<Shell>`. This prevents double-rendering and prepares for the landing page in Phase 4.

- [ ] **Step 6: Make root page redirect to /dashboard temporarily**

Replace `src/app/page.tsx` with a temporary redirect (landing page comes in Phase 4):

```typescript
import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/dashboard')
}
```

- [ ] **Step 7: Verify routing works**

Start dev server, navigate to:
- `/` → redirects to `/dashboard`
- `/dashboard` → shows dashboard
- `/scan/some-id` → redirects to `/dashboard/scan/some-id`

- [ ] **Step 8: Commit**

```bash
git add src/app/
git commit -m "feat: restructure routes — dashboard at /dashboard, redirect /scan/:id"
```

---

### Task 2.5: Site Overview Page

**Files:**
- Create: `src/app/dashboard/site/[id]/page.tsx`
- Create: `src/app/dashboard/site/[id]/layout.tsx`

- [ ] **Step 1: Create site layout**

Create `src/app/dashboard/site/[id]/layout.tsx`:

```typescript
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
```

- [ ] **Step 2: Create site overview page**

Create `src/app/dashboard/site/[id]/page.tsx`:

A client component that:
- Fetches site data from `GET /api/sites/:id`
- Shows hostname, name, last crawl date
- "Crawl Now" button that POSTs to `/api/sites/:id/crawl`
- Score gauge (from latest crawl's overallScore)
- Stats row: total pages, total issues
- Crawl history list (fetched from `GET /api/sites/:id/crawls`)
- Each crawl row: date, status badge, score, pages scanned, duration
- Click crawl → navigate to `/dashboard/site/:id/crawl/:crawlId`

Use existing components: `ScoreGauge`, SWR for data fetching, shadcn `Card`, `Button`, `Badge`.

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/site/
git commit -m "feat: add site overview page"
```

---

### Task 2.6: Crawl Detail Page

**Files:**
- Create: `src/app/dashboard/site/[id]/crawl/[crawlId]/page.tsx`

- [ ] **Step 1: Create crawl detail page**

A client component with two states:

**During crawl (status: queued/discovering/scanning):**
- SWR polling every 2s
- Progress bar: `scannedPages / totalPages`
- Status badge (discovering / scanning)
- Live stats: pages found, pages scanned, issues found so far
- Cancel button

**After completion (status: completed/failed/cancelled):**
- Score gauge + summary
- Stats: total pages, total issues by severity
- "By Issue" / "By Page" toggle
  - By Issue: grouped issue list (reuse `IssueTabs` component)
  - By Page: list of pages with scores, click to navigate to page detail
- Export button

- [ ] **Step 2: Commit**

```bash
git add src/app/dashboard/site/
git commit -m "feat: add crawl detail page with live progress and results"
```

---

### Task 2.7: Pages List and Page Detail

**Files:**
- Create: `src/app/dashboard/site/[id]/pages/page.tsx`
- Create: `src/app/dashboard/site/[id]/page/[pageId]/page.tsx`

- [ ] **Step 1: Create pages list**

Client component:
- Fetch from `GET /api/sites/:id/pages`
- Table/grid of pages with: path, score (from latest scan), issue count, last scanned date
- Click row → navigate to `/dashboard/site/:id/page/:pageId`

- [ ] **Step 2: Create page detail**

Client component:
- Fetch page from `GET /api/sites/:id/pages/:pageId`
- Show latest scan results using existing `ResultsView` component
- Scan history list (past scans for this page)

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/site/
git commit -m "feat: add pages list and page detail views"
```

---

### Task 2.8: Site Issues View

**Files:**
- Create: `src/app/dashboard/site/[id]/issues/page.tsx`

- [ ] **Step 1: Create filterable issues view**

Client component:
- Fetch from `GET /api/sites/:id/issues` with query params
- Filters: severity dropdown, WCAG level dropdown, status dropdown, page dropdown
- Sortable columns
- Issue rows with: description, severity badge, WCAG criterion, affected page, status
- Click row → expand to show IssueCard details + "Inspect" button
- Dismiss/Can't Fix actions via PATCH `/api/sites/:id/issues/:issueId`
- "Show dismissed" toggle

- [ ] **Step 2: Commit**

```bash
git add src/app/dashboard/site/
git commit -m "feat: add site-wide issues view with filters"
```

---

### Task 2.9: Update Sidebar

**Files:**
- Modify: `src/components/layout/Sidebar.tsx`

- [ ] **Step 1: Add sites section to sidebar**

Update sidebar to show:
- **Sites section** (top):
  - List of sites with hostname, score badge, active crawl indicator
  - Click → navigate to `/dashboard/site/:id`
  - "Add Site" button
- **Recent Scans section** (bottom):
  - Existing standalone scan history (filtered to scans without siteId)

Fetch sites from `GET /api/sites` via SWR.

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/Sidebar.tsx
git commit -m "feat: update sidebar with sites section"
```

---

## Phase 3: Issue Tracking Across Crawls

---

### Task 3.1: Implement Issue Hash Generation

**Files:**
- Create: `src/modules/pipeline/issue-hash.ts`
- Modify: `src/modules/pipeline/stages/store.ts`
- Modify: `src/modules/pipeline/stages/intermediate-store.ts`

- [ ] **Step 1: Create issue hash utility**

Create `src/modules/pipeline/issue-hash.ts`:

```typescript
import { createHash } from 'crypto'

export function computeIssueHash(
  ruleId: string | null,
  axeRuleId: string | null,
  elementSelector: string,
  wcagCriterion: string,
  pageUrl: string,
): string {
  const canonicalRuleId = ruleId ?? axeRuleId ?? 'unknown'
  const input = `${canonicalRuleId}|${elementSelector}|${wcagCriterion}|${pageUrl}`
  return createHash('sha256').update(input).digest('hex')
}
```

- [ ] **Step 2: Add issueHash, pageUrl, and firstSeenScanId to issue creation in IntermediateStore and Store stages**

In both stages, when creating issue records, compute and include `issueHash`, `pageUrl`, `firstSeenScanId`, and `lastSeenScanId`:

```typescript
import { computeIssueHash } from '../issue-hash'

// In the issue mapping:
issueHash: computeIssueHash(issue.ruleId, issue.axeRuleId, issue.elementSelector, issue.wcagCriterion, context.url),
pageUrl: context.url,
firstSeenScanId: context.scanId,
lastSeenScanId: context.scanId,
```

- [ ] **Step 3: Commit**

```bash
git add src/modules/pipeline/
git commit -m "feat: compute and store issue hash for cross-crawl tracking"
```

---

### Task 3.2: Issue Lifecycle Management

**Files:**
- Create: `src/modules/crawler/issue-tracker.ts`
- Modify: `src/worker/processors/ai-enrichment.processor.ts` (in `finalizeCrawl`)

- [ ] **Step 1: Create issue tracker module**

Create `src/modules/crawler/issue-tracker.ts`:

```typescript
import { prisma } from '@/modules/db/prisma'

/**
 * Compare issues between current crawl and previous crawl.
 * Updates issue statuses and returns diff counts.
 */
export async function computeIssueDiff(
  siteId: string,
  currentCrawlId: string,
): Promise<{ newIssues: number; fixedIssues: number; recurring: number }> {
  // Get the previous completed crawl
  const previousCrawl = await prisma.crawl.findFirst({
    where: {
      siteId,
      status: 'completed',
      id: { not: currentCrawlId },
    },
    orderBy: { completedAt: 'desc' },
  })

  // Get current crawl's issue hashes
  const currentIssues = await prisma.issue.findMany({
    where: {
      scan: { crawlId: currentCrawlId },
      issueHash: { not: null },
    },
    select: { id: true, issueHash: true },
  })

  const currentHashes = new Set(currentIssues.map((i) => i.issueHash!))

  if (!previousCrawl) {
    // First crawl — all issues are new
    return { newIssues: currentHashes.size, fixedIssues: 0, recurring: 0 }
  }

  // Get previous crawl's issue hashes
  const previousIssues = await prisma.issue.findMany({
    where: {
      scan: { crawlId: previousCrawl.id },
      issueHash: { not: null },
    },
    select: { id: true, issueHash: true, issueStatus: true },
  })

  const previousHashes = new Set(previousIssues.map((i) => i.issueHash!))

  // Build lookup of previous issue statuses by hash
  const previousStatusByHash = new Map<string, string>()
  for (const prev of previousIssues) {
    if (prev.issueHash) {
      previousStatusByHash.set(prev.issueHash, prev.issueStatus)
    }
  }

  // Compute diff
  let newIssues = 0
  let recurring = 0
  const carryOverUpdates: { id: string; issueStatus: string }[] = []

  for (const current of currentIssues) {
    if (!current.issueHash) continue
    if (previousHashes.has(current.issueHash)) {
      recurring++
      // Carry over dismissed/cant_fix status from previous crawl
      const prevStatus = previousStatusByHash.get(current.issueHash)
      if (prevStatus === 'dismissed' || prevStatus === 'cant_fix') {
        carryOverUpdates.push({ id: current.id, issueStatus: prevStatus })
      }
    } else {
      newIssues++
    }
  }

  // Apply status carryover (dismissed/cant_fix issues stay dismissed)
  for (const update of carryOverUpdates) {
    await prisma.issue.update({
      where: { id: update.id },
      data: { issueStatus: update.issueStatus as any },
    })
  }

  // Update lastSeenScanId for recurring issues
  for (const current of currentIssues) {
    if (current.issueHash && previousHashes.has(current.issueHash)) {
      await prisma.issue.update({
        where: { id: current.id },
        data: { lastSeenScanId: current.id },
      })
    }
  }

  // Fixed: in previous but not in current (and not dismissed/cant_fix)
  const fixedHashes: string[] = []
  for (const prev of previousIssues) {
    if (
      prev.issueHash &&
      !currentHashes.has(prev.issueHash) &&
      prev.issueStatus === 'open'
    ) {
      fixedHashes.push(prev.issueHash)
    }
  }
  const fixedIssues = fixedHashes.length

  // Mark fixed issues
  if (fixedHashes.length > 0) {
    await prisma.issue.updateMany({
      where: {
        issueHash: { in: fixedHashes },
        scan: { crawlId: previousCrawl.id },
        issueStatus: 'open',
      },
      data: {
        issueStatus: 'fixed',
        fixedAtCrawlId: currentCrawlId,
      },
    })
  }

  return { newIssues, fixedIssues, recurring }
}
```

- [ ] **Step 2: Call computeIssueDiff in finalizeCrawl**

In `src/worker/processors/ai-enrichment.processor.ts`, update `finalizeCrawl`:

```typescript
import { computeIssueDiff } from '@/modules/crawler/issue-tracker'

async function finalizeCrawl(crawlId: string) {
  const crawl = await crawlRepo.findById(crawlId)
  if (!crawl) return

  // ... existing score aggregation ...

  // Compute issue diff
  const diff = await computeIssueDiff(crawl.siteId, crawlId)

  await crawlRepo.update(crawlId, {
    status: 'completed',
    overallScore: overallScore ?? undefined,
    newIssues: diff.newIssues,
    fixedIssues: diff.fixedIssues,
    completedAt: new Date(),
  })
}
```

- [ ] **Step 3: Commit**

```bash
git add src/modules/crawler/issue-tracker.ts src/worker/processors/ai-enrichment.processor.ts
git commit -m "feat: issue tracking across crawls with diff computation"
```

---

### Task 3.3: Issue Status UI Actions

**Files:**
- Modify: `src/app/dashboard/site/[id]/issues/page.tsx`
- Modify: `src/components/results/IssueCard.tsx` (optional: add dismiss button)

- [ ] **Step 1: Add dismiss/cant_fix actions to issues view**

In the issues view, add action buttons per issue:
- "Dismiss" → PATCH with `{ issueStatus: 'dismissed' }`
- "Can't Fix" → PATCH with `{ issueStatus: 'cant_fix' }`
- "Reopen" (shown for dismissed/cant_fix issues) → PATCH with `{ issueStatus: 'open' }`

Mutate the SWR cache after action.

- [ ] **Step 2: Add diff display to crawl detail**

In the crawl detail page, after completion, show:
- `+N new issues` (green if 0, red otherwise)
- `-N fixed issues` (green)
- `N recurring` (neutral)

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/site/ src/components/results/
git commit -m "feat: add issue dismiss/triage actions and crawl diff display"
```

---

## Phase 4: Landing Page + Marketing Pages

---

### Task 4.1: Landing Page

**Files:**
- Modify: `src/app/page.tsx` (replace redirect with landing page)
- Create: `src/app/layout-landing.tsx` (optional: separate layout without sidebar)
- Create: `src/components/landing/Hero.tsx`
- Create: `src/components/landing/Features.tsx`
- Create: `src/components/landing/HowItWorks.tsx`
- Create: `src/components/landing/FAQ.tsx`
- Create: `src/components/landing/Footer.tsx`
- Create: `src/components/landing/Navbar.tsx`

- [ ] **Step 1: Create Navbar**

Create `src/components/landing/Navbar.tsx`:

Fixed top navbar with:
- Logo (ClearSight)
- Nav links: How it works, FAQ, Docs (external link to docs-site)
- CTA button: "Dashboard →"

- [ ] **Step 2: Create Hero section**

Create `src/components/landing/Hero.tsx`:

- Large headline: "Full-site accessibility audits, powered by AI"
- Subheadline
- URL input with "Start scanning" CTA (navigates to `/dashboard?url=...`)
- Stats strip below: "50+ WCAG rules", "AI-powered fixes", "Full site crawl", "PDF & Excel reports"

- [ ] **Step 3: Create HowItWorks section**

3-step visual:
1. Enter your site URL
2. We crawl & analyze every page
3. Get actionable results with AI fix suggestions

- [ ] **Step 4: Create Features grid**

2x3 grid of feature cards with icons (Lucide):
- Full-site crawling
- Issue tracking across scans
- AI-generated fix suggestions
- Screenshot + DOM inspector
- PDF/Excel export
- WCAG 2.1 A & AA coverage

- [ ] **Step 5: Create FAQ accordion**

Using shadcn Accordion component. 5-6 common questions.

- [ ] **Step 6: Create Footer**

Links to docs, dashboard. Branding.

- [ ] **Step 7: Assemble landing page**

Replace `src/app/page.tsx`:

```typescript
import { Navbar } from '@/components/landing/Navbar'
import { Hero } from '@/components/landing/Hero'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { Features } from '@/components/landing/Features'
import { FAQ } from '@/components/landing/FAQ'
import { Footer } from '@/components/landing/Footer'

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Features />
      <FAQ />
      <Footer />
    </div>
  )
}
```

Root layout should NOT include Shell/Sidebar for landing page. The `src/app/layout.tsx` should be minimal, and the Shell wrapping should be in `src/app/dashboard/layout.tsx` only.

- [ ] **Step 8: Commit**

```bash
git add src/app/page.tsx src/components/landing/
git commit -m "feat: add marketing landing page"
```

---

### Task 4.2: How It Works and FAQ Pages

**Files:**
- Create: `src/app/how-it-works/page.tsx`
- Create: `src/app/faq/page.tsx`

- [ ] **Step 1: Create How It Works page**

Detailed pipeline explanation with visuals. Reuse Navbar + Footer.

- [ ] **Step 2: Create FAQ page**

Expanded FAQ with more questions. Reuse Navbar + Footer.

- [ ] **Step 3: Commit**

```bash
git add src/app/how-it-works/ src/app/faq/
git commit -m "feat: add How It Works and FAQ pages"
```

---

## Phase 5: Docs Site

---

### Task 5.1: Scaffold Nextra Docs Site

**Files:**
- Create: `docs-site/package.json`
- Create: `docs-site/next.config.mjs`
- Create: `docs-site/theme.config.tsx`
- Create: `docs-site/content/index.mdx`
- Create: `docs-site/content/getting-started.mdx`
- Create: `docs-site/tsconfig.json`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "clearsight-docs",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev --port 3002",
    "build": "next build",
    "start": "next start --port 3002"
  },
  "dependencies": {
    "lucide-react": "^0.563.0",
    "next": "16.1.7",
    "nextra": "^4.6.1",
    "nextra-theme-docs": "^4.6.1",
    "react": "19.2.4",
    "react-dom": "19.2.4"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
```

- [ ] **Step 2: Create next.config.mjs**

```javascript
import nextra from 'nextra'

const withNextra = nextra({
  contentDirBasePath: '/',
})

export default withNextra({})
```

- [ ] **Step 3: Create theme.config.tsx**

```tsx
import type { DocsThemeConfig } from 'nextra-theme-docs'

const config: DocsThemeConfig = {
  logo: <span style={{ fontWeight: 700 }}>ClearSight Docs</span>,
  project: { link: 'https://github.com/your-repo/clearsight' },
  docsRepositoryBase: 'https://github.com/your-repo/clearsight/tree/main/docs-site',
  footer: { content: 'ClearSight Documentation' },
}

export default config
```

- [ ] **Step 4: Create initial content files**

Create `docs-site/content/index.mdx`:
```mdx
# ClearSight Documentation

Welcome to the ClearSight documentation. ClearSight is an AI-powered WCAG 2.1 accessibility checker.
```

Create `docs-site/content/getting-started.mdx`:
```mdx
# Getting Started

## Quick Scan
1. Go to the Dashboard
2. Enter a URL in the scan form
3. View your results

## Full Site Crawl
1. Add your site from the Dashboard
2. Click "Crawl Now"
3. Wait for all pages to be scanned
4. Review aggregated results
```

- [ ] **Step 5: Install dependencies and verify**

Run:
```bash
cd docs-site && pnpm install && pnpm dev
```
Expected: Nextra docs site running at http://localhost:3002

- [ ] **Step 6: Add pnpm script to root**

Add to root `package.json` scripts: `"docs": "cd docs-site && pnpm dev"`

- [ ] **Step 7: Commit**

```bash
git add docs-site/ package.json
git commit -m "feat: scaffold Nextra docs site"
```

---

### Task 5.2: Write Core Documentation

**Files:**
- Create: `docs-site/content/scanning/single-page.mdx`
- Create: `docs-site/content/scanning/full-site-crawl.mdx`
- Create: `docs-site/content/scanning/issue-tracking.mdx`
- Create: `docs-site/content/results/understanding-scores.mdx`
- Create: `docs-site/content/results/issue-types.mdx`
- Create: `docs-site/content/results/inspector.mdx`
- Create: `docs-site/content/results/export.mdx`
- Create: `docs-site/content/faq.mdx`

- [ ] **Step 1: Write scanning docs**

Cover: single-page scan flow, full-site crawl flow, issue tracking lifecycle, dismiss/triage.

- [ ] **Step 2: Write results docs**

Cover: score interpretation, confirmed vs potential issues, inspector usage, PDF/Excel export.

- [ ] **Step 3: Write FAQ**

Expanded FAQ covering common questions.

- [ ] **Step 4: Commit**

```bash
git add docs-site/content/
git commit -m "docs: write core documentation content"
```

---

### Task 5.3: Set Up docs-internal

**Files:**
- Create: `docs-internal/README.md`

- [ ] **Step 1: Create README**

Create `docs-internal/README.md`:

```markdown
# ClearSight Internal Documentation

Internal technical specs, architecture decisions, and implementation plans.

## Structure

- `specs/` — Design specifications
- `plans/` — Implementation plans
- `decisions/` — Architecture Decision Records (ADRs)
```

- [ ] **Step 2: Commit**

```bash
git add docs-internal/
git commit -m "docs: set up internal documentation structure"
```

---

## Phase 6: Polish + Export

---

### Task 6.1: Crawl-Level Export

**Files:**
- Create: `src/app/api/sites/[id]/crawls/[crawlId]/export/route.ts`

- [ ] **Step 1: Create crawl export route**

Similar to existing scan export, but aggregates all issues across all scans in the crawl:
- Fetch all scans + issues for the crawlId
- Generate executive summary via LLM (covering the full site)
- Use existing PDFReportGenerator / ExcelReportGenerator, passing aggregated data

- [ ] **Step 2: Commit**

```bash
git add src/app/api/sites/
git commit -m "feat: add crawl-level PDF/Excel export"
```

---

### Task 6.2: Loading, Error, and Empty States

**Files:**
- Modify: All new pages in `src/app/dashboard/site/`

- [ ] **Step 1: Add skeleton loaders to all new pages**

Each page should have loading skeletons matching the layout (similar to existing scan page skeletons).

- [ ] **Step 2: Add error states**

Error boundary or error UI for failed API calls.

- [ ] **Step 3: Add empty states**

- Sites list empty: "No sites yet. Add your first site."
- Pages list empty: "No pages discovered yet. Start a crawl."
- Issues list empty: "No issues found."
- Crawl history empty: "No crawls yet."

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/ src/components/
git commit -m "polish: add loading, error, and empty states to all new pages"
```

---

### Task 6.3: Mobile Responsiveness

(Note: Root layout refactoring was moved to Task 2.4 Step 5 — already done in Phase 2.)

**Files:**
- Modify: All new pages and components

- [ ] **Step 1: Review and fix responsive breakpoints**

Ensure all new pages work on mobile:
- Dashboard: stack sites + quick scan vertically
- Site overview: single column
- Crawl detail: single column
- Issues view: horizontal scroll on table, or card layout on mobile
- Landing page: stack sections vertically

- [ ] **Step 2: Commit**

```bash
git add .
git commit -m "polish: mobile responsiveness for all new pages"
```
