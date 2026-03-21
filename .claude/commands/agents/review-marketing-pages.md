# Marketing Pages Review Agent

Review landing page, How it Works, and FAQ pages for quality, SEO, performance, and accessibility.

## What to Check

### Landing Page (`src/app/page.tsx`, `src/components/landing/`)
- Hero section loads fast (no heavy animations blocking paint)
- CTA buttons are prominent and have clear action text
- Value proposition is clear above the fold
- Feature descriptions are accurate to actual product capabilities
- Comparison table is fair and factual
- Metrics/stats are real or clearly illustrative

### Component Quality
- `Hero.tsx` — Animation performance (uses CSS/Motion, not JS timers)
- `Features.tsx` — Icons match feature descriptions
- `HowItWorks.tsx` — Steps match actual product flow
- `Comparison.tsx` — Data is accurate
- `FAQ.tsx` — Answers are helpful and accurate
- `Footer.tsx` — Links work, standards referenced are correct (W3C, Section 508)
- `CTABand.tsx` — Clear call to action
- `Navbar.tsx` — Navigation is functional, responsive

### How it Works Page (`src/app/how-it-works/page.tsx`)
- Pipeline stages described match actual implementation
- Technical details are accurate (BFS crawl, axe-core, AI enrichment)
- Concurrency numbers match defaults (3 Playwright, 2 AI)
- No broken links or placeholder content

### FAQ Page (`src/app/faq/page.tsx`)
- Questions cover common user concerns
- Answers are accurate to product behavior
- Accordion/collapse interaction works correctly
- No duplicate questions

### SEO
- Pages have proper `<title>` and meta descriptions
- Heading hierarchy is correct (single h1, logical h2/h3)
- Images have alt text
- Links have descriptive text (not "click here")

### Performance
- Motion/Framer Motion animations are GPU-accelerated (transform/opacity)
- No layout shifts from loading animations
- Images optimized (WebP/AVIF if applicable)
- No unnecessary client-side JavaScript on static marketing pages

### Accessibility
- All interactive elements keyboard-accessible
- Sufficient color contrast
- Skip-to-content link exists (or main landmark)
- Animations respect `prefers-reduced-motion`

### Responsiveness
- Pages look good on mobile (375px), tablet (768px), desktop (1280px+)
- No horizontal scrolling
- Touch targets are large enough (44x44px minimum)
- Text is readable at all breakpoints

## Files to Focus On
- `src/app/page.tsx` — Landing page
- `src/app/how-it-works/page.tsx` — How it Works
- `src/app/faq/page.tsx` — FAQ
- `src/components/landing/*.tsx` — All landing components
- `src/components/Logo.tsx` — Logo component

## Output Format
List findings as:
- **[BLOCKER]** or **[SUGGESTION]** or **[GOOD]**
- File path and line number
- Brief explanation and fix recommendation
