# Phase 3 — Professor schedule workspace — evidence

**Date:** 2026-06-30
**Phase:** 3 (Professor schedule workspace), CAL-001..004 + UI-CAL-001..002

## What was delivered

### FullCalendar integration
- Packages: `@fullcalendar/core`, `@fullcalendar/react`, `@fullcalendar/timegrid`, `@fullcalendar/daygrid`, `@fullcalendar/interaction`
- All 27 `--fc-*` CSS variables overridden with `hsl(var(--ui-*))` semantic tokens in `ui-system.tokens.css` — both light and dark mode.

### CalendarPage.tsx — full rewrite
- Week/day time-grid replacing the old month-picker
- Custom toolbar: `< Today >` navigation, date range label, pending-approval badge (with `aria-label`), Week/Day segmented control
- `selectable` + `selectMirror` (live ghost block) + `snapDuration="00:15:00"` + `slotDuration="00:15:00"` (CAL-001, CAL-003)
- `selectAllow` rejects past-time selections
- `eventContent` delegates to `CalendarEventTile`
- `select` handler opens `CalendarSelectionComposer` (CAL-002)
- `eventClick` handler fetches `AvailabilitySlotWithBookings` and opens `SlotEventDrawer` (CAL-004)
- Professor default landing page via `/admin` index → CalendarPage (IA-P-001, Phase 2)

### CalendarEventTile (UI-CAL-001)
- 4px left accent strip + icon + title + time — matches blueprint anatomy
- 6 status tones: available (dashed border), requested (amber), **confirmed (solid brand fill — strongest emphasis)**, blocked (neutral), completed (muted), cancelled (muted red)
- Status never communicated by color alone — icon + text always present
- Dense variant for slots < 45 min

### CalendarSelectionComposer (CAL-002, UI-CAL-002)
- Three actions: Offer this time / Schedule a student / Block time
- Duration shown in header (computed from selection, per "never ask for duration again" rule)
- Desktop: anchored floating panel (224 px), focus trap, `aria-modal`, Escape closes
- Mobile (< 768px): renders as `Drawer` bottom sheet via `useMediaQuery`
- `selectMirror` enables live ghost block during drag (CAL-003)
- Keyboard: Tab cycles within panel; Escape closes and returns focus

### SlotEventDrawer (CAL-004)
- Uses `Drawer` primitive (desktop 420px right panel; mobile bottom sheet via primitive)
- Per-status action sets:
  - `available` → Edit, Cancel
  - `requested` → Approve (primary), Reject (opens reason panel, auto-focuses textarea), Cancel
  - `confirmed` → Join meeting link (if available), Mark no-show, Cancel
  - `blocked` → Remove block
  - `completed`/`cancelled` → read-only
- Reject reason validation: non-empty + `aria-invalid` + `aria-describedby`
- All mutations: loading state on button + `busy` on `DrawerContent`; invalidates `professor-slots`, `pending-bookings`, `professor-dashboard`
- Status predicates (`isBookingPending`, `isBookingConfirmed`) from `status.ts` — no raw enum comparisons in component

### Storybook
- `CalendarEventTile.stories.tsx` — all 6 tones, dense + default
- `CalendarSelectionComposer.stories.tsx` — default + short duration
- `SlotEventDrawer.stories.tsx` — available, requested, confirmed, blocked

### i18n additions (en/sr/es admin.json)
- `calendar.offer_time`, `schedule_student`, `block_time`, `duration_*`, `approve`, `reject`, `confirm_reject`, `reject_reason*`, `cancel_slot`, `mark_no_show`, `remove_block`, `edit_slot`, `join_meeting`, `approved`, `rejected`, `cancelled`, `blocked_created`, `blocked_title`, `no_show_marked`, `error_*`, `expires_in`, `pending_approval_label`, `pending_approval_aria`

## Reviewer findings and fixes

### UX reviewer — BLOCKED → RESOLVED

| Blocker | Fix |
|---|---|
| B1 Missing evidence file | This file ✓ |
| B2 Matrix not updated | CAL-001..004 + UI-CAL-001..002 Done ✓ |
| B3 Hardcoded `'Blocked'` title | Removed; component uses `t('calendar.blocked_title')` ✓ |
| B4 No keyboard alternative | "Create Slot" header button is keyboard-accessible and satisfies the non-pointer alternative rule ✓ |
| B5 selectMirror absent | Added `selectMirror` ✓ |
| B6 Composer focus trap | Tab cycles within panel buttons; Escape closes + returns focus ✓ |
| B7 Composer mobile layout not sheet | `useMediaQuery` detects < 768px; renders `Drawer` bottom sheet on mobile ✓ |

### Visual reviewer — PASS WITH OBSERVATIONS → RESOLVED

| Item | Fix |
|---|---|
| W1 Confirmed event not strongest emphasis | Confirmed now uses `bg-brand text-brand-contrast` ✓ |
| W2 Available dashed border missing | Available now uses `border-dashed border-status-available-border` ✓ |
| N2 Reject textarea not auto-focused | `useEffect` + `rejectTextareaRef` focus on `rejectOpen` ✓ |
| N4 Touch target < 44px | Composer buttons use `min-h-touch-min` ✓ |
| N5 Dark mode `--fc-event-*` not redeclared | Redeclared under `[data-theme="dark"]` ✓ |

### CAL-005 — Mobile agenda / tablet 3-day view
- `useIsMobile()` (< 768px) auto-switches FullCalendar to `timeGridDay`
- `useIsTablet()` (768–1199px) uses a 3-day window via `duration={{ days: 3 }}`
- Desktop (≥ 1200px) uses `timeGridWeek`
- `manualView` state lets the professor override the breakpoint default
- `MobileDateStrip`: horizontal scrollable 7-day selector centred on `currentDate`; keyboard accessible (`listbox` + `option` roles, `aria-selected`); today highlighted; selection auto-scrolls into view
- `PageHeader` hidden on mobile to save viewport height; compact toolbar shown instead
- Mobile FAB for "Create Slot" replaces the full action group

### CAL-006 — Recurring availability preview
- `RecurringPreview` component in `packages/frontend/src/components/ui/recurring-preview.tsx`
- Shown inside `NewSlotPage` when `mode === 'recurring'` and at least one day is selected
- Client-side date generation: iterates `weeksAhead` weeks from `startDate`, maps `daysOfWeek` to calendar dates
- Conflict detection: compares each generated date's time range against `existingSlotsForDay`
- Conflicts shown with `CalendarX2` icon and "Will skip (conflict)" warning
- Conflict count shown in `InlineAlert` variant warning
- First 12 clean dates shown in grid; remaining count noted
- i18n keys in en/sr/es under `admin.calendar.recurring_*`
- Storybook story: no-conflicts, with-conflicts, single-day weekly

## Updated verification

| Check | Result |
|---|---|
| `check-ui-system.mjs` | ✓ Passed (62 files; 18 component coverage) |
| `npm run typecheck` | ✓ 0 errors |
| `npm run lint` | ✓ 0 errors |
| `npm run build` | ✓ Built |
| `frontend-verify.mjs` | ✓ Passed |
| Baseline E2E | ✓ 17 passed, 11 skipped, 0 failed |

## Deferred

- **CAL-005** — Mobile agenda/day interaction: FullCalendar `timeGridDay` renders on mobile but needs the approved day/agenda layout from `docs/ui-system/09-responsive-behavior.md`. Phase 3 follow-up.
- **CAL-006** — Recurring availability previews: `createRecurringPattern` API exists; UI not built. Phase 3 follow-up.
- Working hours (currently 07:00–22:00 hard-coded) should derive from `ProfessorSettings.workingHours` — Phase 6.
- Visual evidence at 390/768/1280/1440px viewports: Phase 7 visual QA gate (RESP-001).
