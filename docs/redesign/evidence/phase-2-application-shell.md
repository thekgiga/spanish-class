# Phase 2 — Application shell — evidence

**Date:** 2026-06-29
**Phase:** 2 (Application shell)

## What was delivered

### DashboardLayout.tsx — full rewrite
Replaced the 330-line legacy monolith with a clean composition of `AppShell` primitives:

- **Structure:** `<AppSkipLink /> + backdrop + <div ref={sidebarRef}><AppSidebar> + </AppSidebar></div> + <AppTopbar> + <AppMain>`
- **Professor nav (ADMIN_NAV):** Schedule → `/admin`, Students → `/admin/students`, Insights → `/admin/insights`, Settings → `/admin/settings`
- **Student nav (STUDENT_NAV):** Home → `/dashboard`, Book a Lesson → `/dashboard/book`, My Lessons → `/dashboard/bookings`, Profile → `/dashboard/profile`
- **NavLink** (react-router-dom) for automatic `aria-current="page"` and active styling
- **Active state:** `bg-brand text-brand-contrast` (semantic, not gradient)
- **Inactive state:** `text-ink-secondary hover:text-ink hover:bg-surface-muted`
- **No legacy tokens:** zero `spanish-*`, `slate-*`, `navy-*`, `edu-*`, `gradient-*` in the file

### Accessibility improvements
- **Single skip link per layout:** `AppSkipLink` (localized) in `DashboardLayout`; `SkipLink` (localized) in `PublicLayout`. Duplicate from `App.tsx` removed.
- **Mobile sidebar focus management:** Escape closes + returns focus to hamburger (`menuButtonRef`); `useEffect` moves focus into first focusable element on open.
- **`aria-controls="sidebar-panel"`** on hamburger; sidebar element has `id="sidebar-panel"`.
- **Pending badge:** sr-only `<span>` with `t('navigation.pending_count', {count})` alongside the visual counter dot.
- **2FA nudge:** sr-only `<span>` with `t('navigation.two_factor_nudge')` alongside the amber dot.
- **Nav landmark:** `<nav aria-label={t('aria_labels.primary_navigation')} id="primary-nav">`.

### Route changes (App.tsx)
- `/admin` index: `<CalendarPage />` (was `<AdminDashboard />`) — IA-P-001 ✓
- `/admin/dashboard`: `<AdminDashboard />` (new backward-compat route)
- `/admin/insights`: `<AdminInsightsPage />` (new stub — Phase 6 content)

### NotificationBell.tsx — full token migration
- All legacy palette classes replaced with semantic tokens
- `timeAgo()` now uses `t('notifications.{just_now,minutes_ago,hours_ago,days_ago}')` — localized in en/sr/es
- `aria-label` on bell uses `t('notifications.unread_count', {count})` — localized
- `aria-label="Mark as read"` → `t('notifications.mark_as_read')` — localized
- Escape key closes popover and returns focus to trigger button (`triggerRef`)
- `aria-controls` on trigger → panel `id="notification-panel"`, `role="dialog"` on panel

### SkipLink.tsx — token + i18n migration
- Legacy `focus:bg-spanish-red-600 ... focus:ring-spanish-red-500` → semantic `focus:bg-brand ... focus:ring-focus`
- String `"Skip to main content"` → `t('aria_labels.skip_to_main')`

### PublicLayout.tsx
- Added `<SkipLink />` and `id="main-content" tabIndex={-1}` on `<main>` — public pages now also have proper skip-link target.

### i18n additions (en/sr/es, all three locales)
- `notifications.{mark_as_read, unread_count, just_now, minutes_ago, hours_ago, days_ago}`
- `navigation.{schedule, students, insights, bookALesson, myLessons, pending_count, two_factor_nudge}`
- `aria_labels.{skip_to_main, primary_navigation, close_sidebar, toggle_sidebar, open_menu}`

## Verification results

| Check | Result |
|---|---|
| `node scripts/uiux/check-ui-system.mjs` | ✓ Passed |
| `npm run typecheck` | ✓ 0 errors |
| `npm run lint` | ✓ 0 errors |
| `npm run build` | ✓ Built successfully |
| `frontend-verify.mjs` | ✓ Passed |
| Baseline E2E (`playwright test --config baseline/playwright.baseline.config.ts`) | ✓ 17 passed, 11 skipped, 0 failed |

## Reviewer findings (initial + resolved)

**ui-ux-reviewer BLOCKED → RESOLVED:**
- B1: `timeAgo` and `"Mark as read"` hardcoded English → localized via i18next ✓
- B2: `AppSkipLink` string hardcoded → localized ✓  
- B3: Duplicate skip link in `App.tsx` + legacy `SkipLink.tsx` tokens → deduplicated + migrated ✓
- B4: Missing evidence file → this file ✓ (matrix rows updated)
- W1: `aria-controls` pointed at `<nav>` not sidebar → fixed to `sidebar-panel` ✓
- W2: Pending badge no sr-only text → added ✓
- W3: 2FA dot no sr-only text → added ✓
- W4: Notification popover: added Escape handler + `aria-controls` + `role="dialog"` ✓
- W5: Duplicate topbar avatar removed ✓
- W6: Mobile sidebar focus management + Escape added ✓

**visual-design-reviewer:** PASS — no legacy tokens in either rewritten file. All semantic tokens verified correct (sidebar w-sidebar, topbar h-topbar, active bg-brand, bg-canvas on main).

## Responsive verification
Static code review at this stage. Browser screenshots at 390/768/1280/1440 are required per Phase 7 visual QA (RESP-001). Per the rules, visual evidence for each migrated screen is required when a flow is migrated — the shell migration is verified by the E2E suite; per-page screenshot evidence will be captured when each page is migrated in Phase 3+.

## Known deferred items
- Insights page content (stub only) — Phase 6
- Mobile bottom navigation — Phase 3 (per Phase 1 W6 deferred decision)  
- Scroll-shadow on DrawerBody — Phase 3 polish
- `usePendingBookingsCount` backend optimization (N6) — Phase 3 follow-up
- Screenshot evidence at all 4 viewports — Phase 7 visual QA gate
