# LAND-001 — Paella Scroll-Story Landing Page

**Requirement:** Redesign the public landing page (`/`) with a trending scroll-driven
hero, using a culturally authentic paella-cooking metaphor. Dark cinematic hero with a
scroll-scrubbed cooking video; editorial below-fold sections on the Editorial Teaching
Studio semantic token system.

**Route:** `/` (public) — [HomePage.tsx](../../../packages/frontend/src/pages/public/HomePage.tsx)
**Role:** Public / unauthenticated visitor
**Status:** Done

---

## What was built

A two-part landing page:

1. **Paella scroll-story hero** — a sticky, full-viewport section (`N × 100vh` tall) where
   an 8-second paella-cooking video is scrubbed by scroll position. As the visitor scrolls,
   `video.currentTime` advances from empty pan → oil → sofrito → rice + saffron broth →
   finished paella. Five narrative steps are overlaid at evenly-spaced scroll thresholds
   (`01 — LA BASE` … `05 — LA CONVERSACIÓN`), with a sticky headline and a saffron CTA that
   fades in on the final step.

2. **Below-fold sections** — dark→light bridge, stats strip, features grid (4-col),
   benefits (2-col), testimonials (3-col), and a final brand CTA. All on semantic tokens.

### Scroll-scrub mechanics
- `useScroll` (framer-motion) tracks section progress `0→1`.
- `useSpring` (stiffness 90 / damping 24) smooths the raw progress.
- `useMotionValueEvent` + `requestAnimationFrame` coalesce spring updates into **one video
  seek per animation frame** — this eliminates the scroll lag caused by flooding the decoder.
- The MP4 is re-encoded **all-keyframe** (`ffmpeg -g 1 -keyint_min 1 -sc_threshold 0`) so
  any seek is instant — no decode-from-start chain.
- `prefers-reduced-motion`: snaps to the nearest of the 5 step frames instead of continuous
  scrubbing.

### Responsive video strategy
| Viewport | Video | Fit | Notes |
|---|---|---|---|
| Desktop (≥768px) | `paella-cook.mp4` 1600×894 landscape | `object-cover` | full-bleed |
| Mobile (<768px) | `paella-cook-mobile.mp4` 1080×1080 square | `object-contain` | whole pan + both handles visible; letterbox filled by a blurred/dimmed poster backdrop (`blur-2xl brightness-75 scale-110`) so the slate table appears to extend past the pan |

`useIsMobile()` selects the source; a `key={videoSrc}` + reset effect re-covers the hero
with the poster when the breakpoint is crossed. On mobile the step copy and CTA stack
vertically (copy `bottom-24`, CTA `bottom-4` full-width centered); `sm+` places them
side-by-side.

### Fast first paint
- Lightweight WebP posters (56KB desktop / 61KB mobile, down from 1.78MB PNG) are layered
  over the video and fade out on `onCanPlayThrough`.
- `index.html` preloads the correct poster per viewport via media-scoped
  `<link rel="preload" as="image" fetchpriority="high">`.
- Measured: poster paints at ~45ms locally (vs the video streaming in behind it).

---

## Design system compliance

- **Semantic tokens only.** New always-dark marketing tokens added to
  [ui-system.tokens.css](../../../packages/frontend/src/styles/ui-system.tokens.css):
  `--ui-hero-bg`, `--ui-hero-fg`, `--ui-hero-step-label`, `--ui-hero-progress`,
  `--ui-hero-cta-bg/fg/hover`. These are theme-invariant because the hero is always dark
  regardless of app theme. Exposed as `hero.*` Tailwind aliases in
  [ui-system.tailwind.extend.cjs](../../../packages/frontend/ui-system.tailwind.extend.cjs).
- `h-progress-bar` height token + `hero-text-shadow` / `hero-text-shadow-sm` `@layer
  utilities` added so no arbitrary Tailwind values or raw hex appear in TSX.
- Below-fold uses existing `canvas`, `surface`, `ink`, `line`, `accent`, `brand`,
  `feedback-warning` semantic tokens.
- Guardrail (`check-frontend-guardrails.mjs`): passes — no raw color, palette class,
  legacy token, or arbitrary utility in HomePage.tsx.

## Internationalization
`paella.*` keys added in **en / sr / es** (`home.json`): sticky headline, 5 step
labels + copy, and CTA. Verified rendering in all three via the language switcher.

## Accessibility
- Video and posters are `aria-hidden` (decorative); all meaning is in the text overlays.
- `prefers-reduced-motion` respected (snap-to-step instead of continuous scrub).
- CTAs are real `<Link>`s inside `Button`; focus-visible rings via `focus-visible:ring-*`.
- Testimonial star ratings carry an `aria-label` ("N out of 5 stars"); stars themselves
  are `aria-hidden`.
- No color-only status; no interactive element is keyboard-inaccessible.

---

## Responsive evidence

Screenshots captured live from the running dev server (`http://localhost:5173/`):

| Viewport | Hero | Later state | Below-fold |
|---|---|---|---|
| 390 (mobile) | `390-01-hero.png` | `390-02-final-cta.png` | `390-03-belowfold.png` |
| 768 (tablet) | `768-01-hero.png` | `768-02-final-cta.png` | — |
| 1280 (laptop) | `1280-01-hero.png` | `1280-02-midscroll.png` | — |
| 1440 (desktop) | `1440-01-hero.png` | `1440-02-final-cta.png` | `1440-03-belowfold.png` |

Key observations:
- **390:** square pan fully visible; blurred slate backdrop fills letterbox (no flat black);
  copy + CTA stack cleanly with no overlap.
- **768:** switches to landscape full-bleed at the breakpoint.
- **1280 / 1440:** landscape full-bleed; copy bottom-left, CTA bottom-right; clean
  dark→light transition into the stats strip.

---

## Storybook
[HomePage.stories.tsx](../../../packages/frontend/src/pages/public/HomePage.stories.tsx) —
`Desktop`, `Mobile`, and `Tablet` stories document the composed page and its responsive
framing. (The mid-scroll video states depend on real scroll progress, which the Storybook
canvas does not drive; those states are captured as the viewport screenshots above.)
[Header.stories.tsx](../../../packages/frontend/src/components/layout/Header.stories.tsx) —
`LoggedOut` / `LoggedIn` cover the default top-sticky header layout in both auth states.

## Header behavior change (shared layout component)

[Header.tsx](../../../packages/frontend/src/components/layout/Header.tsx) gained a
landing-only mode so the video hero is fully immersive:

- **Route `/`, hero on screen:** the header is **not rendered** (returns `null`) — confirmed
  absent from the DOM (not merely hidden), so there are no phantom keyboard-focus targets
  over the video.
- **Route `/`, scrolled past the hero:** the header **slides down from the top** (320ms
  ease, reduced-motion honored) and pins as `fixed top-0` with a bottom border + shadow, so
  it stays available for the rest of the page (it does not attach to the footer).
- **All other routes:** unchanged `sticky top-0` layout — verified on `/about`
  (`position: sticky, top: 0`).

Decoupling: the header observes a `#landing-hero-end` sentinel (rendered at the end of the
HomePage hero) via `IntersectionObserver` + a scroll listener, rather than importing any
HomePage internals. `fixed` (not `sticky`) is used in the landing-top mode so the header is
out of the document flow — mounting it mid-scroll causes no reflow jump.

Accessibility of the top bar (verified live at 1440 and 390, `position: fixed, top: 0`):
logo, About, Contact, language switcher, and Login/menu are all keyboard-focusable with
accessible names. Evidence: `1440-04-top-header.png`, `390-04-top-header.png`.

## Independent reviews

- **ui-ux-reviewer: PASS.** Found one blocker (B1: hardcoded English star-rating
  `aria-label`) and two observations (O1: hero CTA tabbable while invisible; O2: confirm
  below-fold reduced-motion). All resolved and re-verified:
  - B1 → `testimonials.rating_aria` key added in en/sr/es; `aria-label` now uses `t(...)`.
  - O1 → hero CTA now also drives `visibility` (`ctaVisibility` useTransform → `hidden`
    until scroll ≥ 0.82), removing the invisible link from the tab order / a11y tree.
  - O2 → confirmed global `<MotionConfig reducedMotion="user">` at App.tsx:348 covers the
    below-fold `FadeUp`/`motion.li` animations.
- **visual-design-reviewer: PASS with observations.** Confirmed zero raw hex / arbitrary
  Tailwind values in HomePage.tsx; `--ui-hero-*` tokens cleanly scoped to the marketing hero
  (no leak into app UI); below-fold uses canonical Editorial Teaching Studio tokens; dark→light
  bridge is a deliberate handoff. Post-review cleanups applied: removed the unused
  `--ui-hero-overlay-from` token; swapped the benefits-image scrim from `from-hero-bg/40` to
  the semantic `from-ink/40` so no hero token is used below the fold.

## Engineering checks
- TypeScript: `tsc --noEmit` — **0 errors**.
- Lint: **0 errors** on HomePage.tsx (repo-wide warnings pre-existing, unrelated).
- Guardrail hook: passes on HomePage.tsx, ui-system.tokens.css, tailwind extend.

## Assets
- `packages/frontend/public/imgs/paella-cook.mp4` — 1600×894, all-keyframe, ~11MB
- `packages/frontend/public/imgs/paella-cook-mobile.mp4` — 1080×1080, all-keyframe, ~8.5MB
- `packages/frontend/public/imgs/paella-poster.webp` — 56KB
- `packages/frontend/public/imgs/paella-poster-mobile.webp` — 61KB
- `packages/frontend/public/imgs/paella-5.webp` — 68KB (benefits section)
- `packages/frontend/public/imgs/paella-1.png … paella-5.png` — source frames (poster origin)

## Known limitations
- **No automated E2E** for the scroll-scrub (Playwright scroll → `video.currentTime`
  assertion was verified manually: scroll 0.1/0.35/0.6/0.98 → currentTime 0.84/3.36/5.87/8.02s;
  a committed spec is deferred).
- The 11MB desktop video downloads after first paint (non-blocking). A future optimization
  could gate the video load behind an IntersectionObserver or drop to 1280px (~7MB).
- Storybook cannot exercise the scroll-driven video states; documented via screenshots.
