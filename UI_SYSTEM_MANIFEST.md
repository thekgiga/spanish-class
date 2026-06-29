# Complete UI/UX Package Manifest v2

Files: **87**

## Purpose

This is a complete overlay for the existing Spanish Class repository. It combines the BPMN-based UX redesign governance with an exact Editorial Teaching Studio visual system and deterministic Claude Code enforcement.

## Contents

### Claude enforcement

- `.claude/agents/ui-ux-reviewer.md`
- `.claude/agents/visual-design-reviewer.md`
- `.claude/hooks/frontend-stop-gate.mjs`
- `.claude/hooks/post-edit-frontend.mjs`
- `.claude/hooks/protect-config-change.mjs`
- `.claude/hooks/protect-guardrail-bash.mjs`
- `.claude/hooks/protect-guardrails.mjs`
- `.claude/hooks/session-context.mjs`
- `.claude/rules/frontend/00-workflow.md`
- `.claude/rules/frontend/accessibility.md`
- `.claude/rules/frontend/architecture.md`
- `.claude/rules/frontend/booking-calendar.md`
- `.claude/rules/frontend/component-contracts.md`
- `.claude/rules/frontend/design-system.md`
- `.claude/rules/frontend/legacy-migration.md`
- `.claude/rules/frontend/localization.md`
- `.claude/rules/frontend/responsive.md`
- `.claude/rules/frontend/testing-evidence.md`
- `.claude/rules/frontend/ux-patterns.md`
- `.claude/rules/frontend/visual-quality.md`
- `.claude/rules/frontend/visual-system.md`
- `.claude/settings.json`
- `.claude/skills/implement-ui-system-foundation/SKILL.md`
- `.claude/skills/implement-uiux-redesign/SKILL.md`
- `.claude/skills/spanish-class-ui-system/SKILL.md`
- `.claude/skills/spanish-class-ui-system/references/visual-review-checklist.md`
- `.claude/skills/spanish-class-ui-ux-guardian/SKILL.md`
- `.claude/skills/spanish-class-ui-ux-guardian/references/preflight-checklist.md`
- `.claude/skills/spanish-class-ui-ux-guardian/references/responsive-checklist.md`
- `.claude/skills/spanish-class-ui-ux-guardian/references/review-schema.md`
- `.claude/skills/spanish-class-ui-ux-guardian/references/state-checklist.md`

### CI

- `.github/workflows/frontend-quality.yml`

### Product and UX documentation

- `docs/product/processes-overview.md`
- `docs/redesign/00-product-vision.md`
- `docs/redesign/01-information-architecture.md`
- `docs/redesign/02-core-ux-flows.md`
- `docs/redesign/03-visual-language.md`
- `docs/redesign/04-design-system-architecture.md`
- `docs/redesign/05-accessibility-responsive.md`
- `docs/redesign/06-implementation-roadmap.md`
- `docs/redesign/07-frontend-definition-of-done.md`
- `docs/redesign/08-existing-architecture-findings.md`
- `docs/redesign/CODEOWNERS-snippet.txt`
- `docs/redesign/README.md`
- `docs/redesign/START_PROMPT.md`
- `docs/redesign/current-architecture-audit.template.md`
- `docs/redesign/current-phase.md`
- `docs/redesign/decisions/ADR-001-one-to-one-primary-experience.md`
- `docs/redesign/decisions/ADR-002-professor-approval-required.md`
- `docs/redesign/decisions/ADR-003-calendar-first-professor.md`
- `docs/redesign/decisions/ADR-004-semantic-token-ratchet.md`
- `docs/redesign/evidence/README.md`
- `docs/redesign/evidence/TEMPLATE.md`
- `docs/redesign/implementation-matrix.csv`

### Complete UI system

- `docs/ui-system/00-visual-north-star.md`
- `docs/ui-system/01-design-principles.md`
- `docs/ui-system/02-color-system.md`
- `docs/ui-system/03-typography.md`
- `docs/ui-system/04-spacing-layout-density.md`
- `docs/ui-system/05-shape-elevation-motion.md`
- `docs/ui-system/06-component-contracts.md`
- `docs/ui-system/07-calendar-booking-domain.md`
- `docs/ui-system/08-page-blueprints.md`
- `docs/ui-system/09-responsive-behavior.md`
- `docs/ui-system/10-content-iconography.md`
- `docs/ui-system/11-accessibility.md`
- `docs/ui-system/12-migration-and-enforcement.md`
- `docs/ui-system/13-frontend-definition-of-done.md`
- `docs/ui-system/README.md`
- `docs/ui-system/START_UI_IMPLEMENTATION_PROMPT.md`
- `docs/ui-system/component-inventory.csv`
- `docs/ui-system/design-tokens.json`
- `docs/ui-system/reference-board.html`

### Frontend integration references

- `packages/frontend/CLAUDE.md`
- `packages/frontend/src/lib/ui-system/README.md`
- `packages/frontend/src/lib/ui-system/status.ts`
- `packages/frontend/src/styles/ui-system.tokens.css`
- `packages/frontend/ui-system.tailwind.extend.cjs`

### Validation scripts

- `scripts/uiux/README.md`
- `scripts/uiux/check-canonical-stories.mjs`
- `scripts/uiux/check-frontend-guardrails.mjs`
- `scripts/uiux/check-token-contrast.mjs`
- `scripts/uiux/check-ui-system.mjs`
- `scripts/uiux/frontend-verify.mjs`

### Root guides

- `BOOTSTRAP_MANIFEST.md`
- `README_UIUX_BOOTSTRAP.md`
- `README_UI_SYSTEM_V2.md`

## Validation performed

- JSON parsing for settings and design tokens
- Node syntax checks for all added validation scripts
- Canonical color contrast checks
- CSS variable/Tailwind mapping consistency check
- HTML reference board parse
- UI-system integrity check in a temporary Git repository
- ZIP content verification

## Extraction

```bash
unzip spanish-class-claude-uiux-complete-v2.zip -d /path/to/spanish-class
```

Allow replacement of files from the earlier bootstrap. Review `.claude/settings.json` before extraction only if you have independently added project hooks after the previous package.
