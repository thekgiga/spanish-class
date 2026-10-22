# Vibrant España 2026 — Marketing Site UI/UX Overhaul

> **Plan persistence:** this plan lives at `~/.claude/plans/act-as-a-lead-fluffy-token.md` (outside the repo). Phase 0 copies it to `docs/redesign/vibrant-espana-2026-plan.md` so it is versioned and referenceable by all implementation agents.

## Context

casovispanskog.rs recently shipped the "Elite Education" burgundy/gold marketing brand (Phase 7 complete, 105 matrix rows done). The user now wants a bigger leap: a vivid, immersive 2026 aesthetic that blends multiple vibrant Spanish-culture hues — mesh gradients, aurora backgrounds, scroll-triggered color transitions, glassmorphism, bento layouts, and rich motion — going far beyond a palette swap.

**Locked decisions (user-confirmed):**
1. **Brand:** Replace burgundy/gold with an entirely new vibrant multi-hue Spanish palette on marketing pages.
2. **Scope:** Public marketing surface only — `/`, `/about`, `/services`, `/contact`, `/faq`, `/elite-guide/*`, Header/Footer/PublicLayout. The authenticated app (Editorial Teaching Studio tokens) must remain pixel-identical.
3. **Conversion:** Keep the contact-form funnel, rebuilt as an immersive multi-step consultation request. UI-only.

**Verified facts that shape the plan:**
- ContactPage **fakes submission** via `setTimeout` (ContactPage.tsx:34,40) — no backend contact endpoint exists (`packages/backend/src/routes/` has no contact route). The multi-step form must keep a swappable `submitConsultation()` adapter; a real endpoint is a flagged follow-up.
- Guardrail hooks (`.claude/hooks/protect-guardrail*.mjs`) block edits to `scripts/uiux/*`, `ui-system.tailwind.extend.cjs`, `.claude/rules/frontend/*`, and docs enforcement files unless `UIUX_ALLOW_GUARDRAIL_EDIT=1`. Governance amendments in Phase 1 must use that flow.
- `.claude/rules/frontend/design-system.md` + `visual-quality.md` currently hard-block gradients/glow/glass — they must be amended FIRST or every phase fails review.
- Serbian locale is **Latin script** → `latin-ext` font subsets suffice (č ć đ š ž + Spanish á ñ ü ¿ ¡).
- Precedent exists for theme-invariant marketing tokens: the `--ui-hero-*` family.
- 17 baseline E2E tests must stay green throughout.

## Core architecture: the `.mkt-theme` scoped token layer

**New file:** `packages/frontend/src/styles/marketing.tokens.css`, imported from `globals.css` after `ui-system.tokens.css`. All tokens scoped under a `.mkt-theme` class applied to the root div of `PublicLayout.tsx`. The authenticated app never renders inside `.mkt-theme` → leak is structurally impossible. Never edit `--ui-*` values globally.

**Tier A — new vocabulary (`--mkt-*`, HSL triplets):**
| Token | Value | Hex |
|---|---|---|
| `--mkt-fiesta` | 355 76% 56% | #E63946 |
| `--mkt-sol` | 42 100% 51% | #FFB703 |
| `--mkt-mediterraneo` | 193 70% 43% | #219EBC |
| `--mkt-azahar` | 42 68% 97% | #FDF8F0 |
| `--mkt-noche` | 221 51% 16% | #14213D |
| `--mkt-naranja` (fiesta→sol bridge) | 25 95% 55% | — |
| `--mkt-violeta` (noche→fiesta aurora depth) | 265 45% 40% | — |

Plus derived: `--mkt-scrim-dark/light`, `--mkt-glass-bg/border`, `--mkt-glow-{fiesta,sol,mediterraneo}`, `--mkt-ink-on-vibrant/on-light`, `--mkt-font-display`, `--mkt-shadow-soft`, `--mkt-duration-drift/reveal`. Mesh/aurora/glow compositions live as utility classes (`.mkt-mesh-*`, `.mkt-aurora-*`, `.mkt-glow-*`, `.mkt-border-gradient`) in the same file under `@layer utilities` (raw colors legal only in token files).

**Tier B — semantic re-skin overrides inside `.mkt-theme`:** `--ui-brand/*` → fiesta family, `--ui-accent/*` → sol family, `--ui-focus` → mediterráneo, `--ui-hero-*` → noche/azahar/sol. Every existing CVA primitive (Button, Badge, Accordion, GoldRule, focus rings) re-skins automatically with zero component edits. Status/alert/booking tokens are NEVER overridden.

**Tailwind:** add `mkt` color namespace + `fontFamily.mktdisplay` in `tailwind.config.js` only. Do NOT touch `ui-system.tailwind.extend.cjs` (guardrail-protected app contract).

**Portal rule:** Radix overlays portal to `document.body`, escaping `.mkt-theme`. Marketing surface uses inline-only overlays; MobileNav's portal container gets `.mkt-theme` added explicitly.

---

## Phase 0 — Guardrail removal, plan persistence & CLAUDE.md (S) — RUNS FIRST

**Precondition:** the guardrail hooks protect themselves (they block edits to `.claude/settings.json`, `.claude/hooks/*`, `scripts/uiux/*`, `.claude/rules/*`, and the two skills — including via Bash). Every hook short-circuits when `UIUX_ALLOW_GUARDRAIL_EDIT=1` is in the **Claude Code process env**. The session must be restarted as `UIUX_ALLOW_GUARDRAIL_EDIT=1 claude` before this phase executes (or the user removes the files manually).

### 0.1 Remove enforcement (exact list)

**`.claude/settings.json` — delete these hook registrations** (keep `permissions` as-is):
| Hook event | Entry to delete | What it did |
|---|---|---|
| `SessionStart` | `session-context.mjs` | Injects "load guardian skill / update matrix" mandate into every session |
| `PreToolUse` (Edit\|Write) | `protect-guardrails.mjs` | Blocks edits to enforcement files |
| `PreToolUse` (Bash) | `protect-guardrail-bash.mjs` | Blocks bash touching enforcement paths (even reads) |
| `PostToolUse` (Edit\|Write) | `post-edit-frontend.mjs` | Per-edit frontend checks |
| `Stop` | `frontend-stop-gate.mjs` (900s) **+ the agent verification hook** (240s) | Blocks every turn/agent completion behind full verification — the main obstacle to parallel agent work |
| `ConfigChange` | `protect-config-change.mjs` | Blocks settings changes |
| `TaskCompleted` | `frontend-stop-gate.mjs` | Same gate on task completion |

**Delete files:** `.claude/hooks/{frontend-stop-gate,post-edit-frontend,protect-config-change,protect-guardrail-bash,protect-guardrails,session-baseline,session-context}.mjs` and `.claude/hooks/tests/`.

**Delete mandatory skills:** `.claude/skills/spanish-class-ui-ux-guardian/` and `.claude/skills/spanish-class-ui-system/` (both are "mandatory, automatically use" — they force the matrix/evidence/reviewer workflow on every agent). Also delete `.claude/skills/{implement-ui-system-foundation,implement-uiux-redesign}/` (stale redesign-phase skills tied to the old workflow).

**Delete hard-blocking rules:** `.claude/rules/frontend/` (13 files; `design-system.md` + `visual-quality.md` hard-block gradients/glow/glass and would fail every phase; the useful content is superseded by the CLAUDE.md requirements in 0.3).

**Keep (demoted to opt-in tools, no longer enforced):**
- `scripts/uiux/*.mjs` — useful manual verification (`check-token-contrast.mjs`, `check-ui-system.mjs`, `frontend-verify.mjs`); inert once hooks are gone. Phase 1 still extends contrast pairs/allowlist so the scripts stay truthful.
- `docs/ui-system/` + `docs/redesign/implementation-matrix.csv` — reference docs; matrix updates become a lightweight convention (each agent appends its VIB rows), not a gate.

### 0.2 Persist the plan
Copy this file into the repo: `docs/redesign/vibrant-espana-2026-plan.md`. Commit together with 0.1/0.3.

### 0.3 Add critical requirements to CLAUDE.md
Append a `## Vibrant España 2026 — Marketing Redesign Rules` section containing the non-negotiables every agent must follow:
1. **Scope isolation:** all new visual work lives under the `.mkt-theme` class (root of `PublicLayout.tsx`). NEVER edit `--ui-*` values in `ui-system.tokens.css` or `ui-system.tailwind.extend.cjs` — the authenticated app must remain pixel-identical.
2. **Tokens:** use `--mkt-*` tokens / `mkt-*` Tailwind classes from `src/styles/marketing.tokens.css`. Raw hex only inside that token file. Status/booking/alert tokens are never overridden.
3. **Palette:** fiesta #E63946, sol #FFB703, mediterráneo #219EBC, azahar #FDF8F0, noche #14213D (+ naranja/violeta bridges).
4. **Readability:** body text never directly on mesh/aurora — always scrim or GlassCard; display-on-gradient ≥32px bold, contrast vs worst stop; sol never as text on light grounds; focus ring = mediterráneo.
5. **Motion:** every animation has a `useReducedMotion` static fallback; no infinite looping attention effects.
6. **Perf budget:** ≤2 `blur()` layers + ≤2 `backdrop-filter` surfaces per viewport; gradient drift off <768px.
7. **Portals:** marketing overlays are inline-only (Radix portals escape `.mkt-theme`); MobileNav portal container gets `.mkt-theme` explicitly.
8. **i18n:** every new string in en + sr + es simultaneously (existing hard rule, restated for agents).
9. **Regression:** 17 baseline E2E tests must stay green; verification is `npm run lint`, `tsc`, optional `scripts/uiux/*.mjs`, Playwright screenshots at 390/768/1280/1440.
10. **Tracking:** append VIB-0xx rows to `docs/redesign/implementation-matrix.csv` per completed work item; master plan at `docs/redesign/vibrant-espana-2026-plan.md`.

### 0.4 Agent distribution map (enabled by 0.1)
Work parcels and their dependencies — each parcel is independently assignable once its dependency lands:

```
Phase 0 (serial, this session)
  └─► Phase 1 tokens+governance (ONE agent — everything depends on marketing.tokens.css)
        ├─► Agent A: marketing primitives + stories (MeshGradient, AuroraSection, GlassCard, BentoCell, vibrant-helpers)
        │     ├─► Agent B: HomePage restructure            ├─► Agent E: FAQ + EliteGuide ×2 (light touch)
        │     ├─► Agent C: ServicesPage bento              └─► Agent F: Footer + Header FloatingNav mode
        │     └─► Agent D: AboutPage asymmetric grid
        ├─► Agent G: Phase 3 motion layer (motion.ts, scroll journey, page transitions) — after A–F per page
        ├─► Agent H: Phase 4 typography (Bricolage rollout, glow/border utilities, logo variants) — parallel with G
        └─► Agent I: Phase 5 consultation form + ContactPage + landing flow re-sequencing — after A (form uses GlassCard/motion variants)
Final: ONE integration agent — full verification sweep (lint, tsc, uiux scripts, 4-viewport ×3-language screenshots, 17 e2e)
```
Conflict avoidance: one agent per page file; shared files (`marketing.tokens.css`, `tailwind.config.js`, `PublicLayout.tsx`) are finalized in Phase 1 before fan-out; i18n JSON files touched per-namespace (home/about/common) — assign a namespace to a single agent at a time or merge via worktrees.

---

## Phase 1 — 2026 Aesthetic Strategy & Color Blending (M)

Foundation only — nothing visibly redesigned yet except Tier B auto re-skin.

1. **Create** `src/styles/marketing.tokens.css` (Tier A + Tier B + utility classes + reduced-motion guards).
2. **Modify** `src/styles/globals.css` (import), `tailwind.config.js` (mkt namespace), `src/components/layout/PublicLayout.tsx` (`mkt-theme` class).
3. **Create** `src/components/marketing/ScrollColorSection.tsx` + `useScrollPalette.ts`.
   **Scroll-color mechanism (decided):** framer-motion `useScroll` + `useTransform` interpolating palette stops, writing `--mkt-journey-bg/tint` via `useMotionValueEvent` → `style.setProperty` (zero re-renders, one rAF). Native CSS scroll-driven animations rejected (Safari coverage gaps would require the JS fallback anyway; framer-motion 11 already in bundle). Reduced motion → each section renders its static stop color.
4. **Fonts:** add `@fontsource-variable/bricolage-grotesque` (latin + latin-ext), imported in `PublicLayout.tsx` → ships only with public chunk.
5. **Documentation (guardrails already removed in Phase 0 — these are plain doc updates):**
   - Amend `docs/ui-system/{00-visual-north-star,02-color-system,03-typography,05-shape-elevation-motion}.md` — define the sanctioned "Marketing Vibrant tier" (mesh/aurora/glass/glow legal only inside `.mkt-theme` on public routes).
   - `docs/ui-system/design-tokens.json` → v3.1.0 with `marketing` token group.
   - Extend `scripts/uiux/check-token-contrast.mjs` (new mkt pairs) + `check-ui-system.mjs` allowlist (`--mkt-*`/`mkt-*` recognized as semantic) so the opt-in scripts stay truthful.
   - Matrix rows VIB-001…VIB-006.

**Readability rules (codified in 02-color-system amendment):** body text never sits directly on mesh/aurora (always on scrim or GlassCard); display text on gradient ≥32px bold + text shadow, contrast checked against the worst gradient stop; Sol never as text on light grounds; Fiesta as text only ≥24px bold on azahar; focus ring = mediterráneo, 2px offset; 44px touch targets.

**Verify:** lint + tsc + `check-ui-system.mjs` + `check-token-contrast.mjs` green; 17 baseline e2e green; before/after screenshot of an admin page proving pixel-identical (zero-leak proof); smoke all 7 public pages in en/sr/es.

## Phase 2 — Deep UI/UX Structural Overhaul (XL)

Order: primitives + stories → navigation → page-by-page.

**New components in `src/components/marketing/`** (each with Storybook stories):
- `MeshGradientBackground.tsx` — `{variant: 'fiesta'|'sol'|'mediterraneo'|'noche', animate?}`. Pure CSS: 3–4 stacked soft-stop radial-gradients; optional slow background-position drift. No canvas/WebGL/libs. Drift off <768px and under reduced motion.
- `AuroraSection.tsx` — section wrapper: 2 absolutely-positioned `blur(80px)` blobs + scrim + content slot. **Perf budget: ≤2 blur layers + ≤2 backdrop-filter surfaces per viewport** (written into governance doc).
- `GlassCard.tsx` — `backdrop-blur-md` + glass tokens; `@supports not (backdrop-filter)` → solid scrim fallback; `{tone: 'light'|'dark', interactive?}`.
- `BentoCell.tsx` — extracted asymmetric bento cell (shared by Home + Services).
- `vibrant-helpers.tsx` — successors to editorial-helpers: `SolRule`, `VibrantSectionLabel`, `MarketingPageHeader`. `editorial-helpers.tsx` untouched (Tier B re-colors it during migration).
- **FloatingNav** — new rendering mode *inside* `Header.tsx` (no parallel nav component, avoids duplicate landmarks, reuses `#landing-hero-end` sentinel): past-hero on public routes → floating glass pill (fixed top-3, rounded-full, condensed links + CTA), desktop only; mobile keeps sticky bar + MobileNav. Reserve height → no CLS.

**Page restructuring (in order):** `HomePage.tsx` (noche mesh + duotone scrim over existing hero video; bento upgrade — 2×2 feature + 1×1 satellites, GlassCards on AuroraSection, one palette hue per cell; StandoutSection → 60/40 asymmetric overlap) → `ServicesPage.tsx` (full bento re-layout via BentoCell) → `AboutPage.tsx` (asymmetric editorial grid, portrait offset against mesh band) → `FAQPage.tsx` / `EliteGuideHubPage.tsx` / `EliteGuideArticlePage.tsx` (lighter: MarketingPageHeader, azahar canvas, mediterráneo accents, glass article cards; article body stays plain high-contrast) → `Footer.tsx` (noche ground, sol/fiesta gradient top rule).

Matrix rows VIB-010…VIB-019. **Verify:** stories for all primitives; Playwright screenshots of every page at 390/768/1280/1440; keyboard walk of FloatingNav; axe pass on Home + Services; baseline e2e green.

## Phase 3 — Motion UX & Micro-interactions (M)

All motion respects `useReducedMotion` with a mandatory static fallback; uses `--ui-duration/ease-*` + new `--mkt-duration-drift: 8s`, `--mkt-duration-reveal: 600ms`.

1. `src/components/marketing/motion.ts` — shared variants: `revealUp`, `staggerGrid`, `tiltHover` (bento: scale 1.02 + glow intensify), `magneticCta` (pointer-fine desktop only).
2. HomePage scroll journey: activate ScrollColorSection stops **azahar → sol → mediterraneo → noche** (daylight → "noche" at the conversion point); upgrade HowItWorksTeaser SVG pathLength to scroll-synced (`useScroll({target})`); counters unchanged.
3. Page transitions: `AnimatePresence` in `PublicLayout.tsx` keyed by pathname — 250ms fade/8px rise, marketing routes only, skipped under reduced motion.
4. Hover states: sol underline-grow links, GlassCard border-light sweep, FloatingNav pill expand — as token-file utility classes.
5. FinalCTA: one-time `whileInView` glow pulse (never looping — vestibular safety).

Matrix rows VIB-020…VIB-024. **Verify:** OS-level reduced-motion pass per page; DevTools perf trace at 4× CPU throttle @390px (no jank); baseline e2e green.

## Phase 4 — Component Architecture & Typography (M)

**Pairing (decided): Bricolage Grotesque Variable (display) + Montserrat (body).** Rationale: expressive 2026 grotesque, on Fontsource with latin-ext (covers Serbian Latin + Spanish diacritics), variable woff2 ≈60KB, `font-display: swap`, self-hosted. Clash Display rejected (incomplete latin-ext); Space Grotesk rejected (too cold for the warmth brief). Playfair remains for the app; unused on marketing after migration.

1. Type scale utilities in marketing.tokens.css: `.mkt-display-xl` (`clamp(2.75rem, 7vw, 6rem)` w700 tight), `.mkt-display`, `.mkt-eyebrow` (Montserrat 700 caps). Rule: Bricolage for h1/h2 only, never <24px.
2. Exact component styling: `.mkt-glow-sm/md` per-hue glow utilities; soft-shadow recipe (`--mkt-shadow-soft`, noche-tinted large-radius low-alpha); 1px gradient border (`padding-box/border-box` double background) as `.mkt-border-gradient`.
3. Apply `font-mktdisplay` across all 7 pages + Header/Footer.
4. **Logo:** add mono variants to `public/imgs/brand/` (azahar-mono for dark/mesh, noche-mono for light), swap per context. Full logo redesign = separate design task (flagged).
5. Font-loading dedupe: consolidate `globals.css` @import vs `index.html` link → `index.html` + preload.
6. Amend `docs/ui-system/03-typography.md` + `06-component-contracts.md` (guardrail flow).

Matrix rows VIB-030…VIB-034. **Verify:** screenshot matrix ×3 languages (Serbian longest-string wrap at 390px); font subset proof story (`č ć đ š ž ñ ¿`); Lighthouse font CLS <0.02, LCP ≤2.5s on `/`; contrast script green.

## Phase 5 — User Journey & Landing Page Flow (L)

**Landing narrative re-sequencing (`HomePage.tsx`):** immersive hero (video + mesh scrim, single dominant CTA) → offerings bento (cells deep-link `/services#anchor` or `/contact?interest=x`) → media band (existing street footage reused as FounderSection backdrop — no new asset) → social proof (StatsStrip + condensed FaqTeaser) → HowItWorksTeaser as "what happens after you book" bridge → FinalCTA with **step 1 of the consultation form embedded inline**, continuing on `/contact`.

**Multi-step consultation form — `src/components/marketing/consultation/`:**
- Files: `MultiStepConsultationForm.tsx`, `StepGoals.tsx`, `StepService.tsx`, `StepContact.tsx`, `FormProgress.tsx`, `SuccessPanel.tsx`; `ContactPage.tsx` rewritten around it (also purges forbidden legacy `spanish-teal/coral` classes).
- **Steps:** 1) Goals (multi card-select: travel/culture, study in Spain, exam prep, career, personal growth) → 2) Service interest (single-select from services taxonomy + intensity) → 3) Contact details (name, email, optional message, consent). React Hook Form + Zod (already in stack), step index in `useState`, per-step `trigger(stepFields)` validation, `?interest=` pre-selects step 2.
- **Motion:** `AnimatePresence mode="wait"` direction-aware slide (±24px, 200ms); sol→fiesta progress fill; focus moves to new step `<h2>`; `aria-current="step"`; reduced motion → instant swap.
- **Submission:** isolated `submitConsultation(data)` adapter preserving the current simulated success — a real `POST /api/contact` plugs in later with zero UI change. **No backend endpoint exists today — flagged follow-up.**
- **i18n:** ~40 new `consultation.*` keys in `about.json` ×3 languages (step titles, option labels+descriptions, back/next/submit, validation messages, success copy). Hard gate: no completion with a missing locale.

Matrix rows VIB-040…VIB-044. **Verify:** keyboard-only funnel walkthrough; validation/error states per step; new Playwright marketing spec for the form (baseline suite untouched; grep first to confirm no baseline test references the old form); screenshots ×4 viewports ×3 languages; final full run: lint, tsc, `check-ui-system.mjs`, `check-token-contrast.mjs`, `frontend-verify.mjs`, 17 baseline e2e green.

---

## Risk register

| Risk | Mitigation |
|---|---|
| No real contact endpoint (form simulates success) | `submitConsultation()` adapter; explicit follow-up backend task |
| Burgundy/gold-era logo clashes with new palette | Phase 4 mono variants interim; logo redesign = separate design task |
| Hero video warm grading vs new palette | CSS duotone scrim (noche multiply + mediterráneo/sol overlay); no re-encode |
| Blur/backdrop-filter jank on mobile | ≤2 blur + ≤2 glass per viewport; drift off <768px; `@supports` fallbacks; 4× throttle traces |
| Guardrail hooks block their own removal | Phase 0 requires session restart with `UIUX_ALLOW_GUARDRAIL_EDIT=1 claude` (or manual deletion by user); never touch `ui-system.tailwind.extend.cjs` |
| Losing all enforcement removes quality safety net | CLAUDE.md rules (0.3) + opt-in `scripts/uiux/*.mjs` + final integration-agent verification sweep replace the hooks |
| Parallel agents conflict on shared files | Phase 1 finalizes all shared files before fan-out; one agent per page; i18n namespace ownership (see 0.4) |
| Portaled overlays escape `.mkt-theme` | Inline-only overlays; `.mkt-theme` on MobileNav portal container |
| Token overrides restyle primitives unexpectedly | Tier B limited to brand/accent/focus/hero; status/booking tokens never overridden |
| i18n gaps (~40 keys ×3) | Per-phase i18n gate; Serbian wrap checks at 390px |
| SEO/CLS | swap + preload fonts, reserved FloatingNav height, CLS <0.1 per phase |

## Sequencing & effort

Phase 0 (S, serial — de-guardrail + CLAUDE.md + plan persistence) → Phase 1 (M, serial — tokens, one agent) → Phases 2–5 fan out per the distribution map in 0.4 (Phase 2 XL, Phase 3 M, Phase 4 M, Phase 5 L) → final integration verification sweep. Each parcel = code + stories + i18n + VIB matrix rows + evidence screenshots in `docs/redesign/evidence/vibrant-phase-{1..5}.md`, baseline e2e green.

## Critical files

- `packages/frontend/src/styles/marketing.tokens.css` (new — everything hangs off this)
- `packages/frontend/src/components/layout/PublicLayout.tsx` (scope class, transitions, font import)
- `packages/frontend/tailwind.config.js` (mkt namespace)
- `packages/frontend/src/components/marketing/` (new primitives + consultation form)
- `packages/frontend/src/pages/public/HomePage.tsx` (largest rework)
- `packages/frontend/src/pages/public/ContactPage.tsx` (multi-step rebuild + legacy purge)
- `.claude/settings.json` + `.claude/hooks/` + `.claude/skills/` + `.claude/rules/frontend/` (Phase 0 removals)
- `CLAUDE.md` (Phase 0.3 — critical requirements for distributed agents)
- `docs/redesign/vibrant-espana-2026-plan.md` (persisted copy of this plan)
- `docs/ui-system/*` (marketing-tier doc amendments)
- `docs/redesign/implementation-matrix.csv` (VIB-0xx rows)
