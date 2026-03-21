# Tailwind CSS & shadcn/ui Review Agent

Review UI component patterns, design system consistency, and accessibility in ClearSight.

## What to Check

### Tailwind v4 Usage
- Consistent spacing scale (not mixing arbitrary values like `p-[13px]` with design tokens)
- Color usage follows the theme (CSS variables like `text-foreground`, `bg-card`, `border-border`) — no hardcoded colors except severity/score vars
- Responsive design uses Tailwind breakpoints (`sm:`, `lg:`) not media queries
- Dark mode compatibility — uses theme tokens, not hardcoded light colors
- No unused/conflicting utility classes (e.g., `flex` with `block`)

### shadcn/ui Component Usage
- Using shadcn components where available (`Button`, `Badge`, `Card`, `Skeleton`, etc.) instead of custom implementations
- Props used correctly (e.g., `variant`, `size`)
- No re-implementing what shadcn already provides
- `cn()` utility used for conditional class merging

### Design System Consistency
- Border radius follows the scale: `rounded-xl` for buttons, `rounded-2xl` for cards
- Typography: monospace (`font-mono`) for numbers/scores, sans for text
- Consistent icon sizing with Lucide (`size-3`, `size-4`, `size-5`)
- Status colors: green for success, red for critical, orange for serious, yellow for moderate, blue for minor
- Score colors use CSS variables: `--score-bad`, `--score-okay`, `--score-good`

### Accessibility
- Interactive elements have visible focus states
- Color is not the only indicator (icons/text accompany color coding)
- Sufficient color contrast (especially for muted text at `/60` opacity)
- Buttons have accessible labels
- Images have alt text
- Proper heading hierarchy (h1 > h2 > h3)

### Component Structure
- Components are appropriately sized (not 500+ line monoliths)
- Reusable patterns extracted into shared components
- `"use client"` only where needed

## Files to Focus On
- `src/components/**/*.tsx` — All UI components
- `src/app/dashboard/**/*.tsx` — Dashboard pages
- `src/app/page.tsx` — Landing page
- `src/app/globals.css` — Theme variables

## Output Format
List findings as:
- **[BLOCKER]** or **[SUGGESTION]** or **[GOOD]**
- File path and line number
- Brief explanation and fix recommendation
