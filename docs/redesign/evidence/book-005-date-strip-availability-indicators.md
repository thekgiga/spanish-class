# Frontend Change Evidence

## Scope

- Requirement IDs: BOOK-005
- Roles: Student
- Routes: `/book`
- BPMN sections: §2 Booking Lifecycle — browsing step (before slot selection)

## Before

`DateStrip` showed only weekday abbreviation and day number. Students had no way to know which days had openings without tapping each day and waiting for the list to update.

## After

`DateStrip` accepts optional `slotCounts: Record<string,number>` and `getSlotLabel?: (n:number)=>string` props. When provided (student `BookPage` only):

- Days with available slots show a small `text-micro text-brand` count below the date number (e.g. `3`, `9+` for >9).
- Days with zero available slots show an invisible spacer of the same height — button heights remain uniform and no misleading zero is displayed.
- When a day is selected, the count text switches to `text-brand-contrast` to stay legible against the filled brand background.
- Each button's `aria-label` is augmented with the localized `getSlotLabel(count)` string so screen readers announce "Wednesday, July 9 — 3 available" (language-dependent).
- `CalendarPage` (professor) passes neither prop — zero regression.
- Slot query window widened from `centerDate ± 3/4 days` to `centerDate ± 7/8 days` to match `DateStrip radius={7}` (15 visible days). Without this, outer days always resolved to count=0.

## State coverage

- [x] default — mixed counts (some days 1–9 openings, some 0)
- [x] loading — `isLoading=true`: `slotCounts` defaults to `{}` so all days show invisible spacer, consistent with existing skeleton list treatment; no phantom numbers during load
- [x] empty — all-zero counts: spacers keep uniform height; list below shows EmptyState
- [x] success — slots loaded, counts visible, count updates after booking mutation invalidates query
- [ ] error/retry — pre-existing; slot list shows empty state; counts not visible (not a new regression)
- [x] disabled — zero-count days can still be selected (student may want to check; EmptyState with explanation appears)
- [x] 9+ cap — counts > 9 render `9+` string

## Responsive evidence

- [x] 390px — horizontal scroll in DateStrip unchanged; count fits below date number within `min-w-touch` (44px) button
- [x] 768px — same layout, wider buttons, count visible
- [x] 1280px — desktop; strip in top strip area below PageHeader; count legible
- [x] 1440px — same as 1280px; `max-w-lg` constraint on slot list unaffected

Visual verification performed via Storybook stories (`WithSlotCounts`, `WithSlotCountsHighVolume`, `WithSlotCountsNoneAvailable`) covering all count states at all required viewports.

## Accessibility evidence

- Count is `aria-hidden="true"` (visual decoration supplemented by aria-label on the button).
- `aria-label` on each button = `{weekday, month day} — {count} available` (via `getSlotLabel`).
- Zero-count days: invisible spacer does not appear in accessibility tree (`visibility: hidden`).
- `getSlotLabel` is optional; when absent, aria-label falls back to `undefined` (same behavior as before this change).
- O1 reviewer note: `format(day, 'EEEE, MMMM d')` uses date-fns default English locale even in SR/ES. Known limitation; date part of the aria-label is English on non-English locales. Count portion is localized via `t(…)`. Deferred to a follow-up as this is pre-existing pattern across the whole DateStrip.
- O2 reviewer note: contract allows `slotCounts` without `getSlotLabel`. When that happens, count renders visually but aria-label stays `undefined`. Future callers should be aware. Tracked as follow-up hardening.

## Localization evidence

All three locales updated simultaneously:

| Key | EN | SR | ES |
|---|---|---|---|
| `booking:date_strip.slots_available` | `{{count}} available` | `{{count}} dostupno` | `{{count}} disponible` |
| `booking:date_strip.slots_available_plural` | `{{count}} available` | `{{count}} dostupnih` | `{{count}} disponibles` |

O3 reviewer note: Serbian has three plural categories (1 / 2–4 / 5+); `_plural` covers only 5+. `2 dostupna` would need a `_few` key. Grammatical quality gap for SR; deferred to i18n follow-up.

## Automated verification

- `tsc --noEmit`: 0 errors
- `eslint` on changed files: 0 errors, 1 pre-existing `@typescript-eslint/no-explicit-any` warning in BookPage (unchanged line 115)
- `npm run build`: success (5.76 s, same chunk warnings as before, no new ones)

## UI/UX reviewer decision

**BLOCKED → RESOLVED**

Reviewer found two blocking issues:

- B1 (query window narrower than strip radius) — fixed: window widened to `centerDate ± 7/8` to match `radius={7}`.
- B2 (missing evidence file) — fixed: this document.

Observations O1–O3, O5 deferred as follow-ups (see Remaining limitations).

## Remaining limitations

1. **O1** — `format(day, 'EEEE, MMMM d')` in aria-label uses English locale regardless of app language. Fix: pass `locale` from date-fns to `format()`.
2. **O2** — `getSlotLabel` is optional even when `slotCounts` is present; a future caller could omit it and silently drop count from AT. Fix: discriminated union or dev-mode warning.
3. **O3** — Serbian plural needs `_zero`, `_one`, `_few`, `_many`, `_other` keys for correct grammar.
4. **O5** — During loading, all strip days show the invisible spacer (visually flat). A shimmer row or "counts pending" affordance could improve perceived responsiveness.
5. **O4** — No `date-strip.test.tsx` component test for the new branches. Storybook stories cover the visual states; automated assertions for aria-label content and 9+ cap are missing.
