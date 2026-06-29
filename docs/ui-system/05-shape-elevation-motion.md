# Shape, Elevation, and Motion

## Radius

| Token | Value | Usage |
|---|---:|---|
| XS | 6px | tags and compact controls |
| SM | 8px | buttons, inputs, calendar events |
| MD | 12px | cards and popovers |
| LG | 16px | drawers, large panels |
| XL | 20px | marketing feature surfaces only |
| Full | 999px | avatars, statuses, segmented indicators |

Do not make every control pill-shaped.

## Borders

- Default: 1px semantic border.
- Emphasis: 1px strong border.
- Selection: 1px brand border plus subtle ring.
- Focus: 2px focus ring with 2px offset.
- Dashed borders are reserved for available time and drop/select previews.

## Shadows

Use borders and surface contrast before shadows.

- `shadow-1`: subtle card lift.
- `shadow-2`: popover/dropdown.
- `shadow-3`: drawer/dialog.
- No colored glows.
- No shadow on every calendar event.

## Motion tokens

- Instant feedback: 80ms
- Micro: 120ms
- Standard: 180ms
- Spatial: 240ms
- Maximum operational transition: 320ms

Easing:

- Enter: cubic-bezier(0.16, 1, 0.3, 1)
- Exit: cubic-bezier(0.4, 0, 1, 1)
- Standard: cubic-bezier(0.2, 0, 0, 1)

## Motion patterns

- Drawer: translate X on desktop; translate Y on mobile.
- Popover: fade + 4px scale/translate from origin.
- Calendar event creation: opacity + scale from 0.98.
- State transition: color and border only; do not bounce.
- Drag/select feedback follows pointer immediately.
- Skeleton shimmer is subtle and disabled under reduced motion.

Use only transform and opacity for animated layout transitions unless a measured exception is documented.
