# BPMN-to-code traceability map

Source BPMN document: [docs/product/processes-overview.md](../../product/processes-overview.md). Section numbers in the table below match that document.

## Flow × code × test mapping

| BPMN § | Flow | Route | Component(s) | API | Status enum | Baseline test |
|---|---|---|---|---|---|---|
| 1.1 | Registration + email verification | `/auth`, `/verify-email` | `AuthPage`, `VerifyEmailPage` | `authApi.register`, `authApi.verifyEmail`, `authApi.resendVerification` | — | `baseline/auth.spec.ts` |
| 1.2 | Login (no 2FA) | `/auth` | `AuthPage` | `authApi.login` | — | `baseline/auth.spec.ts` |
| 1.2 | Login (2FA branch) | `/auth` (inline) | `AuthPage` | `authApi.login` + `authApi.confirm2FA` | — | Deferred — Phase 6 polish |
| 1.3 | Password reset | `/forgot-password`, `/reset-password` | `ForgotPasswordPage`, `ResetPasswordPage` | `authApi.forgotPassword`, `authApi.resetPassword` | — | `baseline/auth.spec.ts` |
| 1.4 | Profile update | `/dashboard/profile` | `StudentProfilePage`, `ProfileCompletionCard` | `authApi.updateProfile`, `studentApi.updateProfile` | — | Existing `profile-completion.spec.ts` |
| 1.4 | Logout | any | `DashboardLayout` (sidebar action) | `authApi.logout` | — | `baseline/auth.spec.ts` |
| 7 | Choose professor (student onboarding) | `/dashboard/choose-professor` | `ChooseProfessorPage` | `studentApi.getProfessor`, `studentApi.selectProfessor`, `getPublicProfessors` | — | Not in Phase 0 baseline (assignment flow). |
| 2.1 | Student requests booking (individual) | `/dashboard/book` | `BookPage` | `studentApi.getSlots`, `studentApi.bookSlot` (returns 201) | `BookingStatus.PENDING_CONFIRMATION` | `baseline/student-booking.spec.ts` |
| 2.1 | Student requests booking (group, waitlist) | `/dashboard/book` | `BookPage` | `studentApi.bookSlot` (returns 202) | `BookingStatus.PENDING_CONFIRMATION` | `test.fixme` — waitlist UI missing |
| 2.2 | Professor approves | `/admin/pending-approvals` | `PendingApprovalsPage` | `professorApi.confirmBooking` | `PENDING_CONFIRMATION` → `CONFIRMED` | `baseline/professor-approval.spec.ts` |
| 2.2 | Professor rejects | `/admin/pending-approvals` | `PendingApprovalsPage` | `professorApi.rejectBooking(reason)` | `PENDING_CONFIRMATION` → `REJECTED` | `baseline/professor-approval.spec.ts` |
| 2.2 | Email-token approve/reject | external link | (no SPA component) | `POST /bookings/confirm-booking`, `POST /bookings/reject-booking` | as above | Not covered by SPA E2E |
| 2.3 | Student cancels | `/dashboard/bookings` | `BookingsPage` | `studentApi.cancelBooking` | → `CANCELLED_BY_STUDENT` | `baseline/cancellation.spec.ts` |
| 2.4 | Professor cancels slot | `/admin/slots`, `/admin/calendar` | `SlotsPage`, `CalendarPage` | `professorApi.cancelSlotWithBookings(reason?)` | per-booking → `CANCELLED_BY_PROFESSOR`; slot → `CANCELLED` | `baseline/cancellation.spec.ts` |
| 2.5 | Background expiry/reminders | n/a | n/a | server jobs | `PENDING_CONFIRMATION` → `EXPIRED` | Not tested at E2E layer (server-driven) |
| 3 | Slot management (create, bulk, recurring) | `/admin/slots/new`, `/admin/slots/bulk` | `NewSlotPage`, `BulkSlotPage` | `professorApi.createSlot`, `createBulkSlots`, `createRecurringPattern` | `SlotStatus.AVAILABLE` | Deferred — Phase 3 |
| 3 | Direct professor booking | (no page) | `CreateCoverModal`, `PrivateInvitationModal` | `professorApi.bookStudent`, `professorApi.createCover` | confirmed | `PrivateInvitationModal` invoked from [CalendarPage.tsx:85](../../../packages/frontend/src/pages/admin/CalendarPage.tsx#L85) (trigger label uses wrong i18n key `t('calendar.subtitle')`); `InviteStudentModal`/`CreateCoverModal` invoked from [StudentsPage.tsx:280-284](../../../packages/frontend/src/pages/admin/StudentsPage.tsx#L280). No calendar-contextual `CreateCoverModal` trigger yet. |
| 4 | Waitlist UI | `/dashboard/book` | `BookPage` | `studentApi.bookSlot` (202) | — | `test.fixme` — UI not implemented |
| 5 | Meeting / video join | inline on booking card | `BookingsPage`, `StudentDashboard` | external `meet.jit.si` link from `slot.meetLink` | `CONFIRMED` / `IN_PROGRESS` | `baseline/meeting-access.spec.ts` |
| 6 | Professor dashboard | `/admin` | `AdminDashboard` | `professorApi.getDashboard` | — | Not in Phase 0 baseline (read-only page) |
| 7 | Student dashboard | `/dashboard` | `StudentDashboard` | `studentApi.getDashboard`, `studentApi.getProfile` | — | Covered indirectly by booking tests |
| 8 | Ratings | inline (no trigger) | `RateUserModal` | `submitRating`, `getPendingRatings` | — | `test.fixme` — trigger UI missing |
| 8b | Session feedback (private) | inline | — | (server-side) | — | Not in Phase 0 baseline |
| 9 | Referrals | `/dashboard/referrals` | `ReferralPage`, `ReferralLinkGenerator` | `getMyReferralCode`, `trackReferral`, `getReferralStats` | — | Not in Phase 0 baseline |
| 10 | Notifications (in-app) | inline bell | `NotificationBell` | `notificationApi.getNotifications`, `markRead`, `markAllRead` | — | `baseline/notifications.spec.ts` covers mobile bell visibility + API. Popover list assertions are `test.fixme` because the seed creates no notifications, not because the popover is missing — the popover is fully implemented in `NotificationBell.tsx`. |
| 10 | Notifications (email) | n/a | n/a | server-side | — | Not in Phase 0 baseline |
| 11 | Admin audit / email logs | `/admin/email-logs` | `EmailLogsPage` | `professorApi.getEmailLogs`, `getEmailLog` | — | Not in Phase 0 baseline |
| 12 | Background jobs | n/a | n/a | server-side | — | Not in Phase 0 baseline |
| 13 | Gap analysis | — | — | — | — | Tracked in [implementation-matrix.csv](../implementation-matrix.csv) |

## Flows whose UI is missing or partial

These are documented as `test.fixme()` placeholders in the baseline suite. Each is also a row in [implementation-matrix.csv](../implementation-matrix.csv).

1. **Waitlist UI** — API returns 202, `BookPage` does not yet show waitlist state or position. Owner: Phase 4.
2. **Ratings trigger** — `RateUserModal` exists; no surface invokes it from a completed booking. Owner: Phase 5 (FEED-001 / future RATE row).
3. **Cover assignment from calendar** — `PrivateInvitationModal` is wired to the calendar; `CreateCoverModal` only has a `StudentsPage` trigger. Calendar-contextual cover creation is owed by Phase 3 (CAL-002).
4. **Desktop notification bell** — `NotificationBell` (with its full popover) is mounted only inside `DashboardLayout`'s `lg:hidden` mobile header. Desktop viewports show no bell. Owner: Phase 6 (NOTIF-001).
5. **Notification popover seed** — Popover renders correctly when notifications exist; the seed creates none, so the `test.fixme` for "popover lists items" is a seed gap, not a UI gap.
6. **2FA verification page** — [pages/auth/TwoFactorSetupPage.tsx](../../../packages/frontend/src/pages/auth/TwoFactorSetupPage.tsx) is rendered inline by [pages/admin/SecuritySettingsPage.tsx](../../../packages/frontend/src/pages/admin/SecuritySettingsPage.tsx) at `/admin/settings/security` — it is **not** orphaned. The actual deferred item is the 2FA-during-login branch handled inline within `AuthPage`. Owner: Phase 6 polish.

## Status / API verb conventions

- **API verb:** `approve` / `reject` / `confirm` / `cancel` / `book`.
- **UI verb:** professor "approves" or "rejects"; student "requests" or "cancels"; professor "schedules" (direct booking).
- **Backend status name** is never shown to the user — see [.claude/rules/frontend/localization.md](../../../.claude/rules/frontend/localization.md). Resolution always passes through the centralized status renderer (Phase 1).
