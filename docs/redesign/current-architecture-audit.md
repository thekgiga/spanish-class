# Current architecture audit

**Phase 0 deliverable.** This is the umbrella document for the architecture reconnaissance baseline required before any visual migration. It points to the nine appendices under [audit/](audit/), the canonical product process map in [docs/product/processes-overview.md](../product/processes-overview.md), the design-system source of truth in [docs/ui-system/README.md](../ui-system/README.md), and the executable regression baseline in [packages/frontend/tests/e2e/baseline/](../../packages/frontend/tests/e2e/baseline/).

It is not narrative. Each section names where the underlying fact lives so the document remains useful as the codebase changes.

## Audit appendices

| # | File | Scope |
|---|------|-------|
| 01 | [audit/01-routes-and-role-guards.md](audit/01-routes-and-role-guards.md) | Every route in [App.tsx](../../packages/frontend/src/App.tsx); guard wrappers; auth state source. |
| 02 | [audit/02-component-inventory.md](audit/02-component-inventory.md) | UI primitives, shared, layout, and domain components; duplicate patterns. |
| 03 | [audit/03-state-and-api-contracts.md](audit/03-state-and-api-contracts.md) | Zustand stores, React Query hooks, every `*Api` namespace and endpoint. |
| 04 | [audit/04-booking-status-transition-map.md](audit/04-booking-status-transition-map.md) | `BookingStatus`/`SlotStatus` enums, lifecycle diagram, current rendering. |
| 05 | [audit/05-localization-inventory.md](audit/05-localization-inventory.md) | i18n configuration, namespaces, observed visible-key/hardcoded gaps. |
| 06 | [audit/06-responsive-audit.md](audit/06-responsive-audit.md) | Breakpoint usage, current Playwright viewports, gaps vs `responsive.md`. |
| 07 | [audit/07-test-inventory.md](audit/07-test-inventory.md) | Current test coverage; critical gaps. |
| 08 | [audit/08-bpmn-traceability.md](audit/08-bpmn-traceability.md) | BPMN flow × route × component × API × status mapping. |
| 09 | [audit/09-legacy-visual-system.md](audit/09-legacy-visual-system.md) | All competing palettes, gradient sets, shadows; legacy ratchet seams. |

## Phase 0 exit-criterion status

| Exit criterion | Source of truth | Status |
|---|---|---|
| Critical booking behavior has regression coverage or a documented blocker. | [tests/e2e/baseline/student-booking.spec.ts](../../packages/frontend/tests/e2e/baseline/student-booking.spec.ts) | See evidence note. |
| Approval and rejection behavior is protected. | [tests/e2e/baseline/professor-approval.spec.ts](../../packages/frontend/tests/e2e/baseline/professor-approval.spec.ts) | See evidence note. |
| Cancellation behavior is protected. | [tests/e2e/baseline/cancellation.spec.ts](../../packages/frontend/tests/e2e/baseline/cancellation.spec.ts) | See evidence note. |
| Meeting access is protected. | [tests/e2e/baseline/meeting-access.spec.ts](../../packages/frontend/tests/e2e/baseline/meeting-access.spec.ts) | See evidence note. |
| Authentication behavior is protected. | [tests/e2e/baseline/auth.spec.ts](../../packages/frontend/tests/e2e/baseline/auth.spec.ts) | See evidence note. |
| Notification behavior is protected. | [tests/e2e/baseline/notifications.spec.ts](../../packages/frontend/tests/e2e/baseline/notifications.spec.ts) | See evidence note. |
| Existing architecture risks documented. | This file + appendices. | Complete. |
| Implementation matrix updated. | [implementation-matrix.csv](implementation-matrix.csv) rows `P0-*`. | Complete. |
| Phase 1 dependencies unblocked. | [current-phase.md](current-phase.md). | Updated. |

The Playwright run evidence is captured in [evidence/phase-0-baseline.md](evidence/phase-0-baseline.md).

## Migration seams (top risks for Phase 1+)

These are the implementation-level seams that Phase 1 onward must respect or migrate. Each is cross-referenced in the appendix that owns it.

1. **Three coexisting design-token layers, only one loaded.** [styles/globals.css](../../packages/frontend/src/styles/globals.css) (shadcn HSL) is the only stylesheet imported by [src/main.tsx](../../packages/frontend/src/main.tsx). [styles/tokens.css](../../packages/frontend/src/styles/tokens.css) (legacy Spanish) and [styles/ui-system.tokens.css](../../packages/frontend/src/styles/ui-system.tokens.css) (new Editorial Teaching Studio) exist in the repo but are not imported anywhere. Phase 1 must decide which layers it formally imports and in what order. Appendix 09.
2. **Ten distinct palette intents in `tailwind.config.js`.** `obsidian`, `charcoal`, `luxury.*`, `spanish-red`, `clay`, `spanish.*`, `navy`, `gold`, `edu-*` (six sub-palettes), and the earthy `spanish-{teal,coral,sunshine,orange,olive,cream}` family are all live as hardcoded hex values. The new semantic mapping in [ui-system.tailwind.extend.cjs](../../packages/frontend/ui-system.tailwind.extend.cjs) has not yet been merged. Appendix 09.
3. **Status rendering is decentralized.** [BookingStatusBadge.tsx](../../packages/frontend/src/components/booking/BookingStatusBadge.tsx) is the only centralized booking-status renderer, and it uses legacy `edu-*` classes plus hardcoded English labels. `SlotStatus` has no badge renderer. Appendix 04.
4. **Orphaned pages.** [pages/auth/LoginPage.tsx](../../packages/frontend/src/pages/auth/LoginPage.tsx), [RegisterPage.tsx](../../packages/frontend/src/pages/auth/RegisterPage.tsx), [pages/professor/*](../../packages/frontend/src/pages/professor/) (BookingConfirmationPage, PendingBookingsList, ProfessorAnalyticsDashboard, StudentListWithPricing), and [pages/shared/SettingsPage.tsx](../../packages/frontend/src/pages/shared/SettingsPage.tsx) exist but are not routed in [App.tsx](../../packages/frontend/src/App.tsx). [pages/auth/TwoFactorSetupPage.tsx](../../packages/frontend/src/pages/auth/TwoFactorSetupPage.tsx) is **not orphaned** — it is the entire body of [pages/admin/SecuritySettingsPage.tsx](../../packages/frontend/src/pages/admin/SecuritySettingsPage.tsx) at the routed `/admin/settings/security`. Phase 1 decides delete vs route for the genuine orphans. Appendix 01.
5. **Duplicate modal implementations.** Six modal-shaped components (`CreateCoverModal`, `InviteStudentModal`, `PrivateInvitationModal`, `StudentPricingModal`, `RateUserModal`, `DeleteAccountDialog`) each wrap Radix `Dialog` with bespoke header/footer/close logic. Appendix 02.
6. **`MobileNav`, `DashboardLayout` sidebar, and `Header` are three independent navigation implementations.** Appendix 02.
7. **No `EmptyState` or `SlotStatusBadge` primitive yet.** Appendix 02.
8. **Waitlist API exists (`bookSlot` returns 202 for waitlisted, 201 for booked) without surfaced UI.** Appendix 03.
9. **Ratings entry point not visible.** [RateUserModal.tsx](../../packages/frontend/src/components/ratings/RateUserModal.tsx) and `pendingRatings` API exist but no trigger is wired in. Appendix 08.
10. **Notifications popover IS implemented but only in the mobile shell.** [NotificationBell.tsx](../../packages/frontend/src/components/shared/NotificationBell.tsx) renders an unread count, popover header, list, mark-as-read, mark-all-read, reconnecting banner, "Load more" action, and empty state — but is mounted only inside the `lg:hidden` mobile header of [DashboardLayout.tsx:264-273](../../packages/frontend/src/components/layout/DashboardLayout.tsx#L264-L273). The desktop shell has no bell at all, and the popover copy is hardcoded English. Appendix 08.
11. **Private invitation flow IS wired from the calendar.** [CalendarPage.tsx:85, 284-286](../../packages/frontend/src/pages/admin/CalendarPage.tsx#L85) invokes `PrivateInvitationModal`; [StudentsPage.tsx:280, 284](../../packages/frontend/src/pages/admin/StudentsPage.tsx#L280) invokes `InviteStudentModal` and `CreateCoverModal`. The remaining gaps are: `CreateCoverModal` has no calendar-contextual entry point, and the calendar trigger label uses the wrong i18n key `t('calendar.subtitle')` at [CalendarPage.tsx:88](../../packages/frontend/src/pages/admin/CalendarPage.tsx#L88). Appendix 08.
12. **`BookingStatusBadge` hardcodes English labels.** Visible to Serbian and Spanish users. Appendix 05.
13. **Responsive coverage limited to Pixel 5 + iPhone 12.** No explicit 390/768/1280/1440 coverage as required by [.claude/rules/frontend/responsive.md](../../.claude/rules/frontend/responsive.md). Appendix 06.

## Hierarchy for documents and decisions

Per [docs/ui-system/README.md](../ui-system/README.md), the resolution order when sources conflict is:

1. BPMN / business rules ([docs/product/processes-overview.md](../product/processes-overview.md)).
2. Approved UX flow and ADRs ([docs/redesign/decisions/](decisions/)).
3. UI semantic tokens ([docs/ui-system/design-tokens.json](../ui-system/design-tokens.json)).
4. Component contracts ([docs/ui-system/06-component-contracts.md](../ui-system/06-component-contracts.md)).
5. Page blueprints ([docs/ui-system/08-page-blueprints.md](../ui-system/08-page-blueprints.md)).
6. Existing legacy implementation — never overrides the above.

## How to use this document

Phase 1 (UI system foundation) reads §"Migration seams" and Appendix 09. Phase 2+ pull the role and route facts from Appendix 01, the API surface from Appendix 03, the lifecycle definitions from Appendix 04, and the BPMN trace from Appendix 08. The matrix in [implementation-matrix.csv](implementation-matrix.csv) is the authoritative ledger of what is done and what is outstanding; this document is the navigation map.
