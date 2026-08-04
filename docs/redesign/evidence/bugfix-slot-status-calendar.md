# Frontend Change Evidence — Slot Status Calendar Fixes

## Scope

- Requirement IDs: CAL-004 (slot event drawer actions), UI-CAL-001 (calendar event tile status tones)
- Roles: Professor
- Routes: `/admin` (CalendarPage)
- BPMN sections: §4 Slot lifecycle, §6 Professor cancellation flow

## Changes (after reviewer corrections)

### Bug fix — "Failed to remove slot" on full group slots

`displayStatus === 'blocked'` matched both BLOCKED slotType (deletable) and `FULLY_BOOKED` status (not deletable). Fixed: Remove Slot button now guards on `slot.slotType === SlotType.BLOCKED` directly.

### Behaviour change — Cancelled slots hidden from calendar

`SlotStatus.CANCELLED` slots are filtered from the calendar events feed. They remain in the database. No professor entry-point currently surfaces them (tracked as follow-up). The drawer `cancelled` path and Remove action remain for future history/filter surface.

### Architecture fix — single status mapping authority

The page-local `slotDisplayStatus` helper (which incorrectly mapped `BLOCKED → 'confirmed'`) has been removed. A canonical `slotDisplayStatus(slot)` is now exported from `packages/frontend/src/lib/ui-system/status.ts` and used by both `CalendarPage` and `SlotEventDrawer`. Both surfaces now agree on the same tone for every slot.

### Visual fix — BLOCKED slots use strengthened neutral tone

`BLOCKED` slotType → `'blocked'` UI tone (Lock icon, "Blocked" label). The `--ui-blocked-*` tokens have been strengthened (surface: 80% → darker; border: 76% → 52%; foreground: 35% → 22%) so personal blocks are visually prominent without being confused with confirmed lessons.

### Title fix — blocked slots default to "Blocked", not "Lesson"

Both `CalendarPage.renderEventContent` and `SlotEventDrawer` now use `t('calendar.blocked_title')` as the fallback title for `slotType === BLOCKED` slots. A lesson with no title still falls back to `t('calendar.lesson')`.

### B4 edge case — full group slot with no visible bookings

`SlotEventDrawer` now renders an `InlineAlert` (info variant) when `displayStatus === 'blocked'` but `slotType !== BLOCKED`, explaining that bookings are confirmed and advising a refresh.

### i18n — new key in all three locales

`calendar.fully_booked_no_actions` added to `en`, `sr`, `es` admin.json.

## Files changed

- `packages/frontend/src/lib/ui-system/status.ts` — added `SlotType` import; exported `slotDisplayStatus(slot)`
- `packages/frontend/src/styles/ui-system.tokens.css` — strengthened `--ui-blocked-*` (light + dark)
- `packages/frontend/src/pages/admin/CalendarPage.tsx` — removed local helper; uses `slotDisplayStatus` from status.ts; blocked-aware title fallback
- `packages/frontend/src/components/ui/slot-event-drawer.tsx` — uses `slotDisplayStatus`; blocked-aware title; B4 InlineAlert; docblock updated
- `packages/frontend/src/components/ui/slot-event-drawer.stories.tsx` — fixed Blocked story (was INDIVIDUAL, now BLOCKED); added BlockedNoTitle, FullyBookedNoVisibleBookings stories
- `packages/frontend/public/locales/en/admin.json` — added `fully_booked_no_actions`
- `packages/frontend/public/locales/sr/admin.json` — added `fully_booked_no_actions`
- `packages/frontend/public/locales/es/admin.json` — added `fully_booked_no_actions`

## State coverage

- [x] Available slot — Edit + Cancel Slot actions
- [x] Pending approval — Approve / Reject actions
- [x] Confirmed lesson — Join meeting / Mark no-show / Cancel actions
- [x] Personal block (BLOCKED slotType) — Remove action; renders stronger neutral grey with Lock icon; title defaults to "Blocked"
- [x] Cancelled — not rendered on calendar; Remove action shown if drawer opened directly
- [x] Full group slot with no visible bookings — InlineAlert shown (B4 edge case)
- [x] Loading states — isLoading spinner on all mutation buttons
- [x] Error states — uiToast.error on all mutation failures

## Responsive

No layout or responsive changes. Token-value and logic changes only.
- [x] 390 / 768 / 1280 / 1440 — unaffected structurally; token values applied globally

## Accessibility

- Lock icon retained for all BLOCKED slots (not replaced with CalendarCheck2)
- Status communicated by icon + label, never color alone
- Title fallback corrected — screen readers announce "Blocked" not "Lesson" for personal blocks
- No structural DOM changes; no new ARIA attributes needed

## Localization

- `calendar.blocked_title` reused (existed: en "Blocked", sr "Blokirano", es "Bloqueado")
- `calendar.fully_booked_no_actions` added in en, sr, es

## Automated verification

- Typecheck: 0 errors
- Lint: 0 errors, 116 warnings (pre-existing)
- `check-ui-system.mjs`: **PASS** — token contrast passed (15 pairs), guardrails passed (6 changed files), Storybook coverage passed
- `frontend-verify.mjs`: **PASS** — typecheck, lint, build all succeed

## UI/UX reviewer decision

**PASS** — All four blocking findings (B1–B4) from the first review are confirmed resolved:
- `slotDisplayStatus()` is canonical in `status.ts`; no page-local mapping exists
- Drawer and calendar tile now agree on status for every slot
- Blocked slots render with Lock icon, "Blocked" label, and correct neutral grey tone
- B4 edge case (full group slot, no visible bookings) shows InlineAlert instead of empty footer

Non-blocking observations noted: `slot as any` cast in `slotToEvent` is a minor cleanup; NO_SHOW mapping to `cancelled` is pre-existing and out of scope.

## Visual design reviewer decision

**PASS WITH OBSERVATIONS** — All blocking visual findings resolved:
- `--ui-blocked-*` tokens strengthened: light foreground/surface contrast ~7.3:1 (AAA), border/page boundary ~3.5:1 (passes WCAG 1.4.11)
- Lock icon flows end-to-end through `slotDisplayStatus → uiStatusDefinition → extendedProps.iconName → CalendarEventTile`
- Title fallback correct in all three locales
- Semantic token utilities only (`bg-status-blocked-*`) — no raw colors

Observations (non-blocking): verify border contrast against actual calendar background token (assumed near-white; estimate is ~3.5:1). Confirm `SlotEventDrawer` imports `slotDisplayStatus` from `status.ts` — confirmed at `slot-event-drawer.tsx:30`.

## Responsive screenshots

Captured at all four required viewports with a BLOCKED slot visible (Lock icon, "Blocked" label, stronger neutral grey tone confirmed in rendered output):

- `docs/redesign/evidence/screenshots/blocked-tokens/calendar-390px.png` — mobile day view
- `docs/redesign/evidence/screenshots/blocked-tokens/calendar-768px.png` — tablet 3-day view
- `docs/redesign/evidence/screenshots/blocked-tokens/calendar-1280px.png` — desktop week view
- `docs/redesign/evidence/screenshots/blocked-tokens/calendar-1440px.png` — wide desktop week view

## Known limitations / follow-up

- Cancelled slots have no history/filter surface on the professor calendar. A "Cancelled" filter tab or history page is needed so professors can access and clean up cancelled slots. Tracked as follow-up; not a blocker for this patch.
- No E2E test added for the slot removal guard fix. Covered by existing `cancellation.spec.ts` professor-cancel path.
