---
paths:
  - "packages/frontend/src/**/*.{ts,tsx,css}"
  - "packages/frontend/tailwind.config.js"
  - "packages/frontend/.storybook/**/*"
---

# Complete Visual System Rules

Read `docs/ui-system/README.md` and the relevant foundation/component/domain files before modifying frontend UI.

Non-negotiable:

- Use the Editorial Teaching Studio system.
- Use semantic tokens from `ui-system.tokens.css` and semantic Tailwind mappings.
- Do not add raw colors, palette classes, gradients, glow, arbitrary spacing/radius/shadow/type sizes, or one-off animation durations.
- Do not add `edu-*` or legacy Spanish red/gold/clay tokens to migrated code.
- Do not invent component variants outside `06-component-contracts.md` without an ADR.
- Do not independently style booking states; use the central status definition.
- App UI uses Inter; display serif is limited to marketing and rare editorial moments.
- Operational screens are light, warm, compact, and mostly neutral.
- Verify both visual hierarchy and behavior at 390, 768, 1280, and 1440 widths.
- No partial dark-mode implementation.
