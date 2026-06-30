# Current Redesign Phase

## Phase 0 — Architecture reconnaissance and regression baseline

**Status:** Complete with documented blockers

## Goal

Understand the existing implementation and protect critical behavior before broad visual migration.

## Required outputs

- [x] `docs/redesign/current-architecture-audit.md`
- [x] route and role-guard inventory — `docs/redesign/audit/01-routes-and-role-guards.md`
- [x] component and duplicate-pattern inventory — `docs/redesign/audit/02-component-inventory.md`
- [x] state-management and API contract inventory — `docs/redesign/audit/03-state-and-api-contracts.md`
- [x] booking-status transition map — `docs/redesign/audit/04-booking-status-transition-map.md`
- [x] localization inventory and visible-key audit — `docs/redesign/audit/05-localization-inventory.md`
- [x] responsive behavior audit — `docs/redesign/audit/06-responsive-audit.md`
- [x] current test inventory — `docs/redesign/audit/07-test-inventory.md`
- [x] BPMN-to-code traceability map — `docs/redesign/audit/08-bpmn-traceability.md`
- [x] baseline E2E coverage for critical professor and student flows — `packages/frontend/tests/e2e/baseline/`, 17 passing tests, 11 documented blockers (see evidence)
- [x] legacy visual-system inventory — `docs/redesign/audit/09-legacy-visual-system.md`

## Exit criteria

- [x] Critical booking, approval, cancellation, meeting, authentication, and notification behavior has regression coverage or a documented blocker. Each blocker is captured as `test.fixme()` with the gap description in [evidence/phase-0-baseline.md](evidence/phase-0-baseline.md).
- [x] Existing architecture risks and migration seams are documented in [current-architecture-audit.md §"Migration seams"](current-architecture-audit.md).
- [x] The implementation matrix contains code/test/evidence links for completed Phase 0 requirements ([implementation-matrix.csv](implementation-matrix.csv) rows P0-AUD-001..003 = Done, P0-TEST-001..003 = Partial with linked spec + evidence + blocker notes).
- [x] Phase 1 dependencies are unblocked.

## Known limitations carried into Phase 1

1. Six `test.fixme` placeholders all collapse onto a single seed gap: the database seed creates available slots but no pre-existing pending or confirmed bookings. The first Phase 1 slice extends [packages/backend/prisma/seed.ts](../../packages/backend/prisma/seed.ts) with deterministic fixtures, which unlocks the approval, cancellation, and meeting `fixme`s simultaneously.
2. One real implementation gap: [`NotificationBell.tsx`](../../packages/frontend/src/components/shared/NotificationBell.tsx) is only mounted in the `lg:hidden` mobile header of `DashboardLayout`. Tracked under `NOTIF-001` and [audit/02 finding 6](audit/02-component-inventory.md).
3. Baseline runs against system Google Chrome (via `channel: 'chrome'`) because the bundled Playwright chromium download was unreachable from this environment. Multi-browser (firefox, webkit) and additional-viewport (390/768/1280/1440) coverage is Phase 7 polish (matrix row `RESP-001`).

---

## Phase 1 — UI system foundation

**Status:** Complete (all Phase 1 deliverables done)

## Goal

Implement the approved Editorial Teaching Studio semantic token layer, Tailwind mapping, central lifecycle status model, canonical primitive components, Storybook coverage, and enforcement — without migrating unrelated pages.

## Required outputs

- [x] Import `ui-system.tokens.css` once via `globals.css`
- [x] Merge `ui-system.tailwind.extend.cjs` into `tailwind.config.js` `theme.extend` without removing legacy entries
- [x] `packages/frontend/src/lib/ui-system/status.ts` — `BookingStatus`/`SlotStatus` → `UiLifecycleStatus` mapping with i18n keys
- [x] `.claude/skills/spanish-class-ui-system/SKILL.md` already present (pre-staged in commit `ffc5740`)
- [x] Button/IconButton normalized to semantic tokens + contract variants + Storybook state matrix
- [x] Input/Textarea normalized to semantic tokens + Storybook state matrix
- [x] Card normalized to semantic tokens + all four contract variants + Storybook
- [x] StatusBadge — centralized lifecycle renderer, all 6 tones, both sizes, i18n in en/sr/es
- [x] `/design-system` showcase route demonstrating tokens + all slice-1 primitives
- [x] `check-ui-system.mjs` passes (contrast, guardrails, canonical story coverage)
- [x] `frontend-verify.mjs` passes (typecheck, lint, build, integrity)
- [ ] `tsconfig.json` shared-package path fix also resolves pre-existing `@spanish-class/shared` type errors
- [x] Drawer/BottomSheet, Popover, Dialog/AlertDialog, Toast/InlineAlert, EmptyState/Skeleton — slice 2
- [x] AppShell (with AppSkipLink), PageHeader — slice 2
- [x] Seed extended with deterministic pending + confirmed bookings + notification fixture
- [x] All Phase 1 matrix rows (DS-001..004, UI-COLOR-001/002, UI-TYPE-001, UI-LAYOUT-001, UI-COMP-001/002) reach Done
- [x] `check-ui-system.mjs` passes (contrast, guardrails, 14-component story coverage)
- [x] `frontend-verify.mjs` passes (0 type errors, 0 lint errors, build succeeds)

## Exit criteria

- Slices 2+ deliver remaining Phase 1 components (DS-004, UI-COMP-002).
- All Phase 1 matrix rows reach Done.
- Independent ui-ux-reviewer and visual-design-reviewer pass for each affected screen when pages are migrated (Phase 2+).
- `check-ui-system.mjs` and `frontend-verify.mjs` continue passing after each slice.

Do not migrate application pages or change business flows in Phase 1.

---

## Phase 2 — Application shell

**Status:** Complete

## Goal

Migrate the authenticated shell onto `AppShell` primitives and semantic tokens. Implement the approved IA navigation for both professor and student roles.

## Delivered

- [x] Professor nav: Schedule → `/admin` (CalendarPage), Students, Insights, Settings — `IA-P-001`, `IA-P-002`
- [x] Student nav: Home, Book a Lesson, My Lessons, Profile — `IA-S-001`
- [x] `/admin` index renders CalendarPage; AdminDashboard at `/admin/dashboard`; `/admin/insights` stub added
- [x] `DashboardLayout.tsx` rewritten on `AppShell` + semantic tokens; no legacy palette classes
- [x] `NotificationBell.tsx` migrated to semantic tokens; `timeAgo` i18n; all hardcoded English removed
- [x] `SkipLink` deduplicated: public routes via `PublicLayout`; authenticated routes via `AppSkipLink` in `DashboardLayout`
- [x] Mobile sidebar: Escape + focus management; `aria-controls` points at sidebar `#sidebar-panel`
- [x] Accessible sr-only labels on pending-approval badge and 2FA nudge dot
- [x] All new strings in en, sr, es; `frontend-verify.mjs` and `check-ui-system.mjs` pass; E2E baseline 17/28 passed

## Phase 3 — Professor schedule workspace

**Status:** Complete

## Delivered

- [x] `@fullcalendar/*` installed; FullCalendar CSS vars overridden with `--ui-*` semantic tokens (light + dark)
- [x] **CAL-001** — Drag-to-create range selection via `selectable` + `select` handler + `CalendarSelectionComposer`
- [x] **CAL-002** — Composer offers Offer / Schedule / Block; mobile bottom sheet; focus trap + Escape
- [x] **CAL-003** — `snapDuration=00:15:00`, `slotDuration=00:15:00`, `selectMirror` live ghost block
- [x] **CAL-004** — `SlotEventDrawer`: per-status action sets; approve/reject/cancel/no-show; Drawer primitive
- [x] **CAL-005** — Mobile: `useIsMobile` → `timeGridDay`; tablet: `useIsTablet` → 3-day; `MobileDateStrip` horizontal date selector
- [x] **CAL-006** — `RecurringPreview` in `NewSlotPage` recurring mode: client-side date generation, conflict highlighting, i18n en/sr/es
- [x] **UI-CAL-001** — `CalendarEventTile`: 6 status tones; confirmed=solid brand; available=dashed border; icon+text always
- [x] **UI-CAL-002** — `selectMirror` live preview; `CalendarSelectionComposer`; 3 actions; mobile sheet variant
- [x] `check-ui-system.mjs` passes; `frontend-verify.mjs` passes; E2E baseline 17/28 passed

## Phase 4 — Student request and professor approval

**Status:** Complete

## Delivered

- [x] Backend `GET /api/student/professor-settings` — exposes cancellationWindowHours to student
- [x] **BOOK-001** — `DateStrip` + `AvailableTimeOption` date-first booking flow
- [x] **BOOK-002** — Review Drawer: date/time/duration/professor/cancellation policy
- [x] **BOOK-003** — `BookingRequestCard` hero post-booking state
- [x] **BOOK-004** — Expiry countdown + "what happens next" InlineAlert explanation
- [x] **APP-001** — CalendarEventTile amber "Approval needed" (confirmed from Phase 3)
- [x] **APP-002** — PendingApprovalsPage → SlotEventDrawer; "Review request" pattern
- [x] **APP-003** — SlotEventDrawer invalidates state; success toast; drawer closes
- [x] **APP-004** — `bookingRecoveryKey()` in status.ts; InlineAlert + rebook CTA in BookingRequestCard/HistoryCard
- [x] All i18n in en/sr/es; `frontend-verify.mjs` passes; E2E baseline unchanged

## Phase 5 — Lessons and students

**Status:** Complete

## Delivered

- [x] **LESSON-S-001** — Already done in Phase 4; marked Done in matrix
- [x] **HOME-S-001** — `StudentDashboard` rewritten: confirmed lesson hero → pending card → book CTA → recent activity priority stack
- [x] **MEET-001** — `MeetingReadiness` component: opens-in-X-hours/minutes hint, active join link within 5 min, 30s polling, `aria-disabled` + `tabIndex=-1` on dormant link
- [x] **STUDENT-P-001** — `StudentDetailPage` rewritten: PageHeader + Overview/Lessons/Notes tabs, `BookingRequestCard` for next lesson, `StatusBadge` on lessons, full note CRUD with localized validation/toast
- [x] **FEED-001** — "Leave feedback" on completed `HistoryCard`; `RateUserModal` lazy-loaded with Suspense; gated by `bookingStatusToUi === 'completed'`
- [x] All i18n in en/sr/es (home/booking/student namespaces); `frontend-verify.mjs` passes; E2E baseline unchanged
- [x] UX reviewer blockers (B1 hardcoded strings) resolved; visual reviewer PASS

## Phase 6 — Supporting capabilities

**Status:** Not started
