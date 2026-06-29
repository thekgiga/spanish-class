# Frontend Definition of Done

A frontend task is not complete until all applicable items are evidenced.

## Product and UX

- [ ] Affected role and BPMN flow identified.
- [ ] Requirement IDs identified and implementation matrix updated.
- [ ] Existing business behavior preserved or explicit decision recorded.
- [ ] One clear primary action per decision region.
- [ ] Loading, empty, error, disabled, success, and permission states covered.

## Visual system

- [ ] Semantic tokens only.
- [ ] Canonical components reused.
- [ ] Component contract followed.
- [ ] Status uses centralized mapping.
- [ ] Typography, spacing, radius, shadow, and motion use approved tokens.
- [ ] No legacy palette or arbitrary values added.

## Responsive and accessibility

- [ ] Verified at 390, 768, 1280, and 1440 widths.
- [ ] Keyboard path verified.
- [ ] Focus behavior verified.
- [ ] Touch targets verified.
- [ ] Reduced motion supported.
- [ ] axe has no new serious/critical violations.
- [ ] Status is not color-only.

## Internationalization

- [ ] All user-facing strings use i18next.
- [ ] English, Serbian, and Spanish keys exist.
- [ ] No backend enums or translation keys visible.
- [ ] Date/time follows locale and timezone.

## Engineering evidence

- [ ] Typecheck passes.
- [ ] Lint passes.
- [ ] Unit/interaction tests pass.
- [ ] Relevant E2E path passes.
- [ ] Storybook stories added/updated.
- [ ] Visual screenshots stored in evidence folder.
- [ ] Independent reviewer returns PASS.
- [ ] Known limitations documented.

Claude may not state “done”, “complete”, or equivalent when a required item is missing.
