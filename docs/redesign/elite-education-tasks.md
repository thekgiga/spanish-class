# Elite Education — Implementation Tasks & Action Items

**Purpose:** executable task list derived from [`elite-education-brand-proposal.md`](./elite-education-brand-proposal.md). Written for a parallel implementation session.
**Date:** 2026-09-21 · **Branch:** `feat/system-redesign`

> Read the proposal first. This file is the *what to do*; the proposal is the *why*. Section refs (§3, §4b …) point back to it.

---

## 0. Ground rules for every task (do not skip)

- Load the **`spanish-class-ui-system`** skill and follow `packages/frontend/CLAUDE.md` before any UI edit. Produce the preflight (role/route/intent, components to reuse, tokens, states, responsive, a11y) before editing.
- **Semantic tokens only.** No raw hex/rgb/hsl or legacy palette classes outside token/config files.
- **No hardcoded user-facing text.** Every string is an i18next key present in **en + sr + es**. Serbian is primary/verbatim; en/es drafted for review. Never expose a raw key or backend enum.
- **No fabricated content** — no invented figures, universities, testimonials, or "top N" lists. "Needs source" content (proposal §4c) stays blocked.
- Implement **loading / empty / error / disabled / success / permission** states for any async surface.
- Verify **390 / 768 / 1280 / 1440**; keyboard + screen-reader path; `prefers-reduced-motion`.
- Update `docs/redesign/implementation-matrix.csv` and add stories/tests + screenshot evidence in the same slice.
- Before claiming done: run `node scripts/uiux/check-ui-system.mjs` and `node scripts/uiux/frontend-verify.mjs`, then the `ui-ux-reviewer` and `visual-design-reviewer` agents.

## Assumed defaults for the two open decisions (override if the owner says otherwise)

- **§3 status colors:** keep **green for available/confirmed**, amber for requested; burgundy reserved for brand/primary; nudge danger/cancelled red so it never reads as brand burgundy. *Do not recolour confirmed/available to burgundy.*
- **§6 translation staging:** ship **hub + FAQ + all UI chrome trilingual now**; article *bodies* Serbian-first, en/es as reviewed follow-up (articles fall back to Serbian per-locale until reviewed).

---

## Parallelization map

```
Stream A (tokens)  ─┐ blocks visual work
Stream B (assets)  ─┤ independent, run in parallel with A
Stream C (i18n+content) ─┘ independent, run in parallel with A/B
                    │
        A done ─────┼──> Stream D (landing rebuild)
   A + C(system) ───┴──> Stream E (Elite Guide pillar)
                              │
                   D + E ───> Stream F (verification & sign-off)
```

**File-conflict guidance for parallel sessions:** A owns token/config files; B owns `public/imgs/brand/` + logo wiring; C owns `public/locales/**` + `src/content/**`; D owns `HomePage.tsx` + landing section components; E owns guide routes/pages + `App.tsx` route additions. Keep sessions on their own files to avoid clobbering. `App.tsx` is touched only by E (route add) — do it once.

---

## Stream A — Brand token foundation (blocks all visual work)

- [ ] **T-A1** Rewrite brand tokens in `docs/ui-system/design-tokens.json` + `packages/frontend/src/styles/ui-system.tokens.css`: brand→burgundy `#8B0E1A`, accent→gold `#D4AF7C`, canvas→cream `#F9F6EF`, ink→charcoal `#1E1E24`. Re-derive hover/active/soft steps.
- [ ] **T-A2** Re-check **WCAG AA** for every re-derived pair. Gold on cream **fails** for text — gold stays a rule/detail/secondary-fill color, never body or CTA text. Document contrast results in the evidence note.
- [ ] **T-A3** Decouple booking-status hues from brand per §3 default (green available/confirmed, amber requested, nudged red danger/cancelled). Keep the **central status mapping** intact — do not style states independently.
- [ ] **T-A4** Swap font tokens to **Playfair Display** (display) + **Montserrat** (sans/body); verify/extend the font-loading pipeline (Montserrat is new). Keep app-body legibility per visual-system rules.
- [ ] **T-A5** Update UI-system docs so source-of-truth matches reality: `docs/ui-system/02-color-system.md`, `03-typography.md`, `00-visual-north-star.md`.
- [ ] **T-A6** Full-app visual re-verification at all 4 breakpoints — every logged-in screen changes color here. Screenshot evidence for calendar/booking states especially (confirm no confirmed-lesson-looks-like-error regression).

## Stream B — Assets (parallel with A)

- [ ] **T-B1** Copy brand assets from `docs/04_BRAND_GUIDE/` into `packages/frontend/public/imgs/brand/`; optimize (webp already provided).
- [ ] **T-B2** Wire logo variants (master / cream / dark-card / white) as components/props; enforce logo rules — never recolour/stretch/crop; on dark sections place logo on white/cream card.
- [ ] **T-B3** Add the 4 OG social images + favicon/meta wiring for landing + guide.
- [ ] **T-B4** Register hero background(s), paper textures, service-card images, section divider, Spain outline for use by D/E.

## Stream C — i18n scaffold + guide content (parallel with A/B)

- [ ] **T-C1** Build `home.json` namespace for **en/sr/es** covering all §4 landing copy (hero, about, founder, 4 services, approach, steps, why-us, final CTA, footer). Remove old paella keys. sr verbatim from sajt V2; en/es drafted.
- [ ] **T-C2** Create `elite-guide` i18n namespace (en/sr/es) for guide **chrome**: rubric labels, hub hero, "read more"/breadcrumb/CTA strings, FAQ section labels.
- [ ] **T-C3** Create the article content system scaffold: typed metadata index (slug, rubric, title-key, excerpt-key, hero asset, CTA target, order) + localized Markdown dir `packages/frontend/src/content/elite-guide/{en,sr,es}/`.
- [ ] **T-C4** Seed the **12 article bodies** (Serbian verbatim from `FaQ - LeadGuide.md`) as Markdown. Proposed slugs + rubrics:
  | # | slug | rubric |
  |---|---|---|
  | 01 | `upis-fakulteta` | Study |
  | 02 | `unedasiss` | Study |
  | 03 | `pce-priprema` | Study |
  | 04 | `troskovi-studija` | Live |
  | 05 | `dele-ili-siele` | Learn |
  | 06 | `nivo-spanskog` | Learn |
  | 07 | `koji-grad` | Live |
  | 08 | `smestaj` | Live |
  | 09 | `prvi-jezicki-kamp` | Camps |
  | 10 | `pet-stvari-spanija` | Experience |
  | 11 | `prvi-boravak-madrid` | Insights |
  | 12 | `zasto-elite-education` | Insights |
- [ ] **T-C5** Draft en/es article bodies **only if** the owner overrides the staged-translation default; otherwise leave en/es to fall back to sr and record the debt in the matrix.

## Stream D — Landing rebuild (after A; uses B + C)

- [ ] **T-D1** Build/reuse section components (stories before composition, per UI-system rule): Hero, About, Founder, Services (4 cards), Approach (4 pillars), How-we-work (4 steps), Why-us, Guide teaser (6 rubric cards + featured), FAQ accordion, Final CTA. Reuse canonical `Button`/card primitives before adding new ones.
- [ ] **T-D2** Compose `packages/frontend/src/pages/public/HomePage.tsx` per §4 order (11 sections). All copy via `home.json` keys. Preserve the `#landing-hero-end` sentinel the public `Header` watches.
- [ ] **T-D3** Retire the paella scroll-story + its assets (`/imgs/paella-cook.mp4`) and keys.
- [ ] **T-D4** Update public `Header`/`Footer` + logo; add an Elite Guide nav link. Footer tagline "Education. Language. Spain."
- [ ] **T-D5** Wire the FAQ accordion answers to link into the matching guide articles (E provides routes).
- [ ] **T-D6** Reduced-motion + keyboard + a11y pass on landing; 4-breakpoint screenshots.

## Stream E — Elite Guide pillar (after A + C system; §4b)

- [ ] **T-E1** Add lazy routes under `PublicLayout` in `packages/frontend/src/App.tsx`: `/elite-guide` (hub) and `/elite-guide/:slug` (article). **Update the route architecture doc** `docs/redesign/audit/01-routes-and-role-guards.md` (adding a top-level route without this is disallowed).
- [ ] **T-E2** Build the hub page: brand hero, 6 rubric cards, article grid filterable by rubric. Loading/empty states included.
- [ ] **T-E3** Build the article page: editorial reading layout, breadcrumb, rubric tag, Markdown body renderer, discreet closing CTA into the relevant service/consultation. Per-locale fallback to sr when en/es body absent.
- [ ] **T-E4** Components get stories; verify reading layout + long localized strings at all 4 breakpoints.
- [ ] **T-E5** (Enrichment, no fabrication) cross-link related articles, add a "Start here" entry, per-rubric intro blurbs + glossary (UNEDasiss/PCE/ECTS/DELE/SIELE). All via i18n keys.

## Stream F — Verification & sign-off (after D + E)

- [ ] **T-F1** `node scripts/uiux/check-ui-system.mjs` and `node scripts/uiux/frontend-verify.mjs` pass.
- [ ] **T-F2** Reduced-motion, keyboard, screen-reader paths verified across landing + guide.
- [ ] **T-F3** Update `docs/redesign/implementation-matrix.csv` and component inventory with implemented requirement IDs + deferred debt (en/es article bodies; §4c "Needs source" rows).
- [ ] **T-F4** Run `ui-ux-reviewer` + `visual-design-reviewer`; resolve blocking findings.
- [ ] **T-F5** Attach screenshots at 390/768/1280/1440 for landing, guide hub, and one article as evidence.

---

## Blocked / needs owner input before shipping

- **§3 status-color resolution** — proceeding on the recommended default; confirm before F sign-off.
- **§6 translation staging** — proceeding staged; confirm before F sign-off.
- **§4c "Needs source"** — University Guides, Elite Picks, Student Choice, Study-by-Field require real founder-supplied data; do not build with placeholder/fabricated content.
- **Founder photo**, **consultation-CTA target**, **dark-mode re-skin scope**, **legacy-palette removal** — carried open questions from proposal §6.
