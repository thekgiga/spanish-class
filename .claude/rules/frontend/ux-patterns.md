---
paths:
  - "packages/frontend/src/**/*.{ts,tsx}"
---
# UX Interaction Patterns

- Professor creation starts contextually from the calendar.
- Selecting a calendar range defines start, end, and duration; do not ask for duration twice.
- Use contextual popovers for lightweight creation.
- Use a right drawer on desktop and a bottom sheet on mobile for lesson, request, and student details.
- Keep the underlying context visible.
- Use confirmation dialogs only for destructive or difficult-to-reverse actions.
- A toast is supplementary feedback, never the sole evidence of state change.
- Always communicate what happens next.
- Keep one visually dominant primary action per surface.
- Empty states explain why the page is empty and provide the next valid action.
