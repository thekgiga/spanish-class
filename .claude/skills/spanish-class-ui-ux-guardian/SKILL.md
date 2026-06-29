---
name: spanish-class-ui-ux-guardian
description: Mandatory Spanish Class frontend design and UX workflow. Automatically use for any change affecting frontend components, pages, routes, styles, user-facing text, booking/calendar interactions, responsive behavior, accessibility, Storybook, or frontend tests.
when_to_use: Any frontend or user-facing change in the Spanish Class repository.
paths:
  - "packages/frontend/**/*"
  - "e2e/**/*"
  - "docs/redesign/**/*"
model: opus
effort: high
---
# Spanish Class UI/UX Guardian

This skill protects product coherence during AI-developed frontend work.

## Canonical sources

Read only what is relevant, but always load:

1. `docs/redesign/current-phase.md`
2. `docs/redesign/implementation-matrix.csv`
3. affected sections of `docs/product/processes-overview.md`
4. `docs/redesign/03-visual-language.md`
5. `docs/redesign/07-frontend-definition-of-done.md`

Use the generic `ui-ux-pro-max` skill only as optional inspiration. It must never override the project-specific visual language, interaction model, or tokens.

## Mandatory preflight

Before editing, provide a compact plan containing:

- affected role(s);
- user goal and next expected step;
- BPMN process/section;
- requirement IDs;
- affected routes and permissions;
- existing components to reuse or extend;
- APIs and state transitions that must remain unchanged;
- planned loading, empty, error, success, disabled, and conflict states;
- desktop, tablet, and mobile behavior;
- accessibility behavior;
- tests and visual evidence to add.

Inspect the code before proposing a new component. Search `components/ui`, `components/shared`, feature/domain folders, stories, hooks, and existing tests.

## Implementation rules

- Implement one coherent vertical slice.
- Preserve existing business contracts unless an approved ADR says otherwise.
- Assemble from semantic tokens and existing primitives.
- Centralize domain status rendering and actions.
- Never introduce a competing visual pattern for local convenience.
- Keep professor and student mental models distinct.
- Add translation strings in English, Serbian, and Spanish.
- Include all required UX states during implementation.
- Keep the patch scoped and migrate touched legacy code where safe.

## Verification sequence

1. Run targeted tests while implementing.
2. Run `node scripts/uiux/check-frontend-guardrails.mjs`.
3. Run `node scripts/uiux/frontend-verify.mjs`.
4. Launch and inspect the affected flow using the repository run workflow or Claude Code `/run` and `/verify`; do not rely only on static checks.
5. Capture evidence using `docs/redesign/evidence/TEMPLATE.md`.
6. Update `docs/redesign/implementation-matrix.csv`.
7. Invoke the read-only `ui-ux-reviewer` subagent.
8. Resolve every blocking reviewer finding.
9. Rerun verification.

## Completion report

Do not claim completion without reporting:

- roles and BPMN flows affected;
- requirement IDs completed;
- reused and new components;
- API contract changes, or `none`;
- state coverage;
- responsive verification;
- keyboard and accessibility verification;
- localization verification;
- tests executed and results;
- evidence file;
- reviewer decision;
- remaining known gaps.

If a required check cannot run, mark the task incomplete and explain the exact blocker. Never silently skip it.
