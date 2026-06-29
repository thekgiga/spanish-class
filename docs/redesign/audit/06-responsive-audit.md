# Responsive behavior audit

## Breakpoints

[packages/frontend/tailwind.config.js](../../../packages/frontend/tailwind.config.js) uses Tailwind defaults — no custom breakpoint set:

| Token | Width |
|---|---|
| `sm` | 640px |
| `md` | 768px |
| `lg` | 1024px |
| `xl` | 1280px |
| `2xl` | 1536px |

Editorial Teaching Studio breakpoints in [design-tokens.json](../../ui-system/design-tokens.json):

| Token | Width |
|---|---|
| `mobile` | 768px |
| `desktop` | 1200px |
| `wide` | 1440px |

Phase 1 merges these as semantic Tailwind tokens via [ui-system.tailwind.extend.cjs](../../../packages/frontend/ui-system.tailwind.extend.cjs).

## Required verification widths (per `.claude/rules/frontend/responsive.md`)

- 390px (mobile)
- 768px (tablet)
- 1280px (desktop)
- 1440px (wide)

## Current automated coverage

[packages/frontend/playwright.config.ts](../../../packages/frontend/playwright.config.ts) projects:

| Project | Approx viewport |
|---|---|
| `chromium` | 1280×720 (Desktop Chrome default) |
| `firefox` | 1280×720 |
| `webkit` | 1280×720 |
| `mobile-chrome` (Pixel 5) | 393×851 |
| `mobile-safari` (iPhone 12) | 390×844 |

**Gaps:** No project covers 768px (tablet) or 1440px (wide). Tests that need precise 390/768/1280/1440 must override viewport per-test.

## Responsive patterns in code

- `DashboardLayout` uses a sidebar fixed at `lg:` (1024+); on smaller widths the sidebar slides off-screen and a hamburger button appears.
- `MobileNav` is shown via Header on viewports below `md` (768).
- Public pages mix `md:` and `lg:` for grid changes (e.g. 1col → 2col → 3col).
- `BookPage` does not yet implement the date-carousel-then-time-list pattern required for mobile by `responsive.md`.
- `CalendarPage` renders the same week layout regardless of viewport — the rule forbids compressing a seven-day calendar into a phone viewport.

## Per-role responsive expectations (per rule file)

### Professor

- Desktop: persistent navigation + week calendar + contextual right drawer.
- Tablet: collapsible navigation + day/three-day calendar + overlay drawer.
- Mobile: agenda/day schedule + bottom navigation + bottom sheet for details.

### Student

- Desktop booking: date context + available-time choices.
- Mobile booking: date carousel/list, time cards, sticky request action.

### Cross-cutting

- No horizontal scrolling except intentional calendar/date-strip behavior.
- Responsive change may alter the interaction model (e.g. drawer → bottom sheet), not only the layout.

## Phase 1+ responsive work

Phase 1 (UI system foundation) does not migrate pages; it provides primitives that pages will compose. Per-page responsive verification happens in the phase that migrates each flow (Phase 3 for professor schedule, Phase 4 for student booking, etc.).

Until then, baseline E2E coverage runs on `chromium` (1280×720) only — see [evidence/phase-0-baseline.md](../evidence/phase-0-baseline.md). Expanding to 390/768/1280/1440 Playwright projects is matrix row `RESP-001` and is owed by Phase 7 polish work.
