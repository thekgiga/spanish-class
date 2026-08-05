# Component Contracts

Every canonical component requires: TypeScript props, variants, all interaction states, keyboard behavior, accessibility contract, responsive behavior, Storybook stories, and focused tests.

## Buttons

### Variants

- `primary`: brand fill, white/brand-contrast text.
- `secondary`: surface, strong border, primary text.
- `quiet`: transparent, primary text.
- `danger`: danger fill for confirmed destructive action only.
- `link`: inline navigation, no button container.

### Sizes

- `sm` 32px, compact desktop only.
- `md` 40px, default.
- `lg` 48px, booking and onboarding primary action.
- Mobile hit target minimum 44px.

Required states: default, hover, pressed, focus-visible, disabled, loading. Loading preserves width.

## IconButton

Requires an accessible name. Tooltip appears after 500–700ms on desktop. Never use an icon-only destructive action without confirmation or undo.

## Inputs

Input, textarea, select, combobox, date, and time controls share:

- 40px default height;
- visible label;
- optional hint;
- inline error with icon;
- focus ring, not only border color;
- disabled and read-only distinction;
- no placeholder-only labeling.

## Selection controls

- Checkbox: independent options.
- Radio: one option from a short visible set.
- Select: longer lists.
- Segmented control: 2–4 immediate view modes only.
- Switch: immediate setting, never form submission choice.

## StatusBadge

The only approved way to render lifecycle status. It maps status to localized label, icon, surface, border, and foreground centrally.

Statuses: available, requested, confirmed, blocked, completed, cancelled, rejected, expired.

## Card

Cards are optional containers, not a default wrapper. Variants:

- `plain`: surface and border.
- `interactive`: hover/focus treatment.
- `selected`: brand border/ring.
- `status`: semantic status surface.

Avoid nested cards deeper than one level.

## Drawer and BottomSheet

- Drawer preserves page context.
- 420px standard; 520px for complex content.
- Sticky header and action footer when content scrolls.
- Escape closes unless an unsafe mutation is in progress.
- Focus is trapped and restored.
- Mobile uses full-height bottom sheet.

## Dialog

Use only for destructive confirmation, short blocking decisions, and authentication/security steps. Do not use a dialog for ordinary editing.

## Popover

Use for contextual creation, filters, and compact actions. It must be anchored to the triggering object and close on Escape/outside click.

## Toast

- Success: 3–4 seconds.
- Error: persists until dismissed or retried.
- Never the sole evidence of a state change.
- Maximum three visible.

## EmptyState

Contains optional icon, specific title, one-sentence guidance, and at most one primary action. Avoid oversized illustration art in operational views.

## Skeleton

Matches the final geometry. Do not use a generic full-page spinner when stable structure is known.

## Tabs

Use for sibling views of the same object, not top-level navigation. Preserve URL/query state when tabs are meaningful destinations.

## Table and list

Use tables for comparison and dense structured administration. Use lists/cards for actions and chronology. Mobile tables transform into labeled rows or cards; they do not shrink horizontally without intent.
