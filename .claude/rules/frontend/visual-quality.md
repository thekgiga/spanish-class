---
paths:
  - "packages/frontend/src/pages/**/*.{ts,tsx}"
  - "packages/frontend/src/components/**/*.{ts,tsx}"
  - "packages/frontend/src/styles/**/*.css"
---

# Visual Quality Gate

For each changed user-facing screen:

1. State the primary user intent and primary action.
2. Apply the canonical page blueprint.
3. Check alignment, hierarchy, density, and whitespace—not only correctness.
4. Render and inspect at all required viewports.
5. Ensure loading, empty, error, disabled, success, and long-content states look intentional.
6. Capture visual evidence.
7. Run the independent visual-design reviewer.

Block completion for:

- generic dashboard/card-grid composition;
- more than one dominant CTA per decision area;
- unexplained empty space or cramped density;
- decorative gradients/glow/glass effects;
- oversized pills/rounded cards everywhere;
- desktop calendar squeezed onto mobile;
- inconsistent drawer, form, or status styling.
