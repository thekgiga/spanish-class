# Spacing, Layout, and Density

## Spacing scale

Use a 4px base with an 8px default rhythm.

`0, 2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96`

- 2/4/6px: optical or icon adjustments only.
- 8/12px: compact controls and inline groups.
- 16/20/24px: cards, drawers, forms.
- 32/40/48px: page sections.
- 64px+: marketing and major page separation.

No arbitrary spacing values in migrated code.

## Application shell

| Region | Desktop | Tablet | Mobile |
|---|---:|---:|---:|
| Sidebar | 240px expanded / 72px collapsed | overlay or 72px | replaced by bottom nav |
| Top bar | 64px | 60px | 56px |
| Page gutter | 28–32px | 20–24px | 16px |
| Drawer | 420px standard / 520px complex | 440px overlay | full-width bottom sheet |
| Settings content | max 880px | fluid | fluid |
| Marketing content | max 1200px | fluid | fluid |

## Control density

| Control | Compact | Default | Comfortable |
|---|---:|---:|---:|
| Height | 32px | 40px | 48px |
| Horizontal padding | 10px | 14px | 18px |
| Icon | 16px | 18px | 20px |

Mobile touch targets remain at least 44×44px even when the visible control is smaller.

## Calendar density

- Desktop week starts with 72px time gutter.
- Day columns have a 132px preferred minimum.
- 15-minute snap interval.
- Default visible range: 07:00–21:00; derive from professor settings if available.
- Hour rows: 64px default, adjustable through a documented compact mode only.
- Event internal padding: 8px compact, 10px standard.
- Never place more than three text lines inside a standard event.

## Alignment

- Align page titles, primary content, and persistent drawers to the same grid.
- Use separators to group; do not wrap every group in a card.
- Keep action clusters on an 8px gap.
- Form field groups use 20–24px vertical gap.
- Labels sit 6px above controls.
