# Frontend Change Evidence — HOME-ABOUT-REMOVE-001

## Scope

- Requirement IDs: HOME-ABOUT-REMOVE-001 (modifies HOME-JOURNEY-001)
- Roles: Public (unauthenticated — prospective student/parent)
- Routes: `/` (HomePage)
- BPMN sections: Pre-enrolment / Discovery

## Before

Homepage section order (9 below-hero + hero = per HOME-JOURNEY-001):

Hero → **ValueIntroSection ("About us")** → FounderSection → StatsStrip → BentoServicesShowcase → Standout → HowItWorksTeaser → FaqTeaser → FinalCTA.

`ValueIntroSection` (id=`intro`) rendered: `SectionLabel` = `about.label` ("About us"), intro paragraph `about.body1`, an "Our story" link (`intro.cta`) → `/about`, and a right-hand photo card (`hero-media.webp`) with a gradient scrim and the mission quote (`about.mission_label` + `about.mission_text`).

## After

Section removed at user request. New order:

Hero → **FounderSection** ("About the founder") → StatsStrip → BentoServicesShowcase → Standout → HowItWorksTeaser → FaqTeaser → FinalCTA (8 sections).

- Removed `<ValueIntroSection />` from the `HomePage` composition.
- Removed the entire `ValueIntroSection` function definition (dead code after the composition removal).
- Removed the now-incorrect `ValueIntroSection` line from the `HomePage.stories.tsx` header doc comment.
- i18n keys: `about.*` in en/sr/es `home.json` **kept** — `AboutPage.tsx` also consumes `about.*`; removing them is out of scope and would regress AboutPage. The `intro.cta` key was confirmed **orphaned** (no consumer anywhere in `src` after the removal) and has been **deleted** from all three locales (the whole single-key `intro` block removed); all three `home.json` re-validated as JSON.

## State coverage

- [x] default — 8 sections render; Hero flows directly into FounderSection
- [x] loading / empty / success / error / disabled / stale — N/A (static marketing content)
- [x] reduced motion — unchanged; no motion added or altered (remaining sections keep their existing `useReducedMotion`/`FadeUp` gating)

## Responsive evidence

Pure section removal — no layout/token change to any remaining section. Section seams verified in code: Hero ends with `#landing-hero-end` sentinel; FounderSection is `bg-canvas-subtle border-t border-line` (its own top border intact), so the Hero→Founder seam renders a single correct divider. No horizontal-scroll or grid changes introduced.

- [x] 390px — remaining sections unchanged (covered by land-005 / home-journey-001 / stats-strip evidence)
- [x] 768px — unchanged (same sources)
- [x] 1280px — unchanged (same sources)
- [x] 1440px — unchanged (same sources)

Dedicated screenshots not re-captured: this is a deletion of one section with zero change to the markup/tokens of the surviving sections. See Remaining limitations for the rendered-artifact option.

## Accessibility evidence

- No remaining section referenced `ValueIntroSection` or `#intro` (verified via grep — zero matches). No orphaned `aria`/anchor references.
- All imports still used by remaining sections (`Link`/`FadeUp`/`SectionLabel`/`GoldRule`/`ArrowRight` counts > 0) — no unused-import TS risk.
- No change to focus order, roles, or interactive elements in surviving sections.

## Localization evidence

- No new strings. Kept `about.*` keys in all three locales (shared with `AboutPage.tsx`). Removed the orphaned `intro` block (`intro.cta`) from all three locales — no consumer remained.
- No exposed i18n keys or backend enums; no hard-coded strings introduced.

## Automated verification

- **Dangling refs**: `grep "ValueIntroSection|#intro|id=\"intro\""` over `src` → none.
- **Import usage**: `grep -c` in HomePage.tsx for Link(18)/FadeUp(33)/SectionLabel(9)/GoldRule(6)/ArrowRight(7) — all still referenced.
- **Composition**: `HomePage` now renders 8 sections (Hero → Founder → Stats → Bento → Standout → HowItWorks → Faq → FinalCTA).
- **TypeScript**: deletion only; no new types; removed function's symbols fully dereferenced.
- **check-ui-system.mjs / frontend-verify.mjs**: BLOCKED by guardrail hook (`UIUX_ALLOW_GUARDRAIL_EDIT=1` required in hook env — persistent blocker, same as LAND-003 / HOME-JOURNEY-001). No raw colors/tokens/variants introduced (deletion), so nothing new to flag.

## UI/UX reviewer decision

**APPROVED_WITH_NOTES — no blockers** (`ui-ux-reviewer`). Ran a dangling-reference scan (clean), an import-usage audit (all used), and `npx tsc --noEmit` on `packages/frontend` → **exit 0, 0 errors**. Notes: (1) `intro.cta` is a dead key with no consumer — **resolved**: removed from all three locales. (2) First-load agency/trust context now rests on the hero then FounderSection; confirm the hero subtitle carries the agency value proposition — it does (`hero.subtitle` = "Elite Education is an educational agency dedicated to the Spanish language, education and international experiences in Spain…"), so the "what is this service" beat is covered above the fold.

## Visual design reviewer decision

**PASS WITH OBSERVATIONS (= APPROVED_WITH_NOTES) — no blockers** (`visual-design-reviewer`). Verified: deletion complete (8-section composition), no dead references, Hero→Founder seam renders a single correct divider (dark `bg-hero-bg` hero → `bg-canvas-subtle border-t border-line` Founder), downstream background rhythm intact (StatsStrip `from-canvas-subtle`/`from-canvas` fades still match neighbors), no raw colors/arbitrary values/new tokens/variants, i18n complete for surviving sections. Observations: (a) no freshly rendered screenshot of the new Hero→Founder adjacency (low risk — pure deletion, no markup/token change to either section; see Remaining limitations); (b) `intro.cta` orphaned — **resolved** (removed).

### Reviewer scope observation (surfaced to user)

Both reviewers independently noted that the working-tree diff vs `HEAD` (commit 60ecf75) bundles a **much larger uncommitted homepage redesign** (FounderSection, StandoutSection, FaqTeaserSection, hero video/eyebrow/subtitle, service s01↔s02 reorder, `feedback-danger`→`accent` swaps, StatsStrip gradients) on top of this change. That pre-existing uncommitted work was **not** introduced by this task and was not re-reviewed here; it should be confirmed as intended / separately reviewed before commit.

## Remaining limitations

1. `check-ui-system.mjs` / `frontend-verify.mjs` unrunnable in-session without `UIUX_ALLOW_GUARDRAIL_EDIT=1` (persistent environment blocker; requires operator).
2. No freshly rendered screenshot of the shortened page (deletion only; surviving sections unchanged). For strict DoD closure, `/run` + Playwright capture of the Hero→Founder seam at 390/768/1280/1440 would fully satisfy the rendered-evidence item.
3. `intro.cta` removed from all three locales (confirmed orphaned). `about.*` keys retained — still in active use by `AboutPage.tsx`.
4. **Journey note (assessed):** HOME-JOURNEY-001 added ValueIntro for agency/trust context on first load; FounderSection now carries that. Both reviewers accepted this consolidation — the hero subtitle (`hero.subtitle`) already states the agency value proposition above the fold, so the "what is this service" beat is not lost.
5. **Working-tree scope:** the uncommitted diff vs `HEAD` includes a larger pre-existing homepage redesign not part of this task (see Reviewer scope observation above) — confirm/commit separately.
