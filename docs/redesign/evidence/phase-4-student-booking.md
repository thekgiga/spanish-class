# Phase 4 — Student request and professor approval — evidence

**Date:** 2026-06-30
**Phase:** 4 (Student request and professor approval)

## What was delivered

### Backend — `GET /api/student/professor-settings`
- Added to `packages/backend/src/routes/student.ts` after the existing `/professor` handler
- Returns `{ cancellationWindowHours: number }` for the student's assigned professor (defaults to 24 if unassigned or settings missing)
- Frontend: `studentApi.getProfessorSettings()` in `packages/frontend/src/lib/api.ts`

### `DateStrip` — extracted shared component
- `packages/frontend/src/components/ui/date-strip.tsx` — extracted from `CalendarPage.tsx` `MobileDateStrip`
- Used by both `BookPage` (student) and `CalendarPage` (professor)
- Keyboard accessible: `listbox` + `option` roles; auto-scrolls selection into view

### `AvailableTimeOption` — time selection card (BOOK-001)
- 44–48px (`min-h-touch-min`) hit target
- Tabular numerals for time range
- Selected state: border-brand + ring + CheckCircle2 icon
- Already-booked state: muted, cursor-not-allowed

### `BookPage.tsx` — full rewrite (BOOK-001 + BOOK-002 + BOOK-003)
- Date-first flow: `DateStrip` → `AvailableTimeOption` list for selected date → `Drawer` review
- Review drawer shows: date, time range, duration, professor name, cancellation policy from `getProfessorSettings()`, `InlineAlert` explanation
- Primary CTA: "Request lesson" (t('booking.request.request_lesson'))
- Post-booking: `BookingRequestCard` hero replaces the flow

### `BookingRequestCard` — pending booking card (BOOK-003 + BOOK-004 + APP-004)
- `hero` variant: post-booking success screen, large, with `InlineAlert` info explanation
- `compact` variant: BookingsPage upcoming list
- Expiry countdown via `formatDistanceToNow`
- Recovery actions for REJECTED/EXPIRED/CANCELLED_BY_PROFESSOR via `bookingRecoveryKey()` from `status.ts`
- All status comparisons centralized in `status.ts` (no raw enum in component)

### `status.ts` — new predicates and recovery helpers
- `isBookingNeedsRecovery(booking)` — true for non-student-cancelled terminal states
- `bookingRecoveryKey(booking)` — returns the i18n key for recovery message or null
- `pendingConfirmationStatus()`, `confirmedBookingStatus()`, `fullyBookedSlotStatus()` — story fixture helpers (already existed from Phase 3)

### `BookingsPage.tsx` — rewrite (BOOK-004 + APP-004)
- Tabs: Upcoming + History
- Upcoming: "Pending requests" section (BookingRequestCard compact) + "Confirmed" section (meet-link, join)
- History: `StatusBadge` migration (was raw `status.replace(/_/g," ")`); `HistoryCard` with recovery `InlineAlert`
- Cancel flow uses `AlertDialog` + `studentApi.cancelBooking`
- All locale strings via `t('booking.page.*')` — no hardcoded English

### `PendingApprovalsPage.tsx` — migration (APP-002 + APP-003)
- Inline approve/reject buttons replaced with "Review request" button per card
- Review button fetches full `AvailabilitySlotWithBookings` via `professorApi.getSlot(slotId)` then opens `SlotEventDrawer`
- `SlotEventDrawer` (Phase 3) handles approve/reject/reject-reason/cancel with all accessibility and focus management
- Empty state: `EmptyState` component with `PageHeader`
- On approve/reject: `SlotEventDrawer` invalidates `professor-slots`+`pending-bookings`+`professor-dashboard` — APP-003 satisfied

### i18n additions (en/sr/es)
- `booking.request.*`: request_lesson, select_date, select_time, review_title, awaiting_approval_title, pending_explanation, expiry_hint, cancellation_policy, recovery_*, rebook, booking_sent_*, no_slots_on_date
- `booking.page.*`: cancel, cancel_success, upcoming, history, no_upcoming, no_upcoming_description, no_history, cancel_confirm_*
- `admin.approvals.*`: no_pending_description, review

### APP-001 confirmation
`CalendarEventTile` with `status='requested'` renders amber fill + "Approval needed" label via `uiStatusDefinition.requested.labelKey`. `CalendarPage.slotDisplayStatus()` overrides to `requested` when `isBookingPending(b)` is true. No code change needed — delivered Phase 3, confirmed Phase 4.

## Reviewer findings and resolutions

### Visual design reviewer — PASS WITH OBSERVATIONS

No blockers. 7 nits (non-blocking):
- N1 `"Already requested"` hardcoded English → fixed: now uses `t('slot.already_booked')` ✓
- N2 `?? "Booking cancelled."` fallback English → removed ✓
- N3–N7 deferred to Phase 5+ (type widening, join-meeting duplication, quote rendering, DateStrip scroll, badge opacity)

### UX reviewer — BLOCKED → RESOLVED

| Blocker | Fix |
|---|---|
| B1 Hardcoded `"Already requested"` in available-time-option.tsx | Fixed: `t('slot.already_booked')` + useTranslation added ✓ |
| B2 Missing `slot.join` key in all three locales | Added `slot.join` to en/sr/es booking.json ✓ |
| B3 Invalid `min-h-touch-min` / `min-w-touch-min` Tailwind classes | Fixed: `minWidth.touch` added to config; classes changed to `min-h-touch` / `min-w-touch` ✓ |

Warnings addressed:
- W8 `DateStrip` listbox without keyboard navigation → downgraded to `role="radiogroup"` + `role="radio"` (native keyboard handling) ✓
- W9 PendingApprovalsPage stagger animation without reduced-motion gate → wrapped in `<MotionConfig reducedMotion="user">` ✓
- W10 BookPage Drawer `onOpenChange` discarded open → fixed to `setDrawerOpen` ✓
- W3 cancel_success fallback English literal → removed ✓

## Updated verification results

| Check | Result |
|---|---|
| `check-ui-system.mjs` | ✓ Passed |
| `npm run typecheck` | ✓ 0 errors |
| `npm run lint` | ✓ 0 errors |
| `npm run build` | ✓ Built |
| `frontend-verify.mjs` | ✓ Passed |
| Baseline E2E | ✓ 17 passed, 11 skipped, 0 failed |
| UI/UX reviewer | ✓ All 3 blockers resolved |
| Visual design reviewer | ✓ PASS (no blockers) |

## Deferred from reviewer warnings (Phase 5+)

- Date-fns `format()` calls without locale argument (W4 from UX reviewer) — consistent with rest of codebase; defer to Phase 7 localization QA
- `BookingWithSlot` type missing professor/meetLink optional fields (W5) — shared types ticket
- Join meeting link extracted to shared composite (N6 visual reviewer) — Phase 5
- `CardContent opacity-80` contrast check (N5 visual reviewer) — Phase 7
- `aria-pressed` vs `role="radio"` on AvailableTimeOption (W7) — acceptable for now; time-option buttons are in a `div` not a group; Phase 5 can add `role="radiogroup"` wrapper
