# Docs Site Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the ClearSight docs site as a dual-audience (~35 page) resource with a User Guide, Developer Guide, and shared Reference section — replacing the existing 11 pages with a clean role-picker landing page and purpose-written content.

**Architecture:** Single Nextra 4 site in `docs-site/`. Content lives entirely in `docs-site/content/` as MDX files organized into `user/`, `dev/`, and `reference/` subdirectories. Nextra auto-generates the sidebar from the directory structure using `_meta.json` files for display names and ordering. The docs home (`index.mdx`) is a custom role-picker landing.

**Tech Stack:** Nextra 4.6, Next.js 16, MDX, Tailwind CSS v4, `<Callout>` and `<Cards>` components from `nextra/components`

---

## File Map

### Files to delete (old content)
- `docs-site/content/index.mdx`
- `docs-site/content/getting-started.mdx`
- `docs-site/content/faq.mdx`
- `docs-site/content/api/overview.mdx`
- `docs-site/content/scanning/single-page.mdx`
- `docs-site/content/scanning/full-site-crawl.mdx`
- `docs-site/content/scanning/issue-tracking.mdx`
- `docs-site/content/results/understanding-scores.mdx`
- `docs-site/content/results/issue-types.mdx`
- `docs-site/content/results/inspector.mdx`
- `docs-site/content/results/export.mdx`

### Files to create

#### Root
- `docs-site/content/index.mdx` — Role-picker landing page
- `docs-site/content/_meta.json` — Top-level nav order

#### User Guide
- `docs-site/content/user/_meta.json`
- `docs-site/content/user/index.mdx` — User guide landing
- `docs-site/content/user/getting-started/_meta.json`
- `docs-site/content/user/getting-started/index.mdx` — What is ClearSight?
- `docs-site/content/user/getting-started/quick-start.mdx`
- `docs-site/content/user/getting-started/chrome-extension.mdx`
- `docs-site/content/user/scanning/_meta.json`
- `docs-site/content/user/scanning/single-page.mdx`
- `docs-site/content/user/scanning/full-site-crawl.mdx`
- `docs-site/content/user/scanning/settings-limits.mdx`
- `docs-site/content/user/results/_meta.json`
- `docs-site/content/user/results/score.mdx`
- `docs-site/content/user/results/severity-levels.mdx`
- `docs-site/content/user/results/confirmed-vs-potential.mdx`
- `docs-site/content/user/results/visual-inspector.mdx`
- `docs-site/content/user/action/_meta.json`
- `docs-site/content/user/action/fixing-issues.mdx`
- `docs-site/content/user/action/dismissing-tracking.mdx`
- `docs-site/content/user/action/exporting-reports.mdx`
- `docs-site/content/user/action/sharing.mdx`
- `docs-site/content/user/help/_meta.json`
- `docs-site/content/user/help/faq.mdx`
- `docs-site/content/user/help/glossary.mdx`
- `docs-site/content/user/help/troubleshooting.mdx`

#### Developer Guide
- `docs-site/content/dev/_meta.json`
- `docs-site/content/dev/index.mdx` — Developer guide landing
- `docs-site/content/dev/self-hosting/_meta.json`
- `docs-site/content/dev/self-hosting/index.mdx` — Prerequisites
- `docs-site/content/dev/self-hosting/docker.mdx`
- `docs-site/content/dev/self-hosting/environment-variables.mdx`
- `docs-site/content/dev/self-hosting/production.mdx`
- `docs-site/content/dev/architecture/_meta.json`
- `docs-site/content/dev/architecture/index.mdx` — System overview
- `docs-site/content/dev/architecture/crawler.mdx`
- `docs-site/content/dev/architecture/queue-system.mdx`
- `docs-site/content/dev/architecture/scan-pipeline.mdx`
- `docs-site/content/dev/architecture/ai-enrichment.mdx`
- `docs-site/content/dev/architecture/data-model.mdx`
- `docs-site/content/dev/api/_meta.json`
- `docs-site/content/dev/api/index.mdx` — Auth & conventions
- `docs-site/content/dev/api/sites-crawls.mdx`
- `docs-site/content/dev/api/scans.mdx`
- `docs-site/content/dev/api/issues-pages.mdx`
- `docs-site/content/dev/api/error-codes.mdx`
- `docs-site/content/dev/contributing/_meta.json`
- `docs-site/content/dev/contributing/index.mdx` — Dev setup
- `docs-site/content/dev/contributing/scan-engines.mdx`
- `docs-site/content/dev/contributing/extension.mdx`
- `docs-site/content/dev/contributing/code-style.mdx`

#### Reference
- `docs-site/content/reference/_meta.json`
- `docs-site/content/reference/wcag/_meta.json`
- `docs-site/content/reference/wcag/level-a.mdx`
- `docs-site/content/reference/wcag/level-aa.mdx`
- `docs-site/content/reference/wcag/axe-core-rules.mdx`
- `docs-site/content/reference/changelog.mdx`
- `docs-site/content/reference/roadmap.mdx`

---

## Task 1: Clear Old Content & Set Up Directory Structure

**Files:**
- Delete: all 11 existing `docs-site/content/**` files
- Create: directory structure + all `_meta.json` files

- [ ] **Step 1: Delete old content files**

```bash
cd docs-site
rm -f content/index.mdx content/getting-started.mdx content/faq.mdx
rm -f content/api/overview.mdx
rm -f content/scanning/single-page.mdx content/scanning/full-site-crawl.mdx content/scanning/issue-tracking.mdx
rm -f content/results/understanding-scores.mdx content/results/issue-types.mdx content/results/inspector.mdx content/results/export.mdx
rmdir content/api content/scanning content/results 2>/dev/null || true
```

- [ ] **Step 2: Create new directory structure**

```bash
mkdir -p content/user/getting-started
mkdir -p content/user/scanning
mkdir -p content/user/results
mkdir -p content/user/action
mkdir -p content/user/help
mkdir -p content/dev/self-hosting
mkdir -p content/dev/architecture
mkdir -p content/dev/api
mkdir -p content/dev/contributing
mkdir -p content/reference/wcag
```

- [ ] **Step 3: Create top-level `_meta.json`**

Create `docs-site/content/_meta.json`:
```json
{
  "index": "Home",
  "user": "User Guide",
  "dev": "Developer Guide",
  "reference": "Reference"
}
```

- [ ] **Step 4: Create User Guide `_meta.json` files**

Create `docs-site/content/user/_meta.json`:
```json
{
  "index": "Overview",
  "getting-started": "Getting Started",
  "scanning": "Running Scans",
  "results": "Understanding Results",
  "action": "Taking Action",
  "help": "Help & FAQ"
}
```

Create `docs-site/content/user/getting-started/_meta.json`:
```json
{
  "index": "What is ClearSight?",
  "quick-start": "Quick Start",
  "chrome-extension": "Chrome Extension"
}
```

Create `docs-site/content/user/scanning/_meta.json`:
```json
{
  "single-page": "Single-Page Scan",
  "full-site-crawl": "Full-Site Crawl",
  "settings-limits": "Settings & Limits"
}
```

Create `docs-site/content/user/results/_meta.json`:
```json
{
  "score": "Accessibility Score",
  "severity-levels": "Severity Levels",
  "confirmed-vs-potential": "Confirmed vs Potential",
  "visual-inspector": "Visual Inspector"
}
```

Create `docs-site/content/user/action/_meta.json`:
```json
{
  "fixing-issues": "Fixing Issues",
  "dismissing-tracking": "Dismissing & Tracking",
  "exporting-reports": "Exporting Reports",
  "sharing": "Sharing with Your Team"
}
```

Create `docs-site/content/user/help/_meta.json`:
```json
{
  "faq": "FAQ",
  "glossary": "Glossary",
  "troubleshooting": "Troubleshooting"
}
```

- [ ] **Step 5: Create Developer Guide `_meta.json` files**

Create `docs-site/content/dev/_meta.json`:
```json
{
  "index": "Overview",
  "self-hosting": "Self-Hosting",
  "architecture": "Architecture",
  "api": "API Reference",
  "contributing": "Contributing"
}
```

Create `docs-site/content/dev/self-hosting/_meta.json`:
```json
{
  "index": "Prerequisites",
  "docker": "Docker Setup",
  "environment-variables": "Environment Variables",
  "production": "Running in Production"
}
```

Create `docs-site/content/dev/architecture/_meta.json`:
```json
{
  "index": "System Overview",
  "crawler": "Crawler & Discovery",
  "queue-system": "Queue System",
  "scan-pipeline": "Scan Pipeline",
  "ai-enrichment": "AI Enrichment",
  "data-model": "Data Model"
}
```

Create `docs-site/content/dev/api/_meta.json`:
```json
{
  "index": "Auth & Conventions",
  "sites-crawls": "Sites & Crawls",
  "scans": "Scans",
  "issues-pages": "Issues & Pages",
  "error-codes": "Error Codes"
}
```

Create `docs-site/content/dev/contributing/_meta.json`:
```json
{
  "index": "Dev Setup",
  "scan-engines": "Adding Scan Engines",
  "extension": "Chrome Extension Dev",
  "code-style": "Code Style & PRs"
}
```

- [ ] **Step 6: Create Reference `_meta.json` files**

Create `docs-site/content/reference/_meta.json`:
```json
{
  "wcag": "WCAG Criteria",
  "changelog": "Changelog",
  "roadmap": "Roadmap"
}
```

Create `docs-site/content/reference/wcag/_meta.json`:
```json
{
  "level-a": "Level A Rules",
  "level-aa": "Level AA Rules",
  "axe-core-rules": "axe-core Rule Index"
}
```

- [ ] **Step 7: Verify dev server starts with empty content**

```bash
cd docs-site && pnpm dev
```
Expected: Site loads, sidebar shows User Guide / Developer Guide / Reference with no page content yet (404s are fine). No build errors.

- [ ] **Step 8: Commit**

```bash
git add docs-site/content/
git commit -m "docs: restructure content directory for dual-audience overhaul"
```

---

## Task 2: Docs Home & Section Landing Pages

**Files:**
- Create: `docs-site/content/index.mdx`
- Create: `docs-site/content/user/index.mdx`
- Create: `docs-site/content/dev/index.mdx`

- [ ] **Step 1: Create docs home (`content/index.mdx`)**

```mdx
---
title: ClearSight Docs
description: Everything you need to audit, fix, and understand web accessibility.
---

import { Cards, Card } from 'nextra/components'

# ClearSight Docs

Everything you need to audit, fix, and understand web accessibility.

<Cards>
  <Card title="I'm using ClearSight" href="/user/getting-started" arrow>
    Audit your site for accessibility issues, understand your score, fix violations, and export reports — no setup required.
  </Card>
  <Card title="I'm hosting or building" href="/dev/self-hosting" arrow>
    Self-host with Docker, explore the architecture, use the REST API, or contribute a custom scan engine.
  </Card>
</Cards>

## Popular pages

<Cards>
  <Card title="Quick Start" href="/user/getting-started/quick-start" arrow />
  <Card title="API Reference" href="/dev/api" arrow />
  <Card title="Self-Hosting" href="/dev/self-hosting" arrow />
  <Card title="Changelog" href="/reference/changelog" arrow />
</Cards>
```

- [ ] **Step 2: Create User Guide landing (`content/user/index.mdx`)**

```mdx
---
title: User Guide
description: Learn how to use ClearSight to audit, understand, and fix accessibility issues on your site.
---

import { Cards, Card } from 'nextra/components'

# User Guide

ClearSight scans your site for WCAG 2.1 accessibility issues and gives you clear, actionable results.

<Cards>
  <Card title="Getting Started" href="/user/getting-started" arrow>
    Run your first scan in under 2 minutes.
  </Card>
  <Card title="Running Scans" href="/user/scanning/single-page" arrow>
    Single-page scans and full-site crawls.
  </Card>
  <Card title="Understanding Results" href="/user/results/score" arrow>
    Scores, severity levels, and the visual inspector.
  </Card>
  <Card title="Taking Action" href="/user/action/fixing-issues" arrow>
    Fix issues, dismiss false positives, and export reports.
  </Card>
</Cards>
```

- [ ] **Step 3: Create Developer Guide landing (`content/dev/index.mdx`)**

```mdx
---
title: Developer Guide
description: Self-host ClearSight, explore its architecture, use the REST API, or contribute to the project.
---

import { Cards, Card } from 'nextra/components'

# Developer Guide

ClearSight is open-source and self-hostable. This guide covers everything from spinning up a local instance to contributing custom scan engines.

<Cards>
  <Card title="Self-Hosting" href="/dev/self-hosting" arrow>
    Run ClearSight on your own infrastructure with Docker.
  </Card>
  <Card title="Architecture" href="/dev/architecture" arrow>
    Crawlers, BullMQ queues, scan pipeline, and data model.
  </Card>
  <Card title="API Reference" href="/dev/api" arrow>
    REST API for sites, crawls, scans, issues, and pages.
  </Card>
  <Card title="Contributing" href="/dev/contributing" arrow>
    Set up a dev environment and add features.
  </Card>
</Cards>
```

- [ ] **Step 4: Verify pages render**

Open `http://localhost:3002`. Check that the home page shows role-picker cards and popular pages links. Click into User Guide and Developer Guide landings.

- [ ] **Step 5: Commit**

```bash
git add docs-site/content/index.mdx docs-site/content/user/index.mdx docs-site/content/dev/index.mdx
git commit -m "docs: add role-picker home and section landing pages"
```

---

## Task 3: User Guide — Getting Started Section

**Files:**
- Create: `docs-site/content/user/getting-started/index.mdx`
- Create: `docs-site/content/user/getting-started/quick-start.mdx`
- Create: `docs-site/content/user/getting-started/chrome-extension.mdx`

- [ ] **Step 1: Create "What is ClearSight?" (`getting-started/index.mdx`)**

```mdx
---
title: What is ClearSight?
description: ClearSight scans your website for accessibility issues and tells you exactly how to fix them.
---

import { Callout } from 'nextra/components'

# What is ClearSight?

ClearSight is an accessibility checker that scans your website for WCAG 2.1 violations and gives you clear, actionable fix suggestions.

## What it checks

- **50+ automated rules** — powered by axe-core, the industry-standard accessibility engine
- **Custom checks** — link text quality and touch target sizes (things axe-core misses)
- **AI-enriched results** — plain-English descriptions and specific fix suggestions for every issue

## What it doesn't replace

<Callout type="info">
  Automated tools catch roughly 30–40% of all accessibility issues. ClearSight is a strong first step — manual testing with real assistive technology is still necessary for full WCAG compliance.
</Callout>

## Two ways to scan

| | Single-Page Scan | Full-Site Crawl |
|---|---|---|
| **What it scans** | One URL | Every page on a domain |
| **How long it takes** | ~15–30 seconds | Minutes to hours depending on site size |
| **Best for** | Quick checks, individual pages | Full audits, ongoing monitoring |

## Next steps

- [Run your first scan →](/user/getting-started/quick-start)
- [Install the Chrome extension →](/user/getting-started/chrome-extension)
```

- [ ] **Step 2: Create Quick Start (`getting-started/quick-start.mdx`)**

```mdx
---
title: Quick Start
description: Run your first accessibility scan in under 2 minutes.
---

import { Callout, Steps } from 'nextra/components'

# Quick Start

Run your first accessibility scan in under 2 minutes.

<Steps>

### Open the Dashboard

Go to the ClearSight dashboard. No account required.

### Enter a URL

Type or paste any public URL — a homepage, a product page, a blog post. ClearSight doesn't support authenticated pages yet.

<Callout type="warning">
  ClearSight can only scan publicly accessible pages. Pages behind a login, VPN, or IP allowlist will fail to load.
</Callout>

### Choose scan type

- **Single-page scan** — scans just the URL you entered
- **Full-site crawl** — follows links from that URL and scans every page it finds on the same domain

### Wait for results

Single-page scans finish in 15–30 seconds. Full-site crawls take longer depending on how many pages your site has — you'll see live progress as pages are discovered and scanned.

### Review your score

You'll see an overall accessibility score (0–100) and a breakdown of issues by severity. Click any issue to see what's wrong, where it is on the page, and how to fix it.

</Steps>

## What happens next

- [Understanding your score →](/user/results/score)
- [What severity levels mean →](/user/results/severity-levels)
- [How to fix common issues →](/user/action/fixing-issues)
```

- [ ] **Step 3: Create Chrome Extension page (`getting-started/chrome-extension.mdx`)**

```mdx
---
title: Chrome Extension
description: Scan any page you're browsing with one click using the ClearSight Chrome extension.
---

import { Callout } from 'nextra/components'

# Chrome Extension

The ClearSight Chrome extension lets you scan any page you're on with a single click — no need to copy and paste URLs.

## How it works

1. Click the ClearSight icon in your browser toolbar
2. The extension reads the URL of your current tab
3. Click **Scan this page** — a new tab opens with the scan results

The extension uses the same scanner as the main app. Results are identical to running a single-page scan manually.

## Installing the extension

The extension is not yet published to the Chrome Web Store. To install it manually:

1. Download the latest `extension.zip` from the [GitHub releases page](https://github.com/thepranaygupta/clearsight/releases)
2. Unzip the file
3. Open Chrome and go to `chrome://extensions`
4. Enable **Developer mode** (top right toggle)
5. Click **Load unpacked** and select the unzipped folder

<Callout type="info">
  The extension requires the ClearSight app to be running. It opens scans at `http://localhost:3000` by default — update this if your app runs on a different URL.
</Callout>

## Permissions

The extension only requests `activeTab` permission — it reads the URL of the current tab and nothing else. It does not run in the background or access your browsing history.

## Next steps

- [Understanding your scan results →](/user/results/score)
```

- [ ] **Step 4: Commit**

```bash
git add docs-site/content/user/getting-started/
git commit -m "docs: add User Guide — Getting Started section"
```

---

## Task 4: User Guide — Running Scans Section

**Files:**
- Create: `docs-site/content/user/scanning/single-page.mdx`
- Create: `docs-site/content/user/scanning/full-site-crawl.mdx`
- Create: `docs-site/content/user/scanning/settings-limits.mdx`

- [ ] **Step 1: Create Single-Page Scan page**

Create `docs-site/content/user/scanning/single-page.mdx`:
```mdx
---
title: Single-Page Scan
description: Scan one URL for accessibility issues in about 30 seconds.
---

import { Callout, Steps } from 'nextra/components'

# Single-Page Scan

A single-page scan audits one URL for WCAG 2.1 A and AA violations. Results are ready in about 30 seconds.

## When to use it

- Checking a specific page you just built or changed
- Quickly auditing a landing page or critical user flow
- Testing via the Chrome extension while browsing

For auditing an entire site, use [Full-Site Crawl](/user/scanning/full-site-crawl) instead.

## Running a scan

<Steps>

### Enter the URL

Paste the full URL including `https://`. The URL must be publicly accessible.

### Start the scan

Click **Scan now**. ClearSight will:
1. Load the page in a headless browser
2. Run axe-core accessibility checks
3. Check link text and touch target sizes
4. Generate AI descriptions and fix suggestions

### Watch the progress

The progress bar shows which stage the scan is on:
- **Fetch** (0–20%) — loading the page
- **Analyze** (20–40%) — running axe-core
- **Custom checks** (40–55%) — link text and touch targets
- **Enrich** (55–80%) — AI fix suggestions
- **Store** (80–100%) — saving results

</Steps>

## Rate limits

<Callout type="warning">
  Single-page scans are limited to **10 per hour per IP address**. If you hit the limit, wait and try again.
</Callout>

## What gets scanned

The scanner loads the page exactly as a user would see it in a browser — JavaScript is executed, CSS is applied. This means:
- Dynamic content rendered by JavaScript **is** included
- Content behind login walls **is not** included
- iframes are not scanned

## Next steps

- [Understanding your results →](/user/results/score)
- [Running a full-site crawl →](/user/scanning/full-site-crawl)
```

- [ ] **Step 2: Create Full-Site Crawl page (user-facing)**

Create `docs-site/content/user/scanning/full-site-crawl.mdx`:
```mdx
---
title: Full-Site Crawl
description: Scan every page on your site and get a complete accessibility picture.
---

import { Callout, Steps } from 'nextra/components'

# Full-Site Crawl

A full-site crawl discovers every page on your domain and scans each one for accessibility issues. Use this for complete audits and ongoing monitoring.

## How it works

ClearSight starts from your homepage and follows every internal link it finds — like a search engine crawler. It also reads your `/sitemap.xml` if one exists. Every discovered page gets a full accessibility scan.

## Running a crawl

<Steps>

### Add your site

The first time you crawl a domain, ClearSight creates a **site** for it. Click **New Site** and enter your domain (e.g. `https://example.com`).

### Start the crawl

Open your site and click **Crawl Now**. ClearSight will begin discovering pages immediately.

### Watch live progress

The crawl dashboard shows:
- Pages discovered so far
- Pages scanned
- Current overall score (updates as pages finish)
- A live feed of issues found

### Review the results

When the crawl completes, you'll see:
- An overall site-wide accessibility score
- Total issues by severity
- Which pages have the most problems
- How this crawl compares to your previous one (new issues, fixed issues)

</Steps>

## How long does it take?

It depends on how many pages your site has and how complex they are. A 20-page site typically finishes in 3–5 minutes.

## Stopping a crawl

Click **Cancel** at any time. Results for pages already scanned are saved and viewable.

<Callout type="info">
  Only one crawl can run per site at a time. If you start a new crawl while one is running, the existing one must finish or be cancelled first.
</Callout>

## Limitations

- Pages behind a login are not scanned
- JavaScript-heavy SPAs may yield fewer discovered pages (the crawler uses lightweight HTTP discovery, not a full browser)
- `robots.txt` is not respected — ClearSight scans all pages it can reach

## Next steps

- [Understanding your score →](/user/results/score)
- [Issue tracking across crawls →](/user/action/dismissing-tracking)
```

- [ ] **Step 3: Create Settings & Limits page**

Create `docs-site/content/user/scanning/settings-limits.mdx`:
```mdx
---
title: Settings & Limits
description: Scan limits, rate limits, and what affects scan behavior.
---

import { Callout } from 'nextra/components'

# Settings & Limits

## Rate limits

| Action | Limit |
|--------|-------|
| Single-page scans | 10 per hour per IP |
| Full-site crawls | 1 running at a time per site |
| Concurrent page scans (per crawl) | 3 (server-side, not configurable in UI) |

<Callout type="warning">
  Rate limits reset every hour. If you hit the single-page scan limit, you can still start or continue a full-site crawl — crawl-initiated scans bypass the IP rate limit.
</Callout>

## Page cap

If the ClearSight instance has `MAX_CRAWL_PAGES` configured, crawls will stop after that many pages. Check with whoever hosts your ClearSight instance.

You can also set a per-crawl page cap when starting a crawl from the UI.

## What affects scan accuracy

| Factor | Impact |
|--------|--------|
| JavaScript-rendered content | Included — ClearSight uses a real browser |
| Lazy-loaded content | Partially included — content must be in the DOM at load time |
| CSS-hidden elements | Checked — hidden elements can still fail accessibility rules |
| Dark mode / forced colors | Not tested — scans use default browser settings |

## Scan timeout

Individual page scans time out after 30 seconds. Pages that time out are marked as failed and don't count toward the overall score.

## Next steps

- [Single-page scan →](/user/scanning/single-page)
- [Full-site crawl →](/user/scanning/full-site-crawl)
```

- [ ] **Step 4: Commit**

```bash
git add docs-site/content/user/scanning/
git commit -m "docs: add User Guide — Running Scans section"
```

---

## Task 5: User Guide — Understanding Results Section

**Files:**
- Create: `docs-site/content/user/results/score.mdx`
- Create: `docs-site/content/user/results/severity-levels.mdx`
- Create: `docs-site/content/user/results/confirmed-vs-potential.mdx`
- Create: `docs-site/content/user/results/visual-inspector.mdx`

- [ ] **Step 1: Create Accessibility Score page**

Create `docs-site/content/user/results/score.mdx`:
```mdx
---
title: Accessibility Score
description: Understand what your accessibility score means and how it's calculated.
---

# Accessibility Score

ClearSight gives every page and site an **accessibility score from 0 to 100**.

## What the score means

| Score | Rating | What it means |
|-------|--------|---------------|
| 80–100 | Good | Few or no significant issues. Site is largely accessible. |
| 50–79 | Needs Work | Moderate issues present. Some users with disabilities will have trouble. |
| 0–49 | Poor | Serious accessibility problems. Significant barriers for users with disabilities. |

## How it's calculated

The score penalizes each issue based on its severity:

| Severity | Penalty per issue |
|----------|-------------------|
| Critical | −10 points |
| Serious | −5 points |
| Moderate | −2 points |
| Minor | −1 point |

The score starts at 100 and deductions are applied, floored at 0. Dismissed issues are excluded from scoring.

## Site score vs page score

- **Page score** — calculated from issues found on that specific page
- **Site score** — the average of all page scores in the most recent crawl

## AI enrichment and scoring

If AI enrichment fails for a page, ClearSight falls back to a heuristic score based on issue counts alone. These pages are marked `completed_partial` in the crawl status.

## Next steps

- [Severity levels explained →](/user/results/severity-levels)
- [Confirmed vs Potential issues →](/user/results/confirmed-vs-potential)
```

- [ ] **Step 2: Create Severity Levels page**

Create `docs-site/content/user/results/severity-levels.mdx`:
```mdx
---
title: Severity Levels
description: What Critical, Serious, Moderate, and Minor mean — and how to prioritize your fixes.
---

import { Callout } from 'nextra/components'

# Severity Levels

Every accessibility issue is rated on a four-level severity scale, adapted from axe-core's impact levels.

## The four levels

### Critical
**Will block users from completing tasks.**

Examples: images with no alt text that convey meaning, form fields with no label, keyboard traps, missing page `<title>`.

Fix these first. Real users are failing because of them.

### Serious
**Significantly hinders access for users with disabilities.**

Examples: low color contrast (below 3:1), links with no accessible name, missing landmark regions.

Fix these after Critical issues. They cause real friction even if they don't completely block users.

### Moderate
**Creates barriers but workarounds usually exist.**

Examples: redundant alt text, improper heading hierarchy, missing language attribute.

Address these in your next sprint after clearing Critical and Serious.

### Minor
**Best-practice violations that affect quality but have low impact.**

Examples: links that open in a new tab without warning, table headers without scope attributes.

Fix these when you have capacity. They matter but won't block most users.

## Prioritization tip

<Callout type="info">
  Focus on **Critical + Serious** issues first — they account for the majority of real-world access barriers. A site scoring 60 with all Critical issues fixed is far more accessible than one scoring 70 with Critical issues unaddressed.
</Callout>

## Next steps

- [Confirmed vs Potential issues →](/user/results/confirmed-vs-potential)
- [How to fix common issues →](/user/action/fixing-issues)
```

- [ ] **Step 3: Create Confirmed vs Potential page**

Create `docs-site/content/user/results/confirmed-vs-potential.mdx`:
```mdx
---
title: Confirmed vs Potential Issues
description: The difference between confirmed violations and issues that need manual review.
---

import { Callout } from 'nextra/components'

# Confirmed vs Potential Issues

ClearSight marks every issue as either **Confirmed** or **Potential**.

## Confirmed issues

Confirmed issues are **definite WCAG violations** that axe-core can detect with certainty. There is no ambiguity — the page fails this rule.

Examples:
- An `<img>` with no `alt` attribute
- A button with no accessible name
- Color contrast below the required ratio

**Act on these immediately.** They are real failures.

## Potential issues

Potential issues are cases where **automated testing can't be certain**, but a violation is likely. They require human judgment to confirm or dismiss.

Examples:
- An `<img>` where axe-core detected alt text but can't tell if it meaningfully describes the image
- A link whose text is technically present but may not be descriptive enough ("click here")
- Touch targets that are close to but not definitively under the size threshold

<Callout type="info">
  Potential issues have a **confidence score** (0–100%) indicating how likely they are to be real violations. Higher confidence = more likely to be a real problem.
</Callout>

## What to do with Potential issues

1. Review each one using the [Visual Inspector](/user/results/visual-inspector)
2. If it's a real problem — fix it like any other issue
3. If it's a false positive — [dismiss it](/user/action/dismissing-tracking) so it doesn't affect your score

## Next steps

- [Using the Visual Inspector →](/user/results/visual-inspector)
- [Dismissing false positives →](/user/action/dismissing-tracking)
```

- [ ] **Step 4: Create Visual Inspector page**

Create `docs-site/content/user/results/visual-inspector.mdx`:
```mdx
---
title: Visual Inspector
description: Inspect any accessibility issue in context on the actual page.
---

# Visual Inspector

The Visual Inspector lets you see exactly where an issue appears on the page and what the underlying HTML looks like — without leaving ClearSight.

## Opening the inspector

Click any issue in your scan results. The inspector opens in a side panel showing:
- A screenshot of the page with the affected element highlighted
- The element's HTML
- The issue description and fix suggestion

## Two view modes

### Page view
Shows the full page screenshot with the problematic element highlighted. Use this to understand the issue in context — where it is on the page, what surrounds it, how a user would encounter it.

### HTML view
Shows the raw HTML of the affected element. Use this when you need the specific selector or markup to find the element in your codebase.

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| `Escape` | Close the inspector |
| `↑` / `↓` | Navigate to previous / next issue |

## Next steps

- [Fixing issues →](/user/action/fixing-issues)
- [Dismissing false positives →](/user/action/dismissing-tracking)
```

- [ ] **Step 5: Commit**

```bash
git add docs-site/content/user/results/
git commit -m "docs: add User Guide — Understanding Results section"
```

---

## Task 6: User Guide — Taking Action Section

**Files:**
- Create: `docs-site/content/user/action/fixing-issues.mdx`
- Create: `docs-site/content/user/action/dismissing-tracking.mdx`
- Create: `docs-site/content/user/action/exporting-reports.mdx`
- Create: `docs-site/content/user/action/sharing.mdx`

- [ ] **Step 1: Create Fixing Issues page**

Create `docs-site/content/user/action/fixing-issues.mdx`:
```mdx
---
title: Fixing Issues
description: How to address the most common accessibility issues ClearSight finds.
---

import { Callout } from 'nextra/components'

# Fixing Issues

ClearSight gives you an AI-generated fix suggestion for every issue. Here's how to act on the most common ones.

## Using fix suggestions

Every issue in your results includes:
- **Description** — plain-English explanation of the problem
- **Fix suggestion** — specific, actionable steps to resolve it
- **Element HTML** — the exact markup that needs to change

Copy the element selector from the Visual Inspector to find it in your codebase.

## Common issue types and fixes

### Missing alt text (Critical)
Images must have alt text that describes their content.

```html
<!-- Wrong -->
<img src="hero.jpg">

<!-- Right — descriptive alt -->
<img src="hero.jpg" alt="A developer working at a laptop">

<!-- Right — decorative image, empty alt -->
<img src="divider.png" alt="">
```

### Missing form labels (Critical)
Every form input needs a visible label or an `aria-label`.

```html
<!-- Wrong -->
<input type="email" placeholder="Email">

<!-- Right -->
<label for="email">Email address</label>
<input type="email" id="email">

<!-- Also right — aria-label for icon-only inputs -->
<input type="search" aria-label="Search the site">
```

### Low color contrast (Serious)
Text must have a contrast ratio of at least 4.5:1 against its background (3:1 for large text).

Use a tool like [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) to find compliant color combinations.

### Links with no descriptive text (Serious)
Link text must describe the destination, not just say "click here" or "read more".

```html
<!-- Wrong -->
<a href="/report">Click here</a>

<!-- Right -->
<a href="/report">Download the accessibility report</a>
```

### Touch targets too small (Moderate)
Interactive elements must be at least 24×24px, ideally 44×44px, to be usable on touch screens.

```css
/* Minimum */
button { min-width: 24px; min-height: 24px; }

/* Recommended */
button { min-width: 44px; min-height: 44px; }
```

<Callout type="info">
  Not every fix requires code changes. Some issues (like heading hierarchy) are fixed in your CMS content. Others (like color contrast) are fixed in design tokens or CSS variables.
</Callout>

## Next steps

- [Dismissing false positives →](/user/action/dismissing-tracking)
- [Exporting a report →](/user/action/exporting-reports)
```

- [ ] **Step 2: Create Dismissing & Tracking page**

Create `docs-site/content/user/action/dismissing-tracking.mdx`:
```mdx
---
title: Dismissing & Tracking Issues
description: How issue statuses work and how to manage false positives.
---

import { Callout } from 'nextra/components'

# Dismissing & Tracking Issues

ClearSight tracks issues across crawls so you can see what's been fixed, what's new, and what you've decided to ignore.

## Issue statuses

| Status | Meaning |
|--------|---------|
| **Open** | Active issue, not yet addressed |
| **Fixed** | Was open in a previous crawl, not found in the latest one |
| **Dismissed** | You've reviewed it and decided not to fix it |
| **Can't Fix** | Third-party content or a known limitation — won't be fixed |

## Dismissing an issue

1. Open the issue in the Visual Inspector
2. Click **Dismiss**
3. Choose a reason: *False positive*, *Won't fix*, or *Can't fix*

Dismissed issues are excluded from your accessibility score and won't reappear in future crawl comparisons unless the underlying element changes.

<Callout type="warning">
  Dismissing an issue doesn't mean it goes away for real users. Only dismiss genuine false positives or issues you've made an informed decision not to fix.
</Callout>

## How tracking works across crawls

ClearSight uses a fingerprint of each issue (element selector + rule + page URL) to match issues across crawls. When you run a new crawl:

- Issues from the previous crawl that are still present → stay **Open**
- Issues that no longer appear → marked **Fixed**
- New issues not seen before → appear as **New**

This lets you measure progress over time and catch regressions.

## Next steps

- [Exporting a report →](/user/action/exporting-reports)
- [Issue tracking (technical details) →](/dev/architecture)
```

- [ ] **Step 3: Create Exporting Reports page**

Create `docs-site/content/user/action/exporting-reports.mdx`:
```mdx
---
title: Exporting Reports
description: Export your scan results as a PDF executive summary or a detailed Excel spreadsheet.
---

# Exporting Reports

ClearSight can export scan results in two formats: PDF and Excel.

## PDF report

The PDF is designed for sharing with stakeholders and leadership. It includes:
- Overall accessibility score with visual gauge
- Issue count by severity
- Top priority issues with fix suggestions
- Positive findings (what's working well)
- Executive summary generated by AI

**To export:** Open a scan or crawl result → click **Export PDF**.

## Excel report

The Excel export is designed for developer teams and detailed auditing. It includes multiple sheets:

| Sheet | Contents |
|-------|----------|
| Summary | Score, issue counts, scan metadata |
| Issues | Full issue list with selector, HTML, description, fix, severity, WCAG criterion |
| Pages | Per-page scores and issue counts (crawl exports only) |

**To export:** Open a scan or crawl result → click **Export Excel**.

## Sharing a report

Reports are downloaded to your device. To share:
- Email the PDF to stakeholders
- Add the Excel file to your project management tool
- Store in a shared drive for audit documentation

## Next steps

- [Sharing with your team →](/user/action/sharing)
```

- [ ] **Step 4: Create Sharing page**

Create `docs-site/content/user/action/sharing.mdx`:
```mdx
---
title: Sharing with Your Team
description: How to share ClearSight results with developers, designers, and stakeholders.
---

# Sharing with Your Team

## Sharing scan results

Every scan and crawl has a unique URL in the ClearSight dashboard. Share the URL directly with teammates who have access to the same ClearSight instance.

## For developers

- Share the **Excel export** — it includes element selectors and the exact HTML to fix
- Use the Visual Inspector's **HTML view** to copy the exact selector
- Link directly to an individual issue in the dashboard

## For designers

- Share the **PDF report** for a high-level overview
- Screenshot the Visual Inspector's **Page view** to show the issue in context
- Note the WCAG criterion for each issue (listed in the issue detail panel) — this gives designers the specific standard to reference

## For leadership and stakeholders

- Share the **PDF report** — it has an executive summary and score visualization
- Run crawls on a regular schedule and compare scores over time to show progress

## Next steps

- [Exporting reports →](/user/action/exporting-reports)
- [Full-site crawl →](/user/scanning/full-site-crawl)
```

- [ ] **Step 5: Commit**

```bash
git add docs-site/content/user/action/
git commit -m "docs: add User Guide — Taking Action section"
```

---

## Task 7: User Guide — Help & FAQ Section

**Files:**
- Create: `docs-site/content/user/help/faq.mdx`
- Create: `docs-site/content/user/help/glossary.mdx`
- Create: `docs-site/content/user/help/troubleshooting.mdx`

- [ ] **Step 1: Create FAQ page**

Create `docs-site/content/user/help/faq.mdx`:
```mdx
---
title: FAQ
description: Answers to common questions about ClearSight.
---

import { Callout } from 'nextra/components'

# FAQ

## General

**Does ClearSight check for WCAG 2.2?**
Not yet. ClearSight currently covers WCAG 2.1 Level A and AA. WCAG 2.2 support is on the roadmap.

**Is a perfect score of 100 achievable?**
Yes, but a score of 100 doesn't mean your site is fully accessible. Automated tools only catch 30–40% of all accessibility issues. Manual testing with screen readers and other assistive technology is still necessary.

**Does ClearSight scan mobile views?**
Not currently. Scans use a desktop viewport. Mobile-specific issues may not be detected.

## Scanning

**Can ClearSight scan pages behind a login?**
No. ClearSight can only scan publicly accessible pages. Authentication support is planned.

**Does ClearSight respect robots.txt?**
No. ClearSight scans all pages it can reach regardless of robots.txt directives.

**Why did my crawl find fewer pages than expected?**
If your site is a JavaScript SPA, the crawler may miss pages that are only accessible through client-side navigation. The crawler uses lightweight HTTP discovery, not a full browser, for the page discovery phase. Try adding a `/sitemap.xml` to your site to help the crawler find all pages.

**How often should I run a crawl?**
For active sites, weekly or after major deployments. For static sites, after any content changes.

## Results

**Why is my score lower than I expected?**
Severity penalties add up quickly. A single Critical issue removes 10 points. Check for Critical and Serious issues first — fixing those will have the biggest impact on your score.

**Why are some issues marked "Potential"?**
Potential issues are cases where automated testing can't be certain a violation exists. They need human review. See [Confirmed vs Potential Issues](/user/results/confirmed-vs-potential).

**I dismissed an issue but it came back. Why?**
Dismissals are matched by issue fingerprint (element selector + rule + page URL). If the element's HTML structure changed, the fingerprint changed, and it appears as a new issue. Re-dismiss it if it's still a false positive.

## Technical

**Which browsers does ClearSight scan in?**
ClearSight uses headless Chromium (via Playwright). Results may differ from Firefox or Safari.

**Which WCAG rules does ClearSight check?**
All axe-core rules for WCAG 2.1 Level A and AA, plus custom engines for link text quality and touch target sizes. See the [axe-core Rule Index](/reference/wcag/axe-core-rules).
```

- [ ] **Step 2: Create Glossary page**

Create `docs-site/content/user/help/glossary.mdx`:
```mdx
---
title: Glossary
description: Plain-English definitions of accessibility and ClearSight terms.
---

# Glossary

## Accessibility terms

**WCAG**
Web Content Accessibility Guidelines. The international standard for web accessibility, published by the W3C. ClearSight checks against WCAG 2.1 Level A and AA.

**Level A / Level AA**
WCAG conformance levels. Level A is the minimum (most critical failures). Level AA is the standard most organizations target — it includes Level A plus additional requirements.

**axe-core**
The open-source accessibility testing engine that powers ClearSight's automated checks. Maintained by Deque Systems and used by major browsers' built-in dev tools.

**Screen reader**
Software that reads page content aloud for users who are blind or have low vision. Common screen readers: NVDA, JAWS (Windows), VoiceOver (macOS/iOS), TalkBack (Android).

**Keyboard navigation**
Navigating a page using only a keyboard (Tab, Enter, arrow keys) without a mouse. Users with motor disabilities and screen reader users rely on this.

**Color contrast ratio**
A measure of how distinct text is from its background. WCAG requires 4.5:1 for normal text and 3:1 for large text (18pt+ or 14pt+ bold).

**Touch target**
An interactive element on a touch screen. WCAG 2.1 recommends touch targets be at least 44×44px to be usable by people with motor impairments.

**Alt text**
Alternative text for images, read aloud by screen readers. Descriptive images need meaningful alt text; decorative images use empty alt (`alt=""`).

**ARIA**
Accessible Rich Internet Applications. A set of HTML attributes that add semantic meaning to elements for assistive technology. Example: `role="button"`, `aria-label="Close dialog"`.

**Landmark**
HTML5 sectioning elements (`<main>`, `<nav>`, `<header>`, `<footer>`) or ARIA landmark roles that let screen reader users jump between sections of a page.

## ClearSight terms

**Scan**
A single accessibility check of one URL.

**Crawl**
A full-site audit that discovers and scans every page on a domain.

**Site**
A domain in ClearSight. One site can have many crawls over time.

**Issue**
A single accessibility violation found on a page.

**Confirmed issue**
An issue that automated testing has determined is definitely a WCAG violation.

**Potential issue**
An issue that may be a violation but requires human review to confirm.

**Confidence score**
For potential issues: how confident ClearSight is that the issue is a real violation (0–100%).

**AI enrichment**
The step where ClearSight uses Azure OpenAI to generate plain-English descriptions and fix suggestions for each issue.
```

- [ ] **Step 3: Create Troubleshooting page**

Create `docs-site/content/user/help/troubleshooting.mdx`:
```mdx
---
title: Troubleshooting
description: Common problems and how to fix them.
---

import { Callout } from 'nextra/components'

# Troubleshooting

## Scan failed or got stuck

**Symptom:** Scan shows "Failed" or progress bar doesn't move.

**Check:**
1. Is the URL publicly accessible? Try opening it in an incognito window.
2. Does the page require JavaScript to render? ClearSight supports JS, but some pages block headless browsers.
3. Is the ClearSight worker running? The worker process handles scans separately from the web app.

If you're self-hosting, check the worker logs: `pnpm worker` and look for error output.

## Score seems wrong

**Symptom:** Score is much lower (or higher) than expected.

**Check:**
- Are there dismissed issues inflating a previous score? Dismissed issues are excluded from scoring.
- Did AI enrichment fail? Pages marked `completed_partial` use a fallback heuristic score.
- Are you looking at a page score or the site score? Site score is the average of all pages.

## Crawl found fewer pages than expected

**Symptom:** Crawl finished but missed pages you know exist.

**Check:**
1. Do you have a `/sitemap.xml`? Add one — it significantly helps page discovery.
2. Are the missing pages linked from other pages? The crawler follows `<a href>` links.
3. Is your site a heavily JS-driven SPA? Client-side-only navigation is not followed by the crawler.

## Export fails or produces empty PDF

**Symptom:** PDF download fails or the file is blank.

This is usually a temporary issue. Try:
1. Refresh the page and try the export again
2. Try the Excel export instead

If you're self-hosting, check that `pdfkit` is in `serverExternalPackages` in your `next.config.ts`.

<Callout type="info">
  Still stuck? [Open an issue on GitHub](https://github.com/thepranaygupta/clearsight/issues) with the scan ID and what you expected vs what happened.
</Callout>
```

- [ ] **Step 4: Commit**

```bash
git add docs-site/content/user/help/
git commit -m "docs: add User Guide — Help & FAQ section"
```

---

## Task 8: Developer Guide — Self-Hosting Section

**Files:**
- Create: `docs-site/content/dev/self-hosting/index.mdx`
- Create: `docs-site/content/dev/self-hosting/docker.mdx`
- Create: `docs-site/content/dev/self-hosting/environment-variables.mdx`
- Create: `docs-site/content/dev/self-hosting/production.mdx`

- [ ] **Step 1: Create Prerequisites page**

Create `docs-site/content/dev/self-hosting/index.mdx`:
```mdx
---
title: Prerequisites
description: What you need before running ClearSight.
---

import { Callout } from 'nextra/components'

# Prerequisites

ClearSight requires three external services:

| Service | Version | Purpose |
|---------|---------|---------|
| PostgreSQL | 16+ | Persistent storage for scans, issues, and summaries |
| Redis | 7+ | BullMQ job queue backing store |
| Azure OpenAI | — | AI enrichment (fix suggestions, descriptions, scoring) |

And the following on the host machine:

| Tool | Version |
|------|---------|
| Node.js | 20+ |
| pnpm | 9+ |
| Docker + Docker Compose | Latest stable (optional but recommended) |

## Azure OpenAI setup

ClearSight uses Azure OpenAI for AI enrichment. You need:

1. An Azure subscription with an OpenAI resource created
2. A deployed model (GPT-4o or GPT-4o-mini recommended)
3. The full chat completions URL — it looks like:
   ```
   https://<resource>.openai.azure.com/openai/deployments/<model>/chat/completions?api-version=2025-01-01-preview
   ```
4. An API key

<Callout type="warning">
  The `AZURE_OPENAI_ENDPOINT` env var must be the complete URL above, including the deployment name and `api-version` query param. ClearSight uses it directly as the fetch target — it does not append any path.
</Callout>

If you don't have Azure OpenAI, scans still work — they'll fall back to heuristic scoring and skip AI-generated descriptions. Pages will be marked `completed_partial`.

## Next steps

- [Docker setup →](/dev/self-hosting/docker)
- [Environment variables →](/dev/self-hosting/environment-variables)
```

- [ ] **Step 2: Create Docker Setup page**

Create `docs-site/content/dev/self-hosting/docker.mdx`:
```mdx
---
title: Docker Setup
description: Run ClearSight with Docker Compose for development or production.
---

import { Callout, Tabs } from 'nextra/components'

# Docker Setup

ClearSight ships with Docker Compose configurations for both development and production.

<Tabs items={['Development', 'Production']}>
  <Tabs.Tab>

## Development

The dev setup runs 5 services with live reloading:

```bash
git clone https://github.com/thepranaygupta/clearsight.git
cd clearsight
cp .env.example .env  # fill in your values
pnpm docker:dev
```

Services started:
| Service | Port | Description |
|---------|------|-------------|
| `app` | 3000 | Next.js dev server with Turbopack |
| `worker` | — | BullMQ processors (no port) |
| `postgres` | 5432 | PostgreSQL 16 |
| `redis` | 6379 | Redis 7 |
| `bull-board` | 3001 | Queue monitoring UI |
| `docs` | 3002 | Nextra docs site |

Source files are volume-mounted into the container — changes to `src/` hot-reload immediately.

To stop:
```bash
pnpm docker:dev:down
```

  </Tabs.Tab>
  <Tabs.Tab>

## Production

The production setup uses a standalone Next.js build and runs migrations on startup:

```bash
git clone https://github.com/thepranaygupta/clearsight.git
cd clearsight
cp .env.example .env  # fill in your values
pnpm docker:up
```

Services started:
| Service | Port | Description |
|---------|------|-------------|
| `app` | 3000 | Next.js production server |
| `worker` | — | BullMQ processors |
| `postgres` | 5432 | PostgreSQL 16 |
| `redis` | 6379 | Redis 7 |

The `app` container runs `prisma migrate deploy` on startup before starting the server.

To stop:
```bash
pnpm docker:down
```

  </Tabs.Tab>
</Tabs>

## Without Docker

If you prefer to run services manually:

```bash
# 1. Install dependencies
pnpm install

# 2. Set up the database
pnpm db:migrate

# 3. Start the Next.js app
pnpm dev

# 4. In a separate terminal, start the worker
pnpm worker
```

Redis and PostgreSQL must be running and accessible at the URLs in your `.env`.

## Next steps

- [Environment variables →](/dev/self-hosting/environment-variables)
- [Running in production →](/dev/self-hosting/production)
```

- [ ] **Step 3: Create Environment Variables page**

Create `docs-site/content/dev/self-hosting/environment-variables.mdx`:
```mdx
---
title: Environment Variables
description: All environment variables for configuring ClearSight.
---

import { Callout } from 'nextra/components'

# Environment Variables

Copy `.env.example` to `.env` and fill in your values.

## Required

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string. Example: `postgresql://user:pass@localhost:5432/clearsight` |
| `REDIS_URL` | Redis connection string. Default: `redis://localhost:6379` |
| `AZURE_OPENAI_ENDPOINT` | Full chat completions URL (see below) |
| `AZURE_OPENAI_API_KEY` | Azure OpenAI API key |

<Callout type="warning">
**`AZURE_OPENAI_ENDPOINT` format is critical.**

It must be the complete URL including deployment name and `api-version`:
```
https://<resource>.openai.azure.com/openai/deployments/<model>/chat/completions?api-version=2025-01-01-preview
```

The code uses this URL directly as the fetch target. Do not omit the path or query string.
</Callout>

## Optional

| Variable | Default | Description |
|----------|---------|-------------|
| `AZURE_OPENAI_API_VERSION` | `2025-01-01-preview` | Azure OpenAI API version |
| `MAX_CRAWL_PAGES` | unlimited | Hard cap on pages per crawl |
| `CRAWL_DELAY_MS` | `200` | Delay (ms) between page fetches during discovery |
| `WORKER_CONCURRENCY` | `3` | Parallel Playwright instances for page scanning |
| `AI_CONCURRENCY` | `2` | Parallel AI enrichment workers |
| `BULL_BOARD_PORT` | `3001` | Port for Bull Board admin UI |

## Tuning concurrency

`WORKER_CONCURRENCY` controls how many pages are scanned simultaneously. Each worker runs a headless Chromium instance. Higher values = faster crawls but more RAM usage.

Rule of thumb: 1 Playwright worker ≈ 300–500MB RAM. With `WORKER_CONCURRENCY=3`, budget ~1.5GB for the worker process.

`AI_CONCURRENCY` controls parallel Azure OpenAI calls. Keep this ≤ your Azure deployment's rate limit.

## Next steps

- [Running in production →](/dev/self-hosting/production)
```

- [ ] **Step 4: Create Running in Production page**

Create `docs-site/content/dev/self-hosting/production.mdx`:
```mdx
---
title: Running in Production
description: Checklist and guidance for deploying ClearSight to a production environment.
---

import { Callout } from 'nextra/components'

# Running in Production

## Deployment checklist

- [ ] PostgreSQL and Redis are running and accessible from your app and worker containers
- [ ] All required env vars are set (`DATABASE_URL`, `REDIS_URL`, `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_API_KEY`)
- [ ] `pnpm docker:up` (or equivalent) starts cleanly
- [ ] Database migrations run on startup (`prisma migrate deploy` in the `app` entrypoint)
- [ ] Worker process is running (check logs for "BullMQ worker started")
- [ ] A test scan completes successfully end-to-end

## Deploying to Vercel

The main Next.js app can be deployed to Vercel. The worker and Redis/Postgres cannot — they need a persistent process and a long-running container environment.

Recommended split:
- **Vercel** — Next.js app (`src/app/`)
- **Railway / Render / Fly.io / VPS** — worker process + Redis + PostgreSQL

<Callout type="info">
  When deploying to Vercel, set `REDIS_URL` to a managed Redis instance (Upstash, Railway, etc.) and `DATABASE_URL` to a managed Postgres (Neon, Supabase, PlanetScale-compatible, etc.).
</Callout>

## Production-specific gotchas

**PDFKit font resolution:** `pdfkit` must be in `serverExternalPackages` in `next.config.ts`. The standalone build must include `./node_modules/pdfkit/**/*` in `outputFileTracingIncludes`. Both are already configured in the repo — don't remove them.

**Redis connectivity:** The worker uses `lazyConnect: true` for Redis. This prevents startup failures if Redis is briefly unavailable, but the worker will not process jobs until the connection succeeds.

**Horizontal scaling:** The in-memory rate limiter resets on restart and is not shared across instances. Don't run multiple app instances without replacing it with a Redis-backed rate limiter.

**Prisma client:** The `postinstall` script runs `prisma generate`. If you're deploying without running `pnpm install` (e.g., copying a standalone build), ensure the Prisma client is pre-generated.

## Monitoring

- **Bull Board** — queue monitoring UI at port 3001 (or `BULL_BOARD_PORT`). Shows job counts, failures, and retry history.
- **Worker logs** — structured log output from the worker process includes job IDs, durations, and error traces.

## Next steps

- [Architecture overview →](/dev/architecture)
- [Environment variables →](/dev/self-hosting/environment-variables)
```

- [ ] **Step 5: Commit**

```bash
git add docs-site/content/dev/self-hosting/
git commit -m "docs: add Developer Guide — Self-Hosting section"
```

---

## Task 9: Developer Guide — Architecture Section

**Files:**
- Create: `docs-site/content/dev/architecture/index.mdx`
- Create: `docs-site/content/dev/architecture/crawler.mdx`
- Create: `docs-site/content/dev/architecture/queue-system.mdx`
- Create: `docs-site/content/dev/architecture/scan-pipeline.mdx`
- Create: `docs-site/content/dev/architecture/ai-enrichment.mdx`
- Create: `docs-site/content/dev/architecture/data-model.mdx`

- [ ] **Step 1: Create System Overview page**

Create `docs-site/content/dev/architecture/index.mdx`:
```mdx
---
title: System Overview
description: How ClearSight's components fit together — processes, queues, and data flow.
---

# System Overview

ClearSight runs as two processes: the **Next.js app** and the **worker**. They communicate exclusively through BullMQ queues backed by Redis.

## Processes

| Process | Entry point | Responsibilities |
|---------|-------------|-----------------|
| `next` (app) | `src/app/` | UI, REST API, enqueuing jobs |
| `worker` | `src/worker/index.ts` | Processing all BullMQ jobs |

The app never touches Playwright or axe-core — all scan work happens in the worker.

## Queues

Three BullMQ queues handle the full-site crawl pipeline:

```
POST /api/sites/:id/crawl
        │
        ▼
┌─────────────────────┐
│  crawl-discovery    │  BFS link discovery (HTTP fetch + sitemap.xml)
│  concurrency: 1     │
└──────────┬──────────┘
           │ enqueues one job per discovered page
           ▼
┌─────────────────────┐
│  page-scan          │  Playwright + axe-core per page
│  concurrency: 3     │
└──────────┬──────────┘
           │ enqueues one job per scanned page
           ▼
┌─────────────────────┐
│  ai-enrichment      │  Azure OpenAI per page
│  concurrency: 2     │
└─────────────────────┘
           │
           ▼
     Crawl finalization
     (score aggregation, issue diff)
```

## Single-page scan flow

`POST /api/scans` skips crawl-discovery and enqueues directly to `page-scan`:

```
POST /api/scans → page-scan → ai-enrichment → scan complete
```

## Key modules

| Path | What it does |
|------|--------------|
| `src/modules/crawler/` | BFS discovery, URL normalization, issue tracking |
| `src/modules/queue/` | BullMQ queue definitions and job type definitions |
| `src/modules/pipeline/` | PipelineOrchestrator + 5 scan stages |
| `src/modules/scanner/` | Playwright renderer + axe-core/LinkText/TouchTarget engines |
| `src/modules/ai/` | Azure OpenAI provider and prompts |
| `src/modules/export/` | PDF and Excel report generators |
| `src/modules/db/repositories/` | Prisma repository layer |
| `src/worker/processors/` | BullMQ job processors |
| `src/config/index.ts` | Centralized env config |

## Next steps

- [Crawler & Discovery →](/dev/architecture/crawler)
- [Queue System →](/dev/architecture/queue-system)
- [Scan Pipeline →](/dev/architecture/scan-pipeline)
```

- [ ] **Step 2: Create Crawler & Discovery page**

Create `docs-site/content/dev/architecture/crawler.mdx`:
```mdx
---
title: Crawler & Discovery
description: How ClearSight discovers pages during a full-site crawl.
---

import { Callout } from 'nextra/components'

# Crawler & Discovery

The crawler (`src/modules/crawler/`) is responsible for discovering all pages on a domain before scanning begins.

## Discovery algorithm

The crawler uses **BFS (breadth-first search)** via lightweight HTTP fetch — not Playwright. This keeps discovery fast: no JavaScript execution, no screenshots, just HTML parsing.

For each URL in the queue:
1. Fetch the page HTML (30s timeout)
2. Parse `<a href>`, `<link href>`, `<iframe src>` tags
3. Add same-origin URLs not yet seen to the queue
4. Also fetch and parse `/sitemap.xml` on the first pass

<Callout type="info">
  Using HTTP fetch for discovery means JavaScript-only navigation (e.g., React Router client-side links that aren't in the initial HTML) won't be followed. A sitemap.xml helps bridge this gap.
</Callout>

## URL normalization

`src/modules/crawler/url-normalizer.ts` normalizes URLs before deduplication:
- Strips fragments (`#section`)
- Strips common tracking params (`utm_*`, `fbclid`, etc.)
- Normalizes trailing slashes
- Lowercases the hostname

This prevents the same page from being scanned twice due to URL variants.

## Same-origin enforcement

The crawler only follows links to the same origin as the seed URL. Subdomains are treated as separate origins.

## Crawl delay

`CRAWL_DELAY_MS` (default 200ms) adds a delay between discovery fetches to avoid hammering the target server.

## Issue tracking across crawls

`src/modules/crawler/issue-tracker.ts` handles cross-crawl issue state:

- Issues are fingerprinted by `(pageUrl + ruleId + elementSelector)` hash
- On crawl completion, each issue's hash is compared against the previous crawl
- Issues not seen in the new crawl → marked `fixed`
- New hashes not seen before → marked `open` (new)
- Hashes seen in both → carry over their existing status

## Key files

| File | Responsibility |
|------|----------------|
| `src/modules/crawler/discovery.ts` | BFS crawl implementation |
| `src/modules/crawler/url-normalizer.ts` | URL normalization and deduplication |
| `src/modules/crawler/issue-tracker.ts` | Cross-crawl issue lifecycle |
| `src/modules/crawler/types.ts` | Crawler type definitions |
| `src/worker/processors/crawl.processor.ts` | BullMQ processor for crawl-discovery queue |

## Next steps

- [Queue System →](/dev/architecture/queue-system)
- [Scan Pipeline →](/dev/architecture/scan-pipeline)
```

- [ ] **Step 3: Create Queue System page**

Create `docs-site/content/dev/architecture/queue-system.mdx`:
```mdx
---
title: Queue System
description: BullMQ queues, job types, and concurrency configuration.
---

# Queue System

ClearSight uses [BullMQ](https://docs.bullmq.io/) for all async job processing, backed by Redis.

## Queues

Defined in `src/modules/queue/queues.ts`:

| Queue name | Processor | Concurrency | Job type |
|------------|-----------|-------------|----------|
| `crawl-discovery` | `crawl.processor.ts` | 1 | `CrawlDiscoveryJob` |
| `page-scan` | `page-scan.processor.ts` | `WORKER_CONCURRENCY` (default 3) | `PageScanJob` |
| `ai-enrichment` | `ai-enrichment.processor.ts` | `AI_CONCURRENCY` (default 2) | `AiEnrichmentJob` |

## Job type definitions

Defined in `src/modules/queue/types.ts`:

```typescript
// CrawlDiscoveryJob
{
  crawlId: string
  siteId: string
  rootUrl: string
  maxPages?: number
}

// PageScanJob
{
  scanId: string
  url: string
  crawlId?: string   // present for crawl-initiated scans
  siteId?: string
}

// AiEnrichmentJob
{
  scanId: string
  crawlId?: string
}
```

## Worker entry point

`src/worker/index.ts` registers all processors and handles graceful shutdown:

```typescript
// Simplified
const crawlWorker = new Worker('crawl-discovery', crawlProcessor, { connection, concurrency: 1 })
const scanWorker = new Worker('page-scan', pageScanProcessor, { connection, concurrency: WORKER_CONCURRENCY })
const aiWorker = new Worker('ai-enrichment', aiEnrichmentProcessor, { connection, concurrency: AI_CONCURRENCY })

// Graceful shutdown on SIGTERM/SIGINT
process.on('SIGTERM', async () => {
  await Promise.all([crawlWorker.close(), scanWorker.close(), aiWorker.close()])
  process.exit(0)
})
```

## Job retry behavior

Failed jobs are not automatically retried by default. The job processors catch errors, update the scan/crawl status to `failed`, and re-throw so BullMQ marks the job as failed.

To add retries, pass `{ attempts: 3, backoff: { type: 'exponential' } }` to the job options in the enqueue call.

## Monitoring

Use Bull Board at `http://localhost:3001` (or `BULL_BOARD_PORT`) to inspect queue state, view failed jobs, and manually retry them.

## Next steps

- [Scan Pipeline →](/dev/architecture/scan-pipeline)
- [AI Enrichment →](/dev/architecture/ai-enrichment)
```

- [ ] **Step 4: Create Scan Pipeline page**

Create `docs-site/content/dev/architecture/scan-pipeline.mdx`:
```mdx
---
title: Scan Pipeline
description: The five-stage pipeline that runs for every page scan.
---

# Scan Pipeline

Every page scan — whether from a single-page scan or a full-site crawl — runs through the same five-stage pipeline implemented in `src/modules/pipeline/`.

## Stages

```
Fetch (20%) → Analyze (40%) → CustomChecks (55%) → Enrich (80%) → Store (100%)
```

| Stage | Progress | What it does |
|-------|----------|--------------|
| **Fetch** | 0–20% | Loads the page in headless Chromium, captures a screenshot |
| **Analyze** | 20–40% | Runs axe-core against the rendered DOM |
| **CustomChecks** | 40–55% | Runs LinkTextEngine and TouchTargetEngine |
| **Enrich** | 55–80% | Sends issues to Azure OpenAI for descriptions and fix suggestions |
| **Store** | 80–100% | Saves all issues, summary, screenshot, and metadata to the DB |

## PipelineOrchestrator

`src/modules/pipeline/` contains the `PipelineOrchestrator` class which:
- Runs stages sequentially
- Updates `scan.progress` and `scan.currentStage` after each stage
- If Enrich fails, falls back to raw axe-core findings and sets `scan.status = 'completed_partial'`
- If any other stage fails, sets `scan.status = 'failed'`

## Scan engines

Three engines run in the **Analyze** and **CustomChecks** stages:

**AxeCoreEngine** (`src/modules/scanner/engines/`)
Runs the full axe-core ruleset against the page. Returns violations as structured issue objects with WCAG criterion, severity, element selector, and HTML snippet.

**LinkTextEngine**
Custom engine that flags links whose accessible name is generic ("click here", "read more", "here", empty). Returns Potential issues with a confidence score.

**TouchTargetEngine**
Custom engine that checks all interactive elements (buttons, links, inputs) for minimum touch target size. Elements under 24×24px are flagged as Moderate violations.

The three engines run with `Promise.allSettled` — if one fails, the others still complete.

## Playwright renderer

`src/modules/scanner/renderer/playwright.ts` manages the headless browser:
- Single browser instance reused across scans (not spawned per scan)
- New page/context per scan, closed after completion
- 30-second navigation timeout
- Viewport: 1280×720 (desktop)

## Next steps

- [AI Enrichment →](/dev/architecture/ai-enrichment)
- [Data Model →](/dev/architecture/data-model)
```

- [ ] **Step 5: Create AI Enrichment page**

Create `docs-site/content/dev/architecture/ai-enrichment.mdx`:
```mdx
---
title: AI Enrichment
description: How ClearSight uses Azure OpenAI to generate fix suggestions and accessibility scores.
---

import { Callout } from 'nextra/components'

# AI Enrichment

After a page is scanned, the AI enrichment stage sends its issues to Azure OpenAI to generate human-readable descriptions, fix suggestions, and an overall accessibility score.

## What it produces

For each issue:
- **Description** — plain-English explanation of why this is an accessibility problem
- **Fix suggestion** — specific, actionable steps to resolve it

For the page overall:
- **Summary** — a 2–3 sentence narrative of the page's accessibility state
- **Overall score** — 0–100 integer
- **Top priorities** — ranked list of the most impactful issues to fix first
- **Positive findings** — what the page does well

## Implementation

`src/modules/ai/providers/azure-openai.ts` — raw `fetch` call to the Azure OpenAI endpoint. No SDK.

```typescript
const response = await fetch(AZURE_OPENAI_ENDPOINT, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'api-key': AZURE_OPENAI_API_KEY,
  },
  body: JSON.stringify({
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    response_format: { type: 'json_object' },
  }),
})
```

The prompt is defined in `src/modules/ai/prompts/` and includes the full issue list, element HTML snippets, and WCAG context.

## Failure handling

<Callout type="warning">
  If AI enrichment fails (Azure quota, network error, malformed response), the scan is marked `completed_partial`. Results still include all raw axe-core findings — only the AI descriptions and AI-generated score are missing. The score falls back to the heuristic calculation.
</Callout>

## Concurrency

The `ai-enrichment` queue runs with `AI_CONCURRENCY` workers (default 2). Keep this within your Azure OpenAI deployment's requests-per-minute limit.

## Prompt engineering

Prompts live in `src/modules/ai/prompts/`. The enrichment prompt instructs the model to:
- Return structured JSON (enforced by `response_format: { type: 'json_object' }`)
- Write for a developer audience (technical fix suggestions)
- Keep descriptions under 2 sentences
- Score strictly (a page with Critical issues should not score above 60)

## Next steps

- [Data Model →](/dev/architecture/data-model)
- [Queue System →](/dev/architecture/queue-system)
```

- [ ] **Step 6: Create Data Model page**

Create `docs-site/content/dev/architecture/data-model.mdx`:
```mdx
---
title: Data Model
description: The Prisma schema — entities, relationships, and key fields.
---

# Data Model

Defined in `prisma/schema.prisma`. All DB access goes through repository classes in `src/modules/db/repositories/`.

## Entities

### Site
Represents a domain.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `hostname` | String | e.g. `example.com` |
| `name` | String | Display name |
| `createdAt` | DateTime | |
| `updatedAt` | DateTime | |

### Crawl
A full-site audit run for a site.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | |
| `siteId` | FK → Site | |
| `status` | Enum | `queued \| discovering \| scanning \| completed \| failed \| cancelled` |
| `totalPages` | Int | Pages discovered |
| `scannedPages` | Int | Pages with completed scans |
| `enrichedPages` | Int | Pages with AI enrichment |
| `overallScore` | Float? | Null until crawl completes |
| `maxPages` | Int? | Per-crawl page cap |
| `newIssues` | Int | Issues not seen in previous crawl |
| `fixedIssues` | Int | Issues from previous crawl no longer present |

### Page
A URL discovered within a site.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | |
| `siteId` | FK → Site | |
| `url` | String | Full URL |
| `path` | String | URL path only |
| `firstSeenCrawlId` | FK → Crawl | Crawl where this page was first discovered |

### Scan
A single-page accessibility scan (created for both standalone scans and crawl-initiated scans).

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | |
| `url` | String | |
| `status` | Enum | `queued \| running \| completed \| failed \| completed_partial \| cancelled` |
| `progress` | Int | 0–100 |
| `currentStage` | String? | Current pipeline stage name |
| `pageTitle` | String? | |
| `pageScreenshot` | String? | Base64 PNG |
| `metadata` | JSON? | Browser info, viewport, etc. |
| `retryCount` | Int | |

### Issue
An accessibility violation found in a scan.

| Field | Type | Notes |
|-------|------|-------|
| `scanId` | FK → Scan (CASCADE) | |
| `issueHash` | String | Fingerprint: `hash(pageUrl + ruleId + selector)` |
| `issueStatus` | Enum | `open \| fixed \| dismissed \| cant_fix` |
| `pageUrl` | String | |
| `firstSeenScanId` | FK → Scan | |
| `lastSeenScanId` | FK → Scan | |
| `fixedAtCrawlId` | FK → Crawl? | Set when status transitions to `fixed` |
| `type` | Enum | `confirmed \| potential` |
| `severity` | Enum | `critical \| serious \| moderate \| minor` |
| `confidenceScore` | Float? | 0–1, for potential issues |
| `wcagCriterion` | String | e.g. `1.1.1` |
| `wcagLevel` | Enum | `A \| AA` |
| `elementSelector` | String | CSS selector |
| `elementHtml` | String | Outer HTML snippet |
| `description` | String | AI or raw description |
| `fixSuggestion` | String | AI or raw fix suggestion |
| `axeRuleId` | String? | axe-core rule ID |

### ScanSummary
AI-generated summary for a scan. One-to-one with Scan.

| Field | Type | Notes |
|-------|------|-------|
| `scanId` | FK → Scan (unique, CASCADE) | |
| `overallScore` | Int | 0–100 |
| `summary` | String | Narrative summary |
| `topPriorities` | JSON | Ranked issue list |
| `positiveFindings` | JSON | What the page does well |

## Repository pattern

All DB access goes through repositories, not direct Prisma calls from processors or API routes:

- `PrismaScanRepository` — CRUD for Scan
- `PrismaIssueRepository` — CRUD for Issue
- `PrismaSummaryRepository` — CRUD for ScanSummary

## Next steps

- [System Overview →](/dev/architecture)
- [API Reference →](/dev/api)
```

- [ ] **Step 7: Commit**

```bash
git add docs-site/content/dev/architecture/
git commit -m "docs: add Developer Guide — Architecture section"
```

---

## Task 10: Developer Guide — API Reference Section

**Files:**
- Create: `docs-site/content/dev/api/index.mdx`
- Create: `docs-site/content/dev/api/sites-crawls.mdx`
- Create: `docs-site/content/dev/api/scans.mdx`
- Create: `docs-site/content/dev/api/issues-pages.mdx`
- Create: `docs-site/content/dev/api/error-codes.mdx`

- [ ] **Step 1: Create Auth & Conventions page**

Create `docs-site/content/dev/api/index.mdx`:
```mdx
---
title: Auth & Conventions
description: Base URL, request format, pagination, and response conventions for the ClearSight REST API.
---

# API Reference

ClearSight exposes a REST API served by the Next.js app. All scan operations are available via API.

## Base URL

```
http://localhost:3000/api
```

Replace `localhost:3000` with your deployment URL in production.

## Authentication

The API has no authentication by default. All endpoints are publicly accessible. If you're exposing ClearSight to the internet, put it behind a reverse proxy with auth (e.g., Nginx + BasicAuth, Cloudflare Access).

## Request format

All `POST` and `PATCH` requests expect `Content-Type: application/json`.

## Response format

All responses return JSON. Successful responses use the shape relevant to the resource. Errors return:

```json
{
  "error": "Human-readable error message"
}
```

## Pagination

List endpoints support `limit` and `offset` query params:

```
GET /api/scans?limit=20&offset=0
GET /api/sites/:id/pages?limit=50&offset=100
```

Default `limit` is 20. No maximum enforced, but large limits may be slow.

## Dates

All timestamps are ISO 8601 strings in UTC: `2026-03-22T14:30:00.000Z`.

## IDs

All resource IDs are UUIDs.

## Next steps

- [Sites & Crawls API →](/dev/api/sites-crawls)
- [Scans API →](/dev/api/scans)
- [Issues & Pages API →](/dev/api/issues-pages)
```

- [ ] **Step 2: Create Sites & Crawls API page**

Create `docs-site/content/dev/api/sites-crawls.mdx`:
```mdx
---
title: Sites & Crawls
description: API reference for managing sites and triggering full-site crawls.
---

# Sites & Crawls API

## Sites

### Create or get a site

```http
POST /api/sites
Content-Type: application/json

{
  "url": "https://example.com"
}
```

If a site for that hostname already exists, returns the existing site. Otherwise creates a new one.

**Response:**
```json
{
  "id": "uuid",
  "hostname": "example.com",
  "name": "example.com",
  "createdAt": "2026-03-22T14:30:00.000Z"
}
```

### List sites

```http
GET /api/sites
```

**Response:** Array of site objects.

### Get site detail

```http
GET /api/sites/:id
```

**Response:** Site object with latest crawl summary.

---

## Crawls

### Start a crawl

```http
POST /api/sites/:id/crawl
Content-Type: application/json

{
  "maxPages": 50
}
```

`maxPages` is optional. Omit to crawl the entire site (subject to `MAX_CRAWL_PAGES` env var).

**Response:**
```json
{
  "crawlId": "uuid",
  "status": "queued"
}
```

### List crawls

```http
GET /api/sites/:id/crawls?limit=10&offset=0
```

**Response:** Paginated array of crawl objects, newest first.

### Get crawl detail

```http
GET /api/sites/:id/crawls/:crawlId
```

**Response:**
```json
{
  "id": "uuid",
  "siteId": "uuid",
  "status": "completed",
  "totalPages": 42,
  "scannedPages": 42,
  "enrichedPages": 41,
  "overallScore": 78,
  "newIssues": 3,
  "fixedIssues": 7,
  "createdAt": "2026-03-22T14:30:00.000Z",
  "completedAt": "2026-03-22T14:38:22.000Z"
}
```

### Cancel a crawl

```http
POST /api/sites/:id/crawls/:crawlId/cancel
```

Cancels a running crawl. Already-scanned pages are preserved.

### Export crawl report

```http
GET /api/sites/:id/crawls/:crawlId/export?format=pdf
GET /api/sites/:id/crawls/:crawlId/export?format=excel
```

Returns the report file as a download. `format` defaults to `pdf`.

## Next steps

- [Scans API →](/dev/api/scans)
- [Issues & Pages API →](/dev/api/issues-pages)
```

- [ ] **Step 3: Create Scans API page**

Create `docs-site/content/dev/api/scans.mdx`:
```mdx
---
title: Scans
description: API reference for single-page scans.
---

import { Callout } from 'nextra/components'

# Scans API

Single-page scans are the legacy scan API. They're still fully supported and route through the same BullMQ pipeline as crawl-initiated scans.

<Callout type="info">
  For auditing entire sites, use the [Sites & Crawls API](/dev/api/sites-crawls) instead.
</Callout>

## Create a scan

```http
POST /api/scans
Content-Type: application/json

{
  "url": "https://example.com/page"
}
```

**Rate limit:** 10 per hour per IP.

**Response:**
```json
{
  "id": "uuid",
  "url": "https://example.com/page",
  "status": "queued",
  "progress": 0,
  "createdAt": "2026-03-22T14:30:00.000Z"
}
```

## List scans

```http
GET /api/scans?limit=20&offset=0
```

**Response:** Paginated array of scan objects, newest first.

## Get scan status and results

```http
GET /api/scans/:id
```

Poll this endpoint to track progress. Once `status` is `completed` or `completed_partial`, the full results are available.

**Response (in progress):**
```json
{
  "id": "uuid",
  "status": "running",
  "progress": 55,
  "currentStage": "CustomChecks"
}
```

**Response (completed):**
```json
{
  "id": "uuid",
  "status": "completed",
  "progress": 100,
  "url": "https://example.com/page",
  "pageTitle": "Example Page",
  "summary": {
    "overallScore": 82,
    "summary": "The page is largely accessible...",
    "topPriorities": [...],
    "positiveFindings": [...]
  },
  "issues": [
    {
      "id": "uuid",
      "type": "confirmed",
      "severity": "critical",
      "wcagCriterion": "1.1.1",
      "wcagLevel": "A",
      "elementSelector": "img.hero",
      "elementHtml": "<img class=\"hero\" src=\"hero.jpg\">",
      "description": "Image is missing alt text.",
      "fixSuggestion": "Add an alt attribute describing the image content.",
      "axeRuleId": "image-alt"
    }
  ]
}
```

## Cancel a scan

```http
POST /api/scans/:id/cancel
```

## Export scan report

```http
GET /api/scans/:id/export?format=pdf
GET /api/scans/:id/export?format=excel
```

Scan must be in `completed` or `completed_partial` status.

## Next steps

- [Sites & Crawls API →](/dev/api/sites-crawls)
- [Issues & Pages API →](/dev/api/issues-pages)
```

- [ ] **Step 4: Create Issues & Pages API page**

Create `docs-site/content/dev/api/issues-pages.mdx`:
```mdx
---
title: Issues & Pages
description: API reference for querying issues and pages within a site.
---

# Issues & Pages API

## Issues

### List issues

```http
GET /api/sites/:id/issues
```

Supports filtering:

| Parameter | Values | Description |
|-----------|--------|-------------|
| `severity` | `critical`, `serious`, `moderate`, `minor` | Filter by severity |
| `wcagLevel` | `A`, `AA` | Filter by WCAG level |
| `status` | `open`, `fixed`, `dismissed`, `cant_fix` | Filter by issue status |
| `pageId` | UUID | Filter to a specific page |
| `limit` | Integer | Default 20 |
| `offset` | Integer | Default 0 |

**Example:**
```http
GET /api/sites/:id/issues?severity=critical&status=open&limit=50
```

### Get issue detail

```http
GET /api/sites/:id/issues/:issueId
```

Returns the full issue object including description, fix suggestion, element HTML, and status history.

### Update issue status

```http
PATCH /api/sites/:id/issues/:issueId
Content-Type: application/json

{
  "status": "dismissed"
}
```

Valid status values: `open`, `dismissed`, `cant_fix`.

---

## Pages

### List pages

```http
GET /api/sites/:id/pages?limit=50&offset=0
```

**Response:** Paginated array of page objects with their latest scan score and issue counts.

### Get page detail

```http
GET /api/sites/:id/pages/:pageId
```

**Response:** Page object with full scan history and all issues found on this page.

## Next steps

- [Error Codes →](/dev/api/error-codes)
- [Sites & Crawls API →](/dev/api/sites-crawls)
```

- [ ] **Step 5: Create Error Codes page**

Create `docs-site/content/dev/api/error-codes.mdx`:
```mdx
---
title: Error Codes
description: HTTP status codes and error messages returned by the ClearSight API.
---

# Error Codes

All errors return JSON with an `error` field:

```json
{
  "error": "Human-readable error message"
}
```

## HTTP status codes

| Status | Meaning |
|--------|---------|
| `400` | Bad request — invalid input (malformed URL, missing required field) |
| `404` | Resource not found |
| `409` | Conflict — e.g. a crawl is already running for this site |
| `429` | Rate limit exceeded — 10 scans/hour per IP for single-page scans |
| `500` | Internal server error |

## Common errors

| Error message | Cause | Fix |
|---------------|-------|-----|
| `"Invalid URL"` | URL failed validation | Ensure the URL includes `https://` and is a valid public URL |
| `"Private IP addresses are not allowed"` | URL resolves to a private/internal IP (SSRF prevention) | Use a public URL |
| `"Rate limit exceeded"` | More than 10 single-page scans per hour from this IP | Wait and retry |
| `"A crawl is already running for this site"` | Concurrent crawl conflict | Wait for the current crawl to finish or cancel it |
| `"Scan not found"` | Invalid scan ID | Check the ID and retry |
| `"Crawl not found"` | Invalid crawl ID | Check the ID and retry |

## SSRF prevention

The URL validator (`src/lib/url-validation.ts`) blocks URLs that resolve to:
- `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16` (RFC 1918 private ranges)
- `127.0.0.0/8` (loopback)
- `169.254.0.0/16` (link-local)
- `::1` (IPv6 loopback)

This is intentional and cannot be disabled in production.
```

- [ ] **Step 6: Commit**

```bash
git add docs-site/content/dev/api/
git commit -m "docs: add Developer Guide — API Reference section"
```

---

## Task 11: Developer Guide — Contributing Section

**Files:**
- Create: `docs-site/content/dev/contributing/index.mdx`
- Create: `docs-site/content/dev/contributing/scan-engines.mdx`
- Create: `docs-site/content/dev/contributing/extension.mdx`
- Create: `docs-site/content/dev/contributing/code-style.mdx`

- [ ] **Step 1: Create Dev Setup page**

Create `docs-site/content/dev/contributing/index.mdx`:
```mdx
---
title: Dev Setup
description: Set up a local development environment to contribute to ClearSight.
---

import { Callout, Steps } from 'nextra/components'

# Dev Setup

<Steps>

### Clone and install

```bash
git clone https://github.com/thepranaygupta/clearsight.git
cd clearsight
pnpm install
```

### Set up environment

```bash
cp .env.example .env
```

Fill in at minimum:
- `DATABASE_URL` — PostgreSQL connection string
- `REDIS_URL` — Redis connection string

Azure OpenAI is optional for local dev. Without it, scans complete as `completed_partial`.

### Start infrastructure

```bash
# Start Postgres + Redis with Docker (no app/worker)
docker compose up postgres redis -d
```

Or use your own local Postgres and Redis.

### Run database migrations

```bash
pnpm db:migrate
```

### Start the app and worker

In two separate terminals:

```bash
# Terminal 1 — Next.js app
pnpm dev

# Terminal 2 — BullMQ worker
pnpm worker
```

The app runs at `http://localhost:3000`. The worker processes scan jobs in the background.

### Verify the setup

Open `http://localhost:3000`, enter a public URL, and run a scan. If it completes (even `completed_partial`), your setup is working.

</Steps>

## Optional services

```bash
pnpm bull-board    # Queue monitoring UI at http://localhost:3001
pnpm docs:dev     # Nextra docs site at http://localhost:3002
```

## Project structure quick reference

```
src/app/          — Next.js pages and API routes
src/worker/       — BullMQ processors
src/modules/      — Core business logic (scanner, crawler, AI, export, DB)
src/components/   — React components
src/config/       — Centralized env config (read all env vars from here)
prisma/           — Prisma schema and migrations
```

## Next steps

- [Adding Scan Engines →](/dev/contributing/scan-engines)
- [Code Style & PRs →](/dev/contributing/code-style)
```

- [ ] **Step 2: Create Adding Scan Engines page**

Create `docs-site/content/dev/contributing/scan-engines.mdx`:
```mdx
---
title: Adding Scan Engines
description: How to write a custom scan engine and plug it into the ClearSight pipeline.
---

import { Callout } from 'nextra/components'

# Adding Scan Engines

Scan engines are the modular units that detect accessibility issues. ClearSight ships with three:

- **AxeCoreEngine** — runs axe-core rules
- **LinkTextEngine** — checks link text quality
- **TouchTargetEngine** — checks touch target sizes

You can add custom engines to detect issues beyond what axe-core covers.

## Engine interface

All engines in `src/modules/scanner/engines/` follow this pattern:

```typescript
export interface ScanEngine {
  name: string
  run(page: Page, url: string): Promise<EngineResult[]>
}

export interface EngineResult {
  type: 'confirmed' | 'potential'
  severity: 'critical' | 'serious' | 'moderate' | 'minor'
  wcagCriterion: string
  wcagLevel: 'A' | 'AA'
  elementSelector: string
  elementHtml: string
  description: string
  axeRuleId?: string
  confidenceScore?: number  // 0-1, required if type === 'potential'
}
```

`page` is a Playwright `Page` object with the target URL already loaded.

## Example: writing a custom engine

```typescript
// src/modules/scanner/engines/HeadingHierarchyEngine.ts
import type { Page } from 'playwright'
import type { ScanEngine, EngineResult } from './types'

export class HeadingHierarchyEngine implements ScanEngine {
  name = 'HeadingHierarchyEngine'

  async run(page: Page, url: string): Promise<EngineResult[]> {
    const issues = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'))
      const results: Array<{ selector: string; html: string; level: number }> = []
      let prevLevel = 0

      headings.forEach((el, i) => {
        const level = parseInt(el.tagName[1])
        if (level > prevLevel + 1) {
          results.push({
            selector: `${el.tagName.toLowerCase()}:nth-of-type(${i + 1})`,
            html: el.outerHTML.slice(0, 200),
            level,
          })
        }
        prevLevel = level
      })

      return results
    })

    return issues.map(issue => ({
      type: 'confirmed' as const,
      severity: 'moderate' as const,
      wcagCriterion: '1.3.1',
      wcagLevel: 'A' as const,
      elementSelector: issue.selector,
      elementHtml: issue.html,
      description: `Heading level skipped from h${issue.level - 1} to h${issue.level}.`,
    }))
  }
}
```

## Plugging in the engine

Register your engine in the **CustomChecks** stage in `src/modules/pipeline/`:

```typescript
// In the CustomChecks stage implementation
const engines = [
  new LinkTextEngine(),
  new TouchTargetEngine(),
  new HeadingHierarchyEngine(),  // add your engine here
]

const results = await Promise.allSettled(
  engines.map(engine => engine.run(page, url))
)
```

<Callout type="info">
  Engines run with `Promise.allSettled` — if your engine throws, it won't break the other engines or the scan. Failed engines are logged but don't fail the scan.
</Callout>

## Testing your engine

Write a test that creates a minimal HTML page with the violation, loads it in Playwright, and asserts your engine finds the expected issues.

## Next steps

- [Chrome Extension Dev →](/dev/contributing/extension)
- [Code Style & PRs →](/dev/contributing/code-style)
```

- [ ] **Step 3: Create Chrome Extension Dev page**

Create `docs-site/content/dev/contributing/extension.mdx`:
```mdx
---
title: Chrome Extension Dev
description: How the Chrome extension works and how to modify it.
---

# Chrome Extension Dev

The extension lives in `extension/` and is intentionally minimal — it's a thin launcher, not a scanner.

## Architecture

```
extension/
├── manifest.json    # Manifest V3, activeTab permission only
├── popup.html       # Popup UI (current URL + Scan button)
├── popup.js         # Opens /dashboard?autoScan=<url> in a new tab
└── icons/           # 16/48/128px PNG + SVG
```

The extension does not run any scan logic. Clicking **Scan this page**:
1. Reads the current tab URL using `chrome.tabs.query`
2. Opens `http://localhost:3000/dashboard?autoScan=<url>` in a new tab
3. The main app detects the `autoScan` query param and starts a scan automatically

## Changing the app URL

The target URL is hardcoded in `popup.js`. To point the extension at a deployed instance:

```javascript
// popup.js
const APP_URL = 'https://your-clearsight-instance.com'  // change this
```

## Permissions

The extension only requests `activeTab`. It cannot:
- Access tabs the user isn't actively viewing
- Access browser history
- Run in the background

## Loading in developer mode

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** → select the `extension/` directory
4. The ClearSight icon appears in the toolbar

Changes to `popup.html` and `popup.js` take effect after reloading the extension (click the refresh icon in `chrome://extensions`).

## Building for distribution

The extension is Manifest V3 with no build step. To package for release:

```bash
cd extension
zip -r clearsight-extension.zip . -x "*.DS_Store"
```

## Next steps

- [Code Style & PRs →](/dev/contributing/code-style)
```

- [ ] **Step 4: Create Code Style & PRs page**

Create `docs-site/content/dev/contributing/code-style.mdx`:
```mdx
---
title: Code Style & PRs
description: Coding conventions and the PR process for contributing to ClearSight.
---

# Code Style & PRs

## TypeScript

- Strict mode is enabled. No `any` unless unavoidable.
- Use `import type { ... }` for type-only imports.
- Path alias `@/*` maps to `./src/*`.
- All env vars are read through `src/config/index.ts` — never `process.env` directly in business logic.

## React

- `"use client"` directive on all interactive components and pages that use hooks.
- API routes are server-side only — no `"use client"` in `src/app/api/`.
- Components in `src/components/ui/` are shadcn/ui — don't modify them directly, add overrides in parent components.

## Database

- All DB access through repository classes in `src/modules/db/repositories/`.
- No raw Prisma calls in API routes or processors — use repositories.
- Run `pnpm db:generate` after schema changes, `pnpm db:migrate` to apply.

## API routes

- Validate inputs at the route level before passing to repositories or queues.
- Return consistent error shapes: `{ error: string }` with appropriate HTTP status.
- Use `NextResponse.json()` — not `Response.json()`.

## Linting

```bash
pnpm lint
```

ESLint with Next.js rules. Fix all lint errors before opening a PR. No lint suppression comments without a comment explaining why.

## Submitting a PR

1. Fork the repo and create a branch: `git checkout -b feat/your-feature`
2. Make your changes with focused commits
3. Run `pnpm lint` and fix any errors
4. Open a PR against `main` with a clear description of what changed and why
5. Link any related issues

## Commit message format

```
type: short description

Types: feat, fix, docs, refactor, test, chore
```

Examples:
```
feat: add HeadingHierarchyEngine scan engine
fix: prevent duplicate pages in crawl discovery
docs: update environment variables reference
```
```

- [ ] **Step 5: Commit**

```bash
git add docs-site/content/dev/contributing/
git commit -m "docs: add Developer Guide — Contributing section"
```

---

## Task 12: Reference Section

**Files:**
- Create: `docs-site/content/reference/wcag/level-a.mdx`
- Create: `docs-site/content/reference/wcag/level-aa.mdx`
- Create: `docs-site/content/reference/wcag/axe-core-rules.mdx`
- Create: `docs-site/content/reference/changelog.mdx`
- Create: `docs-site/content/reference/roadmap.mdx`

- [ ] **Step 1: Create WCAG Level A page**

Create `docs-site/content/reference/wcag/level-a.mdx`:
```mdx
---
title: WCAG 2.1 Level A
description: All WCAG 2.1 Level A success criteria checked by ClearSight.
---

# WCAG 2.1 Level A

Level A is the minimum conformance level. These are the most critical requirements — failing them creates barriers that make content completely inaccessible to some users.

## Perceivable

| Criterion | Name | Description |
|-----------|------|-------------|
| 1.1.1 | Non-text Content | All non-text content has a text alternative |
| 1.2.1 | Audio-only and Video-only (Prerecorded) | Prerecorded audio/video has an alternative |
| 1.2.2 | Captions (Prerecorded) | Captions provided for prerecorded audio in video |
| 1.2.3 | Audio Description or Media Alternative | Audio description or text alternative for prerecorded video |
| 1.3.1 | Info and Relationships | Structure and relationships conveyed through presentation are programmatically determinable |
| 1.3.2 | Meaningful Sequence | Correct reading sequence is programmatically determinable |
| 1.3.3 | Sensory Characteristics | Instructions don't rely solely on sensory characteristics |
| 1.4.1 | Use of Color | Color not used as the only visual means of conveying information |
| 1.4.2 | Audio Control | Mechanism to pause/stop/control audio that auto-plays |

## Operable

| Criterion | Name | Description |
|-----------|------|-------------|
| 2.1.1 | Keyboard | All functionality available from keyboard |
| 2.1.2 | No Keyboard Trap | Keyboard focus can be moved away from any component |
| 2.1.4 | Character Key Shortcuts | Single-character keyboard shortcuts can be turned off or remapped |
| 2.2.1 | Timing Adjustable | Time limits can be turned off, adjusted, or extended |
| 2.2.2 | Pause, Stop, Hide | Moving/blinking/scrolling content can be paused |
| 2.3.1 | Three Flashes or Below Threshold | No content flashes more than 3 times per second |
| 2.4.1 | Bypass Blocks | Mechanism to skip repeated blocks of content |
| 2.4.2 | Page Titled | Pages have descriptive titles |
| 2.4.3 | Focus Order | Focus order preserves meaning and operability |
| 2.4.4 | Link Purpose (In Context) | Purpose of each link determinable from link text or context |
| 2.5.1 | Pointer Gestures | All multi-point/path-based gestures have single-pointer alternatives |
| 2.5.2 | Pointer Cancellation | Single-pointer actions can be cancelled or undone |
| 2.5.3 | Label in Name | Visible label text is part of the accessible name |
| 2.5.4 | Motion Actuation | Functionality triggered by motion has UI alternatives |

## Understandable

| Criterion | Name | Description |
|-----------|------|-------------|
| 3.1.1 | Language of Page | Default language of page is programmatically determinable |
| 3.2.1 | On Focus | Receiving focus doesn't trigger unexpected context change |
| 3.2.2 | On Input | Changing input setting doesn't trigger unexpected context change |
| 3.3.1 | Error Identification | Input errors identified and described in text |
| 3.3.2 | Labels or Instructions | Labels or instructions provided for user input |

## Robust

| Criterion | Name | Description |
|-----------|------|-------------|
| 4.1.1 | Parsing | Markup can be reliably parsed (no duplicate IDs, complete tags) |
| 4.1.2 | Name, Role, Value | UI components have accessible name, role, and value |
```

- [ ] **Step 2: Create WCAG Level AA page**

Create `docs-site/content/reference/wcag/level-aa.mdx`:
```mdx
---
title: WCAG 2.1 Level AA
description: WCAG 2.1 Level AA success criteria checked by ClearSight (in addition to Level A).
---

# WCAG 2.1 Level AA

Level AA includes all Level A requirements plus these additional criteria. This is the standard most organizations target for accessibility compliance.

## Perceivable

| Criterion | Name | Description |
|-----------|------|-------------|
| 1.2.4 | Captions (Live) | Captions for all live audio content in synchronized media |
| 1.2.5 | Audio Description (Prerecorded) | Audio description for all prerecorded video content |
| 1.3.4 | Orientation | Content doesn't restrict view to a single display orientation |
| 1.3.5 | Identify Input Purpose | Input purpose can be programmatically determined for personal data fields |
| 1.4.3 | Contrast (Minimum) | Text has contrast ratio of at least 4.5:1 (3:1 for large text) |
| 1.4.4 | Resize Text | Text can be resized up to 200% without loss of content or functionality |
| 1.4.5 | Images of Text | Text used instead of images of text except for logos |
| 1.4.10 | Reflow | Content reflows in 400 CSS pixels width without horizontal scrolling |
| 1.4.11 | Non-text Contrast | UI components and graphical objects have 3:1 contrast against adjacent colors |
| 1.4.12 | Text Spacing | No loss of content when overriding letter/word/line spacing |
| 1.4.13 | Content on Hover or Focus | Hoverable/focusable content that appears can be dismissed, hovered, and persists |

## Operable

| Criterion | Name | Description |
|-----------|------|-------------|
| 2.4.5 | Multiple Ways | More than one way to locate a page in a set of pages |
| 2.4.6 | Headings and Labels | Headings and labels describe topic or purpose |
| 2.4.7 | Focus Visible | Keyboard focus indicator is visible |

## Understandable

| Criterion | Name | Description |
|-----------|------|-------------|
| 3.1.2 | Language of Parts | Language of each passage or phrase can be programmatically determined |
| 3.2.3 | Consistent Navigation | Navigation appearing on multiple pages is in the same relative order |
| 3.2.4 | Consistent Identification | Components with same functionality are identified consistently |
| 3.3.3 | Error Suggestion | Suggestions provided for input errors when known |
| 3.3.4 | Error Prevention (Legal, Financial, Data) | Submissions can be checked, confirmed, or reversed |

## Robust

| Criterion | Name | Description |
|-----------|------|-------------|
| 4.1.3 | Status Messages | Status messages can be programmatically determined without focus |
```

- [ ] **Step 3: Create axe-core Rule Index page**

Create `docs-site/content/reference/wcag/axe-core-rules.mdx`:
```mdx
---
title: axe-core Rule Index
description: All axe-core rules checked by ClearSight, mapped to WCAG criteria.
---

import { Callout } from 'nextra/components'

# axe-core Rule Index

ClearSight runs all axe-core rules that map to WCAG 2.1 Level A and AA. Below is a reference of the most commonly flagged rules.

<Callout type="info">
  For the full axe-core rule list, see the [axe-core documentation](https://github.com/dequelabs/axe-core/blob/master/doc/rule-descriptions.md).
</Callout>

## Critical rules (Level A)

| Rule ID | Description | WCAG |
|---------|-------------|------|
| `image-alt` | Images must have alternate text | 1.1.1 A |
| `button-name` | Buttons must have discernible text | 4.1.2 A |
| `label` | Form elements must have labels | 1.3.1 A |
| `link-name` | Links must have discernible text | 2.4.4 A |
| `document-title` | Documents must have a `<title>` element | 2.4.2 A |
| `html-has-lang` | `<html>` element must have a lang attribute | 3.1.1 A |
| `keyboard` | Content must be accessible by keyboard | 2.1.1 A |
| `duplicate-id` | IDs must be unique | 4.1.1 A |

## Serious rules (Level AA)

| Rule ID | Description | WCAG |
|---------|-------------|------|
| `color-contrast` | Text must meet 4.5:1 contrast ratio | 1.4.3 AA |
| `aria-allowed-attr` | ARIA attributes must be allowed for element's role | 4.1.2 A |
| `aria-required-attr` | Required ARIA attributes must be provided | 4.1.2 A |
| `aria-valid-attr-value` | ARIA attribute values must be valid | 4.1.2 A |
| `landmark-one-main` | Page must have one main landmark | 1.3.1 A |
| `region` | All page content must be contained in landmarks | 1.3.1 A |

## Moderate rules

| Rule ID | Description | WCAG |
|---------|-------------|------|
| `heading-order` | Heading levels must only increase by one | 1.3.1 A |
| `list` | `<ul>` and `<ol>` must contain only `<li>` elements | 1.3.1 A |
| `listitem` | `<li>` elements must be inside a list | 1.3.1 A |
| `table-duplicate-name` | Table summary and caption must not have the same value | 1.3.1 A |
| `td-headers-attr` | Table cells must have headers with valid IDs | 1.3.1 A |

## Custom engine rules (not axe-core)

| Rule ID | Engine | Description | WCAG |
|---------|--------|-------------|------|
| `link-text-quality` | LinkTextEngine | Link text must be descriptive (not "click here", "read more") | 2.4.4 A |
| `touch-target-size` | TouchTargetEngine | Interactive elements must be at least 24×24px | 2.5.5 AA |
```

- [ ] **Step 4: Create Changelog page**

Create `docs-site/content/reference/changelog.mdx`:
```mdx
---
title: Changelog
description: ClearSight release history.
---

# Changelog

## Unreleased

- Docs site overhaul — dual-audience structure with User Guide, Developer Guide, and Reference sections

## v1.0.0

- Full-site crawl with BFS link discovery and sitemap.xml support
- Issue tracking across crawls (new, fixed, recurring)
- AI enrichment with Azure OpenAI (descriptions, fix suggestions, scoring)
- Visual Inspector with page screenshot and HTML view
- PDF and Excel export
- Chrome extension (Manifest V3)
- Bull Board queue monitoring
- Nextra docs site
- Docker Compose for dev and production
- SSRF prevention (private IP blocking)
- In-memory rate limiting (10 scans/hour per IP)
```

- [ ] **Step 5: Create Roadmap page**

Create `docs-site/content/reference/roadmap.mdx`:
```mdx
---
title: Roadmap
description: Planned features and known limitations.
---

# Roadmap

## Planned

- **Authentication support** — scan pages behind login (cookie injection or browser session replay)
- **WCAG 2.2 support** — additional criteria beyond WCAG 2.1
- **Scheduled crawls** — cron-based automatic re-crawls
- **Webhook notifications** — alerts when new Critical issues appear
- **Interactive API playground** — try API endpoints from the docs
- **Chrome Web Store listing** — one-click extension install
- **Multi-user support** — accounts, teams, and access control
- **Redis-backed rate limiting** — support horizontal scaling

## Known limitations

- No authentication support for scanning protected pages
- JavaScript-only navigation not followed during crawl discovery
- `robots.txt` not respected
- Single-instance rate limiter (resets on restart, not shared across instances)
- Scans use desktop viewport only (no mobile)
- WCAG 2.2 not yet covered
```

- [ ] **Step 6: Commit**

```bash
git add docs-site/content/reference/
git commit -m "docs: add Reference section — WCAG criteria, axe-core rules, changelog, roadmap"
```

---

## Task 13: Final Verification

- [ ] **Step 1: Build the docs site**

```bash
cd docs-site && pnpm build
```

Expected: Build completes with no errors.

- [ ] **Step 2: Check all sidebar sections render**

```bash
cd docs-site && pnpm start
```

Open `http://localhost:3002` and verify:
- Home page shows role-picker cards
- Sidebar shows: User Guide, Developer Guide, Reference
- All three top-level sections expand correctly
- All ~35 pages load without 404

- [ ] **Step 3: Check internal links**

Click through the "Next steps" links on at least 5 pages and verify they resolve correctly.

- [ ] **Step 4: Final commit**

```bash
git add docs-site/
git commit -m "docs: complete docs site overhaul — dual-audience structure with ~35 pages"
```
