# Routes and role guards

Source of truth: [packages/frontend/src/App.tsx](../../../packages/frontend/src/App.tsx).

## Auth state and guard wrappers

| Element | Location | Behavior |
|---|---|---|
| `useAuthStore` (Zustand, persisted to `auth-storage` in localStorage) | [src/stores/auth.ts](../../../packages/frontend/src/stores/auth.ts) | Holds `user`, `isAuthenticated`, `isLoading`, `emailVerified`, `twoFactorEnabled`. Token kept in localStorage and injected by axios interceptor in [src/lib/api.ts](../../../packages/frontend/src/lib/api.ts). |
| `ProtectedRoute` | [App.tsx:134-164](../../../packages/frontend/src/App.tsx#L134-L164) | Shows spinner while loading. Redirects unauthenticated to `/auth`. If `requireAdmin` and user is not admin → `/dashboard`. If not `requireAdmin` and user is admin → `/admin`. |
| `AuthRedirect` | [App.tsx:166-174](../../../packages/frontend/src/App.tsx#L166-L174) | Redirects authenticated users away from public auth pages to `/admin` or `/dashboard` depending on `user.isAdmin`. |
| 404 | [App.tsx:277](../../../packages/frontend/src/App.tsx#L277) | `*` → `Navigate to="/"`. |

The "professor" role is encoded as `User.isAdmin === true`. No multi-tenant or finer-grained roles exist today.

## Route inventory

### Public (`PublicLayout`)

| Path | Page component | Notes |
|---|---|---|
| `/` | `HomePage` | [pages/public/HomePage.tsx](../../../packages/frontend/src/pages/public/HomePage.tsx) |
| ~~`/about`~~ | ~~`AboutPage`~~ | Removed (LAND-002). Page deleted; `/about` now falls through to the `*` catch-all → redirect to `/`. The `about` i18n namespace is retained (still used by `ContactPage`). |
| `/contact` | `ContactPage` | [pages/public/ContactPage.tsx](../../../packages/frontend/src/pages/public/ContactPage.tsx) |
| `/design-showcase` | `DesignShowcase` | [pages/DesignShowcase.tsx](../../../packages/frontend/src/pages/DesignShowcase.tsx). Internal-only; not linked from public nav. |
| `/auth` | `AuthPage` wrapped in `AuthRedirect` | Unified login + register. |
| `/forgot-password` | `ForgotPasswordPage` wrapped in `AuthRedirect` | |
| `/reset-password` | `ResetPasswordPage` wrapped in `AuthRedirect` | |
| `/verify-email` | `VerifyEmailPage` | |
| `/verify-email-change` | `VerifyEmailChangePage` | |
| `/login` | redirect → `/auth` | Legacy. |
| `/register` | redirect → `/auth` | Legacy. |

### Student (`ProtectedRoute` → `DashboardLayout`)

All under `/dashboard`. Guard: authenticated, not admin.

| Path | Page component |
|---|---|
| `/dashboard` | `StudentDashboard` |
| `/dashboard/book` | `BookPage` |
| `/dashboard/bookings` | `BookingsPage` |
| `/dashboard/homework` | `HomeworkPage` |
| `/dashboard/profile` | `StudentProfilePage` |
| `/dashboard/referrals` | `ReferralPage` |
| `/dashboard/choose-professor` | `ChooseProfessorPage` |
| `/dashboard/feedback/:bookingId` | `FeedbackPage` |
| `/dashboard/notifications` | `NotificationsPage` |

### Admin/Professor (`ProtectedRoute requireAdmin` → `DashboardLayout isAdmin`)

All under `/admin`. Guard: authenticated and `user.isAdmin === true`.

| Path | Page component |
|---|---|
| `/admin` | `CalendarPage` (index — Schedule is the professor landing) |
| `/admin/dashboard` | `AdminDashboard` |
| `/admin/calendar` | `CalendarPage` |
| `/admin/insights` | `AdminInsightsPage` |
| `/admin/slots` | `SlotsPage` |
| `/admin/slots/bulk` | `BulkSlotPage` |
| `/admin/students` | `StudentsPage` |
| `/admin/students/:id` | `StudentDetailPage` |
| `/admin/pending-approvals` | `PendingApprovalsPage` |
| `/admin/email-logs` | `EmailLogsPage` |
| `/admin/feedback` | `FeedbackDashboard` |
| `/admin/session/:slotId` | `SessionPage` (In-Class Mode) |
| `/admin/settings/security` | `SecuritySettingsPage` |
| `/admin/settings` | `ProfessorSettingsPage` |
| `/admin/notifications` | `NotificationsPage` |

> Slot creation/editing no longer uses a dedicated `NewSlotPage` route — it happens contextually via `SlotFormDrawer` from the calendar (`CalendarPage`). `NewSlotPage.tsx` was removed in the `feat/system-redesign` merge.

## Orphaned page files (Phase 1 decides delete vs route)

These files exist but no route mounts them.

- [pages/auth/LoginPage.tsx](../../../packages/frontend/src/pages/auth/LoginPage.tsx)
- [pages/auth/RegisterPage.tsx](../../../packages/frontend/src/pages/auth/RegisterPage.tsx)
- [pages/professor/BookingConfirmationPage.tsx](../../../packages/frontend/src/pages/professor/BookingConfirmationPage.tsx)
- [pages/professor/PendingBookingsList.tsx](../../../packages/frontend/src/pages/professor/PendingBookingsList.tsx)
- [pages/professor/ProfessorAnalyticsDashboard.tsx](../../../packages/frontend/src/pages/professor/ProfessorAnalyticsDashboard.tsx)
- [pages/professor/StudentListWithPricing.tsx](../../../packages/frontend/src/pages/professor/StudentListWithPricing.tsx)
- [pages/shared/SettingsPage.tsx](../../../packages/frontend/src/pages/shared/SettingsPage.tsx) — `StudentProfilePage` superseded it.

[pages/auth/TwoFactorSetupPage.tsx](../../../packages/frontend/src/pages/auth/TwoFactorSetupPage.tsx) is **not orphaned** — [pages/admin/SecuritySettingsPage.tsx](../../../packages/frontend/src/pages/admin/SecuritySettingsPage.tsx) is a one-line wrapper that renders it, so the page is reachable at the routed `/admin/settings/security`. Phase 1 may rename to `SecuritySettingsView` for clarity but no routing change is needed.

## Cross-role behavior

- An authenticated admin landing on a student route is redirected to `/admin` (and vice versa). This is enforced inside the guard, not by separate routers.
- Legacy `/login` and `/register` rewrite to `/auth` so external links continue to resolve.
- There is no role-specific home; landing is decided by the guard at `/dashboard` vs `/admin`.

## Lazy-loading

All page components are `React.lazy()` imports with `PageSkeleton` as the Suspense fallback. Layouts (`PublicLayout`, `DashboardLayout`) are not lazy.
