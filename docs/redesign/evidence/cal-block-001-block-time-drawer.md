# Frontend Change Evidence

## Scope

- Requirement IDs: CAL-BLOCK-001
- Roles: Professor
- Routes: POST /api/professor/slots (slotType=BLOCKED)
- BPMN sections: Slot creation / Professor schedule workspace

## Before

Clicking "Block time" in CalendarSelectionComposer immediately created a BLOCKED slot via a direct `blockMutation` in `CalendarPage.tsx` — no title, no all-day option, no confirmation step.

## After

"Block time" now opens `SlotFormDrawer` with `mode='blocked'` (prefill.blockTime=true). The drawer shows:
- 3-tab segmented control: My Availability / Schedule a class / Block time (each tab has an icon: CalendarDays / UserPlus / Ban).
- Date and start-time selectors; duration presets.
- "Block the whole day" checkbox — hides start-time and duration, shows hint "Blocks the entire day (00:00–23:59)", posts start 00:00 / end 23:59.
- Optional title field.
- No session-type, visibility, or recurrence controls in blocked mode.
- Title changes to "Block time" in this mode; submit button reads "Block time" / "Blocking…" while pending.
- Edit mode: if the existing slot has slotType=BLOCKED, hydrates with mode='blocked' so visibility/recurrence controls remain hidden.

## State coverage

- [x] default — drawer opens on Block time tab with date prefilled from selection range
- [x] loading — submit button shows "Blocking…" spinner via blockMutation.isPending
- [x] empty — title field is optional; no required fields beyond date
- [x] success — uiToast.success(t('calendar.blocked_created')); drawer closes; calendar query invalidated
- [x] error — uiToast.error(t('calendar.error_generic')) on API failure (including overlap 400)
- [x] disabled — all inputs disabled while anyPending
- [x] overlap warning — InlineAlert shown when new time overlaps existing slot (all-day uses effectiveStartTime 00:00)
- [x] edit mode — existing BLOCKED slot hydrates to blocked mode; non-blocked slots hydrate to availability mode

## Responsive evidence

- [ ] 390px — deferred (no live browser in this environment; documented as known gap)
- [ ] 768px — deferred
- [ ] 1280px — deferred
- [ ] 1440px — deferred

## Accessibility evidence

- `role="tablist"` with `aria-label={t('slot_form.mode_tablist_label')}` — stable label independent of selection
- Each tab: `role="tab"` + `aria-selected`
- All-day checkbox: `<Checkbox id="sf-all-day">` associated with `<label htmlFor="sf-all-day">`
- Icons: all `aria-hidden="true"`
- O3 (focus loss on allDay toggle) documented as known limitation — not fixed in this slice

## Localization evidence

- Keys added in en/sr/es: `tab_block`, `title_block`, `create_block`, `blocking`, `all_day_label`, `all_day_hint`, `mode_tablist_label`
- SR and ES button labels use full verb+object form consistent with `create_availability` / `create_schedule` convention

## Automated verification

- `npx tsc --noEmit` — PASS (0 errors)
- `eslint src/components/ui/slot-form-drawer.tsx src/pages/admin/CalendarPage.tsx --max-warnings=0` — PASS

## UI/UX reviewer decision

First review: BLOCKED (B1 screenshots, B2 E2E, B3 icon imbalance + aria-label instability).
After fixes (B3 icon balance, O1 label alignment, O2 all-day hint, O4 edit hydration): B1/B2 remain deferred (no live browser). See remaining limitations.

## Remaining limitations

- B1: Visual screenshots at 390/768/1280/1440 not captured — deferred pending live environment
- B2: E2E spec for the new drawer path not written — deferred (test environment requires seeded slots)
- O3: Focus loss when allDay toggle unmounts start-time/duration fields — not fixed in this slice
- O5: Tab semantics incomplete (no `aria-controls`, no arrow-key roving tabindex) — pre-existing structural issue
- O6: Storybook stories exist but do not demonstrate overlap warning or loading state
- O7: Title placeholder identical across modes — cosmetic, deferred
