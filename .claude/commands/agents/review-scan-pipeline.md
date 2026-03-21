# Scan Pipeline Review Agent

Review the 5-stage scan pipeline orchestration, progress tracking, and error recovery in ClearSight.

## What to Check

### Pipeline Stages (sequential)
1. **Fetch** (20%) — Playwright renders page, captures screenshot + HTML
2. **Analyze** (40%) — axe-core accessibility checks
3. **CustomChecks** (55%) — Link text + touch target engines
4. **Enrich** (80%) — AI enrichment (descriptions, fixes, scoring)
5. **Store** (100%) — Save issues, summary, metadata to DB

Verify each stage:
- Receives correct input from previous stage
- Updates progress percentage accurately
- Handles failures gracefully (doesn't corrupt state)
- Can be individually debugged/logged

### Pipeline Orchestrator
- Stages execute in correct order
- Progress updates are persisted to DB (not just in-memory)
- `currentStage` field accurately reflects which stage is running
- Total pipeline timeout exists to prevent infinite hangs
- Pipeline can be cancelled mid-execution

### Error Recovery
- If AI enrichment fails, scan completes with `completed_partial` status
- If Playwright crashes, scan is marked `failed` with error message
- Partial results are preserved (e.g., axe results saved even if AI fails)
- Retry logic: stale scans (running > 120s) are recovered (max 3 retries)
- `retryCount` is incremented correctly

### Data Flow
- Issue hashing (`issueHash`) is consistent for the same element + rule
- Issue deduplication works across crawls (new/fixed/recurring detection)
- `ScanSummary` (overallScore, topPriorities, positiveFindings) is generated correctly
- Metadata JSON field stores useful debugging info

### Integration with BullMQ
- Pipeline runs inside BullMQ job processors correctly
- Job progress maps to scan progress
- Job failure maps to scan failure status
- No orphaned scans (job completes but scan stays in `running`)

## Files to Focus On
- `src/modules/pipeline/` — Pipeline orchestrator and stages
- `src/modules/pipeline/stages/` — Individual stage implementations
- `src/modules/pipeline/types.ts` — Pipeline types
- `src/modules/pipeline/issue-hash.ts` — Issue deduplication
- `src/worker/processors/page-scan.processor.ts` — BullMQ integration

## Output Format
List findings as:
- **[BLOCKER]** or **[SUGGESTION]** or **[GOOD]**
- File path and line number
- Brief explanation and fix recommendation
