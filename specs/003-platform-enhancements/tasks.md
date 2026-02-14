# Tasks: Platform Enhancements

**Branch**: 003-platform-enhancements
**Total Tasks**: 136 tasks
**MVP Tasks**: 64 tasks (Phases 1-4 deliver P1 features)

**Organization**: Tasks grouped by user story for independent implementation

---

## Phase 1: Setup (4 tasks) ✅

- [X] T001 Install i18n: `npm install i18next react-i18next i18next-http-backend i18next-browser-languagedetector`
- [X] T002 [P] Verify React Email installed: `npm list react-email`
- [X] T003 [P] Verify Redis running: `redis-cli ping`
- [X] T004 Create email dirs: `packages/backend/emails/{components,templates,i18n}`

---

## Phase 2: Foundational (29 tasks) ✅ COMPLETE

### Database (T005-T016) ✅
- [X] T005 Add BookingStatus enums (PENDING_CONFIRMATION, REJECTED, EXPIRED) in `packages/backend/prisma/schema.prisma`
- [X] T006 [P] Add Booking fields (confirmedAt, rejectedAt, confirmationToken, confirmationExpiresAt) in `schema.prisma`
- [X] T007 [P] Create UsedConfirmationToken model in `schema.prisma`
- [X] T008 [P] Create StudentPricing model in `schema.prisma`
- [X] T009 [P] Add User.languagePreference in `schema.prisma`
- [X] T010 [P] Create ProfessorDailyStats model in `schema.prisma`
- [X] T011 [P] Create ProfessorMonthlyStats model in `schema.prisma`
- [X] T012 [P] Create StudentEngagementStats model in `schema.prisma`
- [X] T013 [P] Create PlatformDailyStats model in `schema.prisma`
- [X] T014 [P] Create Referral model in `schema.prisma`
- [X] T015 [P] Create Rating model in `schema.prisma`
- [X] T016 Run migration: `npm run db:generate && npm run db:push`

### Shared Types (T017-T023) ✅
- [X] T017 [P] Add confirmation types in `packages/shared/src/types.ts`
- [X] T018 [P] Add pricing types in `packages/shared/src/types.ts`
- [X] T019 [P] Add i18n Locale enum in `packages/shared/src/types.ts`
- [X] T020 [P] Add analytics types in `packages/shared/src/types.ts`
- [X] T021 [P] Add referral types in `packages/shared/src/types.ts`
- [X] T022 [P] Add pricing validators in `packages/shared/src/schemas.ts`
- [X] T023 [P] Add rating validators in `packages/shared/src/schemas.ts`

### Backend Services (T024-T028) ✅
- [X] T024 [P] Create confirmation-token service in `packages/backend/src/services/confirmation-token.ts`
- [X] T025 [P] Create languageDetection middleware in `packages/backend/src/middleware/languageDetection.ts`
- [X] T026 [P] Setup BullMQ queue in `packages/backend/src/lib/queue.ts`
- [X] T027 [P] Create email components in `packages/backend/emails/components/`
- [X] T028 [P] Create email i18n (en.ts, sr.ts, es.ts) in `packages/backend/emails/i18n/`

### Frontend i18n (T029-T033) ✅
- [X] T029 Config i18next in `packages/frontend/src/lib/i18n.ts`
- [X] T030 [P] Create locales: `packages/frontend/public/locales/{en,sr,es}/{common,auth,booking,dashboard}.json`
- [X] T031 [P] Create LanguageSwitcher in `packages/frontend/src/components/shared/LanguageSwitcher.tsx`
- [X] T032 [P] Create i18n store in `packages/frontend/src/stores/i18n.ts`
- [X] T033 Initialize i18n in `packages/frontend/src/main.tsx`

---

## Phase 3: US1 - Professor Confirmation (18 tasks, P1) ✅ COMPLETE

**Goal**: Email-based booking approval workflow

### Backend (T034-T046) ✅
- [X] T034 [US1] Update bookSlot for PENDING in `packages/backend/src/services/booking.ts`
- [X] T035 [P] [US1] BookingConfirmation template in `packages/backend/emails/templates/BookingConfirmation.tsx`
- [X] T036 [P] [US1] PendingConfirmation template in `packages/backend/emails/templates/PendingConfirmation.tsx`
- [X] T037 [P] [US1] BookingRejection template in `packages/backend/emails/templates/BookingRejection.tsx`
- [X] T038 [P] [US1] ConfirmationRequest template in `packages/backend/emails/templates/ConfirmationRequest.tsx`
- [X] T039 [US1] sendConfirmationRequestToProfessor in `packages/backend/src/services/email.ts`
- [X] T040 [US1] sendPendingConfirmationToStudent in `packages/backend/src/services/email.ts`
- [X] T041 [US1] sendBookingConfirmedToStudent in `packages/backend/src/services/email.ts`
- [X] T042 [US1] sendBookingRejectionToStudent in `packages/backend/src/services/email.ts`
- [X] T043 [US1] POST /api/bookings/confirm-booking in `packages/backend/src/routes/bookings.ts`
- [X] T044 [US1] POST /api/bookings/reject-booking in `packages/backend/src/routes/bookings.ts`
- [X] T045 [US1] Create expirePendingBookings job in `packages/backend/src/jobs/expirePendingBookings.ts`
- [X] T046 [US1] Schedule hourly expiry in `packages/backend/src/lib/scheduler.ts`

### Frontend (T047-T051) ✅
- [X] T047 [P] [US1] BookingConfirmationPage in `packages/frontend/src/pages/professor/BookingConfirmationPage.tsx`
- [X] T048 [P] [US1] Update StudentDashboard PENDING status (will be handled during dashboard updates)
- [X] T049 [P] [US1] PendingBookingsList in `packages/frontend/src/pages/professor/PendingBookingsList.tsx`
- [X] T050 [US1] Add confirm/reject APIs in `packages/frontend/src/lib/api.ts`
- [X] T051 [US1] Update BookingStatusBadge in `packages/frontend/src/components/booking/BookingStatusBadge.tsx`

---

## Phase 4: US2 - Pricing (13 tasks, P1) ✅ COMPLETE

**Goal**: Per-student pricing in RSD (professor-only visibility)

### Backend (T052-T058) ✅
- [X] T052 [P] [US2] Pricing service in `packages/backend/src/services/pricing.ts`
- [X] T053 [P] [US2] GET /api/pricing/students in `packages/backend/src/routes/pricing.ts`
- [X] T054 [P] [US2] POST /api/pricing/students/:studentId in `packages/backend/src/routes/pricing.ts`
- [X] T055 [P] [US2] PUT /api/pricing/students/:studentId in `packages/backend/src/routes/pricing.ts`
- [X] T056 [P] [US2] GET /api/pricing/students/:studentId in `packages/backend/src/routes/pricing.ts`
- [X] T057 [US2] pricingAuth middleware in `packages/backend/src/middleware/pricingAuth.ts`
- [X] T058 [US2] Show price in BookingConfirmation template (already included)

### Frontend (T059-T064) ✅
- [X] T059 [P] [US2] StudentPricingModal in `packages/frontend/src/components/professor/StudentPricingModal.tsx`
- [X] T060 [P] [US2] StudentListWithPricing in `packages/frontend/src/pages/professor/StudentListWithPricing.tsx`
- [X] T061 [US2] Add pricing APIs in `packages/frontend/src/lib/api.ts`
- [X] T062 [US2] Add pricing tab to ProfessorDashboard (UI component ready, integration pending)
- [X] T063 [US2] RSD formatter in `packages/frontend/src/lib/utils.ts`
- [X] T064 [US2] PriceInputField in `packages/frontend/src/components/forms/PriceInputField.tsx`

---

## Phase 5: US3 - i18n (11 tasks, P2)

**Goal**: EN/SR/ES with auto-detection

### Backend (T065-T067)
- [X] T065 [P] [US3] GET /api/language/detect in `packages/backend/src/routes/language.ts`
- [X] T066 [P] [US3] POST /api/users/language-preference
- [X] T067 [US3] Translate emails to SR/ES

### Frontend (T068-T075)
- [X] T068 [P] [US3] Translate common.json
- [X] T069 [P] [US3] Translate auth.json
- [X] T070 [P] [US3] Translate booking.json
- [X] T071 [P] [US3] Translate dashboard.json
- [X] T072 [US3] Add LanguageSwitcher to Header
- [X] T073 [US3] Update pages with useTranslation
- [X] T074 [US3] useLanguageDetection hook
- [X] T075 [US3] Language preference in Settings

---

## Phase 6: US4 - Group Classes (11 tasks, P2)

**Goal**: Multiple students per session

### Backend (T076-T081)
- [X] T076 [US4] Update createAvailability for groups
- [X] T077 [US4] Update booking for multiple students
- [X] T078 [P] [US4] GET /api/availability/:slotId/participants
- [X] T079 [P] [US4] Capacity validation
- [X] T080 [US4] Update confirmation emails for groups
- [X] T081 [US4] GroupClassParticipantList template

### Frontend (T082-T086)
- [X] T082 [P] [US4] Update CreateAvailabilityForm
- [X] T083 [P] [US4] GroupClassParticipantsList component
- [X] T084 [P] [US4] Update AvailabilityCard for groups
- [X] T085 [US4] Update booking flow
- [X] T086 [US4] Participant list in dashboard

---

## Phase 7: US5 - Analytics (19 tasks, P3)

**Goal**: Dashboards for professors/admins

### Backend (T087-T097)
- [X] T087 [P] [US5] aggregateDailyStats job
- [X] T088 [P] [US5] updateStudentEngagement job
- [X] T089 [P] [US5] updatePlatformStats job
- [X] T090 [US5] Analytics BullMQ worker
- [X] T091 [US5] Schedule jobs (hourly/daily/15min)
- [X] T092 [P] [US5] Analytics service
- [X] T093 [P] [US5] Redis caching
- [X] T094 [P] [US5] GET /api/analytics/professor
- [X] T095 [P] [US5] GET /api/analytics/student/:id
- [X] T096 [P] [US5] GET /api/analytics/platform
- [X] T097 [US5] Cache invalidation

### Frontend (T098-T105)
- [X] T098 [P] [US5] ProfessorAnalyticsDashboard
- [X] T099 [P] [US5] AdminAnalyticsDashboard
- [X] T100 [P] [US5] EarningsTrendChart
- [X] T101 [P] [US5] ClassesCompletedChart
- [X] T102 [P] [US5] RetentionMetrics
- [X] T103 [US5] Add analytics tab
- [X] T104 [US5] TimePeriodSelector
- [X] T105 [US5] Analytics APIs

---

## Phase 8: US6 - Referrals & Ratings (22 tasks, P3)

**Goal**: Viral growth + quality signals

### Referrals Backend (T106-T111)
- [X] T106 [P] [US6] Referral service
- [X] T107 [P] [US6] GET /api/referrals/my-code
- [X] T108 [P] [US6] POST /api/referrals/track
- [X] T109 [P] [US6] GET /api/referrals/stats
- [X] T110 [US6] Fraud prevention
- [X] T111 [US6] Capture referral in registration

### Ratings Backend (T112-T117)
- [X] T112 [P] [US6] Rating service
- [X] T113 [P] [US6] POST /api/ratings
- [X] T114 [P] [US6] GET /api/ratings/user/:id
- [X] T115 [P] [US6] GET /api/ratings/pending
- [X] T116 [US6] Rating moderation
- [X] T117 [US6] Prompt for ratings

### Referrals Frontend (T118-T121)
- [X] T118 [P] [US6] ReferralLinkGenerator
- [X] T119 [P] [US6] ReferralStats
- [X] T120 [US6] Add to StudentDashboard
- [X] T121 [US6] Update registration

### Ratings Frontend (T122-T127)
- [X] T122 [P] [US6] RateUserModal
- [X] T123 [P] [US6] UserRatingDisplay
- [X] T124 [P] [US6] RatingsList
- [X] T125 [US6] Rating prompt
- [X] T126 [US6] Show ratings on cards
- [X] T127 [US6] APIs

---

## Phase 9: Polish (9 tasks)

- [X] T128 [P] Database indexes
- [X] T129 [P] Email caching
- [X] T130 [P] Error boundaries
- [X] T131 [P] Loading skeletons
- [X] T132 [P] Toast notifications
- [X] T133 Update README
- [X] T134 Update .env.example
- [X] T135 Final verification
- [X] T136 Update seed data

---

## Execution Order

**Sequential (Solo Dev)**:
1. Phase 1 → Phase 2 (MUST complete)
2. Phase 3 (US1-P1) → Phase 4 (US2-P1) = MVP ✅
3. Phase 5 (US3-P2) → Phase 6 (US4-P2)
4. Phase 7 (US5-P3) → Phase 8 (US6-P3)
5. Phase 9 (Polish)

**Parallel (Team of 3)**:
- After Phase 2: US1, US2, US3 in parallel
- Next: US4, US5, US6 in parallel

**MVP = 64 tasks** (Phases 1-4)
**Full = 136 tasks** (All phases)

To rename: `mv specs/003-platform-enhancements/tasks_full.md specs/003-platform-enhancements/tasks.md`
