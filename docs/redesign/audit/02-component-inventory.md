# Component and duplicate-pattern inventory

Source paths are under [packages/frontend/src/components/](../../../packages/frontend/src/components/).

## UI primitives (`components/ui/`)

| File | Purpose | Story |
|---|---|---|
| [button.tsx](../../../packages/frontend/src/components/ui/button.tsx) | Button (Radix slot, cva variants). | [Button.stories.tsx](../../../packages/frontend/src/components/ui/Button.stories.tsx) |
| [input.tsx](../../../packages/frontend/src/components/ui/input.tsx) | Text input. | [Input.stories.tsx](../../../packages/frontend/src/components/ui/Input.stories.tsx) |
| [textarea.tsx](../../../packages/frontend/src/components/ui/textarea.tsx) | Textarea. | — |
| [checkbox.tsx](../../../packages/frontend/src/components/ui/checkbox.tsx) | Radix checkbox. | — |
| [select.tsx](../../../packages/frontend/src/components/ui/select.tsx) | Radix select. | — |
| [tabs.tsx](../../../packages/frontend/src/components/ui/tabs.tsx) | Radix tabs. | — |
| [dialog.tsx](../../../packages/frontend/src/components/ui/dialog.tsx) | Radix dialog primitive. | — |
| [dropdown-menu.tsx](../../../packages/frontend/src/components/ui/dropdown-menu.tsx) | Radix dropdown. | — |
| [badge.tsx](../../../packages/frontend/src/components/ui/badge.tsx) | Status/label badge. | [Badge.stories.tsx](../../../packages/frontend/src/components/ui/Badge.stories.tsx) |
| [avatar.tsx](../../../packages/frontend/src/components/ui/avatar.tsx) | Avatar with initials fallback. | [Avatar.stories.tsx](../../../packages/frontend/src/components/ui/Avatar.stories.tsx) |
| [card.tsx](../../../packages/frontend/src/components/ui/card.tsx) | Card + sub-components. | [Card.stories.tsx](../../../packages/frontend/src/components/ui/Card.stories.tsx) |
| [FormField.tsx](../../../packages/frontend/src/components/ui/FormField.tsx) | Field wrapper (label + hint + error). | — |
| [Typography.tsx](../../../packages/frontend/src/components/ui/Typography.tsx) | Heading/text helpers. | — |
| [label.tsx](../../../packages/frontend/src/components/ui/label.tsx) | Radix label. | — |
| [separator.tsx](../../../packages/frontend/src/components/ui/separator.tsx) | Visual divider. | — |
| [skeleton.tsx](../../../packages/frontend/src/components/ui/skeleton.tsx) | Loading skeleton block. | — |
| [error-boundary.tsx](../../../packages/frontend/src/components/ui/error-boundary.tsx) | React error boundary. | — |
| [premium.tsx](../../../packages/frontend/src/components/ui/premium.tsx) | Legacy: `GlassCard`, `GoldButton`, `PrimaryButton`. **Uses `edu-blue` and gradients; Phase 1+ candidate for removal.** | — |
| [index.ts](../../../packages/frontend/src/components/ui/index.ts) | Barrel export. | — |

Canonical UI-system primitives still **missing** ([component-inventory.csv](../../ui-system/component-inventory.csv)): `IconButton`, `Combobox`, `Radio`, `Switch`, `SegmentedControl`, `StatusBadge` (centralized lifecycle renderer), `Popover`, `Drawer`/`BottomSheet`, `AlertDialog`, `Toast`/`InlineAlert`, `EmptyState`, `AppShell`, `PageHeader`.

## Shared components (`components/shared/`)

| File | Purpose |
|---|---|
| [DeleteAccountDialog.tsx](../../../packages/frontend/src/components/shared/DeleteAccountDialog.tsx) | Account deletion confirmation. |
| [EmailVerificationBanner.tsx](../../../packages/frontend/src/components/shared/EmailVerificationBanner.tsx) | Prompt to verify email. |
| [LanguageSwitcher.tsx](../../../packages/frontend/src/components/shared/LanguageSwitcher.tsx) | en/sr/es switcher. |
| [LoadingSkeleton.tsx](../../../packages/frontend/src/components/shared/LoadingSkeleton.tsx) | Exports `PageSkeleton`. |
| [NotificationBell.tsx](../../../packages/frontend/src/components/shared/NotificationBell.tsx) | Unread count badge plus full popover (header, item list, mark-as-read, mark-all-read, reconnecting banner, load-more, empty state). All popover copy is hardcoded English. **Mounted only inside the `lg:hidden` mobile header of `DashboardLayout`** — the desktop shell has no bell. |
| [PasswordStrengthMeter.tsx](../../../packages/frontend/src/components/shared/PasswordStrengthMeter.tsx) | Strength visual. |
| [ResponsiveImage.tsx](../../../packages/frontend/src/components/shared/ResponsiveImage.tsx) | Lazy image. |
| [SEOMeta.tsx](../../../packages/frontend/src/components/shared/SEOMeta.tsx) | Helmet wrapper. |
| [SkipLink.tsx](../../../packages/frontend/src/components/shared/SkipLink.tsx) | Skip-to-content. |

## Layout (`components/layout/`)

| File | Purpose |
|---|---|
| [PublicLayout.tsx](../../../packages/frontend/src/components/layout/PublicLayout.tsx) | Public site shell. |
| [DashboardLayout.tsx](../../../packages/frontend/src/components/layout/DashboardLayout.tsx) | Authenticated shell. Sidebar + topbar; collapse state local. |
| [Header.tsx](../../../packages/frontend/src/components/layout/Header.tsx) | Public site header. |
| [Footer.tsx](../../../packages/frontend/src/components/layout/Footer.tsx) | Public site footer. |
| [MobileNav.tsx](../../../packages/frontend/src/components/layout/MobileNav.tsx) | Mobile slide-out drawer. |
| [Grid.tsx](../../../packages/frontend/src/components/layout/Grid.tsx) | Grid utility. |

## Domain components

### Booking ([components/booking/](../../../packages/frontend/src/components/booking/))

| File | Purpose | Lifecycle ownership |
|---|---|---|
| [BookingStatusBadge.tsx](../../../packages/frontend/src/components/booking/BookingStatusBadge.tsx) | Maps `BookingStatus` to label, icon, color. | Centralized for `BookingStatus`; uses legacy `edu-*` Tailwind classes and hardcoded English labels. |
| [GroupClassParticipantsList.tsx](../../../packages/frontend/src/components/booking/GroupClassParticipantsList.tsx) | List of group-class enrollees. | — |

No `SlotStatusBadge` exists for `SlotStatus`.

### Student ([components/student/](../../../packages/frontend/src/components/student/))

| File | Purpose |
|---|---|
| [ProfileCompletionCard.tsx](../../../packages/frontend/src/components/student/ProfileCompletionCard.tsx) | Profile completion progress. |

### Professor ([components/professor/](../../../packages/frontend/src/components/professor/))

| File | Purpose |
|---|---|
| [CreateCoverModal.tsx](../../../packages/frontend/src/components/professor/CreateCoverModal.tsx) | Create substitute professor cover. |
| [InviteStudentModal.tsx](../../../packages/frontend/src/components/professor/InviteStudentModal.tsx) | Invite student by email. |
| [PrivateInvitationBadge.tsx](../../../packages/frontend/src/components/professor/PrivateInvitationBadge.tsx) | Private invite indicator. |
| [PrivateInvitationList.tsx](../../../packages/frontend/src/components/professor/PrivateInvitationList.tsx) | List of private invites. |
| [PrivateInvitationModal.tsx](../../../packages/frontend/src/components/professor/PrivateInvitationModal.tsx) | Send a private invite. |
| [StudentPricingModal.tsx](../../../packages/frontend/src/components/professor/StudentPricingModal.tsx) | Per-student price (RSD). |
| [StudentSelector.tsx](../../../packages/frontend/src/components/professor/StudentSelector.tsx) | Student picker. |

### Forms, Ratings, Referrals

| File | Purpose |
|---|---|
| [forms/PriceInputField.tsx](../../../packages/frontend/src/components/forms/PriceInputField.tsx) | Price field with RSD validation. |
| [ratings/RateUserModal.tsx](../../../packages/frontend/src/components/ratings/RateUserModal.tsx) | 5-star rating + comment. |
| [referrals/ReferralLinkGenerator.tsx](../../../packages/frontend/src/components/referrals/ReferralLinkGenerator.tsx) | Code, copy, stats. |

## Duplicate-pattern findings

1. **Bespoke modal wrappers.** `CreateCoverModal`, `InviteStudentModal`, `PrivateInvitationModal`, `StudentPricingModal`, `RateUserModal`, `DeleteAccountDialog`, plus modal-mode usage of [dialog.tsx](../../../packages/frontend/src/components/ui/dialog.tsx) directly. Each reinvents header layout, close affordance, cancel/submit footer. Phase 1+ should produce a canonical `Dialog`/`AlertDialog`/`Drawer`/`BottomSheet` set.
2. **Three navigation implementations.** `DashboardLayout` sidebar, `Header` top nav, and `MobileNav` slide-out duplicate item rendering and active-state logic.
3. **No `EmptyState` primitive.** `BookingsPage`, `SlotsPage`, `StudentsPage`, `PendingApprovalsPage`, `ReferralPage`, `EmailLogsPage` all render their own empty-list affordances.
4. **No `PageHeader` primitive.** Title + context + primary action is repeated per page.
5. **Mixed loading approach.** `PageSkeleton` is the only shared skeleton; geometry-specific skeletons per page are inlined.
6. **`premium.tsx`.** Legacy `GlassCard`/`GoldButton`/`PrimaryButton` define competing visual variants. Not part of UI-system contract.
7. **Status rendering is partly central, partly ad hoc.** `BookingStatusBadge` exists for `BookingStatus`; `SlotStatus` is shown via inline conditionals in the pages that need it.

## Storybook

Coverage is limited to five primitives (`Avatar`, `Badge`, `Button`, `Card`, `Input`). Storybook config lives in [packages/frontend/.storybook/](../../../packages/frontend/.storybook/).

## Component ratchet (active enforcement)

Per [.claude/rules/frontend/legacy-migration.md](../../../.claude/rules/frontend/legacy-migration.md) and [docs/ui-system/12-migration-and-enforcement.md](../../ui-system/12-migration-and-enforcement.md):

- New primitives require a documented gap in [component-inventory.csv](../../ui-system/component-inventory.csv) and a Storybook story.
- New code may not use `edu-*` palette or legacy `spanish-*` tokens.
- Pages may not implement button, field, badge, drawer, dialog, toast, or status primitives directly.
