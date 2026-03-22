---
description: Comprehensive code review using all specialized review agents
argument-hint: [files or PR number]
---

# Code Review Request

## Context

- Current branch: !`git branch --show-current`
- Changed files: !`git diff --name-only main...HEAD`

## Your Task

Perform a comprehensive code review by dispatching all relevant specialized review agents **in parallel**. Each agent reviews a specific domain. Collect their findings and present a unified report.

| Agent | Focus Area |
|-------|-----------|
| `review-nextjs` | App Router patterns, server/client boundaries, API route handlers |
| `review-prisma` | Repository pattern, schema design, query optimization |
| `review-swr` | Cache keys, revalidation, polling, error/loading states |
| `review-tailwind-shadcn` | Component usage, design system, Tailwind v4, accessibility |
| `review-bullmq` | Queue patterns, job reliability, concurrency, dead letters |
| `review-typescript` | Type safety, strict mode, interface design, type imports |
| `review-security` | SSRF, injection, rate limiting, input validation, auth gaps |
| `review-docker` | Compose config, Dockerfile efficiency, service orchestration |
| `review-playwright-axe` | Browser automation, axe-core usage, resource cleanup |
| `review-scan-pipeline` | Pipeline stages, orchestration, error recovery, progress tracking |
| `review-ai-prompts` | LLM prompt quality, token efficiency, fallback handling |
| `review-worker-queues` | Worker processors, BullMQ job flow, crawl/page-scan/enrichment |
| `review-crawler` | BFS discovery, URL normalization, issue tracking across crawls |
| `review-validation` | URL validation, input sanitization, API request/response validation |
| `review-marketing-pages` | Landing page, How it Works, FAQ — SEO, performance, accessibility |

## How to Run

1. Determine the review scope from `$ARGUMENTS`:
   - If a PR number is given, use `gh pr diff <number>` to get the diff
   - If file paths are given, review only those files
   - If nothing is given, review all changes on the current branch vs main
2. Dispatch ALL agents in parallel using the Agent tool with `subagent_type: "general-purpose"`. Each agent prompt should include:
   - The agent's specific review instructions (from `.claude/commands/agents/<agent-name>.md`)
   - The list of changed files relevant to that agent's domain
   - The diff or file contents for those files
3. Wait for all agents to complete
4. Compile a unified review report

## Documentation Drift Check

After the code review agents finish, cross-reference changed files against this mapping to detect stale documentation:

| Source Path Pattern | Target Documentation |
|---|---|
| `src/app/api/` | README.md "API Endpoints", CLAUDE.md API routes section |
| `src/modules/pipeline/` | CLAUDE.md "Pipeline Stages" |
| `src/modules/crawler/` | CLAUDE.md "Architecture", docs-site scanning docs |
| `src/modules/queue/` | CLAUDE.md architecture section |
| `src/worker/` | CLAUDE.md "Architecture", README.md |
| `prisma/schema.prisma` | CLAUDE.md "Data Model", README.md "Data Model" |
| `docker-compose*.yml` | CLAUDE.md "Docker", README.md "Quick Start" |
| `src/config/index.ts` | .env.example, CLAUDE.md "Environment Variables" |
| `src/components/landing/` | No docs needed (self-contained marketing) |
| `docs-site/` | Self-documenting |
| `package.json` | README.md "Scripts", CLAUDE.md "Commands" |

**Skip** trivial changes: formatting-only diffs, test files, minor refactors with no behavior change.

## Expected Output

Structure your review as:

### 1. Blockers
Must fix before merging. Include file path, line number, and explanation.

### 2. Suggestions
Should fix for quality. Categorized by agent/domain.

### 3. Documentation Drift
Numbered list (DD-1, DD-2, ...) of docs that are stale or missing. Include target doc path and brief reason.

### 4. Good Practices
Positive patterns found across the codebase.

### 5. Testing Recommendations
Manual smoke tests + automated test suggestions.

## Verification Commands

After review, run these checks:

```bash
pnpm lint
pnpm build
```

## Review Scope

$ARGUMENTS

If no specific files or PR number provided, review all changes on the current branch vs main.
