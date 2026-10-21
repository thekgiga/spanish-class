# Frontend Change Evidence — Elite Guide hub redesign

## Scope

- Requirement IDs: GUIDE-HUB-002 (redesign of BRAND-005)
- Roles: Public / anonymous (prospective student, parent)
- Routes: `/elite-guide` (`EliteGuideHubPage`)
- BPMN sections: none (marketing/content hub; no booking/approval behavior)

## Problem

The original hub (BRAND-005) was a hero + a 7-chip rubric filter + a flat 3-column
grid of **12 equal-weight article cards**, defaulting to "All" (maximum information on
first paint). For a cold visitor this is choice-paralysis: no entry point, no hierarchy,
abstract one-word categories (Study/Learn/Live/Experience/Camps/Insights) that do not map
to a visitor's real question, and no differentiation between the student and parent
audiences. The `start_here` / `featured_label` i18n keys existed but were never rendered —
a guided structure was intended and never built.

## Change

Rebuilt the hub around **visitor intent and stage** instead of internal taxonomy:

1. **Hero** — unchanged composition (`bg-brand`).
2. **"Start here" cornerstone** — single guided front door; a bordered `bg-surface` panel
   promoting the featured article (`zasto-elite-education`) via the existing `start_here.*`
   keys and a primary CTA. Removed from the grid to avoid duplication.
3. **"Choose your path"** — 3 intent shortcuts (Study / Learn / Camps-for-parents) that
   anchor-link to the relevant section, letting student and parent self-select immediately.
4. **Four themed sections** — the 6 rubrics folded into 4 visitor-facing groups
   (Study in Spain, Learn Spanish, Living & settling in, Stories & experience), each with an
   accent icon, label, a one-line "who it's for" description, and its article cards.
5. **Consultation CTA** — `bg-brand`, links to `/contact` (reuses `article.cta_*` keys).

The old 7-chip rubric filter was removed; the sectioned IA + path shortcuts supersede it.

### Data model (additive, no contract break)
- `content/elite-guide/index.ts`: added `theme: GuideTheme` and `featured?: boolean` to each
  article, plus `GUIDE_THEME_ORDER`. The `rubric` field and `EliteGuideArticlePage` are
  untouched.

### Theme mapping
| Section | Articles | Folds rubrics |
|---|---|---|
| Study in Spain | upis-fakulteta, unedasiss, pce-priprema | study |
| Learn Spanish | dele-ili-siele, nivo-spanskog | learn |
| Living & settling in | troskovi-studija, koji-grad, smestaj | live |
| Stories & experience | prvi-jezicki-kamp, pet-stvari-spanija, prvi-boravak-madrid | experience + insights + camps |
| (cornerstone) | zasto-elite-education | featured |

## State coverage

- [x] default — 4 populated sections + cornerstone + paths
- [x] empty — `sections.length === 0` falls back to `hub.articles_empty`; empty sections are
      skipped (`.filter(s => s.articles.length > 0)`)
- [x] loading — N/A: article metadata is a static import, no async fetch on the hub
- [x] success / error / disabled / stale — N/A for a static content hub
- [x] long-content — section descriptions and path copy are `max-w-2xl`; SR/ES strings
      (longer than EN) wrap without clipping; card excerpts `line-clamp-3`

## Responsive evidence

Layout intent (reasoned from Tailwind classes; live screenshots pending — see limitations):
- [ ] 390px — hero stacks; cornerstone `p-6`; paths single column; sections single-column cards
- [ ] 768px — paths `sm:grid-cols-3`; cards `sm:grid-cols-2`
- [ ] 1280px — cards `lg:grid-cols-3`
- [ ] 1440px — container capped at `max-w-screen-lg`, centered

## Accessibility evidence

- Heading order: `h1` (hero) → `h2` (start-here, paths heading, each section) → `h3`
  (article cards). No skipped levels.
- Path shortcuts are native `<a href="#guide-...">` anchors — keyboard focusable, Enter
  activates, focus moves to target; sections carry `scroll-mt-24` so the sticky header does
  not cover the landing position.
- Visible focus ring on every interactive element (`focus-visible:ring-2 ring-focus`).
- Decorative icons/images are `aria-hidden`.
- Motion via `FadeUp` is gated by `useReducedMotion`.
- Touch targets: path cards `p-5`, buttons `size="lg"` — all ≥ 44px.

## Localization evidence

- Added `themes.*` (4× label + description) and `paths.*` (heading + 3× title + description)
  to `en`, `sr`, and `es` `elite-guide.json`. No hard-coded strings; no exposed keys/enums.
- Reused existing `start_here.*`, `featured_label`, `article.cta_*`, `hub.rubric_*`.

## Automated verification

- `node scripts/uiux/check-ui-system.mjs` → **passed** (token contrast 15 pairs; guardrails
  for 4 changed files; canonical stories). Hook false-positives on `node`+`scripts/uiux/`;
  run from repo root with the path quoted — read-only, mutates nothing.
- `node scripts/uiux/frontend-verify.mjs` → **passed** (build succeeds; `EliteGuideHubPage`
  chunk builds; TypeScript 0 errors).
- VS Code diagnostics on `EliteGuideHubPage.tsx` → 0.

## UI/UX reviewer decision

- ui-ux-reviewer: _pending_
- visual-design-reviewer: _pending_

## Remaining limitations

- Live 390/768/1280/1440 screenshots not captured: a Playwright browser instance is locked
  by another session. Layout verified statically; screenshots to be attached when the
  browser frees up.
- `ctaTarget` on `GUIDE_ARTICLES` remains dead code (article page always links to
  `/contact`) — pre-existing, left out of scope.
- Article bodies remain SR-only (pre-existing; EN/ES show the fallback notice).
