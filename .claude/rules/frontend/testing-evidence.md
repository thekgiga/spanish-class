---
paths:
  - "packages/frontend/**/*"
  - "e2e/**/*"
  - "docs/redesign/**/*"
---
# Tests and Evidence

A frontend change is incomplete without evidence appropriate to risk.

Required for a user-flow change:

- unit/component coverage for business-visible states;
- E2E coverage for the critical path;
- accessibility check;
- desktop and mobile visual proof;
- updated requirement matrix;
- independent UI/UX reviewer result.

Every async flow covers loading, success, recoverable error, stale data/conflict, and disabled behavior. Do not silently update snapshots. Explain why a visual baseline changed.
