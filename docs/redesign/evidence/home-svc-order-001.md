# Frontend Change Evidence — HOME-SVC-ORDER-001

## Scope

- Requirement IDs: HOME-SVC-ORDER-001 (refines LAND-005 bento / HOME-JOURNEY-001)
- Roles: Public (unauthenticated — prospective student/parent)
- Routes: `/` (HomePage → BentoServicesShowcase), `/services` (ServicesPage card grid)
- BPMN sections: Pre-enrolment / Discovery (understand the offer, perceive the flagship service)

## Before

Services were numbered by i18n keys `services.sNN_number`:

- s01 Spanish language = **I**
- s02 Studies in Spain = **II**
- s03 Language camps = III
- s04 Consultations = IV

On the homepage bento, the large 2×2 **lead** tile renders `s02` (Studies in Spain) but displayed numeral **II**, while the smaller Spanish-language tile (`s01`) displayed **I** — so the flagship tile carried a higher numeral than a secondary tile, and reading order went II → I → III → IV. User requested Studies in Spain be numbered **I** (the #1 service) and Spanish language **II**.

## After

Numerals swapped (content-only) so numbering is sequential in reading order on both surfaces:

- s02 Studies in Spain = **I**  (homepage flagship lead tile)
- s01 Spanish language = **II**
- s03 Language camps = III
- s04 Consultations = IV

Two surfaces share these keys, so to avoid introducing an out-of-order regression on `/services`:

- `ServicesPage` `SERVICE_CARDS` array reordered `[s01,s02,s03,s04]` → `[s02,s01,s03,s04]` so the grid reads I, II, III, IV top-to-bottom. Each card keeps its own image (`service-card-0N.webp` stays bound to its key; both reordered cards were already `eager`).

The separate, unrelated `how_we_work.sNN_number` process-step set (We talk / explore / organise / support = I–IV) was deliberately left untouched.

## State coverage

- [x] default — numerals render correctly on both surfaces
- [x] loading — N/A (static marketing content, no async data)
- [x] empty — N/A
- [x] success — numbering reads I→IV in order on homepage bento and services grid
- [x] error/retry — N/A
- [x] disabled — N/A
- [x] stale/conflict — N/A
- [x] reduced motion — unchanged; no motion added or altered

## Responsive evidence

No layout change — numerals occupy the same glyph slots as before (`TileHead` number slot on homepage; bottom-left overlay on ServicesPage cards). Grid/structure untouched.

- [x] 390px — no structural change; bento single-col / services single-col unaffected (covered by LAND-005 `evidence/land-005/` + ABOUT-002 ServicesPage evidence)
- [x] 768px — unaffected (same source)
- [x] 1280px — unaffected (same source)
- [x] 1440px — unaffected (same source)

Dedicated screenshots not re-captured because this is a single-character text swap + display-order change with zero layout/token impact; prior bento/services viewport evidence remains valid.

## Accessibility evidence

- Numerals are decorative in both surfaces: homepage `TileHead` number `<span ... aria-hidden="true">`; ServicesPage numeral is wrapped in an overlay `<div ... aria-hidden="true">` (added in this change — see below). Service identity is conveyed by the visible `SectionLabel` + `<h2>/<h3>` title, not the numeral. No semantic/label regression.
- **a11y consistency fix applied in this change:** the ui-ux-reviewer noted the ServicesPage numeral overlay was not `aria-hidden` (unlike the homepage numerals), so a screen reader would announce a bare "I"/"II". Since this change already touches `ServicesPage.tsx`, added `aria-hidden="true"` to the numeral overlay div (`ServicesPage.tsx:54`) to match HomePage. Pre-existing minor gap, now aligned.
- No change to focus order, roles, or interactive elements.

## Localization evidence

- Roman numerals are locale-independent; identical values applied to all three locales.
- `services.s01_number` = "II", `services.s02_number` = "I" verified present in `en/home.json`, `sr/home.json`, `es/home.json`.
- All three `home.json` files parse as valid JSON (`node JSON.parse` check passed).
- No exposed i18n keys or backend enums.

## Automated verification

- **JSON validity**: `node -e JSON.parse(...)` on en/sr/es `home.json` — all valid.
- **Numeral assignment**: `grep '"s0[1-4]_number"'` on en/home.json confirms services block = s01:II, s02:I, s03:III, s04:IV; `how_we_work` block unchanged (s01:I, s02:II, ...).
- **TypeScript**: ServicesPage change is an array-literal reorder with unchanged `as const` keys — no type surface change.
- **check-ui-system.mjs / frontend-verify.mjs**: BLOCKED by guardrail hook (`protect-guardrail-bash.mjs` refuses to exec anything under `scripts/uiux/` without `UIUX_ALLOW_GUARDRAIL_EDIT=1` in the hook env). Persistent operator-action blocker, identical to LAND-003 / HOME-JOURNEY-001. Operator can run: `UIUX_ALLOW_GUARDRAIL_EDIT=1 node scripts/uiux/check-ui-system.mjs` and `... frontend-verify.mjs`. Change introduces no raw colors/tokens/variants, so these validators have nothing new to flag.

## UI/UX reviewer decision

**APPROVED_WITH_NOTES — no blockers** (`ui-ux-reviewer`). Confirmed: numbering correct and sequential on both surfaces in all three locales; `how_we_work` set untouched; numeral↔service↔image pairing intact; numerals decorative on homepage. One non-blocking, pre-existing observation: ServicesPage numeral overlay was not `aria-hidden` → **fixed in this change** (see Accessibility).

## Visual design reviewer decision

**APPROVED_WITH_NOTES — no blockers** (`visual-design-reviewer`). Confirmed: no raw colors / arbitrary values / new tokens / new variants; numeral styling (`text-ink/15` homepage, `text-hero-fg/60` services) unchanged — only the glyph differs; flagship lead tile correctly shows the lowest numeral "I" at the largest glyph size; `how_we_work` ordinals correctly untouched. Non-blocking notes: (a) `services.s02_highlights` and `faq.read_more` keys also present in the working-tree diff — these are **pre-existing** changes from prior homepage work (the three `home.json` files were already `M` in git status at session start), not introduced by this numeral swap; (b) no freshly rendered screenshot of the swapped numerals (see Remaining limitations).

## Remaining limitations

1. `check-ui-system.mjs` / `frontend-verify.mjs` unrunnable in-session without `UIUX_ALLOW_GUARDRAIL_EDIT=1` (persistent environment blocker; requires operator). No raw colors/tokens/variants introduced, so nothing new for them to flag.
2. No freshly rendered per-viewport screenshot of the swapped numerals was captured (single-character glyph substitution inside an unmodified styled container; hierarchy verified from code by both reviewers; prior `land-005/` bento + ServicesPage viewport evidence remains valid). For strict DoD closure, a quick capture of the homepage bento (flagship "I") and ServicesPage grid (I→IV) would fully satisfy the rendered-evidence item — recommend running `/run` + Playwright capture if a rendered artifact is required.
3. No new tests — content/order change on a static marketing surface with no user-state flow.
