---
paths:
  - "packages/frontend/src/components/**/*.{ts,tsx}"
  - "packages/frontend/src/design-system/**/*.{ts,tsx}"
  - "packages/frontend/src/stories/**/*.{ts,tsx}"
---

# Component Contract Enforcement

Before creating a component, search existing UI, shared, layout, design-system, and stories directories.

Every canonical component must include:

- typed props and constrained variants;
- default, hover, pressed, focus, disabled, loading where applicable;
- keyboard and screen-reader behavior;
- responsive behavior;
- Storybook stories covering variants and edge states;
- focused tests.

Page components may compose but may not implement new primitives.

No nested interactive controls. No placeholder-only labels. No icon-only action without accessible name. No status conveyed by color alone.
