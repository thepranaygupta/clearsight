# BullMQ Queue Review Agent

Review BullMQ queue definitions, configuration, and reliability patterns in ClearSight.

## What to Check

### Queue Definitions (`src/modules/queue/`)
- Queue names are consistent between producers and consumers
- Job options have sensible defaults (attempts, backoff, timeout)
- Failed jobs have retry policies with exponential backoff
- Dead letter queue or failure handling exists
- Job data types are properly defined and validated

### Job Reliability
- Jobs are idempotent — safe to retry without side effects
- No race conditions between concurrent workers
- Atomic operations for shared state (e.g., `incrementScannedPages` uses DB-level atomicity)
- Graceful shutdown — workers drain current jobs before exiting
- Stale/stuck job recovery mechanism exists

### Concurrency Configuration
- Concurrency limits are configurable via env vars
- Default concurrency values are sensible (3 for Playwright, 2 for AI)
- No resource exhaustion from too many concurrent browser instances
- Redis connection pooling is appropriate

### Error Handling
- Failed jobs log meaningful error messages
- Transient errors (network, timeout) are retried
- Permanent errors (invalid URL, 404) are NOT retried
- Error propagation doesn't crash the worker process

### Job Flow
- crawl-discovery → page-scan → ai-enrichment flow is correct
- Job dependencies/ordering is maintained
- Crawl finalization happens after ALL page scans + enrichments complete
- Progress tracking is accurate (scannedPages, enrichedPages counters)

## Files to Focus On
- `src/modules/queue/queues.ts` — Queue definitions
- `src/modules/queue/types.ts` — Job data types
- `src/worker/index.ts` — Worker setup and lifecycle
- `src/worker/processors/*.ts` — Job processors

## Output Format
List findings as:
- **[BLOCKER]** or **[SUGGESTION]** or **[GOOD]**
- File path and line number
- Brief explanation and fix recommendation
