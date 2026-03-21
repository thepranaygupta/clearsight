# SWR Data Fetching Review Agent

Review SWR usage patterns in ClearSight's client-side data fetching.

## What to Check

### Cache Key Consistency
- SWR keys match API route paths exactly
- Conditional fetching uses `null` key pattern: `useSWR(condition ? url : null, fetcher)`
- No duplicate fetcher definitions — should be shared or consistent
- Keys include all relevant parameters (pagination, filters)

### Revalidation & Polling
- Active crawls/scans use `refreshInterval` for real-time updates
- Completed/static data uses `revalidateOnFocus: false` to avoid unnecessary refetches
- `mutate()` is called after mutations (POST/PUT/DELETE) to update cache
- No stale data after user actions (e.g., starting a crawl should immediately reflect)

### Error & Loading States
- Every `useSWR` call handles `isLoading` with skeleton/spinner
- Error states show meaningful messages, not raw error objects
- `error` is typed properly (not just `any`)
- Fallback UI for empty data states

### Type Safety
- `useSWR<ResponseType>` has explicit generic type
- Response shapes match API route return types
- No `as any` casts on SWR data

### Performance
- No waterfalls — independent data fetches should be parallel (multiple `useSWR` calls)
- No unnecessary refetches from key instability (new object/array references in keys)
- Large lists use pagination, not unbounded fetches

## Files to Focus On
- `src/app/dashboard/**/*.tsx` — All dashboard pages using SWR
- `src/app/scan/**/*.tsx` — Scan result pages
- `src/components/layout/Sidebar.tsx` — Sidebar data fetching
- `src/components/scan/ScanHistory.tsx` — Scan history polling

## Output Format
List findings as:
- **[BLOCKER]** or **[SUGGESTION]** or **[GOOD]**
- File path and line number
- Brief explanation and fix recommendation
