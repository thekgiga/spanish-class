# Accessibility Contract

Target WCAG 2.2 AA.

## Keyboard

- Every action is reachable and operable by keyboard.
- Logical focus order follows visual order.
- Focus is never lost after drawer/dialog closure.
- Escape closes transient surfaces unless unsafe.
- Calendar has a non-drag keyboard path.
- Arrow-key behavior follows established component conventions.

## Focus

Use the semantic focus token with a 2px ring and 2px offset. Never remove focus outlines without replacing them.

## Touch

Minimum target is 44×44px on touch screens.

## Semantics

- Correct heading hierarchy.
- Real buttons and links.
- Labels programmatically connected to controls.
- Errors associated with fields.
- Live announcements for booking, approval, cancellation, and calendar selection results.

## Color and contrast

- Text meets 4.5:1 minimum.
- Large text and UI boundaries meet 3:1.
- Status never relies on color alone.
- Disabled states remain readable.

## Motion

Honor `prefers-reduced-motion`. Remove spatial movement, parallax, shimmer, and nonessential transitions under reduced motion.

## Zoom and reflow

At 200% zoom, core workflows remain operable without two-dimensional scrolling, except intentional calendar/table regions with an accessible alternative.

## Testing

A frontend change is blocked on new serious/critical axe violations. Manual keyboard verification is required for new interactions.
