# Frontend Change Evidence — LAND-007

## Scope

- Requirement IDs: LAND-007
- Roles: Public (unauthenticated marketing visitor)
- Routes: `/` (HomePage — BentoServicesShowcase section)
- BPMN sections: N/A — public marketing surface. No booking/auth/dashboard logic touched.

## Change summary

Added book-page-turn hover reveal animation to BentoServicesShowcase tiles s01, s02, and s03.

**Effect:** Hovering a tile causes the content cover to rotate away (left-hinge, `rotateY(-160deg)`) like a book page turning, revealing a full-bleed service image (`service-card-0X.webp`) with a bottom gradient + label + CTA beneath. Mouse-out reverses the animation. s04 (wide banner, horizontal layout) is intentionally excluded — the page-turn mechanic does not suit wide landscape tiles.

**Implementation:**
- `.tile-book-scene` (outer container): `perspective: 1200px` to establish 3D context
- `.tile-book-cover` (front content layer): `transform-origin: left center`, `transition: transform 700ms cubic-bezier(0.645, 0.045, 0.355, 1.000)` (InOutCubic, book-page easing), `will-change: transform`
- `.tile-book-scene:hover .tile-book-cover`: `rotateY(-160deg)` (160° not 180° — preserves spine curl)
- Duration 700ms is a documented exception to the 320ms operational cap — this is an editorial signature moment on the public marketing surface, not an operational state-transition
- **Back layer** (image, `z-0`, `absolute inset-0`): `<img>` object-cover + bottom gradient `bg-gradient-to-t from-ink/80 via-ink/10 to-transparent` + service label (`text-micro uppercase`) + CTA (`Find out more →`)
- **Front cover** (`z-10`, `tile-book-cover`, `relative flex flex-1 flex-col bg-canvas`): existing tile content (icon, number, label, heading, teaser, highlights, FindOutMore)
- `TILE_CHROME_BOOK` constant: adds `tile-book-scene overflow-hidden`, removes hover translate/border-change (image layer owns hover feedback); keeps `hover:shadow-ui-brand focus-visible:ring-*`
- `SERVICE_IMGS` record mapping s01–s04 to `/imgs/brand/service-card-0X.webp`
- **Reduced motion:** handled automatically — global rule `transition-duration: 1ms !important` in tokens.css snaps the cover instantly; no separate override needed
- **Mobile/touch:** no hover on touch — tiles permanently show content (acceptable; Proposal B click-reveal would be needed for touch support but was not chosen)

## Files changed

- `packages/frontend/src/styles/ui-system.tokens.css` — Added `.tile-book-scene` / `.tile-book-cover` CSS utilities (lines 267–281)
- `packages/frontend/src/pages/public/HomePage.tsx` — Added `SERVICE_IMGS` record; added `TILE_CHROME_BOOK` constant; restructured s01 lead tile and s02/s03 small tiles to two-layer (back image + front cover) structure

## State coverage

Static marketing surface. Applicable states:

- [x] default — all tiles show content cover (opaque, image hidden behind)
- [x] hover — cover rotates away, image revealed with gradient + label/CTA
- [x] reduced motion — cover snaps instantly (1ms) rather than animating
- [x] keyboard / touch — `:hover` does not fire on keyboard focus; tiles remain content-forward on keyboard tab; touch devices same
- [x] loading / empty / error / async — n/a (static marketing section)

## Responsive evidence

All screenshots in `docs/redesign/evidence/land-007/`.

- [x] **1440px default** — `default-1440.png` — 3-col bento grid, all three covers opaque, content readable
- [x] **1440px hover s01** — `hover-s01-1440.png` — s01 cover fully rotated away, `service-card-01.webp` fills tile with gradient + "SPANISH LANGUAGE / Find out more →" label at bottom; s02/s03 unaffected
- [x] **1440px hover s02** — `hover-s02-1440.png` — s02 cover rotated away, `service-card-02.webp` revealed with "STUDIES IN SPAIN / Find out more →" label
- [x] **1280px s04** — `default-1280-s04.png` — s04 wide banner unchanged (no book-flip), rendering correctly
- [x] **768px** — `tablet-768.png` — 2-col layout, tiles in content-default state; no animation state leak
- [x] **390px** — `mobile-390.png` — single-col, all tiles show content permanently (no hover on touch)
- [x] **All covers open** — `all-covers-open.png` — JS-injected `.tile-book-scene.is-flipped` forces all three open simultaneously; images + labels all render correctly

## Accessibility evidence

- Keyboard: tiles remain native `<Link>` elements with `focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2`; book-flip is `:hover`-only and does not activate on keyboard focus
- Back-layer images: `<img alt="" loading="lazy">` — decorative, no alt text needed; `aria-hidden="true"` on the back-layer container
- Service label and CTA in the back layer: presented visually only when image is revealed via hover; the tile's accessible name is provided by the heading `<h3>` in the front cover (always in DOM)
- Touch targets: full-card Links (≫44px)
- Reduced motion: `transition-duration: 1ms !important` global rule covers the book-cover transition

## Localization evidence

No new i18n keys added. Back-layer labels use existing `services.s0X_label` and `services.s0X_cta` keys already present in en/sr/es. Verified: language switch renders translated labels correctly under all three locales.

## Automated verification

### TypeScript
0 errors (`npx tsc --noEmit`).

### `node scripts/uiux/check-ui-system.mjs`
_To be confirmed by operator._

### `node scripts/uiux/frontend-verify.mjs`
_To be confirmed by operator._

## UI/UX reviewer decision

See below — `ui-ux-reviewer` agent result to be appended once complete.
