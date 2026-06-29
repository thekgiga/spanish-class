# Calendar and Booking Domain UI

## Professor calendar

The calendar is a workspace, not a decorative widget.

### Header

Left: date navigation and Today. Center/left: date range. Right: day/week view, filters, search, New.

A compact summary below the header reads naturally, for example:

> 3 lessons today · 2 requests need approval · Next at 14:00

### Event anatomy

1. Status icon or 3px semantic accent.
2. Student name or state label.
3. Time range.
4. Optional secondary indicator: meeting, recurring, note.

Never show raw status codes, participant counters, IDs, or redundant duration when space is limited.

### Available event

- Soft sage fill and dashed border.
- Label “Available”.
- Low visual priority.
- Hover reveals edit affordance.

### Requested event

- Amber fill and solid border.
- Clock icon.
- Student name first.
- “Approval needed” visible.
- Drawer opens to approval actions.

### Confirmed event

- Solid brand fill in normal week view.
- White foreground and clear time.
- Meeting icon when link is available.
- Current/next lesson may use a subtle outline, not glow.

### Blocked event

- Neutral surface, lock icon, optional label.
- Lower visual priority than lessons.

### Completed/cancelled

Completed is muted. Cancelled, rejected, and expired are hidden by default and available through filters/history.

## Calendar selection

While selecting a range:

- render a translucent brand-tinted block;
- show start, end, and live duration;
- snap to 15 minutes;
- announce the selected interval for assistive technology;
- allow keyboard creation through a dedicated New action.

After release, open `CalendarSelectionComposer` with:

1. Offer this time
2. Schedule a student
3. Block time

The selected interval is authoritative; never ask for duration again.

## Student booking

Students do not use the professor week grid as the default booking interface.

Desktop: date panel + time-option panel.
Mobile: horizontal date strip + vertical time list + sticky action.

### Time option

- 44–48px minimum height.
- Start–end time in tabular numerals.
- Duration as secondary text only if options vary.
- Clear selected state with border, ring, and check icon.

### Review request

Show date, local timezone, start/end, duration, professor, approval explanation, and cancellation policy.

Primary label: **Request lesson**.

### Pending state

Explain that the time is reserved while awaiting the professor. Show the exact response deadline or countdown in plain language.

## Status mapping

All UI state mapping lives in one module. Pages may not independently choose labels, colors, or actions for booking statuses.
