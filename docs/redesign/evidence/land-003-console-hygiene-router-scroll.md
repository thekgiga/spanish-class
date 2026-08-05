# Frontend Change Evidence — Console hygiene: router future flags + scroll container position

## Scope

- Requirement IDs: LAND-003
- Roles: Public (landing hero); Both (app-wide router wrapper)
- Routes: `/` (HomePage `PaellaScrollStory`); all routes (BrowserRouter)
- BPMN sections: None (no business logic touched)

## Problem

The browser console on the landing page was flooded with three actionable items
(plus benign dev-only i18next/React-DevTools notices):

1. **React Router future-flag warnings** (`v7_startTransition`, `v7_relativeSplatPath`)
   — emitted with large stack traces on every mount.
2. **framer-motion**: "Please ensure that the container has a non-static position…"
   — the `useScroll({ target: containerRef })` measurement target on the landing
   hero was `position: static`, so scroll offset could be miscalculated (this drives
   the paella scroll-scrub video's `currentTime`).

## Before

- `App.tsx`: `<BrowserRouter>` with no `future` prop → two v7 future-flag warnings.
- `HomePage.tsx`: outer scroll-sizing container `<div ref={containerRef} style={{height}}>`
  was `position: static` → framer-motion warning.

## After

- `App.tsx:345`: `<BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>`.
- `HomePage.tsx:199-203`: outer container gains `className="relative bg-hero-bg"`.
  Inner layer remains `sticky top-0`.

Intended rendered diff: **zero pixels**. Both changes are correctness/hygiene only.

## State coverage

Not applicable — no async flow, form, or data-bearing surface changed. No
loading/empty/error/success/disabled/conflict states are affected. The landing
hero's existing scroll-scrub, reduced-motion snap, and CTA visibility gate are
untouched.

## Responsive evidence

`position: relative` with no inset offsets does not move the box or create a
stacking context; the sole child is the `sticky top-0` layer whose containing
block is unchanged. No layout change at any width. Formal re-capture deferred
(zero-pixel diff); prior LAND-001 responsive screenshots at 390/768/1280/1440
remain representative.

- [ ] 390px (unchanged from LAND-001 baseline)
- [ ] 768px (unchanged from LAND-001 baseline)
- [ ] 1280px (unchanged from LAND-001 baseline)
- [ ] 1440px (unchanged from LAND-001 baseline)

## Accessibility evidence

No focusable elements, semantics, or motion behavior changed. Global
`<MotionConfig reducedMotion="user">` and `useReducedMotion()` gate intact.
`v7_startTransition` only changes React scheduling of router state updates; it
does not alter guard evaluation or focus.

## Localization evidence

No strings added or changed. N/A across en/sr/es.

## Automated verification

- `tsc --noEmit` (packages/frontend): exit 0.
- `eslint src/App.tsx src/pages/public/HomePage.tsx`: exit 0.
- `node scripts/uiux/check-ui-system.mjs`: PENDING — blocked by the
  `protect-guardrail-bash.mjs` PreToolUse hook (false positive: the read-only
  command `node …scripts/uiux/…` matches the hook's mutation heuristic; the
  sanctioned `UIUX_ALLOW_GUARDRAIL_EDIT=1` override cannot be injected into the
  hook's own process from a Bash tool call). To be run by operator:
  `UIUX_ALLOW_GUARDRAIL_EDIT=1 node scripts/uiux/check-ui-system.mjs`.
- `node scripts/uiux/frontend-verify.mjs`: PENDING — same blocker.

## UI/UX reviewer decision

Independent `ui-ux-reviewer`: **APPROVE**, no blocking findings.
- (a) Adding `relative` does not change stacking/layout of the sticky hero at any
  viewport — no inset offsets, `z-index: auto`, sole child already establishes its
  own containing block via `sticky`.
- (b) `v7_relativeSplatPath` is safe — the only splat route (`path="*"`) renders an
  absolute `<Navigate to="/" replace />`; all `Link`/`navigate`/`NavLink` targets are
  absolute; no nested `<Routes>` within a splat. `v7_startTransition` does not alter
  guard evaluation or redirect targets.
- (c) No accessibility/reduced-motion impact.

## Remaining limitations

- Two mandated uiux scripts (`check-ui-system.mjs`, `frontend-verify.mjs`) are
  BLOCKED by the Bash guardrail hook and must be run by the operator with the
  `UIUX_ALLOW_GUARDRAIL_EDIT=1` override. Until their output is confirmed green,
  this row is not fully closed.
- Reviewer noted a before/after landing-hero screenshot at 390 and 1280 is the
  cheapest sufficient visual proof if the matrix row expects it; deferred given the
  intended zero-pixel diff.
