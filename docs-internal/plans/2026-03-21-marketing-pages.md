# ClearSight Marketing Pages Plan

Based on analysis of: TestMu AI, Siteimprove, BrowserStack, AccessibilityChecker.org, accessiBe accessScan, Silktide

---

## Homepage (`/`) — Section by Section

### 1. Hero (above the fold, compact)
- **Headline:** "Your website has accessibility issues. We'll find every one."
- **Subheadline:** "AI-powered WCAG 2.1 scanning with prioritized fixes. Free. No signup. Results in minutes."
- **CTA:** URL input + "Scan Now" button (centered)
- **Below input:** Compliance badges row — WCAG 2.1 · ADA · Section 508 · EAA (small, horizontal)
- **Design:** Light background, centered layout, no product screenshot here. Clean, focused.

### 2. Social Proof / Built With
- "Built on axe-core — the same engine used by Microsoft, Google, and the U.S. government"
- Show: axe-core logo, Playwright logo, Azure OpenAI wordmark
- When we have users: swap to customer logos + "Trusted by X teams"

### 3. How It Works (3 Steps)
- **Heading:** "Three steps to a full audit"
- Step 1: **Enter your URL** — "Paste any public URL. We render the full page in a real Chromium browser."
- Step 2: **AI scans every page** — "50+ WCAG 2.1 rules. Custom engines for link text and touch targets. 3 concurrent browsers."
- Step 3: **Get actionable fixes** — "Each issue gets an AI-generated description, fix suggestion, and severity score."
- Below steps: A product screenshot/mockup showing actual scan results (NOT in a fake browser chrome — just a clean screenshot with a subtle shadow)

### 4. Feature Grid (2x3)
- **Heading:** "Everything you need for compliance"
- WCAG 2.1 Level A & AA
- AI-enriched fix suggestions
- Full-site crawling
- Issue tracking across crawls
- Visual element inspector
- PDF & Excel export

### 5. Sample Report Preview
- **Heading:** "See what you'll get"
- Interactive or static preview showing: score gauge, AI summary, top priorities, 2-3 issue cards
- This is the money section — none of the competitors do this well
- CTA: "Scan your site to get your own report"

### 6. Comparison Table
- **Heading:** "Why teams choose ClearSight"
- 3 columns: ClearSight | Free scanners (WAVE, Lighthouse) | Manual audit firms
- Rows: AI fix suggestions, WCAG coverage, severity scoring, time to results, cost, export options, element-level detail
- ClearSight wins on "deeper than free, faster than manual, AI-powered"

### 7. FAQ (top 5, with "See all →" link)
- Is the scan really free?
- What WCAG criteria do you check?
- How is this different from WAVE or Lighthouse?
- How does the AI enrichment work?
- Can I scan pages behind a login?

### 8. Bottom CTA
- "Your users deserve an accessible web."
- URL input repeated + "Scan Now"
- "Free scan. No signup. Results in under 2 minutes."

### 9. Footer
- Product links, standards links (with official URLs), "Built with axe-core and AI"

---

## Additional Marketing Pages

### `/how-it-works` (already exists, needs update)
- Detailed 4-stage pipeline with technical depth
- Architecture section (3 queues, concurrent scanning, fault tolerance)
- CTA at bottom

### `/faq` (already exists, needs update)
- Full 10+ question FAQ
- CTA at bottom

### `/pricing` (NEW)
- "Free during development" with future tier hints
- Free: unlimited scans, basic export
- Pro (coming): API access, scheduled crawls, team features
- Enterprise (coming): custom integrations, SLA, dedicated support
- Transparent, builds trust

### `/wcag-checklist` (NEW — major SEO play)
- Complete WCAG 2.1 Level A & AA success criteria list
- Each criterion: what it means, whether ClearSight checks it, common failures
- This page will rank for "WCAG checklist" searches — high intent traffic

### `/for-developers` (NEW)
- Technical angle: axe-core foundation, Playwright rendering, pipeline stages
- Future: API access, CI/CD integration, GitHub Actions
- Code snippets, technical architecture

### `/for-agencies` (NEW)
- "Scan your clients' sites and deliver branded reports"
- PDF/Excel export emphasis
- Bulk scanning, time savings vs manual audits
- ROI framing

### `/sample-report` (NEW — highest leverage page)
- Public, interactive example of a completed scan
- Real data from scanning a public site
- Visitors see exactly what they'll get before entering their own URL
- NONE of the 6 competitors do this

### `/accessibility-statement` (NEW — table stakes)
- ClearSight's own accessibility commitment
- What we do to ensure our own site is accessible
- VPAT/conformance information
- Contact for accessibility feedback

---

## Design Principles (from competitor analysis)

1. **Light theme** — accessibility tool should practice what it preaches
2. **No dark hero sections** — keep it clean, readable, trustworthy
3. **Compliance badges near hero** — instantly communicate scope (WCAG, ADA, Section 508, EAA)
4. **URL input is the hero CTA** — converts curiosity to action with zero friction
5. **3-step simplicity** — reduce perceived complexity
6. **Comparison table** — help buyers evaluate (stolen from BrowserStack)
7. **Sample report** — show don't tell (unique differentiator)
8. **No superlatives without proof** — never "#1", always specific ("50+ rules", "under 2 minutes")
9. **No overlay/quick-fix positioning** — "code-level fixes, not band-aids"
10. **Restrained CTAs** — quality over quantity (4-5 max per page, not 15)

---

## Implementation Priority

1. **Homepage redesign** (this is the priority)
2. `/pricing` page
3. `/wcag-checklist` page (SEO)
4. `/sample-report` page
5. Update `/how-it-works` and `/faq`
6. `/for-developers` and `/for-agencies`
7. `/accessibility-statement`
