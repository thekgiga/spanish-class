# Responsive Behavior

## Breakpoint intent

- Mobile: below 768px.
- Tablet: 768–1199px.
- Desktop: 1200px and above.
- Wide: 1440px and above.

Use content-driven adjustments between these points when necessary; do not add arbitrary project-specific breakpoints without documentation.

## Desktop

- Persistent 240px sidebar.
- Week calendar.
- Right drawer alongside/over calendar.
- Two-panel student booking.
- Split-view student management.

## Tablet

- Collapsed/overlay sidebar.
- 3-day or day calendar based on width.
- Drawers overlay content.
- Student booking remains two-panel when at least 900px is available.

## Mobile

- Bottom navigation with 3–4 primary destinations.
- Professor schedule becomes day agenda.
- Floating or sticky New action.
- Drawers become bottom sheets.
- Date and time selection become vertical steps.
- Sticky primary action only when it does not cover focused fields.
- Tables become labeled lists/cards.

## Required viewport verification

Every affected page is visually verified at:

- 390×844
- 768×1024
- 1280×800
- 1440×900

Also test 200% zoom at 1280px equivalent and landscape phone where relevant.

## Touch and gestures

- Minimum hit area 44×44px.
- Do not make drag the only way to create or reschedule.
- Swipe may enhance, never replace visible controls.
- Hover-only actions must appear on focus and remain discoverable on touch.
