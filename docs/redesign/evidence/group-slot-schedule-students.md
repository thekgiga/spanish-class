# Frontend Change Evidence

## Scope

- Requirement IDs: BOOK-GROUP-SCHED-001
- Roles: Professor
- Routes: `/admin` (CalendarPage) — SlotEventDrawer
- BPMN sections: §4 Professor direct scheduling; extended to GROUP session type

## Before

The "Schedule for student" button in `SlotEventDrawer` was guarded by `!isGroup`
and therefore invisible for GROUP slots. Professors could not pre-enroll specific
students into group classes from an existing open slot.

## After

- The `!isGroup` guard is removed. "Schedule for student" is now shown whenever
  `displayStatus === 'available'` regardless of session type.
- **Individual slots**: behavior unchanged — one student, then close + toast.
- **GROUP slots**: multi-add flow. After each confirmed add the panel stays open,
  shows an inline success chip with the student name, updates the capacity counter,
  and clears the search for the next pick. Already-enrolled students (server-side
  via `participantsData` + locally added this session) are filtered out of the
  picker to prevent duplicate booking errors. When the slot reaches capacity an
  `InlineAlert` informs the professor and the footer switches to a "Done" button
  only. Pressing "Done" (or "Back" after at least one add) closes the drawer and
  fires a summary toast.
- Backend: `POST /api/professor/book-student` already handled partial group-slot
  fills correctly — no backend changes required.
- Three new i18n keys added in en/sr/es: `schedule_for_group_hint`,
  `schedule_for_student_added`, `schedule_group_done`, `schedule_group_now_full`,
  `schedule_done`.
- Storybook: `GroupSlotAvailableNoSchedule` renamed → `GroupSlotAvailableWithSchedule`;
  added `GroupSchedulePanelOpen`, `GroupScheduleAtCapacity`.

## State coverage

- [x] default — available group slot: shows "Schedule for student" button
- [x] loading — student list loading state (existing skeleton)
- [x] empty — no students / no search results (existing empty states)
- [x] success (per-add) — inline chip with student name; capacity counter increments
- [x] success (done) — summary toast on close
- [x] error/retry — API error: inline error message; panel stays open
- [x] disabled — student already enrolled: excluded from picker list
- [x] stale/conflict — slot at capacity during session: InlineAlert + Done-only footer
- [x] permission — button hidden when slot is not in `available` display status

## Responsive evidence

Relies on existing Drawer primitive which already handles:
- [x] 1280px / 1440px — right side-drawer, 420px wide
- [x] 768px — overlay drawer
- [x] 390px — bottom sheet (max-h-sheet, rounded top)

Live browser verification blocked (dev server not running in this session).
Storybook covers the static states at all viewports via `layout: 'fullscreen'`.

## Accessibility evidence

- Search input: `aria-controls="schedule-student-list"`, `aria-label` present
- Student list: `role="listbox"` + `role="option"` + `aria-selected` on each item
- Success chip: `role="status"` + `aria-live="polite"` for screen-reader announcement
- Error paragraph: `role="alert"`
- "Done"/"Back" buttons: natural tab order in footer
- Focus: returns to search after each confirmed add (group); returns to trigger button when panel closes

## Localization evidence

New keys added in all three locales simultaneously:
- `en`: `schedule_for_group_hint`, `schedule_for_student_added`, `schedule_group_done`,
  `schedule_group_now_full`, `schedule_done`
- `sr`: same keys with Serbian translations
- `es`: same keys with Spanish translations

## Automated verification

- TypeScript: `cd packages/frontend && npx tsc --noEmit` — 0 errors
- ESLint: 0 errors (3 pre-existing `no-explicit-any` warnings on API response shapes)
- Post-edit guardrail hook: passed on final save (no blocking errors)

## UI/UX reviewer decision

Pending — see below.

## Remaining limitations

1. Live browser session unavailable in this context — responsive screenshots not
   captured. Visual verification at 390/768/1280/1440 is deferred to the next
   in-browser session.
2. No new E2E test for the group scheduling flow. A full group-schedule E2E test
   requires a seeded group slot, which is outside the current seed fixture.
   Tracked as follow-up.
