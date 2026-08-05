# Phase 5 — Lessons and students — evidence

**Date:** 2026-06-30
**Phase:** 5 (Lessons and students)

## What was delivered

### LESSON-S-001 — no new code
`BookingsPage.tsx` was rewritten in Phase 4 with Upcoming (pending + confirmed) and History tabs. Marked Done in matrix; evidence at `phase-4-student-booking.md`.

### StudentDashboard.tsx — full rewrite (HOME-S-001 + MEET-001)

Priority stack per approved blueprint (§Student — Home):
1. **Next confirmed lesson hero** — `Card variant="selected"` + `StatusBadge confirmed` + `MeetingReadiness`
2. **Pending request card** — `BookingRequestCard` hero/compact (no confirmed lesson)
3. **Book a lesson CTA** — always shown below hero
4. **Recent activity** — last 3 completed lessons with `StatusBadge`

**MeetingReadiness** (MEET-001):
- Props: `startTime`, `meetLink`
- Renders "Opens in X h" when > 60 min; "Opens in X min" when 5–60 min; active "Join lesson" link within 5 min
- Polls every 30 s via `setInterval` so label updates live
- Returns `null` when `minutesUntil < 0` (lesson in progress/past)
- Dormant `<a>`: `href={undefined}`, `aria-disabled={true}`, `tabIndex={-1}` — fully keyboard-inert
- Window hint: "Meeting link opens 5 minutes before the lesson." in all three locales

### StudentDetailPage.tsx — full rewrite (STUDENT-P-001)

- `PageHeader` with student name + "Schedule lesson" primary action
- **Overview tab**: next lesson (`BookingRequestCard compact`), student identity (avatar + email + timezone), learning goals, availability notes
- **Lessons tab**: all bookings for this student — `StatusBadge` via `bookingStatusToUi()`, no-show button for confirmed lessons
- **Notes tab**: full CRUD — add/edit/delete with `Textarea`, inline error (`t('detail.note_required')`), distinct success toasts (`note_saved`, `note_deleted`)
- All legacy `navy-*`/`gray-*`/`edu-*` tokens replaced with semantic equivalents
- No hardcoded English strings; all copy via `useTranslation('student')`

### BookingsPage.tsx — RateUserModal wiring (FEED-001)

- `HistoryCard` accepts `onFeedback` callback
- "Leave feedback" `Button variant="quiet"` shown only when `bookingStatusToUi(b.status) === 'completed'` — no raw enum comparison
- `RateUserModal` imported via `lazy()` + `Suspense fallback={null}`
- On submit: `qc.invalidateQueries(['student-bookings'])` + `uiToast.success(t('feedback_sent'))` + close

### i18n additions (en/sr/es)
- `home.dashboard.*`: seo_title/description + 15 dashboard keys including meeting_opens_in_hours/minutes, meeting_open, meeting_window_hint, join_lesson
- `booking.page.leave_feedback`, `feedback_sent`, `professor_fallback`
- `student.detail.*`: 15 keys covering all StudentDetailPage labels + empty states + note validation

## Reviewer findings and fixes

### UX reviewer — BLOCKED → RESOLVED

| Blocker | Fix |
|---|---|
| B1 Hardcoded English strings (7 instances) | All replaced with `t()` calls using new keys in en/sr/es ✓ |

Warnings addressed:
- W1 Dormant meeting link keyboard-inert → `tabIndex={-1}` added ✓
- W2 Suspense fallback for rating modal (accepted: null fallback is minimal; fast chunk; not blocking) 
- W3 Feedback toast reused CTA label → new `feedback_sent` key ✓
- W4 Note save toast reused save button label → new `note_saved` key ✓

### Visual reviewer — PASS WITH OBSERVATIONS

No blockers. Warnings addressed:
- W1 Duplicate `import ... from "react"` lines → merged into single import ✓
- W2 Brand-tinted count badge on tab → replaced with plain inline count `(N)` ✓

## Verification results

| Check | Result |
|---|---|
| `check-ui-system.mjs` | ✓ Passed |
| `npm run typecheck` | ✓ 0 errors |
| `npm run lint` | ✓ 0 errors |
| `npm run build` | ✓ Built |
| `frontend-verify.mjs` | ✓ Passed |
| Baseline E2E | ✓ 17 passed, 11 skipped, 0 failed |
| UX reviewer | ✓ All blockers resolved |
| Visual reviewer | ✓ PASS |

## Deferred

- `BookingWithSlot` type widening (missing professor/meetLink fields) — shared types package, Phase 7
- `Card variant="muted"` for history cards instead of `opacity-80` — Phase 7 polish
- `recentActivity` query limit may miss completions if recent pending bookings dominate — Phase 7 data quality
- W6 `BookingRequestCard` professor-vs-student copy when shown on StudentDetailPage — validated: card shows status/time/dates only in compact mode, no student-oriented copy visible to professor
