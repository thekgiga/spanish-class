---
paths:
  - "packages/frontend/src/**/*.{ts,tsx,css}"
  - "packages/frontend/tailwind.config.*"
---
# Design-System Rules

The target visual direction is **Editorial Teaching Studio**: calm, warm, precise, personal, and premium.

- Use semantic tokens. Raw hex, RGB/HSL, and direct palette classes are allowed only in token/configuration files.
- Do not add arbitrary Tailwind values such as `mt-[13px]`.
- Do not introduce another palette. Consolidate toward warm neutral surfaces, deep ink green, restrained terracotta, and semantic status tones.
- Use borders and surface contrast before shadows.
- Use 8px controls, 12px standard cards, and 16px large surfaces unless an existing semantic radius token applies.
- Use Lucide icons; never use emoji as interface icons.
- Use pills only for statuses, compact filters, and choices.
- Motion explains state or spatial change. Respect reduced motion.
- A new primitive requires a design-system use case, Storybook state coverage, and documentation.
