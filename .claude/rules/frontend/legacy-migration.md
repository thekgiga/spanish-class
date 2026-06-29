---
paths:
  - "packages/frontend/**/*"
---
# Legacy Migration

The repository currently contains multiple visual palettes and overlapping UI patterns.

- Do not perform an unrelated big-bang cleanup.
- Never add new usage of legacy palette utilities.
- When a legacy component is touched substantially, migrate it to semantic tokens and shared patterns.
- Prefer adapters when a direct replacement would create excessive regression risk.
- Record deferred legacy debt in the implementation matrix or evidence note.
- Delete legacy CSS/components only after references and route behavior are verified.
