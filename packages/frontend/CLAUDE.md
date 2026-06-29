# Frontend Constitution

This file applies whenever work enters `packages/frontend/`.

## Read before editing

1. `docs/product/processes-overview.md`
2. `docs/redesign/current-phase.md`
3. `docs/redesign/implementation-matrix.csv`
4. `docs/redesign/03-visual-language.md`
5. `docs/redesign/04-design-system-architecture.md`
6. `docs/redesign/07-frontend-definition-of-done.md`

The root `CLAUDE.md` remains authoritative for repository commands, deployment, and general engineering conventions.

## Current stack

- React 18 + TypeScript + Vite
- Tailwind CSS
- Radix UI primitives
- TanStack Query
- Zustand
- React Hook Form + Zod
- Framer Motion
- Lucide icons
- Storybook and Playwright

Preserve the existing architecture unless the current redesign phase explicitly migrates it.

## Non-negotiable product rules

- The primary product is one-to-one teaching.
- A student requests an available time; the professor always approves or rejects it.
- A professor-created booking is immediately confirmed.
- Professor experience is calendar-first.
- Student booking is decision-first and must not simply reuse the administrative professor calendar.
- Backend sophistication must not leak into user language.
- Existing BPMN behavior is preserved unless an approved ADR changes it.

## Non-negotiable frontend workflow

For every user-facing change:

1. Activate `spanish-class-ui-ux-guardian`.
2. Identify affected role, journey, BPMN section, and requirement IDs.
3. Inspect existing components before proposing new ones.
4. Write a short implementation plan before editing.
5. Reuse semantic tokens, primitives, composites, and domain components.
6. Implement loading, empty, error, disabled, success, and permission states.
7. Verify keyboard, screen-reader semantics, reduced motion, and focus restoration.
8. Verify 390px, 768px, 1280px, and 1440px layouts.
9. Add or update tests and visual evidence.
10. Update `docs/redesign/implementation-matrix.csv`.
11. Run the independent `ui-ux-reviewer` agent.
12. Run `node scripts/uiux/frontend-verify.mjs`.

Never report completion while a blocking check or reviewer issue remains.

## Architecture rules

- Pages compose; they do not invent primitives.
- Feature code must not introduce raw color values or arbitrary Tailwind values.
- Use semantic status mapping instead of styling booking states independently.
- Do not expose enum values or translation keys.
- Do not add a top-level route without updating the route architecture document.
- Do not use large modals when a contextual popover, drawer, or mobile sheet preserves context better.
- Do not duplicate API-derived server state in Zustand.
- Do not use `alert`, `confirm`, or `prompt`.
- Do not add one-off CSS to solve a reusable component problem.

## Migration policy

This is an incremental migration. Do not rewrite unrelated files. New code follows the target system; touched legacy code is improved where safe. Keep pull requests as complete vertical flows rather than broad page collections.
