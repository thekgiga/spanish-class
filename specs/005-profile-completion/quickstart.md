# Quickstart: Student Profile Completion Enhancement

**Feature**: 005-profile-completion
**Date**: 2026-02-15
**Audience**: Developers implementing this feature

## Overview

This guide provides step-by-step instructions for implementing the profile completion feature. Follow these steps in order to ensure proper implementation.

## Prerequisites

- Node.js 18+ installed
- MySQL 8.0 running locally or accessible remotely
- Repository cloned and dependencies installed (`npm install`)
- Existing development environment set up per main README

## Implementation Checklist

### Phase 1: Database Schema (Backend - Database)

**Time Estimate**: 30 minutes

1. **Update Prisma schema**
   ```bash
   cd packages/backend
   ```

2. **Edit `prisma/schema.prisma`**
   - Add 7 new fields to the `User` model (see data-model.md for exact schema)
   - Fields: `dateOfBirth`, `phoneNumber`, `aboutMe`, `spanishLevel`, `preferredClassTypes`, `learningGoals`, `availabilityNotes`

3. **Generate migration**
   ```bash
   npx prisma migrate dev --name add_student_profile_fields
   ```

4. **Verify migration**
   ```bash
   npx prisma studio
   ```
   - Open User table
   - Verify new columns exist and are nullable

5. **Regenerate Prisma Client**
   ```bash
   npx prisma generate
   ```

**Success Criteria**:
- Migration created in `prisma/migrations/`
- New fields visible in Prisma Studio
- TypeScript types updated (check autocomplete in VS Code)

---

### Phase 2: Shared Types & Validation (Shared Package)

**Time Estimate**: 20 minutes

1. **Update shared types**
   ```bash
   cd packages/shared
   ```

2. **Edit `src/types.ts`**
   - Add new optional fields to any existing profile-related interfaces
   - Verify `ProfileCompletion` interface already exists (lines 238-251)

3. **Edit `src/schemas.ts`**
   - Update `updateStudentProfileSchema` with validation rules for 7 new fields
   - See data-model.md for exact Zod schema

4. **Build shared package**
   ```bash
   npm run build
   ```

**Success Criteria**:
- TypeScript compilation succeeds
- No type errors in terminal
- Validation schema exported correctly

---

### Phase 3: Backend Service Logic (Backend - Business Logic)

**Time Estimate**: 45 minutes

1. **Create profile completion service**
   ```bash
   cd packages/backend
   touch src/services/profile-completion.ts
   ```

2. **Implement calculation logic**
   - Create `calculateProfileCompletion(user)` function
   - See data-model.md for exact calculation formula
   - Return `ProfileCompletion` object with percentage and items array

3. **Write unit tests**
   ```bash
   touch tests/unit/profile-completion.test.ts
   ```
   - Test all fields null → 0%
   - Test one field filled → ~14%
   - Test all fields filled → 100%
   - Test empty strings/arrays count as unfilled
   - Run tests: `npm test tests/unit/profile-completion.test.ts`

**Success Criteria**:
- All unit tests pass
- Coverage > 90% for profile-completion.ts
- No TypeScript errors

---

### Phase 4: Backend API Endpoints (Backend - API Layer)

**Time Estimate**: 1 hour

1. **Update student routes**
   ```bash
   cd packages/backend
   ```

2. **Edit `src/routes/student.ts`**
   - **GET /api/student/profile** (lines 534-582):
     - Uncomment new field selections (lines 545-551)
     - Uncomment preferredClassTypes parsing (lines 565-567)
     - Update `calculateProfileCompletion` call with actual fields (currently only firstName/lastName)

   - **PUT /api/student/profile** (lines 584-670):
     - Uncomment field extraction (lines 591-599)
     - Uncomment updateData assignments (lines 603-625)
     - Uncomment field selections in response (lines 636-642)
     - Uncomment preferredClassTypes parsing (lines 651-653)

3. **Write integration tests**
   ```bash
   touch tests/integration/student-profile.test.ts
   ```
   - Test GET /api/student/profile returns completion data
   - Test PUT with all fields saves correctly
   - Test PUT with partial fields updates only those fields
   - Test validation errors for invalid data
   - Run tests: `npm test tests/integration/student-profile.test.ts`

4. **Manual API testing** (optional but recommended)
   ```bash
   npm run dev
   ```
   - Use Postman/Insomnia or curl to test endpoints
   - GET /api/student/profile → verify completion object
   - PUT /api/student/profile with test data → verify 200 response

**Success Criteria**:
- All integration tests pass
- API returns correct completion percentage
- Invalid data returns 400 with validation errors

---

### Phase 5: Frontend - Profile Completion Card (Frontend - Components)

**Time Estimate**: 45 minutes

1. **Create ProfileCompletionCard component**
   ```bash
   cd packages/frontend
   touch src/components/student/ProfileCompletionCard.tsx
   ```

2. **Implement component**
   - Props: `percentage`, `items`, `onNavigate`
   - Display progress bar with percentage
   - Show list of completed/missing fields with icons
   - "Complete Your Profile" button → navigate to profile page
   - Use existing UI components (Card, Button, Badge from `@/components/ui`)

3. **Add to StudentDashboard**
   - Edit `src/pages/student/StudentDashboard.tsx`
   - Import ProfileCompletionCard
   - Fetch profile completion data (use existing `studentApi.getProfile()`)
   - Conditionally render: `{completion.percentage < 100 && <ProfileCompletionCard ... />}`

4. **Style with Tailwind**
   - Use existing color scheme (gold-500, navy-800)
   - Make responsive (hide detailed items on mobile if needed)

**Success Criteria**:
- Card displays on dashboard when profile < 100%
- Progress bar animates correctly
- Clicking button navigates to /student/profile
- Card hidden when profile = 100%

---

### Phase 6: Frontend - View/Edit Mode (Frontend - Pages)

**Time Estimate**: 1.5 hours

1. **Refactor StudentProfilePage**
   ```bash
   cd packages/frontend
   # File already exists: src/pages/student/StudentProfilePage.tsx
   ```

2. **Add view/edit state**
   ```typescript
   const [isEditing, setIsEditing] = useState(false);
   ```

3. **Implement view mode**
   - Display all profile fields as read-only text
   - Use `<p>`, `<span>` tags with appropriate styling
   - Show "Edit Profile" button → `setIsEditing(true)`
   - Format data nicely (e.g., date formatting, enum labels)

4. **Implement edit mode** (already partially done)
   - Current implementation is always in edit mode
   - Wrap form fields in conditional: `{isEditing ? <Input ...> : <p>...}</p>}`
   - Add "Cancel" button → `reset()` and `setIsEditing(false)`
   - "Save Profile" button → submit form, then `setIsEditing(false)`

5. **Add congratulations on 100%**
   ```typescript
   useEffect(() => {
     if (completion?.percentage === 100) {
       toast.success('🎉 Congratulations! Your profile is 100% complete!');
     }
   }, [completion?.percentage]);
   ```

6. **Update profile completion card** (already exists at lines 202-251)
   - Verify it displays items with checkmarks correctly
   - Update any styling if needed

**Success Criteria**:
- Page loads in view mode showing saved data
- "Edit Profile" button switches to edit mode
- "Cancel" button discards changes and returns to view
- "Save" button persists changes and returns to view
- Toast shown when reaching 100%

---

### Phase 7: Testing (E2E)

**Time Estimate**: 1 hour

1. **Create E2E test**
   ```bash
   cd packages/frontend
   touch tests/e2e/profile-completion.spec.ts
   ```

2. **Write test scenarios**
   - Register new student account
   - Verify dashboard shows completion card at 0%
   - Click card → navigates to profile page
   - Fill all 7 fields
   - Save profile
   - Verify completion jumps to 100%
   - Verify congratulations message appears
   - Refresh page → verify data persisted
   - Return to dashboard → verify card hidden or shows "complete"

3. **Run E2E tests**
   ```bash
   npx playwright test tests/e2e/profile-completion.spec.ts
   ```

**Success Criteria**:
- All E2E tests pass
- Test runs in < 30 seconds
- Screenshots/videos captured on failure

---

### Phase 8: Integration & Polish

**Time Estimate**: 30 minutes

1. **Run full test suite**
   ```bash
   # Backend
   cd packages/backend
   npm test

   # Frontend
   cd packages/frontend
   npx playwright test
   ```

2. **Type check everything**
   ```bash
   cd ../..  # repo root
   npm run typecheck
   ```

3. **Manual smoke test**
   - Start both servers: `npm run dev` (from repo root)
   - Register a new student account
   - Go through complete user flow:
     - See 0% on dashboard
     - Navigate to profile
     - Fill all fields
     - Save
     - See 100% and congratulations
     - Log out and back in
     - Verify persistence

4. **Code review checklist**
   - [ ] All fields nullable in database
   - [ ] Validation on both frontend and backend
   - [ ] Completion calculation tested
   - [ ] View/edit modes work correctly
   - [ ] No console errors or warnings
   - [ ] Responsive design (test on mobile viewport)
   - [ ] Accessibility (keyboard navigation works)

**Success Criteria**:
- All tests pass (unit, integration, E2E)
- No TypeScript errors
- Complete user flow works end-to-end
- No regressions in existing functionality

---

## Troubleshooting

### Common Issues

**Issue**: Prisma migration fails
- **Solution**: Check MySQL is running, database credentials are correct in .env
- **Command**: `npx prisma studio` to verify connection

**Issue**: TypeScript errors after schema update
- **Solution**: Regenerate Prisma client: `npx prisma generate`
- **Solution**: Rebuild shared package: `cd packages/shared && npm run build`

**Issue**: Profile completion not updating
- **Solution**: Check browser console for API errors
- **Solution**: Verify backend is recalculating on every save (check logs)
- **Solution**: Clear browser cache and localStorage

**Issue**: Tests failing
- **Solution**: Ensure test database is seeded correctly
- **Solution**: Check environment variables in test environment
- **Solution**: Run tests in isolation: `npm test -- --no-coverage` for faster feedback

---

## Next Steps

After completing this implementation:

1. **Create PR**: Use `/speckit.implement` or manually create PR from feature branch
2. **Deploy to staging**: Test on staging environment with real data
3. **Monitor metrics**: Track profile completion rates in production
4. **Iterate**: Gather user feedback and plan enhancements (e.g., gamification, rewards)

---

## Key Files Reference

| File | Purpose | Lines to Modify |
|------|---------|-----------------|
| `packages/backend/prisma/schema.prisma` | Database schema | Add 7 fields to User model |
| `packages/backend/src/routes/student.ts` | API endpoints | Uncomment lines 545-551, 565-567, 591-625, 636-653 |
| `packages/backend/src/services/profile-completion.ts` | Completion logic | Create new file, implement calculation |
| `packages/shared/src/types.ts` | TypeScript types | Verify ProfileCompletion exists |
| `packages/shared/src/schemas.ts` | Validation schemas | Update updateStudentProfileSchema |
| `packages/frontend/src/components/student/ProfileCompletionCard.tsx` | Dashboard widget | Create new component |
| `packages/frontend/src/pages/student/StudentDashboard.tsx` | Dashboard page | Add ProfileCompletionCard |
| `packages/frontend/src/pages/student/StudentProfilePage.tsx` | Profile page | Add view/edit mode, celebration |

---

## Estimated Total Time

- **Backend**: 2.5 hours
- **Frontend**: 2.5 hours
- **Testing**: 1.5 hours
- **Total**: ~6-7 hours for complete implementation

---

## Success Metrics (Post-Launch)

Track these metrics after deployment:

1. **Profile completion rate**: % of users with 100% complete profiles (target: >60% within 2 weeks)
2. **Time to completion**: Average days from registration to 100% (target: <7 days)
3. **Field completion order**: Which fields are filled first (informs UX improvements)
4. **Bounce rate**: % of users who leave profile page without saving (target: <30%)
5. **API performance**: Profile save response time (target: <1s p95)

---

## Support

- **Spec**: [spec.md](./spec.md)
- **Data Model**: [data-model.md](./data-model.md)
- **API Contract**: [contracts/profile-api.yaml](./contracts/profile-api.yaml)
- **Research**: [research.md](./research.md)
