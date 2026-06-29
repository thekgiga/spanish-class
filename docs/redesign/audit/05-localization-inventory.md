# Localization inventory and visible-key audit

## i18next configuration

[packages/frontend/src/lib/i18n.ts](../../../packages/frontend/src/lib/i18n.ts) uses `HttpBackend` to load JSON namespaces from `/locales/{{lng}}/{{ns}}.json`, with `LanguageDetector` ordered: `querystring`, `localStorage`, `navigator`, `htmlTag`. Persistence: `localStorage` key `i18nextLng`. React Suspense is enabled. Fallback: `en`. Supported: `en`, `sr`, `es`.

**Namespace registration mismatch.** The `ns: [...]` array at [i18n.ts:23-33](../../../packages/frontend/src/lib/i18n.ts#L23-L33) declares nine namespaces: `common`, `auth`, `home`, `booking`, `dashboard`, `student`, `admin`, `professor`, `about`. JSON files exist for a tenth namespace, `showcase`, in all three locales, and [DesignShowcase.tsx](../../../packages/frontend/src/pages/DesignShowcase.tsx) calls `useTranslation("showcase")` — but `showcase` is **not** in the registered `ns` list. Phase 1 either adds `showcase` to the `ns` array or removes the orphan namespace.

## Namespaces

| Namespace | File pattern | Purpose |
|---|---|---|
| `common` | `public/locales/{lng}/common.json` | App-wide nav, buttons, errors, forms. |
| `auth` | `public/locales/{lng}/auth.json` | Login, register, reset, verify. |
| `home` | `public/locales/{lng}/home.json` | Homepage. |
| `about` | `public/locales/{lng}/about.json` | About + contact. |
| `booking` | `public/locales/{lng}/booking.json` | Booking flow. |
| `dashboard` | `public/locales/{lng}/dashboard.json` | Shared dashboard. |
| `student` | `public/locales/{lng}/student.json` | Student-specific. |
| `admin` | `public/locales/{lng}/admin.json` | Admin-specific. |
| `professor` | `public/locales/{lng}/professor.json` | Professor-specific. |
| `showcase` | `public/locales/{lng}/showcase.json` | Internal showcase. |

Per [docs/product/processes-overview.md](../../product/processes-overview.md) and root [CLAUDE.md](../../../CLAUDE.md), all three locales must be kept key-complete — no placeholder English in `sr` or `es`.

## Visible-key and hardcoded-string audit

Findings worth tracking in [implementation-matrix.csv](../implementation-matrix.csv) as `I18N-001`/`I18N-002`:

1. **`BookingStatusBadge` hardcoded labels.** `Confirmed`, `Pending`, `Rejected`, `Expired`, `Cancelled`, `Completed`, `No Show` are inline strings in [BookingStatusBadge.tsx](../../../packages/frontend/src/components/booking/BookingStatusBadge.tsx). Should resolve through `t('booking.status.{value}')`. Owner: Phase 1 lib/ui-system/status.ts module.
2. **`DashboardLayout` nav labels.** Sidebar items (`Dashboard`, `Calendar`, `Availability`, `Students`, `Email Logs`, `Settings`, `Security`, `Book Class`, `My Bookings`, `Referrals`, `My Profile`) are inline strings in [DashboardLayout.tsx](../../../packages/frontend/src/components/layout/DashboardLayout.tsx). Owner: Phase 2 information architecture work.
3. **Inline alerts / toast messages.** `react-hot-toast` calls scattered across pages typically use literal English strings. Owner: localization sweep alongside each migrated flow.

A full grep audit is not yet done in this phase — the rule [docs/redesign/audit/07-test-inventory.md](07-test-inventory.md) identifies the lack of automated lint coverage for raw string literals as a Phase 7 enforcement task (`POLISH-001`).

## Backend enum exposure (forbidden in UI)

Per [.claude/rules/frontend/localization.md](../../../.claude/rules/frontend/localization.md): no UI may render raw backend enum values such as `PENDING_CONFIRMATION` or translation keys such as `spanish_levels.BEGINNER.label`. The `BookingStatusBadge` hardcoded labels are an early form of this rule — they evade the raw enum but skip i18n, which is the second half of the rule.

## Locale-dependent formatting

- Dates: formatted via `formatDate()` in [src/lib/utils.ts](../../../packages/frontend/src/lib/utils.ts) using locale.
- Times: formatted via `formatTime()` using `UserPublic.timezone`.
- `<html lang>` mirror: [src/hooks/useDocumentLang.ts](../../../packages/frontend/src/hooks/useDocumentLang.ts).
- Backend stores `User.languagePreference` (used for email templates). Phase 1 frontend continues to defer to it for transactional emails.

## Translation workflow

Per root [CLAUDE.md](../../../CLAUDE.md): for every new key, all three locale files must be updated in the same commit. Email templates in [packages/backend/emails/](../../../packages/backend/emails/) use React Email and read `user.languagePreference`.
