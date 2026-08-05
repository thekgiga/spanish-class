# Design Principles

## 1. Calendar before dashboard

For professors, Schedule is home. Summary information is embedded around the calendar instead of forcing a separate analytics dashboard.

## 2. Context before navigation

Open drawers, popovers, and bottom sheets over the current workflow. Do not navigate to a new page for small edits or approvals.

## 3. One dominant action

Each page, drawer, card, and dialog must have one visually dominant action. Secondary actions are quieter. Destructive actions are separated.

## 4. Progressive disclosure

Show the minimum required to decide. Reveal advanced recurrence, notes, security, and administration only when requested.

## 5. Semantic styling only

Components use role-based tokens (`surface`, `text-primary`, `status-requested`) rather than visual implementation names (`green-600`, `shadow-xl`).

## 6. Density follows task

- Calendar: compact and scan-friendly.
- Booking: spacious and confidence-building.
- Settings: structured and calm.
- Marketing: editorial and expressive.

Do not apply one density to the whole product.

## 7. State is visible in place

After an action, the changed object must visibly update. A toast is confirmation, not the only proof.

## 8. Color supports meaning

Use neutral surfaces for structure. Reserve saturated color for primary actions, selection, and status. Never use color alone.

## 9. Motion explains change

Motion shows origin, destination, hierarchy, or state transition. It never delays task completion.

## 10. Mobile is a different composition

Do not compress a seven-day desktop calendar into a phone. Change the view and interaction model.

## 11. No speculative novelty

Use familiar interaction patterns for consequential actions. Innovation belongs in flow simplification, not in making controls unrecognizable.

## 12. Human language over data language

Use “Request lesson”, “Approval needed”, and “Offer this time”. Never expose internal enums, tokens, slots, or job terminology.
