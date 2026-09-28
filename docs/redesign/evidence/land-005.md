# Frontend Change Evidence — LAND-005

## Scope

- Requirement IDs: LAND-005
- Roles: Public (unauthenticated marketing visitor)
- Routes: `/` (HomePage). Deep-links out to `/services#s01…#s04`, `/about`, `/how-it-works`, `/contact`.
- BPMN sections: N/A — public marketing surface (lead acquisition / top-of-funnel). No booking/auth/dashboard logic touched.

## Change summary

Repositioned the homepage as the primary selling surface:

- **Replaced** the thin symmetric 4-icon `ServicesPreviewSection` with `BentoServicesShowcase` — an asymmetric bento grid that surfaces condensed service content directly on the homepage. The section keeps `id="services-preview"` so the hero's "Explore our services" ghost CTA still scrolls correctly.
  - Lead tile **s01** (Spanish language — the primary one-to-one product) spans 2 cols × 2 rows at `lg`, text-forward editorial tile: accent icon chip (`bg-accent-soft` + Lucide `Languages` icon) + ghost ordinal `text-ink/15` + `SectionLabel` + Playfair heading + teaser + bottom-anchored proof-point list + reveal CTA.
  - Small tiles **s02** / **s03**: same structure at smaller scale (`p-6`, `text-lg` heading).
  - Wide banner **s04** spans full width at `lg` (`sm:col-span-2 lg:col-span-3`), `sm:flex-row` two-column layout (left rail: icon chip + ghost ordinal; right: label + heading + teaser).
  - Every tile is a `Link` to `/services#${key}` — deep-link contract preserved. "Find out more" reveal-on-hover affordance is `aria-hidden="true"` (decorative; tile heading provides the accessible name).
  - Ghost ordinal spans throughout are `aria-hidden="true"` (decorative counting numbers).
  - "Explore all services" `Button` → `/services` retained.
- **Added** `HowItWorksTeaser` — a 4-step methodology band (reusing `how_we_work.*` step keys from the correct `<ol>`/`<li>` list structure) with a ghost `Button` → `/how-it-works`. **Wave trajectory redesign (LAND-006):** the flat 4-col equal-card grid was replaced with an animated SVG cubic-bezier wave path (`motion.path`, `pathLength 0→1`, draws L→R on scroll) + alternating zigzag step layout (steps 1,3 content-above/node-below; steps 2,4 node-above/content-below). Mobile: `SpineRail` + `SpineNode` vertical timeline using existing `editorial-helpers.tsx` primitives. Padding moved to `<li>` so SpineNode aligns with SpineRail on mobile/tablet (BLOCK-1 fix).
- **Kept** hero, value-intro (about + mission), and final CTA unchanged.

## Before

Homepage: video hero → about/mission → thin 4-icon services teaser (symmetric grid, no methodology sell) → final CTA. Only linked to `/about`, `/services`, `/contact`. `/how-it-works`, `/faq`, `/elite-guide` ignored. Full services selling copy was buried on `/services` (dense single section: 4 cards, ~50-word paragraphs, 30 bullets).

Prior implementation used baked-in raster images (`service-card-0x.webp`) with text overlaid in the image files — those images couldn't be localised and named a different service than the tile copy beneath them (visual-design-reviewer blocking finding B1 on the first pass). B1 is resolved: all tiles are now editorial-text tiles with no images in the services section.

## After

Homepage: hero → about/mission → **bento services showcase (condensed, text-forward editorial tiles, deep-linking into `/services`)** → **How-It-Works teaser (→ `/how-it-works`)** → final CTA. `/services` retained as the full detail page (source of truth for full copy). Copy on the homepage is trimmed per the "reduce text" requirement.

## State coverage

Static public marketing content — no data fetching, so async states do not apply. Applicable states:

- [x] default — all five sections render from i18n keys
- [x] disabled — n/a (no form / async action on this surface)
- [x] loading / empty / error / stale / conflict — n/a (no server state; TanStack Query not used here)
- [x] permission — n/a (public route, no guard)
- [x] hover/focus affordance — "Find out more" reveals on `group-hover` / `group-focus-visible`; tiles lift (`hover:-translate-y-px hover:shadow-ui-2`)
- [x] long-content — highlights use `flex-col gap-3`; localized strings verified in sr/es without clipping

## Responsive evidence

Evidence captured under `prefers-reduced-motion: reduce` to ensure all `FadeUp` wrappers render immediately at full opacity (no `whileInView` opacity-0 holdback). Screenshots scrolled to show each section.

- [x] **1440px** — `services-1440.png` (s01/s02/s03 top grid) + `services-1440-s04.png` (s04 banner + CTA) — 3-col grid; s01 lead tile spans 2 cols × 2 rows with bottom-anchored highlights; s04 wide-banner in `sm:flex-row` two-column layout.
- [x] **1280px** — `services-1280-s04.png` (s04 + CTA) — same 3-col layout as 1440.
- [x] **768px** — `services-768.png` (s01 full-width lead tile + s02/s03 in 2-col) + `services-768-s04.png` (s04 in `sm:flex-row` 2-col banner + CTA + HowItWorksTeaser start).
- [x] **390px** — `services-390.png` (s01 lead tile, single-col, full bottom-anchored highlights visible) + `services-390-s04.png` (s04 stacked/vertical at mobile: left rail on top, right content below, CTA + HowItWorksTeaser start). No horizontal scroll confirmed.

## Accessibility evidence

- Keyboard: every tile is a native `Link` / `Button` (`asChild`) — reachable and activatable via keyboard; visible focus via `focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2` on tiles.
- Semantics: How-It-Works steps use a real `<ol>`/`<li>` list; lead-tile highlights use `<ul>`/`<li>`. **Fix applied:** the `<ol>` previously wrapped `FadeUp` (`motion.div`) directly around `<li>` (invalid list structure) → axe `list`/`listitem` violations (5 nodes). Restructured so `<li>` is the direct child of `<ol>` with `FadeUp` nested inside. Re-ran axe: list/listitem violations gone.
- axe (axe-core 4.10.2, runOnly wcag2a/wcag2aa/wcag21a/wcag21aa): **20 passes**, 0 violations introduced by this change. Remaining: 3 `color-contrast` nodes — all in the shared **Footer** (`text-ink-tertiary` ≈ 4.49:1 vs 4.5 required), pre-existing and shared-layout, **out of scope** for this change.
- Decorative ghost ordinals (`text-ink/15` numerals "01"–"04" in `TileHead` and the s04 standalone span, and the How-It-Works step numerals) are `aria-hidden="true"` — not announced; the associated link/step is named by the heading text adjacent to them.
- Decorative icon chips (`Languages`, `GraduationCap`, `Tent`, `Lightbulb`, `MessagesSquare`, `Compass`, `ClipboardCheck`, `HeartHandshake`) are all `aria-hidden`. The CTA banner image uses `alt=""` + `aria-hidden="true"`.
- `FindOutMore` span is `aria-hidden="true"` — correct; it is a decorative reveal affordance and each tile's accessible name is composed from the heading `<h3>` and teaser `<p>` inside the wrapping `<Link>`.
- Touch targets: tiles are full-card links (≫44px); CTA buttons use `size="lg"` (≥44px height).
- Reduced motion: `FadeUp` + `useReducedMotion` disable entrance/scroll motion; hero shows the still image under `prefers-reduced-motion`; global `MotionConfig reducedMotion="user"`.

## Localization evidence

- All new strings added to **en / sr / es** simultaneously:
  - `services.s01_highlights` (array, fetched via `t(..., { returnObjects: true })`)
  - `how_we_work.home_intro`, `how_we_work.home_cta`
- No raw keys rendered; existing `services.*` / `cta.*` keys untouched (ServicesPage still consumes them). Verified language switch en/sr/es shows translated copy with highlights array rendering in all three.

## Automated verification

### `node scripts/uiux/check-ui-system.mjs`

```
Token contrast passed (15 canonical pairs).
UI/UX guardrails passed for 2 changed frontend file(s).
Canonical Storybook coverage passed for 0 changed component(s).
Complete UI-system integrity check passed.
```

### `node scripts/uiux/frontend-verify.mjs`

```
✓ 2529 modules transformed.
✓ built in 3.44s
PWA v0.19.8 — 123 entries precached
Frontend verification passed. Browser E2E and visual checks must also be run
when required by the affected flow or CI variables.
```

(Pre-existing warnings: `CalendarPage` chunk >500 kB; `elite_logo.png` >2 MB precache limit. Both pre-date this change.)

### TypeScript

0 errors.

## UI/UX reviewer decision

### `ui-ux-reviewer` — **APPROVED**

All 7 checklist items pass:
1. Deep-link hrefs correct: s01 `/services#s01`, s02/s03 templated, s04 `/services#s04`. Targets (`id={key}`) confirmed in `ServicesPage.tsx`.
2. `#services-preview` scroll target exists; hero ghost CTA uses `<a href="#services-preview">` (same-page anchor).
3. `HowItWorksTeaser` links to `/how-it-works`; `<ol>`/`<li>` structure correct.
4. Accessibility: `FindOutMore` `aria-hidden` correct; icon `aria-hidden` set; touch targets ≫44px; `TILE_CHROME` includes `focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2`.
5. i18n completeness: all `t()` keys resolve in en/sr/es — `services.s0X_*`, `services.cta_all`, `how_we_work.*` — no missing keys.
6. No raw user-facing strings; every string through `t()`.
7. `FinalCTASection` decorative image (`cta-banner.webp`) correctly uses `alt=""` + `aria-hidden="true"`.

Non-blocking suggestions noted:
- **[S] SPA hash-scroll**: React Router v6 doesn't auto-scroll to URL hash on client-side navigation; clicking a bento tile lands at the top of `/services` rather than at `#s01`–`#s04`. Pre-existing site-wide behavior; recommended fix is a global hash-scroll effect (`useLocation().hash` → `getElementById().scrollIntoView()`). Out of scope for LAND-005; tracked for follow-up.
- **[S] Inline text links** (`intro.cta`) are below 44px on mobile. Low priority; full-card tiles and `size="lg"` buttons are fine.

### `visual-design-reviewer` — **APPROVED** (second pass)

Prior blocking finding B1 (evidence gap: s04 and CTA not visible due to `whileInView` at `opacity:0`) is resolved. Second-pass review confirmed:

1. s04 banner visible in `services-1440-s04.png` / `services-1280-s04.png`: Lightbulb icon chip, `aria-hidden` ghost "04" ordinal, i18n-driven "CONSULTATIONS FOR SPAIN" label, title, and teaser — no `<img>`, text-forward, matches code.
2. `sm:flex-row` two-column layout at 768 correctly shown in `services-768-s04.png` (left rail: icon chip + "04", `border-r`; right: label + heading + teaser). Mobile fallback at 390 shows stacked layout with `border-b` between rail and content.
3. Ghost ordinal spans (`aria-hidden="true"`) confirmed at `TileHead` line 229, s04 standalone line 349, and How-It-Works steps line 416.
4. Semantic tokens only. Visual hierarchy calm and editorial. No raw colors, gradients, glow, or legacy tokens.

Non-blocking observation: s04 banner has white space to the right at desktop (content capped at `max-w-xl`); reads as intentional editorial banner.

**All blocking and non-blocking findings from both passes resolved.**

## Remaining limitations

- Footer `color-contrast` (3 nodes) is a pre-existing shared-layout finding, not introduced here — tracked separately, out of scope for LAND-005.
- Elite Guide / FAQ homepage sections deferred (not this round, per plan).
- SPA hash-scroll on client-side navigation to `/services#sNN` is a site-wide pre-existing gap (React Router v6 doesn't auto-scroll to hash). Noted by ui-ux-reviewer; tracked as a follow-up.
- Stale `docs/redesign/audit/01-routes-and-role-guards.md` left untouched (unrelated; noted as follow-up in plan).

---

## LAND-006 — HowItWorksTeaser wave trajectory redesign

**Change:** Replaced the flat 4-equal-column card grid with a wave trajectory / zigzag layout.

- Desktop (lg+): 4-column grid, alternating layout — steps 1 & 3 (`i%2===0`) have content above the node circle; steps 2 & 4 (`i%2!==0`) have node circle above the content (`lg:mt-10`). Decorative `motion.svg` wave (`aria-hidden`, `pathLength 0→1`, 1.4s, draws L→R on `whileInView`). Node circles pop-in with staggered spring delays.
- Mobile (<lg): `SpineRail` + `SpineNode` vertical timeline from `editorial-helpers.tsx`. Padding moved from `<ol>` to `<li>` so SpineNode's `absolute left-4 sm:left-6` resolves against the `<li>` padding-box origin — same coordinate axis as `SpineRail` (BLOCK-1 fix from ui-ux-reviewer).
- Animation: fully disabled under `prefers-reduced-motion` (`useReducedMotion` gate on all `initial`/`whileInView` props).
- i18n: no new keys — reuses existing `how_we_work.*` (label/title/home_intro/home_cta/s0N_number/s0N_title/s0N_body). Verified en/sr/es.
- TypeScript: 0 errors.

### Responsive evidence (post-BLOCK-1 fix)

- [x] **1280px** — `hiw-1280-fixed.png` — 4-col zigzag, wave path visible, node circles in alternating positions, no horizontal scroll.
- [x] **1440px** — `hiw-1440-desktop.png` — same 4-col layout at wider viewport.
- [x] **768px** — `hiw-768-fixed.png` — mobile layout (below lg); SpineNode dots sit exactly on SpineRail line.
- [x] **390px** — `hiw-390-fixed.png` — SpineNode dots on SpineRail, content indented cleanly, no horizontal scroll.
- [x] **sr language** — `hiw-sr-1440.png` — Serbian translations render, no missing keys.
- [x] **es language** — `hiw-es-1440.png` — Spanish translations render, no missing keys.

### BLOCK-1 fix detail

`ui-ux-reviewer` found that `pl-10 sm:pl-14 lg:pl-0` on the `<ol>` caused `SpineNode`'s `absolute left-4 sm:left-6` to resolve against the `<li>` padding-box (shifted by 40/56px), while `SpineRail`'s identical offsets resolved against the outer `div.relative` — placing dots 40–56px to the right of the rail. Fix: moved padding utilities to `<li>` so both primitives resolve against the same coordinate origin. Confirmed visually at 390 and 768.

### ui-ux-reviewer second pass — **APPROVED**

BLOCK-1 and BLOCK-2 both confirmed resolved. SpineNode/SpineRail coordinate-origin alignment verified in code; evidence file references all 4 viewports + 2 locale screenshots. No new findings.

---

## LAND-006 HIW-WAVE-01 — Wave phase and extent fix

**Blocker:** `visual-design-reviewer` first pass blocked on HIW-WAVE-01: SVG wave was anti-phase (crests at columns 1,3 where nodes are LOW; troughs at columns 2,4 where nodes are HIGH) and insufficient vertical extent (fixed `height="100"` SVG centered at mid-container covered y 78–178px only; nodes at cy 60 and cy 182–204 in a 256px container — 84–106px off at 1440px).

**Fix applied (`packages/frontend/src/pages/public/HomePage.tsx` lines ~418–440):**
1. SVG positioning: `inset-x-0 top-1/2 -translate-y-1/2 w-full` + explicit `height="100"` → `inset-0 w-full h-full` (SVG spans full container height; `preserveAspectRatio="none"` stretches path vertically)
2. Path phase + extent: `M 125,20 C 250,20 250,80 375,80 …` (crests at cols 1,3) → `M 125,75 C 250,75 250,25 375,25 C 500,25 500,75 625,75 C 750,75 750,25 875,25` (crests at cols 2,4; y=25% top-band / y=75% bottom-band maps to node positions)

**Responsive evidence (post-wave fix):**
- [x] **1440px** — `hiw-1440-wave-fixed.png` — wave crests co-located with nodes 02 & 04 (top), troughs co-located with nodes 01 & 03 (bottom); continuous S-curve journey path.
- [x] **1280px** — `hiw-1280-wave-fixed.png` — same alignment confirmed.

### visual-design-reviewer second pass — **APPROVED**

HIW-WAVE-01 resolved. Measurements from `hiw-1440-wave-fixed.png`:
- Col 1 node 01 cy~550 (low) — wave trough `M 125,75` on it ✓
- Col 2 node 02 cy~430 (high) — wave crest `375,25` on it ✓
- Col 3 node 03 cy~573 (low) — wave trough `625,75` on it ✓
- Col 4 node 04 cy~429 (high) — wave crest `875,25` on it ✓

Phase in-phase with node positions; wave reads as continuous L→R journey path threading all four steps. Token compliance confirmed (`text-accent` + `stroke="currentColor"`, no raw colors). Reduced-motion branch preserved. No regressions. No remaining observations.

**All blocking findings resolved across both reviewers. LAND-005 and LAND-006 complete.**
