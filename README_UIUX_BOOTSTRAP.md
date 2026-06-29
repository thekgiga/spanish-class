# Spanish Class — Claude Code UI/UX Bootstrap

This package adds a project-specific enforcement layer for the existing Spanish Class repository. It is intentionally additive:

- it does **not** replace the existing root `CLAUDE.md`;
- it does **not** remove the existing Spec Kit commands;
- it does **not** remove the existing generic `ui-ux-pro-max` skill;
- it does not require a big-bang frontend rewrite.

The package makes the redesign executable through four controls:

1. **Persistent project rules** — architecture, UX, visual system, accessibility, responsiveness, localization, and evidence requirements.
2. **Automatic UI/UX guardian skill** — loaded whenever Claude works in the frontend.
3. **Deterministic hooks** — inspect frontend edits and block incomplete completion attempts.
4. **CI and migration ledger** — make compliance visible and mergeable only when requirements have evidence.

## Install

Extract the ZIP into the repository root, preserving paths.

```bash
unzip spanish-class-claude-uiux-bootstrap.zip -d /path/to/spanish-class
cd /path/to/spanish-class
npm install
```

No existing root file is intentionally overwritten. Review the extracted files before committing.

## Verify Claude Code sees the package

Inside Claude Code, run:

```text
/memory
/skills
/hooks
```

Confirm that Claude sees:

- `packages/frontend/CLAUDE.md`
- `.claude/rules/frontend/*`
- `spanish-class-ui-ux-guardian`
- `implement-uiux-redesign`
- project hooks from `.claude/settings.json`

## Start implementation

Use either:

```text
/implement-uiux-redesign
```

or:

```text
Start the UI/UX redesign implementation. Read the repository redesign plan, current phase, implementation matrix, BPMN source of truth, and existing architecture. Execute the next coherent vertical slice. Do not skip the guardian workflow, tests, evidence, or independent UI/UX review.
```

The command is resumable. It reads `docs/redesign/current-phase.md` and `docs/redesign/implementation-matrix.csv`, then continues from the first incomplete requirement instead of restarting.

## Initial behavior

The first run performs **Phase 0: architecture reconnaissance and regression baseline**. It should not begin a broad visual rewrite before documenting:

- routes and role guards;
- components and duplicate patterns;
- state management and API contracts;
- booking status transitions;
- localization structure;
- responsive behavior;
- current tests;
- BPMN-to-code traceability.

After Phase 0, Claude builds the semantic design-system foundation and migrates one complete user flow at a time.

## Strictness model

The guardrail scanner checks **added lines and new files**, not every legacy violation. This is deliberate. The current frontend contains multiple palettes and older patterns, so whole-repository enforcement would block all incremental work. Quality is ratcheted forward:

- new code must follow the target system;
- touched legacy code should be migrated when practical;
- untouched legacy code remains temporarily allowed;
- each migration reduces the legacy surface.

## Guardrail maintenance

Claude is prevented from modifying the enforcement layer during a normal feature task. To intentionally update guardrails, start Claude Code with:

```bash
UIUX_ALLOW_GUARDRAIL_EDIT=1 claude
```

Use a dedicated change and review it separately.

## Optional CI gates

The static quality workflow runs immediately. The guardian also requires runtime inspection through the repository run workflow or Claude Code `/run` and `/verify`; a green typecheck is not considered visual proof. Browser E2E and visual tests are present as opt-in jobs until a stable baseline is created. Enable them through repository variables after Phase 0:

```text
RUN_FRONTEND_E2E=true
RUN_VISUAL_REGRESSION=true
```

Once enabled, protect `main` and require all frontend quality jobs.

## Recommended repository protection

Add CODEOWNERS protection for:

```text
/.claude/
/docs/redesign/
/docs/product/processes-overview.md
/packages/frontend/src/styles/
/scripts/uiux/
/.github/workflows/frontend-quality.yml
```

Do not allow a feature pull request to weaken the check that it violates.
