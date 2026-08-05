# Spanish Class — Complete UI System & Claude Enforcement v2

This overlay completes the previous UX bootstrap with an exact visual system and stronger Claude Code enforcement.
Extract it at the repository root. It is additive and does not replace the root `CLAUDE.md`.

## What is now fixed, not left to Claude to invent

- Product visual concept: **Editorial Teaching Studio**
- Exact light and dark semantic color tokens
- Typography scale and font roles
- Spacing, layout, radius, border, shadow, density, and motion tokens
- Component contracts, variants, states, and anti-patterns
- Calendar and booking domain visuals
- Professor and student page blueprints
- Responsive transformations
- Content, iconography, accessibility, and localization rules
- Automatic Claude skill, path-scoped rules, independent visual reviewer
- Changed-line token guardrails, completion gates, CI checks, and evidence requirements

## Safe installation

```bash
unzip spanish-class-claude-uiux-complete-v2.zip -d /path/to/spanish-class
cd /path/to/spanish-class
npm install
```

If the previous bootstrap is already installed, allow this archive to replace files with the same name.

## Verify Claude loaded the system

```text
/memory
/skills
/hooks
```

The following should be visible:

- `spanish-class-ui-ux-guardian`
- `spanish-class-ui-system`
- `implement-uiux-redesign`
- frontend rules under `.claude/rules/frontend/`
- lifecycle hooks from `.claude/settings.json`

## Start with this command

```text
/implement-uiux-redesign
```

Or paste `docs/ui-system/START_UI_IMPLEMENTATION_PROMPT.md` into Claude Code.

## Important migration behavior

The repository currently contains multiple visual systems and Tailwind v3. The new system uses a **ratchet**:

- legacy code may remain temporarily;
- every newly added or modified visual line must use semantic tokens;
- migrated components may not reintroduce old `edu-*`, Spanish red/gold, raw palette, raw hex, or arbitrary Tailwind values;
- the design-system foundation is implemented before page migration;
- one complete vertical journey is migrated at a time.

## Visual reference

Open `docs/ui-system/reference-board.html` in a browser. It is a self-contained visual board showing the approved palette, typography, controls, statuses, cards, calendar events, drawer, and page shell.

## Canonical sources

1. Business behavior: `docs/product/processes-overview.md`
2. UX redesign: `docs/redesign/`
3. UI system: `docs/ui-system/`
4. Implementation tracking: `docs/redesign/implementation-matrix.csv`
5. Frontend completion gate: `docs/ui-system/13-frontend-definition-of-done.md`
