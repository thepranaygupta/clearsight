# TypeScript Review Agent

Review type safety and TypeScript patterns in ClearSight.

## What to Check

### Strict Mode Compliance
- No `any` types — use `unknown` for truly unknown shapes, then narrow
- No `@ts-ignore` or `@ts-expect-error` without justification
- No non-null assertions (`!`) on values that could genuinely be null
- Strict null checks are respected (handle `| null` and `| undefined`)

### Type Organization
- Client-side types in `src/lib/types.ts` — shared interfaces for API responses
- Prisma-generated types used on server side, not leaked to client
- `import type { ... }` syntax for type-only imports (separate from value imports)
- No circular type dependencies

### Interface Design
- API response types match actual API route return shapes
- Enums match Prisma schema enums (ScanStatus, CrawlStatus, Severity, etc.)
- No overly broad types (e.g., `Record<string, any>`)
- JSON fields have typed shapes (not just `Json`)

### Function Signatures
- Async functions return `Promise<T>`, not untyped promises
- Event handlers are properly typed
- Callback props have explicit signatures
- No implicit `any` in function parameters

### Type Guards & Narrowing
- Proper type narrowing before accessing optional properties
- Discriminated unions used where appropriate (e.g., status-based type narrowing)
- No unsafe casts (`as SomeType`) without validation

### Path Aliases
- `@/*` alias consistently used (maps to `./src/*`)
- No relative paths like `../../../` that the alias could simplify

## Files to Focus On
- `src/lib/types.ts` — Central type definitions
- `src/modules/db/types.ts` — Database input types
- `src/modules/queue/types.ts` — Job data types
- `src/modules/crawler/types.ts` — Crawler types
- `src/config/index.ts` — Config shape
- All `.tsx` and `.ts` files for type usage patterns

## Output Format
List findings as:
- **[BLOCKER]** or **[SUGGESTION]** or **[GOOD]**
- File path and line number
- Brief explanation and fix recommendation
