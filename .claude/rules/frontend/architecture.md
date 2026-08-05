---
paths:
  - "packages/frontend/src/**/*.{ts,tsx}"
---
# Frontend Architecture

Preferred dependency direction:

`pages -> features/domain -> shared composites -> UI primitives -> tokens`

Rules:

- Pages orchestrate data and layout; they do not define reusable controls.
- Check `src/components/ui`, `src/components/shared`, and domain folders before creating a component.
- Server state belongs in TanStack Query. Local cross-route UI state may use Zustand. Form state belongs in React Hook Form.
- Centralize booking-state labels, icons, tones, and allowed actions.
- Preserve API contracts unless a separately approved backend task changes them.
- Do not move business validation into presentational components.
- Add adapters around legacy components when this allows safe incremental migration.
