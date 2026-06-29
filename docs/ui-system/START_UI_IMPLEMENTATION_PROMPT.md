# Start Prompt for Claude Code

Start the Spanish Class UI/UX redesign using the repository’s canonical BPMN, UX plan, and complete UI system.

Before editing:

1. Load `spanish-class-ui-ux-guardian` and `spanish-class-ui-system`.
2. Read `docs/ui-system/README.md`, `design-tokens.json`, component contracts, page blueprints, and current redesign phase.
3. Audit the existing frontend architecture and current visual systems.
4. Map existing components to keep, extend, replace, or deprecate.
5. Identify affected requirement IDs and update the implementation plan.

Implementation order:

1. Introduce semantic token CSS and Tailwind semantic mappings without breaking legacy screens.
2. Normalize core primitives and Storybook state coverage.
3. Implement the application shell.
4. Implement the professor Schedule page as the visual reference.
5. Continue one complete vertical journey at a time.

Non-negotiable rules:

- Preserve existing backend contracts and BPMN behavior.
- Do not visually polish legacy pages scheduled for removal.
- Do not invent colors, spacing, components, or interaction patterns.
- Do not use raw palettes, legacy `edu-*` colors, gradients, glow, or arbitrary values in migrated code.
- Do not claim completion without verification, screenshots, matrix updates, and independent review.

Begin with a written plan containing affected routes, roles, BPMN flows, requirement IDs, existing components, proposed component changes, responsive behavior, accessibility behavior, tests, and rollback strategy. Then execute the first coherent implementation slice fully.
