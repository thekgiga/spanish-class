---
paths:
  - "packages/frontend/src/**/*.{ts,tsx,css}"
---
# Responsive Behavior

Verify every affected screen at 390px, 768px, 1280px, and 1440px.

- Desktop professor: persistent navigation, week calendar, contextual right drawer.
- Tablet professor: collapsible navigation, day/three-day calendar, overlay drawer.
- Mobile professor: agenda/day schedule, bottom navigation, bottom sheet details.
- Desktop student booking: date context plus available-time choices.
- Mobile student booking: date carousel/list, time cards, sticky request action.
- Never compress a seven-day administrative calendar into a phone viewport.
- Responsive behavior may change the interaction model; it is not only CSS shrinking.
- Prevent horizontal scrolling except deliberate calendar/date-strip behavior.
