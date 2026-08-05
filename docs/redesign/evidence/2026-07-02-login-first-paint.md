# Frontend Change Evidence — Fix "empty dashboard on first login"

## Scope

- Requirement IDs: HOME-S-001, plus shell-level fallback for all authenticated routes
- Roles: Student (primary), Admin/Professor (symmetric fix)
- Routes: `/dashboard/*`, `/admin/*`
- BPMN sections: §Student — Home; §Session lifecycle (rendering pre-conditions only — no state or contract change)

## Problem statement

After a successful login the browser was redirected to `/dashboard` but the
visible page appeared "empty" for the duration of the first-time JavaScript
chunk download. Hitting `F5` masked the bug because the chunk was then cached.

Root cause: `App.tsx` wrapped every route in **one** `<Suspense fallback={<PageSkeleton />}>` boundary at the router level. When `React.lazy(() => import("StudentDashboard"))` suspends on first navigation, that boundary unmounts the entire `<DashboardLayout>` (sidebar + topbar + main) and renders `PageSkeleton` — a generic 3-card grid that shares nothing with the actual dashboard geometry. The result reads as an empty screen because the shell is gone and the fallback does not match the destination.

## Fix

1. **Nested Suspense inside `DashboardLayout`.** `<Outlet />` is now wrapped in
   its own `<Suspense>` so the sidebar, topbar and email-verification banner
   stay mounted while the child page chunk downloads. The outer Suspense in
   `App.tsx` is unchanged — it still catches shell-level suspension.
2. **Geometry-matched skeletons.** New `RouteSkeletons.tsx` exports
   `StudentDashboardSkeleton` and `AdminShellSkeleton` that mirror the actual
   page altitude (max-w-2xl hero card + activity list for student; header +
   toolbar + calendar grid for admin). Uses only semantic tokens
   (`bg-surface-muted`, `border-line`, `rounded-ui-md`, etc.).
3. **Prefetch on login submit.** `AuthPage.onLogin` now issues
   `void import("@/pages/student/StudentDashboard")` and the admin equivalent
   before awaiting the login call. In practice the chunk resolves during the
   network round-trip so the fallback is skipped entirely and the real
   content is visible on the first paint after redirect.

No API contracts changed. No booking-status transitions touched.

## Before

The prior fallback was `PageSkeleton` — a generic 3-card grid at page level.
On first login it briefly displaced the shell entirely (sidebar disappeared,
main became three placeholder cards), then flashed to the real dashboard.
Any user who reported "empty page until refresh" was seeing the shell-less
fallback with no data yet in the destination component's queries.

## After

- Sidebar and topbar are visible continuously.
- Real dashboard content is visible within ~130 ms of the login redirect (see
  timing capture below).
- If the chunk is slow (throttled network, cold PWA install), the nested
  Suspense renders a skeleton with the same silhouette as the destination
  page, so the user sees a coherent "loading" state and not an empty screen.

## State coverage

- [x] default — Playwright verified 130 ms end-to-end at 1280 px on a fresh session
- [x] loading — `StudentDashboardSkeleton` renders with `aria-busy="true"`, `aria-live="polite"`, sr-only "Loading dashboard…" text; captured at 1280 px in `skeleton-fallback-1280.png`
- [x] empty — no regression: page-level `EmptyState` still renders when no bookings exist (unchanged code path)
- [x] success — real content renders after chunk load; no layout shift
- [x] error/retry — unchanged; existing error paths in `StudentDashboard` render inside the same Suspense boundary
- [x] disabled — not applicable to this layer
- [x] stale/conflict — not applicable to this layer
- [x] permission/expiry/cancellation — protected route guard unchanged

## Responsive evidence

- [x] 390 px — `screenshots/2026-07-02-login-flash/dashboard-first-paint-390.png`
- [x] 768 px — `screenshots/2026-07-02-login-flash/dashboard-first-paint-768.png`
- [x] 1280 px — `screenshots/2026-07-02-login-flash/dashboard-first-paint-1280.png`
- [x] 1440 px — `screenshots/2026-07-02-login-flash/dashboard-first-paint-1440.png`

Skeleton fallback: `screenshots/2026-07-02-login-flash/skeleton-fallback-1280.png`

## Accessibility evidence

- Nested Suspense fallback carries `role="status"`, `aria-live="polite"`,
  `aria-busy="true"`, and an sr-only "Loading dashboard…" text so screen
  readers announce the transition.
- No keyboard-affecting change: focus remained where React Router places it
  after the client-side navigation.
- No color-only status; the skeleton uses neutral `bg-surface-muted`.

## Localization evidence

The sr-only "Loading dashboard…" / "Loading…" strings are surfaced via `t("route_loading.dashboard")` and `t("route_loading.generic")` in the `common` namespace. Added to all three locales:

- `packages/frontend/public/locales/en/common.json` → `"Loading dashboard…"`, `"Loading…"`
- `packages/frontend/public/locales/sr/common.json` → `"Učitavanje kontrolne table…"`, `"Učitavanje…"`
- `packages/frontend/public/locales/es/common.json` → `"Cargando panel…"`, `"Cargando…"`

## Automated verification

- `npx tsc --noEmit` in `packages/frontend` — passes.
- `npx playwright test tests/e2e/baseline/auth.spec.ts` — 6/6 pass (student
  and professor login redirects still work).
- Ad-hoc reproduction spec (added and removed during development):
  - Fresh browsing context, no local cache.
  - Login submit → `/dashboard` redirect.
  - Content assertion (`text=/next lesson/i`) becomes visible at ~130 ms.
  - Sidebar is continuously visible throughout the transition.

- `node scripts/uiux/check-ui-system.mjs` and `node scripts/uiux/frontend-verify.mjs`
  are **blocked** by the guardrail hook `protect-guardrail-bash.mjs` which
  requires `UIUX_ALLOW_GUARDRAIL_EDIT=1` to be exported on the process
  launching Claude Code. The env var cannot be threaded in from a
  sub-invocation. Manual run required.

## UI/UX reviewer decision

**PASS with observations** — ui-ux-reviewer agent, 2026-07-02.

Reviewer confirmed: semantic tokens throughout, sidebar/topbar continuously mounted across all four viewport captures, no booking-status rendering change, accessibility semantics correct on the fallback (role=status, aria-live, aria-busy, sr-only text).

Non-blocking observations addressed after review:
1. Skeleton screenshot recaptured with a genuine forced-Suspense flow (cold context + injected auth + `**/assets/StudentDashboard-*.js` blocked 8s). See `skeleton-fallback-1280.png` — now shows the actual skeleton silhouette, not the fully-rendered page.
2. Skeleton sr-only strings moved to i18n. New `common.route_loading.dashboard` and `common.route_loading.generic` keys added in en/sr/es.
3. Storybook coverage added — `packages/frontend/src/components/shared/RouteSkeletons.stories.tsx`.

Deferred / acknowledged:
4. `node scripts/uiux/check-ui-system.mjs` and `node scripts/uiux/frontend-verify.mjs` — the guardrail hook blocks these from being invoked inside this session; documented as a workflow gap, not a patch issue. Manual operator run required.
5. Login-time prefetch warms both StudentDashboard and CalendarPage chunks regardless of role — kept intentional, called out for future bundle-cost review.

## Remaining limitations

- The two `void import(...)` prefetch calls in `AuthPage.tsx` warm both the
  student and admin destination chunks. This is intentional (we don't know
  the role until the login response returns) and costs a small amount of
  bandwidth on the login path. If this ever becomes measurable, gate on
  role after the login response resolves; for now it eliminates the flash
  for both role paths without added complexity.
- `scripts/uiux/*.mjs` checks could not be executed inside this session.
