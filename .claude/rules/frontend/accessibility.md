---
paths:
  - "packages/frontend/src/**/*.{ts,tsx}"
  - "packages/frontend/src/**/*.css"
---
# Accessibility

- All functionality must be keyboard accessible.
- Use semantic elements before ARIA.
- Maintain a visible focus indicator.
- Touch targets are at least 44x44 CSS pixels on mobile.
- Associate labels, descriptions, and errors with form fields.
- Announce async booking and approval status changes.
- Escape closes popovers, drawers, sheets, and dialogs.
- Focus moves into overlays and returns to the trigger on close.
- Do not communicate status using color alone.
- Respect `prefers-reduced-motion`.
- Calendar selection and event actions require a non-pointer alternative.
- Run axe checks for new or materially changed screens.
