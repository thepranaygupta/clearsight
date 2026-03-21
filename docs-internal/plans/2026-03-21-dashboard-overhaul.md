# ClearSight Dashboard UI Overhaul Plan

Based on: Chrome MCP audit of all 7 dashboard pages + analysis of 5 reference mockups + competitor research

---

## Phase 1: Design Foundation
**All other phases depend on this. Do first.**

### ~~1.1 Typography~~ SKIPPED
Keep Geist Sans/Mono. No font change needed.

### ~~1.2 Colors~~ SKIPPED
Keep red primary (#E90029). No color change.

### 1.1 Border Radius
- `--radius: 0.625rem` → `0.25rem` (sharper, professional)
- Bulk replace `rounded-2xl` → `rounded-lg` across all dashboard components
- Keep `rounded-full` for pills/avatars
- File: `globals.css` + bulk find-replace across ~15 component/page files

### 1.2 Design Tokens
- New `src/lib/design-tokens.ts` — centralize severity colors/labels/icons
- Currently duplicated in 9+ files (IssueCard, IssueGroup, IssueTabs, ScoreGauge, ScanHistory, Sidebar, InspectorSidebar, issues page, site overview)
- Export: `SEVERITY_CONFIG`, `getScoreColor()`, `getScoreLabel()`
- Add severity background vars to `globals.css`: `--severity-critical-bg`, etc.

---

## Phase 2: Core Components (highest visual impact)

### 2.1 Issue Cards Redesign
- Add 3px left accent border colored by severity
- Pill-shaped severity badge (icon + text + colored bg)
- WCAG criterion in bordered monospace pill
- Element selector in code format
- AI fix panel: add confidence score badge
- File: `src/components/results/IssueCard.tsx`

### 2.2 Shared Components
- New `<SeverityBadge severity="critical" />`
- New `<WcagPill criterion="2.4.4" level="AA" />`
- New `<EmptyState icon title description action />`

### 2.3 Score Sections
- Include total issues + severity breakdown chips inline on all score cards
- Quick action links ("View all issues →", "View all pages →")

---

## Phase 3: Page-Level Fixes

### 3.1 Main Dashboard (`/dashboard`)
**Currently:** Marketing splash with URL input
**Fix:** Add recent activity below scan form — recent scans as table, aggregate stats if sites exist

### 3.2 Site Overview
- Add breadcrumbs: Dashboard > pranaygupta.in
- Issue breakdown by severity (already partially done)
- Pages as table rows (Path | Score | Issues) not cards
- Crawl history as tighter table rows

### 3.3 Crawl Detail
- Group issues by WCAG rule (not flat list of identical items)
- Show new/fixed/recurring badges on issues
- Add severity to issue cards in the list

### 3.4 Issues List
- **Bug fix:** Severity count mismatch (248 total vs 50 in chips)
- Group by WCAG rule
- Add search input
- Left accent borders on cards
- Breadcrumbs: Dashboard > pranaygupta.in > Issues

### 3.5 Pages List
- Convert from cards to table: Path | Score | Issues | Last Scanned
- Add sort controls
- Breadcrumbs

### 3.6 Page Detail
- Add issue breakdown (top issues inline)
- Add scan timestamps to history
- Make "View full results" more prominent
- Breadcrumbs

---

## Phase 4: Interactions & Polish

### 4.1 Navigation
- Add breadcrumbs to ALL dashboard pages
- Page-specific document titles

### 4.2 Mobile
- Fix spacing on mobile dashboard, site overview
- Stack stat cards vertically
- Responsive tables

### 4.3 Feedback
- Toast notifications for actions (dismiss, can't fix)
- Consistent empty/error states using shared component

### 4.4 Accessibility
- Focus-visible rings on interactive elements
- Form fields with proper id/name attributes
- Keyboard navigation

---

## Implementation Order

| Priority | Work | Impact |
|----------|------|--------|
| **First** | Phase 1 (radius + tokens) + Phase 2 (issue cards, shared components) | Entire app looks sharper, issue cards transform |
| **Second** | Phase 3.1-3.4 (dashboard, site overview, crawl detail, issues list) | Core pages feel complete |
| **Third** | Phase 3.5-3.6 + Phase 4.1-4.2 (remaining pages, breadcrumbs, mobile) | Polish |
| **Fourth** | Phase 4.3-4.4 (feedback, accessibility) | Professional finish |
