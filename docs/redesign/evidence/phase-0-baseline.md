# Phase 0 baseline — execution evidence

**Date:** 2026-06-29
**Operator:** Claude (Phase 0 reconnaissance)
**Stack:** Docker Compose local override on `http://localhost` (Caddy + backend + worker + frontend + MySQL + Redis), all containers reporting healthy.
**Tool:** Playwright 1.58.2 against system Google Chrome (the bundled Playwright chromium download was unreachable from this network at run time, so the suite uses `channel: 'chrome'`).
**Suite:** [packages/frontend/tests/e2e/baseline/](../../packages/frontend/tests/e2e/baseline/)
**Config:** [tests/e2e/baseline/playwright.baseline.config.ts](../../packages/frontend/tests/e2e/baseline/playwright.baseline.config.ts) — points at `http://localhost`, single chromium project, `channel: 'chrome'`.

## Run summary

| Suite | Result |
|---|---|
| [auth.spec.ts](../../packages/frontend/tests/e2e/baseline/auth.spec.ts) | 6 passed |
| [student-booking.spec.ts](../../packages/frontend/tests/e2e/baseline/student-booking.spec.ts) | 3 passed, 2 fixme |
| [professor-approval.spec.ts](../../packages/frontend/tests/e2e/baseline/professor-approval.spec.ts) | 2 passed, 2 fixme |
| [cancellation.spec.ts](../../packages/frontend/tests/e2e/baseline/cancellation.spec.ts) | 2 passed, 3 fixme |
| [meeting-access.spec.ts](../../packages/frontend/tests/e2e/baseline/meeting-access.spec.ts) | 1 passed, 1 skipped (no confirmed booking on seed), 1 fixme |
| [notifications.spec.ts](../../packages/frontend/tests/e2e/baseline/notifications.spec.ts) | 3 passed, 2 fixme (1 desktop-bell gap, 1 popover seed-dependent) |

**Aggregate:** 17 passed · 11 skipped/fixme · 0 failed · ~37s wall.

The final Playwright reporter line: `11 skipped`, `17 passed (37.6s)`.

## What the green tests protect

- Authentication: student and professor login redirect to the correct shell; bad credentials stay on `/auth`; legacy `/login` and `/register` rewrite to `/auth`; `/forgot-password` renders an email control; logout flushes the session.
- Student booking: dashboard → book navigation, seeded availability renders on the book page, bookings list page renders.
- Professor approval: `/admin/pending-approvals` and `/admin/calendar` render for the professor role.
- Cancellation surfaces: student bookings list and professor slots page are reachable.
- Meeting access: student dashboard renders; whenever a Join Meeting link is shown, its `href` must point to `meet.jit.si`.
- Notifications: NotificationBell is visible in the **mobile** dashboard (390×844) for both roles, and `GET /api/notifications` resolves 2xx for the student.

## Documented blockers (`test.fixme`)

Each placeholder is a real implementation gap. The phase-0 exit criterion explicitly allows "regression coverage **or a documented blocker**" — these are the documented blockers, traceable to specific matrix rows.

| Spec | Gap | Owner row |
|---|---|---|
| `student-booking.spec.ts` — concurrent booking race | Only one student is seeded; race requires a second account. | P0-TEST-001 — extend seed |
| `student-booking.spec.ts` — waitlist UI | API returns 202 waitlist response; UI does not yet surface waitlist state. | P0-TEST-001 (audit §08 flow 4) |
| `professor-approval.spec.ts` — approve transitions a pending request to confirmed | Requires a deterministic pending booking; seed does not create one. | P0-TEST-002 |
| `professor-approval.spec.ts` — reject with reason | Same fixture chain. | P0-TEST-002 |
| `cancellation.spec.ts` — student cancel before confirmation | Same fixture chain. | P0-TEST-003 |
| `cancellation.spec.ts` — student cancel after confirmation | Same fixture chain. | P0-TEST-003 |
| `cancellation.spec.ts` — professor cancels a slot with bookings | Same fixture chain. | P0-TEST-003 |
| `meeting-access.spec.ts` — confirmed booking surfaces Join Meeting link | Same fixture chain. | P0-TEST-003 |
| `notifications.spec.ts` — desktop dashboard surfaces the bell | Real UI gap: `NotificationBell` is mounted only in the `lg:hidden` mobile header of `DashboardLayout.tsx:264-273`. | NOTIF-001 / audit §02 finding 6 |
| `notifications.spec.ts` — popover lists items and mark-as-read decrements | Popover exists in `NotificationBell.tsx`, but the seed creates no notifications. | NOTIF-001 |

The dominant root cause across approval/cancellation/meeting `fixme`s is a single seed gap: the database seed creates available slots but no pre-confirmed or pre-pending bookings. Phase 1 extends [packages/backend/prisma/seed.ts](../../packages/backend/prisma/seed.ts) to provide deterministic fixtures, which unlocks all six tests at once.

## Skipped (non-blocker)

- `meeting-access.spec.ts` — *any rendered join-meeting link points to meet.jit.si*: skipped because the seeded student has no confirmed bookings; nothing to assert against. The test's contract is "when shown, the link is a Jitsi room" — it remains in place to catch a regression the moment a confirmed booking enters the seed.

## Operator runbook

```bash
# From repo root, with the local Docker stack already up.
npm exec --workspace=@spanish-class/frontend -- \
  playwright test --config tests/e2e/baseline/playwright.baseline.config.ts \
                  --reporter=list
```

Re-runs are idempotent. The suite does not write to the database — it only logs in, navigates, and asserts visibility / response codes. No cleanup needed.

## Why baseline-only, why one project

The suite intentionally protects the eight exit-criterion flow areas (booking, approval, cancellation, meeting, authentication, notifications) plus auth, at the floor required for Phase 1 to be safe to start. It does not:

- Test all five Playwright projects (mobile/firefox/webkit) — that's matrix row `RESP-001`, owed by Phase 7 polish.
- Exercise the email approve/reject token path — server-driven, handled by backend integration tests.
- Cover ratings, referrals, slot creation, bulk creation, recurring, or analytics flows — those are phase-3+ migration territory and have their own matrix rows.
