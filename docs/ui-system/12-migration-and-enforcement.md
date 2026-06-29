# Migration and Enforcement

## Repository reality

The existing frontend uses React 18, Vite 5, Tailwind 3.4, Radix UI, Framer Motion, Lucide, Storybook, Vitest, Playwright, and axe. It already contains overlapping education-blue and older Spanish red/gold systems. The new UI system is an additive semantic layer and a controlled migration, not a big-bang rewrite.

## Migration sequence

1. Audit current components and routes.
2. Install/import semantic tokens.
3. Map Tailwind semantic names to CSS variables.
4. Build/normalize primitives.
5. Build Storybook state matrix.
6. Migrate application shell.
7. Migrate professor Schedule vertical flow.
8. Migrate student booking vertical flow.
9. Migrate student/profile/settings/secondary pages.
10. Remove deprecated palettes and components only after zero references remain.

## Token ratchet

Existing untouched legacy lines may temporarily remain. Added or modified frontend lines must not introduce:

- raw hex/rgb/hsl values outside token files;
- direct Tailwind color palettes;
- `edu-*` colors in migrated components;
- legacy Spanish red/gold/clay tokens;
- arbitrary Tailwind values;
- new page-specific shadows, radii, spacing, or animation durations.

## Component ratchet

Before creating a component Claude must search:

1. `src/components/ui`
2. `src/components/shared`
3. `src/components/layout`
4. `src/design-system`
5. Storybook stories

A new primitive requires a documented gap. Page files may not implement button, field, badge, drawer, dialog, toast, or status primitives.

## Visual evidence

Every migrated page/flow needs screenshots at required viewports and Storybook stories for new canonical components. Snapshot updates must include a reason.

## Enforcement layers

- Path-scoped Claude rules
- Automatic UI-system skill
- Post-edit changed-line scanner
- Stop/TaskCompleted verification gate
- Independent read-only visual reviewer
- CI workflow
- Protected config and design-system files

## Exceptions

Use an inline exception only when there is no appropriate token and the value is inherently data-driven. Add `uiux-allow-arbitrary: REASON` beside the value and create a follow-up requirement if it represents a reusable pattern.
