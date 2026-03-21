# Next.js App Router Review Agent

Review Next.js 16 App Router usage in the ClearSight codebase.

## What to Check

### Server vs Client Boundaries
- Every interactive page must have `"use client"` directive
- API routes (`route.ts`) must NOT have `"use client"`
- Check for unnecessary `"use client"` — if a component doesn't use hooks/browser APIs, it should be a server component
- No server-only imports (prisma, fs, node modules) in client components

### API Route Handlers
- All API routes use `NextResponse.json()` for responses
- Proper HTTP status codes (201 for creation, 404 for not found, etc.)
- `params` must be awaited in Next.js 16: `const { id } = await params`
- Request body parsing with error handling
- No unhandled promise rejections in route handlers

### Routing & Navigation
- Dynamic routes use correct `[param]` naming
- `useRouter()` from `next/navigation` (not `next/router`)
- `useParams()` for accessing route params in client components
- Proper loading/error states for pages

### Performance
- No unnecessary re-renders from unstable references in client components
- Large page components should be split into smaller components
- Images should use `next/image` if applicable

### Layout Structure
- Layouts don't re-render on navigation (correct use of `layout.tsx`)
- Metadata exports in server components only

## Files to Focus On
- `src/app/**/*.tsx` — Pages and layouts
- `src/app/api/**/*.ts` — API route handlers
- `src/app/**/layout.tsx` — Layout components

## Output Format
List findings as:
- **[BLOCKER]** or **[SUGGESTION]** or **[GOOD]**
- File path and line number
- Brief explanation and fix recommendation
