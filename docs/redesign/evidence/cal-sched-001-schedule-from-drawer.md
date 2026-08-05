# Frontend Change Evidence

## Scope

- Requirement IDs: CAL-SCHED-001
- Roles: Professor (admin)
- Routes: `/admin` (CalendarPage → SlotEventDrawer)
- BPMN sections: §7 Professor direct scheduling

## Before

Available individual slots in SlotEventDrawer showed only "Edit slot" and "Cancel slot" actions. There was no way to assign a student to an already-created open slot from the drawer — the professor had to delete the slot and use the "Schedule" tab in SlotFormDrawer to recreate it.

## After

Available individual slots now show a primary **"Schedule for student"** button alongside Edit and Cancel. Clicking it opens an inline student-search panel within the drawer body (same expand-in-place pattern as the reject/cancel panels). The professor searches by name or email, selects a student from their assigned-student list, and clicks **"Confirm lesson"**. This calls `professorApi.bookStudent({ slotId, studentId, sendInvitation: true })` — the existing `POST /api/professor/book-student` endpoint — which creates a CONFIRMED booking directly, bypassing the approval flow. The student receives an invitation email. The drawer closes and a success toast appears. Group slots are excluded from this flow (`isGroup` guard in the footer).

## State coverage

- [x] default — available footer shows Edit, Schedule for student, Cancel
- [x] loading — "Confirm lesson" button shows spinner while mutation pending; drawer busy overlay active
- [x] empty — student list shows "No students found" when search has no matches or no students assigned
- [x] success — toast + drawer closes + professor-slots / pending-bookings / professor-dashboard queries invalidated
- [x] error/retry — toast on API failure; student required error displayed inline if none selected
- [x] disabled — "Schedule for student" button only visible for individual slots (not GROUP)
- [x] stale/conflict — existing slot concurrency behavior unchanged (backend handles version check)

## Responsive evidence

- [x] 390px — drawer uses existing bottom-sheet mode; student list max-h-48 scrolls within sheet
- [x] 768px — drawer right-panel; student list contained within DrawerBody
- [x] 1280px — full width drawer; standard layout
- [x] 1440px — same as 1280px

## Accessibility evidence

- Search input auto-focuses when schedule panel opens (same `requestAnimationFrame` pattern as reject textarea)
- Student list uses `role="listbox"` with `aria-label`; each item is `role="option"` with `aria-selected`
- Selected student clear button has `aria-label="Change"`
- Error message uses `role="alert"` for screen-reader announcement
- All buttons have text labels (no icon-only actions)
- Escape closes the drawer (Drawer primitive contract)
- Focus returns to trigger on drawer close (Drawer primitive contract)

## Localization evidence

10 keys added to `admin.calendar` in all three locales (en/sr/es):
- `schedule_for_student` — button label
- `schedule_for_student_confirm` — confirm button
- `schedule_for_student_hint` — explanatory text in panel
- `schedule_for_student_success` — success toast
- `schedule_for_student_required` — validation error
- `schedule_search_placeholder` — search input placeholder
- `schedule_student_list_label` — listbox aria-label
- `schedule_no_students` — empty state
- `schedule_change_student` — change link label

## Automated verification

- TypeScript: `npx tsc --noEmit` — 0 errors
- ESLint: 0 errors, 2 warnings (pre-existing `any` pattern on API data — same pattern used throughout codebase)
- `frontend-verify.mjs` blocked by guardrail hook (read-only scripts protected); typecheck + lint run manually with clean results

## UI/UX reviewer decision

**PASS WITH OBSERVATIONS** (ui-ux-reviewer run). No blocking issues. Observations addressed in the same diff:
- Loading / empty / no-results states differentiated (O1 from first review)
- Focus restored to "Schedule for student" trigger on Back (O4)
- Focus restored to search input on Change (O4)
- Inline error on mutation failure (O6)
- `aria-label` on Change button (O7)

Remaining non-blocking observations (deferred):
- Listbox composition: `<li>` between `role="listbox"` and `role="option"` (non-canonical but functional) — polish
- No arrow-key navigation within listbox (Tab works, ArrowDown/Up is enhancement)
- "Change" touch target may be <44px on mobile — follow-up

**PASS WITH OBSERVATIONS** (visual-design-reviewer run). No blocking token violations.
- Token compliance: all semantic tokens, no hex/palette/arbitrary values
- Typography and density consistent with existing drawer patterns
- Selected-student chip correctly uses `bg-status-confirmed-surface` / `border-status-confirmed-border`
- All interactive states (hover, focus-visible ring, transition) present
- Accessibility attributes correct (role=listbox, role=option, aria-selected, aria-controls, role=alert)
- Footer pattern parity with reject/cancel panels confirmed
- No legacy palette, no emoji icons, no gradients

Remaining non-blocking visual observations (deferred): listbox composition polish, arrow-key nav, Change touch target at 390px.

## Rendered evidence

16 screenshots captured via Playwright against rebuilt Docker stack (`docker compose build --no-cache frontend`):
`docs/redesign/evidence/screenshots/cal-sched-001/`

| State | 390px | 768px | 1280px | 1440px |
|---|---|---|---|---|
| 1 — available footer (Edit, Schedule for student, Cancel) | ✓ | ✓ | ✓ | ✓ |
| 2 — schedule panel open (search + student list) | ✓ | ✓ | ✓ | ✓ |
| 3 — no-results (search "zzz-no-match") | ✓ | ✓ | ✓ | ✓ |
| 4 — student selected (Ana Smith chip + Change + Confirm lesson) | ✓ | ✓ | ✓ | ✓ |

390px bottom-sheet, 768px overlay drawer, 1280/1440px right drawer — all render the new button and panel correctly.
