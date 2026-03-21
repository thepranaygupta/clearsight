# Playwright & axe-core Review Agent

Review browser automation and accessibility scanning engine usage in ClearSight.

## What to Check

### Playwright Resource Management
- Browser instances are properly closed after use (no leaks)
- Pages are closed after scanning, even on error (try/finally)
- Navigation timeout is configured and sensible (30s default)
- Concurrent browser instances limited to avoid OOM
- Headless mode is enforced
- Browser context is fresh per scan (no shared state/cookies between scans)

### axe-core Integration
- `@axe-core/playwright` used correctly with proper page injection
- axe rules configured appropriately (WCAG 2.1 Level A + AA)
- Results are properly mapped to ClearSight's Issue model
- axe violations vs incomplete vs inapplicable handled correctly
- Element selectors captured for each issue
- Element HTML snippets captured and truncated to reasonable size

### Custom Scan Engines
- LinkTextEngine and TouchTargetEngine follow same interface pattern
- Custom checks don't duplicate what axe-core already catches
- Results from all engines merged correctly via `Promise.allSettled`
- Partial failures don't block the entire scan

### Screenshot Capture
- Screenshots captured at consistent viewport (1280x720)
- Screenshot data stored efficiently (not base64 in JSON if avoidable)
- Screenshots captured before page modifications (axe injection)

### Error Handling
- Network errors (DNS failure, timeout, SSL) produce clear error messages
- Pages that crash Chromium don't crash the worker
- Redirect loops detected and handled
- JavaScript errors on target page don't fail the scan

## Files to Focus On
- `src/modules/scanner/renderer/playwright.ts` — Browser automation
- `src/modules/scanner/engines/` — axe-core and custom engines
- `src/modules/pipeline/stages/` — Pipeline stages that use Playwright

## Output Format
List findings as:
- **[BLOCKER]** or **[SUGGESTION]** or **[GOOD]**
- File path and line number
- Brief explanation and fix recommendation
