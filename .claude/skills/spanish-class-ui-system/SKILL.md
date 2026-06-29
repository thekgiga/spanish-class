---
name: spanish-class-ui-system
description: Mandatory complete visual-system workflow for every Spanish Class frontend UI change. Loads exact tokens, component contracts, page blueprints, visual review, responsive and accessibility requirements.
paths:
  - "packages/frontend/src/**/*.tsx"
  - "packages/frontend/src/**/*.ts"
  - "packages/frontend/src/**/*.css"
  - "packages/frontend/tailwind.config.js"
  - "packages/frontend/.storybook/**/*"
effort: high
---

# Spanish Class UI System

This skill is mandatory whenever user-facing frontend code changes.

## Read first

- `docs/ui-system/00-visual-north-star.md`
- `docs/ui-system/01-design-principles.md`
- `docs/ui-system/design-tokens.json`
- relevant component/domain/page blueprint files
- `docs/ui-system/13-frontend-definition-of-done.md`

## Preflight

Report:

1. affected role, route, and user intent;
2. affected BPMN and redesign requirements;
3. page blueprint and density mode;
4. components to reuse, extend, add, or deprecate;
5. exact semantic tokens/statuses involved;
6. loading, empty, error, success, permission, and long-content states;
7. desktop/tablet/mobile transformation;
8. keyboard and screen-reader path;
9. tests, stories, and visual evidence to add.

Do not edit before producing this plan for a meaningful UI task.

## Implementation rules

- Semantic tokens only.
- Central status mapping only.
- Existing canonical components before new components.
- App UI uses approved typography, spacing, radius, elevation, and motion.
- Preserve business contracts.
- Implement components and stories before composing a new page pattern.
- Do not polish a legacy page that the UX plan removes.
- Keep the change to one coherent vertical slice.

## Visual verification

Render affected screens at 390×844, 768×1024, 1280×800, and 1440×900. Inspect hierarchy, clipping, wrapping, focus, long localized strings, empty/error/loading states, and reduced motion.

## Completion output

Provide:

- implemented requirement IDs;
- affected routes and roles;
- reused/new/deprecated components;
- token and status mappings used;
- verification command results;
- screenshot/evidence paths;
- independent reviewer decision;
- remaining limitations.

Never claim completion while a required item is missing.
