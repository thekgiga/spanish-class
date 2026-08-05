# Existing Architecture Findings

Initial repository inspection indicates:

- Turborepo/npm workspaces with frontend, backend, and shared packages;
- React 18, Vite, TypeScript, Tailwind, Radix UI, TanStack Query, Zustand, React Hook Form, Zod, Framer Motion, and Lucide;
- Storybook, Playwright, axe, and existing test infrastructure;
- an existing root `CLAUDE.md`, Spec Kit commands, and generic `ui-ux-pro-max` skill;
- frontend organization around pages, shared/UI/domain components, hooks, API services, stores, stories, and styles;
- multiple competing palettes and legacy design mappings in the current Tailwind/token surface.

## Consequence

The redesign must extend the current architecture incrementally. It should not introduce another visual system. New-code checks operate on added lines first, while Phase 1 consolidates the semantic foundation and later phases remove legacy usage.

Claude must validate these observations against the current checkout during Phase 0 because the repository may have changed since this bootstrap was produced.
