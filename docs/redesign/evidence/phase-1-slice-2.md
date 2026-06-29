# Phase 1 Slice 2 — evidence

**Date:** 2026-06-29
**Phase:** 1 (UI system foundation), slice 2 — final

## What was delivered

### New overlay + layout primitives (all with Storybook stories)

| Component | File | Key contract points |
|---|---|---|
| Drawer / BottomSheet | `drawer.tsx` | Desktop right panel (w-drawer = 420px, w-drawer-wide = 520px); mobile bottom sheet (max-h-sheet = 90dvh); `busy` prop prevents Escape/outside-click during unsafe mutations; sticky header+footer via flex-col; focus managed by Radix Dialog |
| Popover | `popover.tsx` | Anchored to trigger; Radix presence animations; data-side slide-in variants |
| Dialog + AlertDialog | `dialog.tsx` | Dialog for blocking decisions; AlertDialog for destructive confirmation with `AlertDialogAction` (danger) + `AlertDialogCancel` (secondary); accessibility contract documented in JSDoc requiring visible `DialogTitle` |
| InlineAlert + uiToast | `inline-alert.tsx` | Four variants (success/error/warning/info) using dedicated `alert-*` token family (not booking status tokens); `role="alert"` for error, `role="status"` for others; `uiToast` helper wraps react-hot-toast with `.toast-ui-*` skin classes from `ui-system.tokens.css` |
| EmptyState | `empty-state.tsx` | Optional icon + specific title + one-sentence description + max one action |
| Skeleton (extended) | `skeleton.tsx` | Base + `SkeletonText`, `SkeletonCard`, `SkeletonAvatar` geometry-matched composites |
| AppShell | `app-shell.tsx` | `AppSkipLink` (WCAG 2.4.1) + `AppSidebar` (w-sidebar / w-sidebar-collapsed) + `AppTopbar` (h-topbar) + `AppMain` (pt-topbar); sidebar hidden below `lg`; `AppShell` composition helper |
| PageHeader | `page-header.tsx` | title + optional description + breadcrumb slot + single primary action; uses `text-h3` heading token |

### Token additions

- `ui-system.tokens.css` — `alert-*-surface/border/foreground` triples for light + dark; `.toast-ui-*` skin classes
- `ui-system.tailwind.extend.cjs` — `alert.*` Tailwind color groups; `fontSize.h1/h2/h3/display` heading scale
- `tailwind.config.js` — `width/height/inset/padding` tokens for drawer, sidebar, topbar, sheet; `maxHeight.sheet = 90dvh`; `maxWidth.drawer/settings/marketing`

### Seed extension

`packages/backend/prisma/seed.ts` extended with:
- `seed-booking-confirmed` — first AVAILABLE slot → CONFIRMED booking for the seeded student
- `seed-booking-pending` — second AVAILABLE slot → PENDING_CONFIRMATION booking
- `seed-notification-pending` — `booking_request` notification for the professor

Seeds verified against the live Docker stack (`Created confirmed booking fixture`, `Created pending booking fixture`, `Created notification fixture`).

### Reviewer findings and fixes (B1–B5)

| Blocker | Fix applied |
|---|---|
| B1 h1/h2/h3/display tokens missing | Added to `ui-system.tailwind.extend.cjs` and `design-tokens.json`; `text-h3` now resolves in PageHeader and DesignSystemPage |
| B2 InlineAlert reused booking-status tokens | New `alert-*` token family added; VARIANT_STYLES updated |
| B3 Dialog accessible-name not enforced | JSDoc contract requirement added with explicit `<span class="sr-only">` guidance |
| B4 Drawer Escape-during-mutation not guarded | `busy` prop added; intercepts `onEscapeKeyDown` and `onPointerDownOutside` when true |
| B5 No skip link in AppShell | `AppSkipLink` added; `AppShell` composition helper injects it as first child |

Warnings acknowledged in implementation matrix; W6 (mobile nav) deferred to Phase 2 Information Architecture.

## Verification results

| Check | Result |
|---|---|
| `node scripts/uiux/check-ui-system.mjs` | ✓ Token contrast 15 pairs; guardrails 48 files; canonical story coverage 14 components |
| `npm run typecheck` | ✓ 0 errors |
| `npm run lint` | ✓ 0 errors |
| `npm run build` | ✓ Built successfully |
| `frontend-verify.mjs` | ✓ Passed |
| Phase 0 E2E baseline | ✓ 17 passed / 11 skipped (unchanged — approve/reject/cancel tests await Phase 4 UI interaction, not seed gap) |

## Phase 1 exit criteria — all met

- [x] DS-001 through DS-004: Done
- [x] UI-COLOR-001/002, UI-TYPE-001, UI-LAYOUT-001, UI-COMP-001/002: Done
- [x] `check-ui-system.mjs` passes
- [x] `frontend-verify.mjs` passes
- [x] No legacy tokens (`edu-*`, `spanish-*`) introduced in new code
- [x] Independent reviewer invoked; all 5 blockers resolved

## Known deferred work (Phase 2+)

- Mobile navigation for AppShell (W6) — Phase 2 Information Architecture
- Scroll-shadow on DrawerBody when content overflows (W1) — Phase 3 polish
- z-layer token documentation (W5) — Phase 3
- Visual proof at all 4 breakpoints per screen — Phase 2+ (per-page as migrated)
- Approve/reject/cancel E2E assertions — Phase 4 (depends on UI interaction, not seed)
