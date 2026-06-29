# Color System

The machine-readable source is `design-tokens.json`. The frontend reference implementation is `packages/frontend/src/styles/ui-system.tokens.css`.

## Light theme foundation

| Token | Hex | Usage |
|---|---:|---|
| Canvas | `#F6F4EF` | Main app background |
| Canvas subtle | `#F0EDE6` | Sidebar/secondary regions |
| Surface | `#FFFFFF` | Cards, drawers, popovers |
| Raised surface | `#FCFBF8` | Elevated quiet surfaces |
| Muted surface | `#F2F1EC` | Disabled/secondary containers |
| Primary text | `#16201E` | Body and headings |
| Secondary text | `#59625F` | Supporting information |
| Tertiary text | `#6B7470` | Metadata; avoid below 14px on canvas |
| Border | `#DEE1DA` | Default separation |
| Strong border | `#C4CAC2` | Controls and emphasized structure |

## Brand and accent

| Token | Hex | Usage |
|---|---:|---|
| Brand | `#1F4D46` | Primary actions, confirmed events |
| Brand hover | `#173C36` | Primary hover |
| Brand active | `#102F2A` | Primary pressed |
| Accent | `#A95535` | Terracotta emphasis and editorial details |
| Accent hover | `#91452B` | Accent hover |
| Accent soft | `#F4E4DB` | Accent background |
| Focus | `#247A6C` | Focus ring only |

Brand is the operational primary. Accent is not a second primary button color.

## Semantic states

| State | Surface | Border | Foreground | Icon |
|---|---|---|---|---|
| Available | `#E8F2EA` | `#8FAE96` | `#315D3B` | Calendar plus |
| Requested | `#FFF1D2` | `#D5A844` | `#7A4E00` | Clock |
| Confirmed | `#DDEDEA` or solid Brand | `#5E9D91` | `#1D5A50` or white | Check/calendar |
| Blocked | `#ECEBE7` | `#C6C4BD` | `#5D5B55` | Lock |
| Completed | `#E9ECEB` | `#B8C0BD` | `#4E5D59` | Check circle |
| Cancelled | `#F4E6E4` | `#D9AAA4` | `#8A342C` | X circle |

## Feedback colors

- Success: `#2F6B46`
- Warning: `#8B5A00`
- Danger: `#B9473C`
- Information: `#2B5D7B`

Feedback colors are not substitutes for booking statuses.

## Color usage rules

- 80–90% of an operational screen must remain neutral.
- One primary filled button per decision region.
- Do not use gradients inside the logged-in application.
- No blue-tinted shadows or glow effects.
- Do not use `edu-blue`, `edu-orange`, legacy Spanish red/gold, or raw Tailwind palettes in migrated code.
- Do not use opacity to manufacture undocumented colors.
- Text contrast must meet WCAG AA; target AAA for body text where feasible.
- Status always includes text or an icon in addition to color.

## Dark theme

Dark tokens are included in the CSS and JSON as a complete opt-in theme. Do not expose a dark-mode toggle until all core components and calendar states pass visual and accessibility verification in both themes. No partial dark mode.
