---
name: implement-uiux-redesign
description: Start or continue the repository-managed Spanish Class UI/UX redesign. Reads the current phase and implementation ledger, then executes the next coherent vertical slice with full verification.
disable-model-invocation: true
argument-hint: "[optional phase or requirement IDs]"
model: opus
effort: high
---
# Implement Spanish Class UI/UX Redesign

Treat this command as a resumable program, not a one-shot rewrite.

## Start

1. Read the root and frontend `CLAUDE.md` files.
2. Read `docs/redesign/current-phase.md`.
3. Read `docs/redesign/implementation-matrix.csv`.
4. Read the relevant BPMN process documentation.
5. Inspect current code and git status. Never discard unrelated work.

If an argument names a phase or requirement IDs, use it only when prerequisites are complete. Otherwise select the first incomplete, unblocked requirement in the current phase.

## Phase behavior

- Phase 0 produces the architecture audit and regression baseline before broad redesign.
- Later phases implement one complete vertical slice at a time.
- Do not migrate multiple unrelated routes in one patch.
- Do not begin a requirement whose dependencies are incomplete.
- Update `current-phase.md` only when phase exit criteria are proven.

## For each slice

1. Invoke `spanish-class-ui-ux-guardian`.
2. Produce the mandatory preflight plan.
3. Implement code, translations, tests, stories, and evidence.
4. Run deterministic guardrails and the full frontend verification command.
5. Invoke the `ui-ux-reviewer` agent in read-only mode.
6. Fix all blocking findings.
7. Update the implementation matrix and current phase ledger.
8. Provide a completion report with evidence.

Do not say the redesign is complete based on visual appearance alone. Completion is determined by the requirement matrix and phase exit criteria.
