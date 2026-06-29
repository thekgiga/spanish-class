---
name: implement-ui-system-foundation
description: Implement the approved Spanish Class Editorial Teaching Studio token layer, Tailwind semantic mapping, canonical primitives, Storybook state matrix, and enforcement without migrating unrelated pages.
disable-model-invocation: true
argument-hint: "[optional component or requirement IDs]"
model: opus
effort: high
---

# Implement UI System Foundation

This command implements Phase 1 only. It does not redesign unrelated pages.

## Read

1. `docs/ui-system/README.md`
2. `docs/ui-system/design-tokens.json`
3. `docs/ui-system/component-inventory.csv`
4. `docs/redesign/current-phase.md`
5. `docs/redesign/implementation-matrix.csv`
6. existing frontend tokens, Tailwind configuration, UI components, stories, and global styles

## Execute

1. Audit existing visual tokens and component duplicates.
2. Import `ui-system.tokens.css` once.
3. Merge `ui-system.tailwind.extend.cjs` into the current Tailwind v3 config without deleting legacy values.
4. Adapt the central lifecycle status mapping to real shared types and i18n keys.
5. Normalize canonical primitives in dependency order.
6. Add Storybook stories for every canonical component state.
7. Demonstrate tokens and components in Storybook or an internal design-system route.
8. Keep existing pages operational and avoid broad visual migration.
9. Run UI-system integrity, typecheck, lint, build, tests, accessibility, and visual checks.
10. Invoke both read-only reviewers and fix all blockers.
11. Update component inventory, implementation matrix, evidence, and phase status.

## Dependency order

Tokens → typography/global styles → Button/IconButton → fields/selection → badge/status → overlays → feedback states → layout shell → domain components.

Do not remove legacy tokens until zero production references remain. Do not create compatibility aliases that encourage new legacy usage.
