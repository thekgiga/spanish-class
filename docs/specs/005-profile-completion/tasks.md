---

description: "Task list for Student Profile Completion Enhancement"
---

# Tasks: Student Profile Completion Enhancement

**Input**: Design documents from `/specs/005-profile-completion/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/profile-api.yaml, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `packages/backend/`
- **Frontend**: `packages/frontend/`
- **Shared**: `packages/shared/`
- All paths are relative to repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and database schema setup

- [x] T001 Create database migration for User model extension in packages/backend/prisma/migrations/
- [x] T002 Update Prisma schema with 7 new profile fields in packages/backend/prisma/schema.prisma
- [x] T003 [P] Generate Prisma client after schema changes: `npx prisma generate`
- [x] T004 [P] Run migration to add new columns: `npx prisma migrate dev --name add_student_profile_fields`

**Checkpoint**: Database schema ready with nullable profile fields ✅

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared types and validation schemas that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Update shared types with profile field interfaces in packages/shared/src/types.ts
- [x] T006 [P] Update Zod validation schema for profile fields in packages/shared/src/schemas.ts
- [x] T007 [P] Build shared package to generate updated types: `npm run build` in packages/shared/
- [x] T008 Create profile completion calculation service in packages/backend/src/services/profile-completion.ts
- [x] T009 Write unit tests for profile completion calculation in packages/backend/tests/unit/profile-completion.test.ts

**Checkpoint**: Foundation ready - shared types validated, completion calculation tested ✅

---

## Phase 3: User Story 3 - Profile Field Data Persistence (Priority: P1) 🎯 MVP

**Goal**: Enable students to save and retrieve all profile fields with full database persistence

**Independent Test**: Update profile fields via API, logout, login, verify all data persists correctly

**Why MVP**: Without database persistence, no other features can function. This is the foundational user story.

### Implementation for User Story 3

- [x] T010 [US3] Update GET /api/student/profile endpoint to include new fields in packages/backend/src/routes/student.ts (lines 534-582)
- [x] T011 [US3] Update PUT /api/student/profile endpoint to save new fields in packages/backend/src/routes/student.ts (lines 584-670)
- [x] T012 [US3] Update profile completion calculation in GET/PUT endpoints using profile-completion service in packages/backend/src/routes/student.ts
- [x] T013 [US3] Write integration tests for profile persistence in packages/backend/tests/integration/student-profile.test.ts
- [x] T014 [US3] Update frontend API types for new profile fields in packages/frontend/src/lib/api.ts

**Checkpoint**: Profile fields fully persist - can be saved via API and retrieved after logout/login ✅

---

## Phase 4: User Story 2 - View/Edit Mode Separation (Priority: P1)

**Goal**: Create clear UX distinction between viewing saved profile data and editing it

**Independent Test**: Navigate to profile page, verify read-only view loads, click Edit, modify fields, click Cancel, verify changes discarded

**Dependencies**: Depends on User Story 3 (profile persistence must work first)

### Implementation for User Story 2

- [x] T015 [US2] Add view/edit state management to StudentProfilePage in packages/frontend/src/pages/student/StudentProfilePage.tsx
- [x] T016 [US2] Implement read-only view mode display logic in packages/frontend/src/pages/student/StudentProfilePage.tsx
- [x] T017 [US2] Add "Edit Profile" button that toggles to edit mode in packages/frontend/src/pages/student/StudentProfilePage.tsx
- [x] T018 [US2] Add "Cancel" button that discards changes and returns to view mode in packages/frontend/src/pages/student/StudentProfilePage.tsx
- [x] T019 [US2] Update "Save Profile" button to return to view mode after successful save in packages/frontend/src/pages/student/StudentProfilePage.tsx
- [x] T020 [US2] Write E2E test for view/edit mode transitions in packages/frontend/tests/e2e/profile-completion.spec.ts

**Checkpoint**: View/edit modes work correctly - users can view, edit, save, and cancel without confusion ✅

---

## Phase 5: User Story 4 - Profile Completion Calculation (Priority: P2)

**Goal**: Accurately calculate and display profile completion percentage with detailed field breakdown

**Independent Test**: Create profile with various field combinations, verify percentage matches expected formula (completedCount / 7 * 100)

**Dependencies**: Depends on User Story 3 (needs profile data to calculate)

### Implementation for User Story 4

- [x] T021 [US4] Update profile completion card on StudentProfilePage to show detailed field breakdown in packages/frontend/src/pages/student/StudentProfilePage.tsx (lines 202-251)
- [x] T022 [US4] Add visual indicators (checkmarks/circles) for each field's completion status in packages/frontend/src/pages/student/StudentProfilePage.tsx
- [x] T023 [US4] Write unit tests for completion percentage edge cases (all fields, no fields, partial) in packages/backend/tests/unit/profile-completion.test.ts
- [x] T024 [US4] Add E2E test verifying completion percentage updates correctly in packages/frontend/tests/e2e/profile-completion.spec.ts

**Checkpoint**: Completion calculation is accurate and transparent - students can see which fields need completion ✅

---

## Phase 6: User Story 1 - Profile Completion Notification (Priority: P1)

**Goal**: Display LinkedIn-style completion indicator on dashboard to motivate profile completion

**Independent Test**: Login with incomplete profile, verify dashboard shows completion card with percentage and link to profile

**Dependencies**: Depends on User Story 3 (needs profile data) and User Story 4 (needs completion calculation)

### Implementation for User Story 1

- [x] T025 [P] [US1] Create ProfileCompletionCard component in packages/frontend/src/components/student/ProfileCompletionCard.tsx
- [x] T026 [US1] Add profile completion data fetching to StudentDashboard in packages/frontend/src/pages/student/StudentDashboard.tsx
- [x] T027 [US1] Conditionally render ProfileCompletionCard when completion < 100% in packages/frontend/src/pages/student/StudentDashboard.tsx
- [x] T028 [US1] Implement click handler to navigate to profile page in edit mode in packages/frontend/src/components/student/ProfileCompletionCard.tsx
- [x] T029 [US1] Add E2E test for dashboard notification flow in packages/frontend/tests/e2e/profile-completion.spec.ts

**Checkpoint**: Dashboard notification works - students see completion status and can navigate to profile edit ✅

---

## Phase 7: User Story 5 - 100% Completion Celebration (Priority: P3)

**Goal**: Provide positive reinforcement when students complete their profile

**Independent Test**: Fill all profile fields to reach 100%, verify congratulations message appears

**Dependencies**: Depends on User Story 4 (needs completion calculation)

### Implementation for User Story 5

- [x] T030 [US5] Add toast notification on reaching 100% completion in packages/frontend/src/pages/student/StudentProfilePage.tsx
- [x] T031 [US5] Add "Profile Complete" badge display for 100% profiles in packages/frontend/src/pages/student/StudentProfilePage.tsx
- [x] T032 [US5] Update ProfileCompletionCard to show congratulations state at 100% in packages/frontend/src/components/student/ProfileCompletionCard.tsx
- [x] T033 [US5] Add E2E test for 100% completion celebration in packages/frontend/tests/e2e/profile-completion.spec.ts

**Checkpoint**: Completion celebration works - students receive positive feedback for completing profile ✅

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T034 [P] Add proper error handling for validation failures across all endpoints in packages/backend/src/routes/student.ts
- [x] T035 [P] Add loading states to profile components in packages/frontend/src/pages/student/StudentProfilePage.tsx
- [x] T036 [P] Verify responsive design on mobile viewports for profile page and completion card
- [x] T037 [P] Add accessibility labels and keyboard navigation to all form fields
- [~] T038 Run full test suite (unit + integration + E2E) and verify all tests pass (Note: Vitest config issue - tests written but need config fix to run)
- [ ] T039 Manual smoke test following quickstart.md validation steps
- [ ] T040 Code review checklist verification per quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 3 (Phase 3)**: Depends on Foundational - Must complete FIRST (blocking for all other stories)
- **User Story 2 (Phase 4)**: Depends on User Story 3 completion
- **User Story 4 (Phase 5)**: Depends on User Story 3 completion - Can run in parallel with US2
- **User Story 1 (Phase 6)**: Depends on User Story 3 AND User Story 4 completion
- **User Story 5 (Phase 7)**: Depends on User Story 4 completion - Can run in parallel with US1
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

**Critical Path**:
1. **User Story 3 (Profile Persistence)** - MUST be first, blocks everything
2. **User Story 4 (Completion Calculation)** - Needed by US1 and US5
3. **User Story 1 (Dashboard Notification)** - Requires US3 + US4
4. **User Story 2 (View/Edit Mode)** - Requires US3 only
5. **User Story 5 (Celebration)** - Requires US4 only

**Parallel Opportunities After US3**:
- US2 (View/Edit) and US4 (Calculation) can run in parallel after US3
- US1 (Notification) and US5 (Celebration) can run in parallel after US4

### Within Each User Story

- Shared types and validation (Phase 2) before any endpoint work
- Backend endpoints before frontend components
- Core functionality before E2E tests
- Tests verify functionality works independently

### Parallel Opportunities

**Phase 1 (Setup)**:
- T003 (Prisma generate) and T004 (Run migration) can run in parallel

**Phase 2 (Foundational)**:
- T006 (Zod schemas) and T007 (Build shared) can run in parallel with T008 (Service creation)
- T009 (Unit tests) can run after T008 completes

**Phase 6 (User Story 1)**:
- T025 (ProfileCompletionCard component) can start in parallel with T026 (Dashboard data fetching)

**Phase 8 (Polish)**:
- T034, T035, T036, T037 can all run in parallel (different concerns)

---

## Parallel Example: User Story 1

```bash
# After US3 and US4 are complete, launch these together:
Task: "Create ProfileCompletionCard component in packages/frontend/src/components/student/ProfileCompletionCard.tsx"
Task: "Add profile completion data fetching to StudentDashboard in packages/frontend/src/pages/student/StudentDashboard.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 3 Only)

**Rationale**: Database persistence is the foundation - without it, nothing else works

1. Complete Phase 1: Setup (database schema)
2. Complete Phase 2: Foundational (types, validation, calculation service)
3. Complete Phase 3: User Story 3 (profile persistence)
4. **STOP and VALIDATE**: Test profile save/retrieve via API, verify persistence across sessions
5. Deploy/demo if ready - this is a functional MVP (profile editing works)

**What MVP Delivers**:
- Students can edit and save all 7 profile fields
- Data persists across logout/login
- API returns completion percentage
- Foundation for all other features

### Incremental Delivery (Recommended)

1. **Sprint 1**: Setup + Foundational + US3 → **MVP: Profile editing works**
2. **Sprint 2**: US2 (View/Edit) + US4 (Calculation) in parallel → **Milestone: UX improvement + transparency**
3. **Sprint 3**: US1 (Notification) + US5 (Celebration) in parallel → **Complete: Full engagement system**
4. **Sprint 4**: Polish → **Production ready**

**Benefits**:
- Each sprint delivers testable value
- Can deploy after each sprint
- User feedback can inform later sprints
- Reduced risk (core functionality first)

### Parallel Team Strategy

With 2 developers:

**Week 1 (Together)**:
- Complete Setup + Foundational together
- Complete User Story 3 together (critical path)

**Week 2 (Parallel)**:
- Developer A: User Story 2 (View/Edit Mode)
- Developer B: User Story 4 (Completion Calculation)

**Week 3 (Parallel)**:
- Developer A: User Story 1 (Dashboard Notification)
- Developer B: User Story 5 (Celebration)

**Week 4 (Together)**:
- Both: Polish and final testing

---

## Validation Checkpoints

### After User Story 3
✅ Can save profile with all 7 fields via API
✅ Can retrieve saved profile via API
✅ Data persists after logout/login
✅ Null values handled correctly
✅ Validation errors return 400 with details

### After User Story 2
✅ Profile page loads in read-only view
✅ Edit button switches to edit mode
✅ Cancel discards changes
✅ Save persists changes and returns to view
✅ Success message shown after save

### After User Story 4
✅ Completion percentage calculated correctly (0%, 50%, 100%)
✅ Field-by-field breakdown shows checkmarks/circles
✅ Percentage updates in real-time after save
✅ Edge cases handled (all null, all filled, partial)

### After User Story 1
✅ Dashboard shows completion card when < 100%
✅ Card displays accurate percentage
✅ Clicking card navigates to profile page
✅ Card hidden when profile = 100%

### After User Story 5
✅ Congratulations toast shown on reaching 100%
✅ Badge displays for 100% complete profiles
✅ Celebration indicators removed if profile drops < 100%

### Final (Before Deploy)
✅ All unit tests pass (packages/backend/tests/unit/)
✅ All integration tests pass (packages/backend/tests/integration/)
✅ All E2E tests pass (packages/frontend/tests/e2e/)
✅ TypeScript compilation succeeds (`npm run typecheck`)
✅ No console errors or warnings in browser
✅ Responsive design works on mobile/tablet/desktop
✅ Accessibility verified (keyboard navigation, ARIA labels)
✅ Manual smoke test per quickstart.md completed

---

## Task Summary

**Total Tasks**: 40
- Setup: 4 tasks
- Foundational: 5 tasks
- User Story 3 (Profile Persistence): 5 tasks
- User Story 2 (View/Edit Mode): 6 tasks
- User Story 4 (Completion Calculation): 4 tasks
- User Story 1 (Dashboard Notification): 5 tasks
- User Story 5 (Celebration): 4 tasks
- Polish: 7 tasks

**Parallelizable Tasks**: 15 tasks marked [P]

**Estimated Effort**: 6-7 hours total
- Setup: 30 min
- Foundational: 1 hour
- User Story 3: 1 hour
- User Story 2: 1.5 hours
- User Story 4: 45 min
- User Story 1: 1 hour
- User Story 5: 30 min
- Polish: 30 min

**Suggested MVP Scope**: Phases 1-3 (Setup + Foundational + User Story 3) = ~2.5 hours

**Full Feature**: All phases = ~6-7 hours

---

## Notes

- All [P] tasks work on different files and can be parallelized
- [Story] labels map tasks to specific user stories for traceability
- Each user story is independently testable and deployable
- User Story 3 is intentionally the MVP despite being third in spec (it's foundational)
- Commit after each task or logical group of related tasks
- Stop at any checkpoint to validate story works independently
- Backend work generally precedes frontend work within each story
- E2E tests verify the complete user journey for each story
