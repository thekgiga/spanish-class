# Test inventory and critical gaps

## Current test files

### Playwright E2E

| File | Coverage |
|---|---|
| [packages/frontend/tests/e2e/homepage.spec.ts](../../../packages/frontend/tests/e2e/homepage.spec.ts) | Page load, hero, CTAs, nav, skip link, features, mobile 375×667, LCP < 2.5s. |
| [packages/frontend/tests/e2e/profile-completion.spec.ts](../../../packages/frontend/tests/e2e/profile-completion.spec.ts) | Profile completion card flow (existence verified; full coverage not analyzed). |
| [packages/frontend/tests/e2e/accessibility.spec.ts](../../../packages/frontend/tests/e2e/accessibility.spec.ts) | axe checks (existence verified; flow coverage not analyzed). |
| [e2e/booking-flow.spec.ts](../../../e2e/booking-flow.spec.ts) | Student book → confirm → meeting link; concurrent race; student cancel; professor views booked students. **Uses obsolete `/login` URL and seed users that don't exist (`student1@example.com`, `student2@example.com`).** |

### Backend tests

| File | Scope |
|---|---|
| [packages/backend/tests/unit/profile-completion.test.ts](../../../packages/backend/tests/unit/profile-completion.test.ts) | Unit. |
| [packages/backend/tests/unit/private-invitation.test.ts](../../../packages/backend/tests/unit/private-invitation.test.ts) | Unit. |
| [packages/backend/tests/integration/professor-routes.test.ts](../../../packages/backend/tests/integration/professor-routes.test.ts) | Integration. |
| [packages/backend/tests/integration/student-profile.test.ts](../../../packages/backend/tests/integration/student-profile.test.ts) | Integration. |

### Frontend unit / component tests

None. No `*.test.tsx` or `*.spec.tsx` under [packages/frontend/src/](../../../packages/frontend/src/).

## Playwright configuration

[packages/frontend/playwright.config.ts](../../../packages/frontend/playwright.config.ts):

- `testDir`: `./tests/e2e`
- `baseURL`: `http://localhost:4173`
- `webServer`: `npm run preview`, port 4173, reuses existing server outside CI
- Projects: `chromium`, `firefox`, `webkit`, `mobile-chrome` (Pixel 5), `mobile-safari` (iPhone 12)
- `screenshot: 'only-on-failure'`, `video: 'retain-on-failure'`, `trace: 'on-first-retry'`
- CI retries: 2; local retries: 0

The top-level [e2e/](../../../e2e/) directory has its own spec but **no companion Playwright config** — it is not auto-discovered by `npx playwright test` from `packages/frontend`. The Phase 0 baseline suite consolidates under `packages/frontend/tests/e2e/baseline/`.

## Critical-flow coverage matrix

| Flow area | Required by Phase 0 exit criteria | Pre-Phase-0 coverage | Phase 0 baseline spec |
|---|---|---|---|
| Student booking happy path | Yes | Partial in `/e2e/booking-flow.spec.ts` (uses obsolete URL) | `baseline/student-booking.spec.ts` |
| Student booking conflict / concurrent | Yes | Yes in `/e2e/booking-flow.spec.ts` (broken seed assumption) | `baseline/student-booking.spec.ts` |
| Professor approve | Yes | None | `baseline/professor-approval.spec.ts` |
| Professor reject | Yes | None | `baseline/professor-approval.spec.ts` |
| Student cancel | Yes | Partial in `/e2e/booking-flow.spec.ts` | `baseline/cancellation.spec.ts` |
| Professor cancel slot | Yes | None | `baseline/cancellation.spec.ts` |
| Meeting access (join link) | Yes | Partial | `baseline/meeting-access.spec.ts` |
| Authentication (login + email verify) | Yes | None | `baseline/auth.spec.ts` |
| Notifications | Yes | None | `baseline/notifications.spec.ts` |
| 2FA | No (deferred to Phase 6 polish) | None | — |
| Waitlist UI | No (UI incomplete) | None | `test.fixme` placeholder |
| Ratings | No (UI trigger missing) | None | `test.fixme` placeholder |
| Private invitation flow | No (UI trigger missing) | None | `test.fixme` placeholder |
| Referrals | No | None | — |
| Slot creation / bulk / recurring | No (Phase 3) | None | — |
| Admin email logs | No | None | — |
| Mobile responsiveness at all breakpoints | No (Phase 7) | Pixel 5, iPhone 12 only | — |

## Frontend test gaps (broader than Phase 0 scope)

- Zero component unit tests for primitives, hooks, or utilities.
- No axe assertions on dashboard pages.
- No visual regression snapshots.
- No coverage of the API client error handler (401 redirect, 429 surface).

Phase 1 brings Storybook coverage for primitives; component unit tests are an explicit `TEST-002` matrix row.
