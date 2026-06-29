# Typography

## Font roles

### Application UI

Use `Inter Variable`, falling back to `Inter`, `ui-sans-serif`, and system sans-serif. Enable tabular numbers for times, counts, prices, and calendar labels.

### Editorial display

Use `Newsreader Variable` only on marketing pages, onboarding moments, and rare empty-state headlines. Do not use serif typography inside dense calendar controls, forms, tables, or navigation.

If Newsreader is not installed, use the existing Playfair Display temporarily. Do not add another display family.

## Type scale

| Token | Size / line height | Weight | Typical use |
|---|---|---|---|
| Display | `48/52` desktop, `38/42` mobile | 550 | Marketing hero only |
| H1 | `32/38` | 650 | Main page title |
| H2 | `24/30` | 650 | Major section/drawer title |
| H3 | `20/26` | 650 | Card/section heading |
| Title | `17/24` | 600 | Event, student, lesson title |
| Body | `15/22` | 450 | Default application text |
| Body strong | `15/22` | 600 | Emphasis |
| Small | `13/18` | 500 | Metadata, secondary control labels |
| Caption | `12/16` | 550 | Status and compact calendar metadata |
| Micro | `11/14` | 600 | Exceptional dense labels only |

## Rules

- Default app text is 15px, not 16px, to support professional density without feeling cramped.
- Never go below 12px for user-facing text except chart annotations with an accessible alternative.
- Use weight and spacing before increasing font size.
- Headings use sentence case.
- Avoid all-caps except tiny non-interactive overlines.
- Calendar times use `font-variant-numeric: tabular-nums`.
- Limit operational line length to 70 characters; marketing copy may use 55–65 characters.
- Do not use the display serif to simulate “premium” across the application.
