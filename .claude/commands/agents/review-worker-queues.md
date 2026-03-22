# Worker & Queue Processors Review Agent

Review BullMQ worker lifecycle, job processors, and the crawl → scan → enrich pipeline flow.

## What to Check

### Worker Lifecycle (`src/worker/index.ts`)
- Graceful shutdown on SIGTERM/SIGINT — drains current jobs before exiting
- All workers (crawl-discovery, page-scan, ai-enrichment) started correctly
- Concurrency settings applied from config
- Worker reconnects on Redis disconnection
- Unhandled errors don't crash the process (global error handlers)
- Logging is sufficient for debugging (job ID, status transitions)

### Crawl Processor (`src/worker/processors/crawl.processor.ts`)
- Creates crawl record in DB before starting discovery
- BFS discovery results in page-scan jobs being enqueued
- Handles empty sites (no pages found) gracefully
- Updates crawl status through lifecycle: queued → discovering → scanning → completed
- Respects `maxPages` limit
- Crawl delay (`CRAWL_DELAY_MS`) applied between requests

### Page Scan Processor (`src/worker/processors/page-scan.processor.ts`)
- Runs the full scan pipeline (fetch → analyze → custom checks → store)
- Increments `scannedPages` atomically after completion
- Enqueues ai-enrichment job after scan completes
- Handles scan failures without blocking other pages in the crawl
- Page/Scan association maintained correctly (pageId, crawlId on Scan)

### AI Enrichment Processor (`src/worker/processors/ai-enrichment.processor.ts`)
- Enriches issues with AI descriptions and fix suggestions
- Generates scan summary (overallScore, topPriorities)
- Increments `enrichedPages` atomically after completion
- Detects when all pages in a crawl are enriched → triggers finalization
- Finalization: aggregates scores across pages, detects new/fixed issues

### Job Data Integrity
- Job payloads contain only IDs (not full objects) — data fetched fresh from DB
- No stale data from job payload vs DB state
- Job IDs are traceable (can find related crawl/scan/page from any job)

### Concurrency Safety
- Multiple page-scan workers don't conflict on shared crawl state
- `incrementScannedPages` / `incrementEnrichedPages` are atomic DB operations
- Crawl completion check (all pages done?) is race-condition-free

## Files to Focus On
- `src/worker/index.ts` — Worker setup and lifecycle
- `src/worker/processors/crawl.processor.ts` — Crawl discovery processor
- `src/worker/processors/page-scan.processor.ts` — Page scan processor
- `src/worker/processors/ai-enrichment.processor.ts` — AI enrichment processor
- `src/modules/queue/queues.ts` — Queue definitions
- `src/modules/queue/types.ts` — Job data types

## Output Format
List findings as:
- **[BLOCKER]** or **[SUGGESTION]** or **[GOOD]**
- File path and line number
- Brief explanation and fix recommendation
