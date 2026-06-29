# UI System Index

The UI system is normative. Claude must not reinterpret it page by page.

| File | Purpose |
|---|---|
| `00-visual-north-star.md` | Product feel and creative direction |
| `01-design-principles.md` | Decision rules and anti-patterns |
| `02-color-system.md` | Exact semantic colors and usage |
| `03-typography.md` | Font roles and type scale |
| `04-spacing-layout-density.md` | Grid, spacing, sizing, and density |
| `05-shape-elevation-motion.md` | Radius, borders, shadows, animation |
| `06-component-contracts.md` | Required component API and states |
| `07-calendar-booking-domain.md` | Calendar and booking-specific visuals |
| `08-page-blueprints.md` | Canonical page compositions |
| `09-responsive-behavior.md` | Desktop/tablet/mobile transformation |
| `10-content-iconography.md` | Voice, labels, icons, dates, and numbers |
| `11-accessibility.md` | Non-negotiable accessibility contract |
| `12-migration-and-enforcement.md` | Existing architecture migration rules |
| `13-frontend-definition-of-done.md` | Evidence required to finish a task |
| `design-tokens.json` | Machine-readable source of truth |
| `reference-board.html` | Human visual reference |

## Hierarchy when documents conflict

1. BPMN/business rules
2. Approved UX flow and ADRs
3. UI semantic tokens
4. Component contracts
5. Page blueprint
6. Existing legacy implementation

Legacy code never overrides the new system.
