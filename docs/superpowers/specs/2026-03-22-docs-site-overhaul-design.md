# ClearSight Docs Site Overhaul — Design Spec

**Date:** 2026-03-22
**Status:** Approved

---

## Goal

Rebuild the ClearSight docs site from scratch as a unified, dual-audience documentation resource: developer-first with strong user coverage. Replace the existing 11 loosely organized pages with ~35 purpose-built pages across three clearly separated sections.

---

## Audiences

- **Primary:** Developers using or hosting ClearSight — technically literate, comfortable with CLI/Docker/REST APIs
- **Secondary:** Non-technical users (PMs, designers, accessibility managers) auditing their own sites

---

## Structure

Single Nextra 4 site in `docs-site/`. Three top-level sections:

### 1. User Guide (`content/user/`)
Plain-English, task-oriented. For people using ClearSight to audit sites — no setup knowledge assumed.

Sections:
- **Getting Started** — What is ClearSight, Quick Start (first scan walkthrough), Chrome Extension
- **Running Scans** — Single-Page Scan, Full-Site Crawl, Scan Settings & Limits
- **Understanding Results** — Accessibility Score, Severity Levels, Confirmed vs Potential Issues, Visual Inspector
- **Taking Action** — Fixing Issues by Type, Dismissing & Tracking Issues, Exporting Reports, Sharing with Your Team
- **Help & FAQ** — Common Questions, WCAG Glossary, Troubleshooting

### 2. Developer Guide (`content/dev/`)
Technical, direct, code-first. Assumes CLI/Docker/REST API comfort.

Sections:
- **Self-Hosting** — Prerequisites, Docker Setup, Environment Variables, Running in Production
- **Architecture** — System Overview, Crawler & Discovery, Queue System (BullMQ), Scan Pipeline, AI Enrichment, Data Model
- **API Reference** — Auth & Conventions, Sites & Crawls, Scans (legacy), Issues & Pages, Error Codes
- **Contributing** — Dev Setup, Adding Scan Engines, Chrome Extension Dev, Code Style & PRs

### 3. Reference (`content/reference/`)
Purely factual. Shared by both audiences.

Sections:
- **WCAG** — Level A Rules, Level AA Rules, axe-core Rule Index
- Changelog
- Roadmap

---

## Docs Home (`content/index.mdx`)

Role-picker landing page:
- Hero: one-line description + search bar (⌘K)
- Two large role cards: "I'm using ClearSight" (→ User Guide) and "I'm hosting or building" (→ Developer Guide)
- Quick links: Quick Start, API Reference, Self-Hosting, Changelog
- No sidebar on this page — feels like a landing, not a doc page

---

## Per-Page Standards

Every page includes:
- Nextra breadcrumb (built-in)
- On-page TOC (built-in)
- "Next steps" links at the bottom pointing forward in the flow
- Copy buttons on all code blocks (built-in)
- Callout boxes for warnings/tips/gotchas using Nextra `<Callout>`
- "Was this helpful?" at the bottom (MDX callout linking to GitHub Issues)

### User Guide page structure
1. Short plain-English intro (1–2 sentences)
2. Step-by-step walkthrough
3. What to expect / screenshots where useful
4. Next steps

### Developer Guide page structure
1. Concept paragraph (technical, direct)
2. Code block or config example
3. Gotchas / edge cases callout
4. Related pages

### Reference page structure
Tables and lists. Minimal prose.

---

## Writing Tone

**User pages:** Plain English, no jargon without explanation. Example: explain "Critical severity" as "will block users from completing tasks" not "WCAG 2.1 Level A failure."

**Developer pages:** Technical, terse, code-first. No hand-holding on basic concepts (Docker, env vars, REST).

**Reference pages:** Factual. Definitions, tables, rule IDs.

---

## Implementation Approach

Full rewrite in one pass (Option 2). Delete existing `content/` files, create new structure from scratch. All existing content used as reference material only — tone and structure change significantly.

Total pages: ~35 (up from 11).

---

## Content Directory Structure

```
docs-site/content/
├── index.mdx                        # Docs home — role picker
├── user/
│   ├── index.mdx                    # User guide landing
│   ├── getting-started/
│   │   ├── index.mdx                # What is ClearSight?
│   │   ├── quick-start.mdx          # First scan walkthrough
│   │   └── chrome-extension.mdx
│   ├── scanning/
│   │   ├── single-page.mdx
│   │   ├── full-site-crawl.mdx
│   │   └── settings-limits.mdx
│   ├── results/
│   │   ├── score.mdx
│   │   ├── severity-levels.mdx
│   │   ├── confirmed-vs-potential.mdx
│   │   └── visual-inspector.mdx
│   ├── action/
│   │   ├── fixing-issues.mdx
│   │   ├── dismissing-tracking.mdx
│   │   ├── exporting-reports.mdx
│   │   └── sharing.mdx
│   └── help/
│       ├── faq.mdx
│       ├── glossary.mdx
│       └── troubleshooting.mdx
├── dev/
│   ├── index.mdx                    # Developer guide landing
│   ├── self-hosting/
│   │   ├── index.mdx                # Prerequisites
│   │   ├── docker.mdx
│   │   ├── environment-variables.mdx
│   │   └── production.mdx
│   ├── architecture/
│   │   ├── index.mdx                # System overview
│   │   ├── crawler.mdx
│   │   ├── queue-system.mdx
│   │   ├── scan-pipeline.mdx
│   │   ├── ai-enrichment.mdx
│   │   └── data-model.mdx
│   ├── api/
│   │   ├── index.mdx                # Auth & conventions
│   │   ├── sites-crawls.mdx
│   │   ├── scans.mdx
│   │   ├── issues-pages.mdx
│   │   └── error-codes.mdx
│   └── contributing/
│       ├── index.mdx                # Dev setup
│       ├── scan-engines.mdx
│       ├── extension.mdx
│       └── code-style.mdx
└── reference/
    ├── wcag/
    │   ├── level-a.mdx
    │   ├── level-aa.mdx
    │   └── axe-core-rules.mdx
    ├── changelog.mdx
    └── roadmap.mdx
```

---

## Out of Scope

- Versioned docs (not needed yet)
- i18n
- Authentication-gated content
- Interactive API playground (future)
- Automated screenshots / live page captures
