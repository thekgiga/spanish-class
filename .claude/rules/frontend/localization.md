---
paths:
  - "packages/frontend/src/**/*.{ts,tsx,json}"
  - "packages/frontend/public/locales/**/*"
---
# Localization and Content

Supported UI languages are English, Serbian, and Spanish.

- No user-facing string is considered complete until all supported locales contain it.
- Never expose keys such as `spanish_levels.BEGINNER.label`.
- Never render backend enums such as `PENDING_CONFIRMATION` directly.
- Dates use the selected locale; times use the user's timezone.
- Prefer natural user language: `Request lesson`, `Approval needed`, `Confirmed`, `Available`.
- Avoid system language: `Create AvailabilitySlot`, `confirmation token`, `booking entity`.
- Button labels describe the action and expected result.
- Errors explain recovery, not only failure.
