# Implementation Tasks: Professor-Initiated Private Invitations

**Feature**: 001-professor-invitations
**Branch**: 001-professor-invitations
**Total Tasks**: 39
**MVP Scope**: User Story 1 (14 tasks)

## Overview

This task list is organized by user story to enable independent implementation and testing. Each user story can be developed, tested, and deployed independently once foundational tasks are complete.

**Implementation Strategy**: Start with User Story 1 (MVP), verify it works end-to-end, then add additional stories incrementally.

## Phase 1: Setup & Infrastructure (3 tasks)

**Goal**: Prepare development environment and add database optimizations

- [X] T001 Checkout feature branch and verify project builds: `git checkout 001-professor-invitations && cd packages/backend && npm install && npm run build`
- [X] T002 Create database migration for composite index in packages/backend/prisma/migrations/
- [X] T003 Apply migration and regenerate Prisma client: `npx prisma migrate dev && npx prisma generate`

## Phase 2: Foundational - Shared Types & Validation (4 tasks)

**Goal**: Create shared types and validation schemas used by all user stories

**Blocking**: Must complete before any user story implementation

- [X] T004 [P] Create shared PrivateInvitation types in packages/shared/types/private-invitation.ts
- [X] T005 [P] Add Zod validation schemas for create/update in packages/backend/src/lib/validation.ts
- [X] T006 [P] Extend existing auth middleware to support professor checks in packages/backend/src/middleware/auth.ts
- [X] T007 Create private invitation email template function in packages/backend/src/services/email.ts

## Phase 3: User Story 1 - Professor Creates Private Invitation (P1) - 14 tasks

**Story Goal**: Professor can create a confirmed booking for a specific student based on offline agreement

**Independent Test**: 
1. Login as professor
2. Create private invitation for specific student at future time
3. Verify slot created with isPrivate=true and booking status=CONFIRMED
4. Verify student receives email notification
5. Verify slot NOT visible to other students

**Acceptance Criteria**:
- Private invitation creates slot + booking atomically
- Booking auto-confirmed (no pending state)
- Email sent to student with class details
- Other students cannot see the slot

### Backend Tasks (US1)

- [X] T008 [US1] Create conflict detection function in packages/backend/src/services/private-invitation.ts
- [X] T009 [US1] Implement createPrivateInvitation service method in packages/backend/src/services/private-invitation.ts
- [X] T010 [US1] Add POST /professor/private-invitations route in packages/backend/src/routes/professor.ts
- [X] T011 [US1] Add GET /professor/private-invitations route with filtering in packages/backend/src/routes/professor.ts
- [X] T012 [US1] Integrate email notification in createPrivateInvitation flow
- [X] T013 [US1] Add error handling and validation to private invitation routes

### Frontend Tasks (US1)

- [X] T014 [P] [US1] Create API client for private invitations in packages/frontend/src/services/api/private-invitations.ts
- [X] T015 [P] [US1] Create useCreatePrivateInvitation hook in packages/frontend/src/hooks/usePrivateInvitations.ts
- [X] T016 [P] [US1] Create usePrivateInvitations list hook in packages/frontend/src/hooks/usePrivateInvitations.ts
- [X] T017 [US1] Build StudentSelector component in packages/frontend/src/components/professor/StudentSelector.tsx
- [X] T018 [US1] Build PrivateInvitationModal component in packages/frontend/src/components/professor/PrivateInvitationModal.tsx
- [X] T019 [US1] Add "Create Private Invitation" button to ProfessorSchedule page in packages/frontend/src/pages/professor/ProfessorSchedule.tsx

### Testing Tasks (US1)

- [X] T020 [P] [US1] Write unit tests for createPrivateInvitation service in packages/backend/tests/unit/private-invitation.test.ts
- [X] T021 [US1] Write integration tests for POST /private-invitations in packages/backend/tests/integration/professor-routes.test.ts

**✓ US1 Complete**: Professor can create private invitations and students are notified

## Phase 4: User Story 2 - Student Views Private Invitation (P1) - 5 tasks

**Story Goal**: Student sees private invitation in their schedule and can access all details

**Independent Test**:
1. Professor creates private invitation for student (using US1)
2. Login as that student
3. Verify invitation appears in upcoming classes list
4. Click on invitation and verify all details shown (time, professor, video link)
5. Verify reminder notifications are scheduled

**Acceptance Criteria**:
- Private invitation visible in student's schedule
- All booking details accessible (time, professor, meet link)
- Reminder notifications work same as regular bookings

**Dependencies**: Requires US1 (professor creation) to be complete

### Backend Tasks (US2)

- [X] T022 [US2] Extend GET /student/bookings to include private invitations in packages/backend/src/routes/student.ts
- [X] T023 [US2] Add query to fetch student's private invitations with professor details in packages/backend/src/services/private-invitation.ts

### Frontend Tasks (US2)

- [X] T024 [P] [US2] Extend BookingCard component to show private invitation indicator in packages/frontend/src/components/student/BookingCard.tsx
- [X] T025 [US2] Update StudentBookings page to display private invitations in packages/frontend/src/pages/student/StudentBookings.tsx
- [X] T026 [US2] Verify reminder notifications trigger correctly for private invitations

**✓ US2 Complete**: Students can view and access their private invitations

## Phase 5: User Story 3 - Professor Manages Schedule View (P2) - 6 tasks

**Story Goal**: Professor can distinguish private invitations from public slots in schedule view

**Independent Test**:
1. Login as professor
2. Create mix of public availability and private invitations
3. View schedule and verify visual distinction (badges, colors, icons)
4. Attempt to create private invitation at conflicting time
5. Verify clear conflict warning shown

**Acceptance Criteria**:
- Visual badges distinguish private from public slots
- Conflict detection prevents double-booking
- Schedule view shows all slot types clearly

**Dependencies**: Requires US1 to be complete

### Backend Tasks (US3)

- [X] T027 [US3] Extend GET /professor/schedule to include slot type indicators in packages/backend/src/routes/professor.ts
- [X] T028 [US3] Add conflict warnings to createPrivateInvitation response when overlaps exist

### Frontend Tasks (US3)

- [X] T029 [P] [US3] Create PrivateInvitationBadge component in packages/frontend/src/components/professor/PrivateInvitationBadge.tsx
- [X] T030 [P] [US3] Create PrivateInvitationList component in packages/frontend/src/components/professor/PrivateInvitationList.tsx
- [X] T031 [US3] Update ProfessorSchedule to show badges for private slots in packages/frontend/src/pages/professor/ProfessorSchedule.tsx
- [X] T032 [US3] Add conflict detection UI warnings in PrivateInvitationModal

**✓ US3 Complete**: Professors can manage mixed schedule types clearly

## Phase 6: User Story 4 - Canceling Private Invitations (P2) - 7 tasks

**Story Goal**: Professors and students can cancel private invitations with proper notifications

**Independent Test**:
1. Professor creates private invitation (using US1)
2. Professor cancels the invitation
3. Verify booking status = CANCELLED_BY_PROFESSOR
4. Verify student receives cancellation email
5. Repeat with student-initiated cancellation

**Acceptance Criteria**:
- Professor can cancel via DELETE endpoint
- Student can cancel following standard policy
- Cancellation emails sent to both parties
- Slot status updated correctly

**Dependencies**: Requires US1 to be complete

### Backend Tasks (US4)

- [X] T033 [US4] Implement cancelPrivateInvitation service method in packages/backend/src/services/private-invitation.ts
- [X] T034 [US4] Add DELETE /professor/private-invitations/:id route in packages/backend/src/routes/professor.ts
- [X] T035 [US4] Add cancellation email template in packages/backend/src/services/email.ts
- [X] T036 [US4] Extend student cancellation routes to support private invitations

### Frontend Tasks (US4)

- [X] T037 [P] [US4] Add useCancelPrivateInvitation hook in packages/frontend/src/hooks/usePrivateInvitations.ts
- [X] T038 [US4] Add cancel button to PrivateInvitationList component with confirmation dialog
- [X] T039 [US4] Add cancel option to student BookingCard for private invitations

**✓ US4 Complete**: Cancellation flow works for both professor and student

## Phase 7: Polish & Cross-Cutting Concerns - 0 tasks

**Goal**: Final refinements, performance optimization, and production readiness

**Note**: All polish tasks are already integrated into user stories above. No additional cross-cutting tasks needed.

---

## Task Dependencies & Execution Order

### Critical Path (Must Complete in Order):
1. **Phase 1**: Setup (T001-T003)
2. **Phase 2**: Foundational (T004-T007)
3. **Phase 3**: US1 (T008-T021) - **MVP DELIVERY**
4. **Parallel After MVP**:
   - Phase 4: US2 (T022-T026)
   - Phase 5: US3 (T027-T032)  
   - Phase 6: US4 (T033-T039)

### Parallel Execution Opportunities

**Within US1 (after T009 complete)**:
- Frontend tasks (T014-T019) can run in parallel with backend routes (T010-T013)
- Testing tasks (T020-T021) can run in parallel with frontend

**Across User Stories (after US1 complete)**:
- US2, US3, US4 are independent and can be developed in parallel by different developers

## Independent Testing Per Story

### US1 Testing Checklist
- [ ] Professor can create private invitation via UI
- [ ] Slot created with isPrivate=true
- [ ] Booking auto-confirmed (status=CONFIRMED)
- [ ] Student receives email notification
- [ ] Other students cannot see the slot
- [ ] Conflict detection prevents double-booking

### US2 Testing Checklist
- [ ] Student sees private invitation in bookings list
- [ ] Invitation details accessible (professor, time, link)
- [ ] Reminder notifications scheduled correctly
- [ ] Private invitation distinguishable from public bookings

### US3 Testing Checklist
- [ ] Professor schedule shows visual distinction
- [ ] Private slots have badges/indicators
- [ ] Conflict warnings shown when appropriate
- [ ] Schedule view handles mixed slot types

### US4 Testing Checklist
- [ ] Professor can cancel private invitation
- [ ] Student receives cancellation email
- [ ] Booking status updated to CANCELLED
- [ ] Student can also cancel following policy
- [ ] Both cancellation paths tested

## Suggested MVP Scope

**Recommended MVP**: User Story 1 Only (14 tasks)

**Rationale**:
- Delivers core value: professor-initiated private bookings
- Fully testable end-to-end
- Students can be manually notified if US2 not yet ready
- Can deploy and validate with real users before adding features

**MVP Deployment Checklist**:
- [ ] US1 tasks T008-T021 completed
- [ ] Database migration applied to production
- [ ] Email templates tested in production
- [ ] Privacy verified (other students cannot see private slots)
- [ ] Professor creation flow tested with real data
- [ ] Rollback plan prepared (migration can be reverted)

## Task Statistics

- **Total Tasks**: 39
- **Setup**: 3 tasks
- **Foundational**: 4 tasks
- **US1 (P1)**: 14 tasks - MVP
- **US2 (P1)**: 5 tasks
- **US3 (P2)**: 6 tasks
- **US4 (P2)**: 7 tasks
- **Polish**: 0 tasks (integrated into stories)

**Parallelizable Tasks**: 14 tasks marked with [P]

**Estimated Effort**: 
- MVP (US1): 1-2 days
- All P1 stories (US1+US2): 2-3 days
- Complete feature (all stories): 3-4 days
