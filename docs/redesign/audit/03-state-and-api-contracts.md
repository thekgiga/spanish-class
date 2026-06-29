# State management and API contracts

This appendix is the **contract surface** that Phase 1+ must preserve. The redesign changes presentation, not the API.

## Stores

| Store | File | Persisted |
|---|---|---|
| `useAuthStore` | [src/stores/auth.ts](../../../packages/frontend/src/stores/auth.ts) | localStorage `auth-storage`. `user`, `isAuthenticated`, `isLoading`, `emailVerified`, `twoFactorEnabled`. |
| `useI18nStore` (i18next-backed) | [src/stores/i18n.ts](../../../packages/frontend/src/stores/i18n.ts) | i18next handles locale persistence in `i18nextLng`. |

There is no Zustand store for cross-route UI state (drawer state, filters, sidebar collapse, etc.) — those are component-local.

## React Query setup

[App.tsx:124-132](../../../packages/frontend/src/App.tsx#L124-L132): `staleTime: 5min`, `gcTime: 10min`, `retry: 1`. The `QueryClient` is constructed once at app root.

## Hooks (`src/hooks/`)

| Hook | Purpose |
|---|---|
| `useDocumentLang` | Mirrors i18n language onto `<html lang>`. |
| `useLanguageDetection` | Detects preferred language. |
| `useLazyImage` | IntersectionObserver-based lazy load. |
| `useMediaQuery` | Media-query subscription. |
| `useNotifications` | React Query against `notificationApi`. |
| `useOptimizedAnimation` | Framer Motion wrapper that respects reduced motion. |
| `usePendingBookingsCount` | Badge count for pending approvals/confirmation. |
| `usePrefetch` | Route hover prefetch. |
| `usePrivateInvitations` | CRUD for private invitations. |
| `useReducedMotion` | Boolean flag. |
| `useSearchTransition` | Debounce + loading flag. |

## API client

[src/lib/api.ts](../../../packages/frontend/src/lib/api.ts): axios instance with `baseURL='/api'`, `withCredentials=true`, request interceptor reading the bearer token from localStorage, and a response interceptor that clears the token + redirects on 401 and surfaces rate-limit messaging on 429.

## API surface by namespace

Phase 1+ must preserve every endpoint shape below. The redesign may change how UI invokes them, never the contract.

### `authApi`

- `register(input)` → `POST /auth/register`
- `login(input)` → `POST /auth/login`
- `logout()` → `POST /auth/logout`
- `logoutAll()` → `POST /auth/logout-all`
- `me()` → `GET /auth/me`
- `updateProfile(data)` → `PUT /auth/profile`
- `forgotPassword(email)` → `POST /auth/forgot-password`
- `resetPassword(token, password, confirmPassword)` → `POST /auth/reset-password`
- `verifyEmail(token)` → `POST /auth/verify-email`
- `resendVerification(email)` → `POST /auth/resend-verification`
- `setup2FA()` → `GET /auth/2fa/setup`
- `confirm2FA(code)` → `POST /auth/2fa/verify`
- `disable2FA()` → `POST /auth/2fa/disable`
- `regenerateRecoveryCodes(code)` → `POST /auth/2fa/regen-recovery`
- `changePassword(current, new, confirm)` → `POST /auth/change-password`
- `changeEmail(newEmail, currentPassword)` → `POST /auth/change-email`
- `verifyEmailChange(token)` → `GET /auth/verify-email-change?token=`
- `deleteAccount(password, confirmation)` → `POST /auth/delete-account`

### `professorApi`

- `getDashboard()` → `GET /professor/dashboard`
- `getSlots(params)` → `GET /professor/slots`
- `getSlot(id)` → `GET /professor/slots/{id}`
- `createSlot(data)` → `POST /professor/slots`
- `createBulkSlots(data)` → `POST /professor/slots/bulk`
- `updateSlot(id, data)` → `PUT /professor/slots/{id}`
- `deleteSlot(id)` → `DELETE /professor/slots/{id}`
- `cancelSlotWithBookings(id, reason?)` → `POST /professor/slots/{id}/cancel-with-bookings`
- `getStudents(params?)` → `GET /professor/students`
- `getStudent(id)` → `GET /professor/students/{id}`
- `removeStudent(studentId)` → `DELETE /professor/students/{studentId}`
- `assignStudent(studentId, allowOverride?)` → `POST /professor/assign-student`
- `inviteStudent(email)` → `POST /professor/invite-student`
- `createNote(studentId, content)` → `POST /professor/students/{studentId}/notes`
- `updateNote(studentId, noteId, content)` → `PUT /professor/students/{studentId}/notes/{noteId}`
- `deleteNote(studentId, noteId)` → `DELETE /professor/students/{studentId}/notes/{noteId}`
- `getRecurringPatterns()` → `GET /professor/recurring-patterns`
- `createRecurringPattern(data)` → `POST /professor/recurring-patterns`
- `deleteRecurringPattern(id)` → `DELETE /professor/recurring-patterns/{id}`
- `bookStudent(data)` → `POST /professor/book-student`
- `getEmailLogs(params?)` → `GET /professor/email-logs`
- `getEmailLog(id)` → `GET /professor/email-logs/{id}`
- `getPendingBookings(params?)` → `GET /professor/pending-bookings`
- `confirmBooking(bookingId)` → `POST /professor/bookings/{bookingId}/approve`
- `rejectBooking(bookingId, reason)` → `POST /professor/bookings/{bookingId}/reject`
- `markNoShow(bookingId)` → `POST /professor/bookings/{bookingId}/no-show`
- `getSettings()` → `GET /professor/settings`
- `updateSettings(data)` → `PUT /professor/settings`
- `createCover(data)` → `POST /professor/covers`
- `listCovers()` → `GET /professor/covers`
- `deleteCover(coverId)` → `DELETE /professor/covers/{coverId}`
- `getPendingInvitations()` → `GET /professor/pending-invitations`

### `studentApi`

- `getProfessor()` → `GET /student/professor`
- `selectProfessor(professorId)` → `POST /student/select-professor`
- `getDashboard()` → `GET /student/dashboard`
- `getSlots(params?)` → `GET /student/slots`
- `bookSlot(slotId)` → `POST /student/bookings` (returns **201 = booked** or **202 = waitlisted**)
- `getBookings(params?)` → `GET /student/bookings`
- `getBooking(id)` → `GET /student/bookings/{id}`
- `cancelBooking(id, reason?)` → `POST /student/bookings/{id}/cancel`
- `getProfile()` → `GET /student/profile`
- `updateProfile(data)` → `PUT /student/profile`

### Token-based booking confirmation (email link)

- `POST /bookings/confirm-booking` with `{ token }`
- `POST /bookings/reject-booking` with `{ token, reason? }`

### Pricing

- `GET /pricing/students`
- `GET /pricing/students/{studentId}`
- `POST /pricing/students/{studentId}`
- `PUT /pricing/students/{studentId}`
- `DELETE /pricing/students/{studentId}`

### Notifications (`notificationApi`)

- `GET /notifications?page=&limit=`
- `PUT /notifications/{id}/read`
- `POST /notifications/read-all`
- `GET /notifications/preferences`
- `PUT /notifications/preferences`

There is also an SSE/WebSocket reconnect path; see commit `ffd5196` (notifications N1 SSE reconnect).

### Other

- Language: `GET /language/detect`, `POST /language/preference`.
- Group classes: `GET /availability/{slotId}/participants`.
- Analytics: `GET /analytics/professor?startDate&endDate`, `GET /analytics/student/{studentId}`, `GET /analytics/platform`.
- Referrals: `GET /referrals/my-code`, `POST /referrals/track`, `GET /referrals/stats`.
- Ratings: `POST /ratings`, `GET /ratings/user/{userId}`, `GET /ratings/pending`.
- Public: `GET /professors`.

A standalone service module sits at [src/services/api/private-invitations.ts](../../../packages/frontend/src/services/api/private-invitations.ts).

## Contract preservation rules

Per [packages/frontend/CLAUDE.md](../../../packages/frontend/CLAUDE.md): existing BPMN behavior is preserved unless an approved ADR changes it. The redesign work touches presentation only. Any UI change that requires backend changes must spawn an ADR under [docs/redesign/decisions/](../decisions/).
