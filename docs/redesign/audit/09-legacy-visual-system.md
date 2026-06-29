# Legacy visual-system inventory

This is the most consequential appendix for Phase 1+. It enumerates every visual-token surface that currently coexists in the frontend and identifies what is loaded, what is referenced, and what must change.

## Token layers (CSS variables)

Three CSS layers define design tokens. All three are present in the repo. **Only Layer A is imported by the build today** — Layers B and C are defined but unused.

### Layer A — shadcn / generic HSL ([globals.css](../../../packages/frontend/src/styles/globals.css))

Defines: `--background`, `--foreground`, `--primary`, `--secondary`, `--destructive`, `--muted`, `--accent`, `--popover`, `--card`, `--border`, `--input`, `--ring`, `--radius`. Light mode foreground charcoal + cream background; dark mode navy-charcoal + white. Primary leans **luxury gold (38°, 95%, 40%)**, accent **electric purple**.

This is the **only** stylesheet imported by [src/main.tsx](../../../packages/frontend/src/main.tsx). It is mapped into [tailwind.config.js](../../../packages/frontend/tailwind.config.js) via `hsl(var(--*))` for the shadcn primitive components.

`globals.css` also defines a sizeable set of bespoke utility classes inside `@layer components` (`glass-card`, `gold-gradient-btn`, `nav-item-active`, `input-premium`, `stat-card-*`, `card-premium`, and others), plus a duplicate set of `.shadow-soft`/`.shadow-medium`/`.shadow-large` and `.shadow-glow-red`/`.shadow-glow-gold` CSS utilities that overlap with the `boxShadow` extends in `tailwind.config.js`. Hardcoded `rgba(...)` selection and scrollbar styles also live here.

### Layer B — legacy Spanish/warm palette ([tokens.css](../../../packages/frontend/src/styles/tokens.css))

Defines: `--color-primary-*` (Spanish Red `#B91C1C`), `--color-secondary-*` (Gold `#D97706`), `--color-neutral-*` (Warm Clay), plus `--color-terracotta-*`, `--color-olive-*`, `--color-cream-*`. Semantic helpers: success, warning, error, info. Typography: `--font-sans` Inter, `--font-serif` Playfair Display. Spacing: 8px base. Shadows: `--shadow-sm` through `--shadow-2xl`. Radii: `--radius-xs` through `--radius-full`.

**This file is currently dead code.** It is not imported anywhere and no Tailwind consumer reads its `--color-*` variables. The `spanish-*` and `clay-*` Tailwind palette groups duplicate the same hex values directly rather than referencing this layer. Phase 7 deletes it alongside the legacy `spanish-*` palette.

### Layer C — Editorial Teaching Studio ([ui-system.tokens.css](../../../packages/frontend/src/styles/ui-system.tokens.css))

Defines: `--ui-canvas`, `--ui-surface`, `--ui-fg-*`, `--ui-border-*`, `--ui-brand-*` (teal), `--ui-accent-*` (terracotta), `--ui-focus`, `--ui-success/warning/danger/info`, six status tone triples (`available`, `requested`, `confirmed`, `blocked`, `completed`, `cancelled`), `--ui-radius-*`, `--ui-shadow-1..3`, `--ui-duration-*` and `--ui-ease-*`, layout dims (`--ui-sidebar-width`, `--ui-drawer-width`, etc.) and control sizes (`--ui-control-default`, `--ui-touch-minimum`). Dark theme block present.

**This file exists but is NOT imported by the build today.** The Phase 1 task is to import it once via the global stylesheet, *before* shadcn vars, so cascading still favors the new layer for new components while shadcn-based components keep working.

## Tailwind palette groups

[tailwind.config.js](../../../packages/frontend/tailwind.config.js) currently exposes:

| Group | Source | Status | Purpose |
|---|---|---|---|
| `border`, `input`, `ring`, `background`, `foreground`, `primary`, `secondary`, `destructive`, `muted`, `accent`, `popover`, `card` | HSL vars from globals.css | Active | shadcn-style aliases. Phase 1 keeps these for primitives that already use them. |
| `obsidian` | hardcoded hex | Legacy / unused at scale | Premium dark-luxury. |
| `charcoal` | hardcoded hex | Active | Warm neutral text. |
| `luxury.{gold,purple,cyan,emerald}` | hardcoded hex | Legacy | Premium variants. |
| `spanish-red` | hardcoded hex | Legacy | Phase 1+ ratchet target. |
| `clay` | hardcoded hex | Legacy | Duplicates `charcoal`. |
| `spanish.{red,gold,terracotta,olive,cream}` | hardcoded hex | Legacy (kept for backward compatibility per tailwind comment) | Phase 7 removal. |
| `navy` | hardcoded hex | Legacy | Used in `App.tsx` spinner borders. |
| `gold` | hardcoded hex | Legacy | |
| `spanish-teal`, `spanish-coral`, `spanish-sunshine`, `spanish-orange`, `spanish-olive`, `spanish-cream` | hardcoded hex | Active "earthy" attempt | Used in `StudentDashboard` gradients. |
| `edu-blue`, `edu-emerald`, `edu-orange`, `edu-slate`, `edu-amber`, `edu-red` | hardcoded hex at [tailwind.config.js:216-298](../../../packages/frontend/tailwind.config.js#L216-L298) | Legacy "premium education" intent | Used by `BookingStatusBadge` and one `ui/input` focus ring. **Phase 1 ratchet forbids new usage; migration target is the semantic status tokens in Layer C.** |

The tailwind config comments mark `spanish-*` and several gradient/shadow utilities as DEPRECATED with notes pointing to `edu-blue`/`edu-emerald` replacements — but `edu-*` is **itself** legacy under the Editorial Teaching Studio direction, and the comments precede the UI-system rewrite. Treat the deprecated-comments as out of date.

## Gradients and shadows

[tailwind.config.js](../../../packages/frontend/tailwind.config.js) `extend.backgroundImage`:

- `gradient-blue`, `gradient-emerald`, `gradient-orange`, `gradient-page`, `gradient-hero` — earthy palette gradients (active).
- `gradient-spanish`, `gradient-gold`, `gradient-warm` — DEPRECATED in comments.
- `gradient-sidebar`, `mesh-pattern` — design utilities.

`extend.boxShadow`:

- `soft`, `medium`, `large` — blue-tinted (legacy "premium feel").
- `glow-blue`, `glow-emerald`, `glow-orange`, `glow-terracotta`, `glow-cream` — colored glows (forbidden by [.claude/rules/frontend/visual-system.md](../../../.claude/rules/frontend/visual-system.md): "Do not add ... glow").
- `glass`, `glass-inset`, `elevation-{sm,md,lg,xl}`, `inner-soft` — generic.
- `glow-red`, `glow-gold`, `gold-glow`, `purple-glow` — explicitly DEPRECATED.

`extend.keyframes` and `animation`: `morph`, `gradient-flow`, `float`, `glow-pulse` etc. are premium-liquid-glass effects that conflict with the calm Editorial Teaching Studio direction.

## Editorial Teaching Studio (target)

The full target system is documented in [docs/ui-system/](../../ui-system/). Token source of truth is [docs/ui-system/design-tokens.json](../../ui-system/design-tokens.json). Phase 1 merges these into Tailwind via [ui-system.tailwind.extend.cjs](../../../packages/frontend/ui-system.tailwind.extend.cjs), which exposes:

- `canvas`, `surface`, `ink`, `line`, `brand`, `accent`, `focus`, `feedback.{success,warning,danger,info}`
- `status.{available,requested,confirmed,blocked,completed,cancelled}.{surface,border,foreground}`
- `font-{micro,caption,small,body,title}` with constrained weights
- `rounded-ui-{xs..xl}`, `shadow-ui-{1..3}`, `duration-{instant,micro,standard,spatial}`, `ease-{ui-enter,ui-exit,ui-standard}`

The extend file is **prepared but not merged** into `tailwind.config.js` today.

## Known live `edu-*` references

From a static grep in this audit cycle:

- [components/booking/BookingStatusBadge.tsx](../../../packages/frontend/src/components/booking/BookingStatusBadge.tsx) — `edu-blue-*`, `edu-emerald-*`, `edu-orange-*` for status backgrounds.
- [components/ui/input.tsx](../../../packages/frontend/src/components/ui/input.tsx) — focus-visible ring uses `edu-blue-500`.
- [components/ui/card.tsx](../../../packages/frontend/src/components/ui/card.tsx) — hover treatment.
- [components/ui/premium.tsx](../../../packages/frontend/src/components/ui/premium.tsx) — `edu-blue` gradient (legacy "Premium" intent).

Multiple legacy `spanish-*` references remain across [components/layout/DashboardLayout.tsx](../../../packages/frontend/src/components/layout/DashboardLayout.tsx), [pages/student/StudentDashboard.tsx](../../../packages/frontend/src/pages/student/StudentDashboard.tsx) (uses `spanish-teal-*`, `spanish-coral-*` gradients), and several public pages.

`edu-slate`, `edu-amber`, and `edu-red` are defined in [tailwind.config.js](../../../packages/frontend/tailwind.config.js) but have **zero production references** in `packages/frontend/src/`. They can be removed in Phase 7 without touching any component.

## Token ratchet (active enforcement)

Per [docs/ui-system/12-migration-and-enforcement.md](../../ui-system/12-migration-and-enforcement.md), added or modified frontend lines must not introduce:

- raw hex/rgb/hsl values outside token files;
- direct Tailwind color palettes;
- `edu-*` colors in migrated components;
- legacy Spanish red/gold/clay tokens;
- arbitrary Tailwind values;
- new page-specific shadows, radii, spacing, or animation durations.

Untouched legacy lines may temporarily remain. They are migrated in the slice that touches them.

## Phase 1 deliverable that affects this layer

Phase 1 will:

1. Import [ui-system.tokens.css](../../../packages/frontend/src/styles/ui-system.tokens.css) once from the global stylesheet ([src/main.tsx](../../../packages/frontend/src/main.tsx) imports `styles/globals.css`).
2. Merge [ui-system.tailwind.extend.cjs](../../../packages/frontend/ui-system.tailwind.extend.cjs) into [tailwind.config.js](../../../packages/frontend/tailwind.config.js) `theme.extend` without removing legacy entries.
3. Build [packages/frontend/src/lib/ui-system/status.ts](../../../packages/frontend/src/lib/ui-system/status.ts) — the canonical mapping from `BookingStatus`/`SlotStatus` to label key, icon, and status tone token.
4. Normalize the primitives listed in [docs/ui-system/component-inventory.csv](../../ui-system/component-inventory.csv).
5. Add Storybook coverage for every canonical state.

Phase 1 does **not** remove any legacy token, palette, or component. Removal is Phase 7 polish ([implementation-matrix.csv](../implementation-matrix.csv) row `LEGACY-001`) once no production reference remains.
