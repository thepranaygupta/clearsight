# Prisma & Database Review Agent

Review Prisma schema design and repository pattern usage in ClearSight.

## What to Check

### Schema Design (`prisma/schema.prisma`)
- Proper use of `@id`, `@unique`, `@@unique`, `@@index`
- Indexes exist for all foreign keys and frequently queried fields
- Cascade rules make sense (e.g., deleting a Scan cascades to Issues)
- Enum values are comprehensive and correctly named
- `@map` annotations follow snake_case convention for DB columns
- No missing relations or orphan references

### Repository Pattern (`src/modules/db/repositories/`)
- All database access goes through repository classes (no direct `prisma.xxx` in routes/components)
- Repositories handle only data access, no business logic
- Proper use of `include` — no over-fetching (N+1 potential)
- Pagination uses `take`/`skip` correctly
- Transactions where needed (multi-table writes)

### Query Safety
- Raw SQL (if any) uses parameterized queries (`$queryRaw` with template literals)
- No string concatenation in queries
- `FOR UPDATE SKIP LOCKED` patterns are correct
- Atomic operations (increment, etc.) use DB-level atomicity

### Data Integrity
- Required fields are truly required (no `?` on fields that should always exist)
- Default values make sense
- `@updatedAt` on all mutable models
- JSON fields (`Json?`) have documented shape

### Migration Safety
- Schema changes are additive where possible
- No data-destructive changes without migration scripts

## Files to Focus On
- `prisma/schema.prisma`
- `src/modules/db/repositories/*.ts`
- `src/modules/db/types.ts`
- `src/modules/db/index.ts`

## Output Format
List findings as:
- **[BLOCKER]** or **[SUGGESTION]** or **[GOOD]**
- File path and line number
- Brief explanation and fix recommendation
