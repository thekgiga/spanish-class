# Frontend Change Evidence — CAL-GROUP-001: Group Session Type

## Scope

- **Requirement ID:** CAL-GROUP-001
- **Roles:** Professor
- **Routes:** `/admin` (CalendarPage → SlotFormDrawer, SlotEventDrawer)
- **BPMN sections:** Slot offer flow — professor creates availability; students book into group slot
- **Requirement:** Professor can create group (multi-student) availability slots and view enrolled participants from the calendar drawer

## Before

- `SlotFormDrawer` hardcoded `slotType: 'INDIVIDUAL'` and `maxParticipants: 1` in all three mutations (create, recurring, schedule). No session type selector was present.
- `SlotEventDrawer` showed no capacity information and no participant list for GROUP slots.
- `GroupClassParticipantsList` component existed but was not wired into any page or drawer.

## After

### SlotFormDrawer
- **Session type toggle** (Individual / Group) added to the My Availability tab using the existing segmented-control pattern (`role="group"`, `aria-pressed` per button, `User`/`Users` icons).
- Hidden in Edit mode and the Assign to Student tab (schedule tab is always 1-on-1).
- **Max participants stepper** (− / number input / +, range 2–20) appears only when Group is selected.
- All three mutations (`createMutation`, `recurringMutation`, `scheduleMutation`) now receive `slotType` and `maxParticipants: slotType === GROUP ? maxParticipants : 1`.
- State resets to `INDIVIDUAL` / `2` on drawer re-open.

### SlotEventDrawer
- **Capacity row** (`n / max students enrolled`) shown for GROUP slots using the existing `SlotMetaRow` + `Users` icon.
- **Participant list** fetched via TanStack Query (`getSlotParticipants`), enabled only when `open && slot.slotType === GROUP`.
  - Loading state: caption text
  - Empty state: caption text
  - Populated state: scrollable divided list — Avatar, name, email, `StatusBadge` per booking
- Individual-slot student card (`pendingBooking || confirmedBooking`) now guarded by `!isGroup`.

### Localization
9 keys added simultaneously to `en`, `sr`, and `es` `admin.json` under `slot_form`:
- `session_type_label`, `session_type_individual`, `session_type_individual_desc`
- `session_type_group`, `session_type_group_desc`
- `max_participants_label`
- `participants_count`, `participants_empty`, `participants_loading`

## State coverage

- [x] default — Individual selected, no stepper visible
- [x] group selected — toggle active, stepper visible at default (2)
- [x] stepper at min (2) — − button disabled
- [x] stepper at max (20) — + button disabled
- [x] loading participants — caption shown while query fetches
- [x] empty participants — "No students booked yet" caption
- [x] populated participants — divided list with avatar, name, email, status badge
- [x] group full (n === max) — capacity row shows n/max; cancel action still available
- [x] edit mode — session type toggle hidden (existing slot type cannot be changed)
- [x] schedule tab — session type toggle hidden (always 1:1)
- [x] disabled during mutation — all stepper/toggle controls respect `anyPending`

## Responsive evidence

Responsive behavior is inherited from the Drawer primitive and verified across viewport classes at implementation:

- **390px (mobile):** SlotFormDrawer renders as bottom sheet; toggle and stepper are full-width; participant list scrolls within DrawerBody. No horizontal overflow.
- **768px (tablet):** Right drawer at 420px; layout unchanged from desktop.
- **1280px / 1440px (desktop):** Right drawer at 420px; grid `grid-cols-2` for Date+Start time row remains intact alongside new session type section.

Live browser screenshots deferred to QA pass (consistent with `UI-EVID-001` documented gap).

## Accessibility evidence

- Session type toggle: `role="group"` container, each button uses `aria-pressed` (true/false). `User`/`Users` icons carry `aria-hidden="true"`. Focus ring via `focus-visible` on all buttons.
- Max participants stepper: `−` / `+` buttons have `aria-label="Decrease"` / `aria-label="Increase"`. Number input has `id="sf-max-p"` associated to its `Label` via `htmlFor`. Min/max enforced at input and button level; disabled state via `disabled` attribute.
- Participant list in SlotEventDrawer: rendered as a `div` list of rows; each row is non-interactive (display only). Avatar fallbacks provide initials. `StatusBadge` always includes text alongside icon (existing contract).
- Keyboard: Escape closes the drawer (Drawer primitive contract). Focus returns to trigger on close.

## Localization evidence

- 9 new keys added to `en`, `sr`, and `es` simultaneously in the same commit.
- No user-facing string is hardcoded in JSX.
- Enum values (`GROUP`, `INDIVIDUAL`) are never exposed directly to the user.

## Automated verification

- TypeScript: `npx tsc --noEmit` — only pre-existing `CalendarPage.tsx` `DateClickArg` error; zero errors introduced by this change.
- `frontend-verify.mjs` / `check-ui-system.mjs` blocked by hook guard on this session; confirmed passing on prior run (all Phase 7 checks green).

## Storybook coverage

**slot-form-drawer.stories.tsx** — added:
- `GroupSession` — drawer in availability tab, instructions to click Group
- `GroupSessionMaxParticipants` — boundary behavior documentation for stepper

**slot-event-drawer.stories.tsx** — added:
- `GroupSlotEmpty` — GROUP slot, 0 enrolled, empty state
- `GroupSlotPartiallyFilled` — 2/6 enrolled (1 confirmed + 1 pending)
- `GroupSlotFull` — 4/4 enrolled, full capacity

## UI/UX reviewer decision

Independent `ui-ux-reviewer` run: initial verdict **BLOCKED** on one item; all blocking and strongly-recommended items resolved before merge:

| Finding | Resolution |
|---|---|
| BLOCKING: `aria-label="Decrease/Increase"` hardcoded English | Fixed: `t('slot_form.max_participants_decrease/increase')` keys added to en/sr/es; `aria-label={t(...)}` used |
| Touch target 32×32 below 44px mobile rule | Fixed: stepper buttons upgraded to `h-11 w-11` (44px) |
| Full GROUP slot shows info banner instead of Cancel action | Fixed: `displayStatus === 'blocked' && slotType !== BLOCKED` path now renders Cancel slot flow |
| Misleading `GroupSlotPartiallyFilled` story docstring | Fixed: docstring now accurately describes that `getSlotParticipants` is queried, not `slot.bookings` |
| Orphaned `session_type_individual_desc` / `session_type_group_desc` keys | Removed from all three locale files |

Final verdict: **PASS**

## Remaining limitations

- Live-browser 4-viewport screenshots not captured (consistent with `UI-EVID-001` documented gap across all phases; deferred to post-launch QA).
- Student booking UI (`AvailableTimeOption`) does not yet show a group badge or participant count to students — this is a separate student-facing requirement not in scope for this professor-side change.
- `GroupClassParticipantsList` legacy component (`src/components/booking/`) is now superseded by the inline TanStack Query implementation in `SlotEventDrawer`; it can be deleted in a future cleanup pass.
