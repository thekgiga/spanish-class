# Current Redesign Phase

## Phase 0 — Architecture reconnaissance and regression baseline

**Status:** Not started

## Goal

Understand the existing implementation and protect critical behavior before broad visual migration.

## Required outputs

- [ ] `docs/redesign/current-architecture-audit.md`
- [ ] route and role-guard inventory
- [ ] component and duplicate-pattern inventory
- [ ] state-management and API contract inventory
- [ ] booking-status transition map
- [ ] localization inventory and visible-key audit
- [ ] responsive behavior audit
- [ ] current test inventory
- [ ] BPMN-to-code traceability map
- [ ] baseline E2E coverage for critical professor and student flows
- [ ] legacy visual-system inventory

## Exit criteria

- Critical booking, approval, cancellation, meeting, authentication, and notification behavior has regression coverage or a documented blocker.
- Existing architecture risks and migration seams are documented.
- The implementation matrix contains code/test links for completed Phase 0 requirements.
- Phase 1 dependencies are unblocked.

Do not change this status to complete based only on a written audit. Exit criteria require executable regression protection.
