# Research: Student Profile Completion Enhancement

**Feature**: 005-profile-completion
**Date**: 2026-02-15
**Status**: Complete

## Overview

This document consolidates research findings for implementing the profile completion feature, resolving technical unknowns and establishing best practices for the implementation.

## Database Schema Design

### Decision: Extend User Model vs. Create Separate StudentProfile Table

**Chosen**: Extend existing User model with profile fields

**Rationale**:
- Current codebase already uses User model for student data (firstName, lastName, email)
- Profile fields are 1:1 with User (not separate entity lifecycle)
- Simpler queries: No joins required for profile data
- Existing GET /api/student/profile endpoint already queries User table
- All fields are optional (nullable), so no data migration complexity

**Alternatives Considered**:
- **Separate StudentProfile table**: Rejected because it adds unnecessary complexity (joins, foreign keys) for data that is conceptually part of the user identity and has no independent lifecycle
- **NoSQL document store**: Rejected because project uses MySQL/Prisma consistently; introducing new data store adds operational complexity

### Field Storage Strategy

**Decision**: Store preferredClassTypes as JSON string in MySQL

**Rationale**:
- MySQL supports JSON data type with native JSON functions
- Prisma supports Json scalar type for MySQL
- Array of enums can be serialized/deserialized automatically
- Existing codebase already uses this pattern (comments in student.ts indicate intent)
- Simpler than creating junction table for class type preferences

**Implementation**:
```prisma
model User {
  // ... existing fields
  dateOfBirth        DateTime?
  phoneNumber        String?
  aboutMe            String?   @db.Text
  spanishLevel       String?   // Enum value as string
  preferredClassTypes String?  @db.Text // JSON array of ClassType enums
  learningGoals      String?   @db.Text
  availabilityNotes  String?   @db.Text
}
```

## Profile Completion Calculation

### Decision: Equal-weight calculation with backend computation

**Chosen**: Each field contributes equal weight (100% / 7 fields ≈ 14.3% each)

**Rationale**:
- Simple, transparent formula that users can understand
- Avoids subjective weighting decisions
- Backend calculation ensures consistency and prevents client-side manipulation
- Matches assumption in spec: "equal weighting for all fields"

**Formula**:
```typescript
const PROFILE_FIELDS = 7; // Total trackable fields
const completedCount = [dateOfBirth, phoneNumber, aboutMe, spanishLevel, preferredClassTypes, learningGoals, availabilityNotes]
  .filter(field => field !== null && field !== undefined && field !== '')
  .length;
const percentage = Math.round((completedCount / PROFILE_FIELDS) * 100);
```

**Alternatives Considered**:
- **Weighted calculation**: Rejected because it requires subjective decisions about which fields are "more important" and adds complexity without clear user benefit
- **Frontend calculation**: Rejected because it allows client-side manipulation and creates potential inconsistencies

## View/Edit Mode Separation

### Decision: Single-page toggle pattern with React state

**Chosen**: Use local state to toggle between view and edit modes on the same page

**Rationale**:
- Better UX: No page navigation/reload required
- Maintains scroll position and context
- Simpler routing: No need for separate /profile/edit route
- Common pattern in modern web apps (LinkedIn, GitHub, etc.)
- React Hook Form already loaded for edit mode

**Implementation Pattern**:
```typescript
const [isEditing, setIsEditing] = useState(false);

// View mode: Display data with <p>, <span> tags
// Edit mode: Display data with <Input>, <Select>, <Textarea> components
// Toggle: "Edit Profile" button sets isEditing=true
// Save: Submit form → API call → setIsEditing(false)
// Cancel: Reset form → setIsEditing(false)
```

**Alternatives Considered**:
- **Separate routes (/profile and /profile/edit)**: Rejected because it requires page navigation and adds routing complexity
- **Modal/dialog for editing**: Rejected because profile forms are too large for modal UX

## Profile Completion Notification

### Decision: Non-dismissible card on student dashboard with CTA button

**Chosen**: Persistent card component shown on dashboard when profile < 100%

**Rationale**:
- Persistent visibility ensures students see it on every login
- Card format allows for visual progress bar and detailed breakdown
- Non-dismissible prevents "dismiss and forget" behavior
- Direct CTA link to profile page improves conversion
- Matches LinkedIn pattern described in requirements

**Implementation**:
```typescript
// On StudentDashboard.tsx
{completion.percentage < 100 && (
  <ProfileCompletionCard
    percentage={completion.percentage}
    missingFields={completion.items.filter(i => !i.completed)}
    onComplete={() => navigate('/student/profile')}
  />
)}
```

**Alternatives Considered**:
- **Dismissible notification**: Rejected because it allows students to ignore it permanently
- **Modal popup**: Rejected because it's intrusive and annoying on repeat visits
- **Toast notification**: Rejected because it disappears and doesn't show detailed progress

## Congratulations on 100% Completion

### Decision: Success toast + visual badge on profile page

**Chosen**: Combination of transient and persistent celebration

**Rationale**:
- Toast notification provides immediate positive feedback upon save
- Persistent badge on profile page provides ongoing recognition
- Lightweight implementation (no animations/confetti needed for MVP)
- Can be enhanced later with animations if desired

**Implementation**:
```typescript
// After successful profile save
if (result.completion.percentage === 100) {
  toast.success('🎉 Congratulations! Your profile is 100% complete!');
}

// On profile page view mode
{completion.percentage === 100 && (
  <Badge variant="success">Profile Complete ✓</Badge>
)}
```

**Alternatives Considered**:
- **Confetti animation**: Considered but deferred as nice-to-have enhancement
- **Email notification**: Rejected as unnecessary for this milestone

## Validation Strategy

### Decision: Zod schema validation on backend, HTML5 validation on frontend

**Chosen**: Multi-layer validation with graceful error handling

**Rationale**:
- Zod already used in codebase for validation
- Frontend HTML5 validation provides immediate user feedback
- Backend validation prevents invalid data even if frontend bypassed
- Consistent with existing validation patterns in the codebase

**Validation Rules**:
- **dateOfBirth**: Must be valid past date, reasonable age range (13-120 years)
- **phoneNumber**: Allow international formats, basic pattern validation
- **aboutMe**: Max 1000 characters
- **spanishLevel**: Must be valid SpanishLevel enum value
- **preferredClassTypes**: Array of valid ClassType enum values
- **learningGoals**: Max 2000 characters
- **availabilityNotes**: Max 1000 characters

## Concurrency Handling

### Decision: Optimistic updates with last-write-wins

**Chosen**: Standard REST PUT semantics without pessimistic locking

**Rationale**:
- Profile edits are rare and unlikely to conflict
- Added complexity of optimistic locking (ETags, version fields) not justified
- User sessions are typically single-device
- If conflicts occur, last write wins is acceptable for profile data (no financial/critical data)

**Edge Case Handling**:
- If user has multiple tabs open and edits in both, last save wins
- No warning or conflict detection needed for MVP
- Can add ETag-based optimistic locking later if conflicts become problematic

**Alternatives Considered**:
- **Optimistic locking with version field**: Rejected as over-engineering for low-conflict scenario
- **Pessimistic locking**: Rejected as it adds unnecessary complexity and degrades UX

## Migration Strategy

### Decision: Nullable fields with zero-downtime deployment

**Chosen**: All new fields nullable, no data backfill required

**Rationale**:
- Existing users have no profile data initially (expected state)
- Nullable fields allow backward compatibility
- No service interruption during deployment
- Profile completion naturally starts at 0% for existing users

**Migration Steps**:
1. Add nullable fields to User model in Prisma schema
2. Generate and run migration: `prisma migrate dev --name add_student_profile_fields`
3. Deploy backend with updated endpoints (existing endpoints continue working)
4. Deploy frontend with new UI components
5. Existing users see 0% completion (correct state), new users start at 0% as well

**Rollback Plan**:
- Fields are nullable, so removing them is safe
- Can create rollback migration if needed
- No data loss risk

## Testing Strategy

### Decision: Comprehensive test coverage at unit, integration, and E2E levels

**Layers**:
1. **Unit Tests**: Profile completion calculation logic
2. **Integration Tests**: API endpoint behavior, database persistence
3. **E2E Tests**: Complete user flow from dashboard notification to 100% completion

**Test Cases Priority**:
- ✅ P0: Profile completion calculation accuracy for various field combinations
- ✅ P0: Profile save/retrieve with all fields populated
- ✅ P0: Profile save/retrieve with partial fields (null handling)
- ✅ P0: Dashboard shows completion card when < 100%
- ✅ P0: Dashboard hides completion card when = 100%
- ✅ P1: View/edit mode toggle preserves data
- ✅ P1: Cancel discards unsaved changes
- ✅ P1: Validation errors displayed correctly
- ✅ P2: Congratulations message on reaching 100%
- ✅ P2: Multiple-choice field (preferredClassTypes) saves correctly

**Tools**:
- Vitest for unit/integration tests
- Playwright for E2E tests
- Existing test infrastructure (already in package.json)

## Performance Considerations

### Decision: Eager loading with minimal optimization

**Chosen**: Load profile data on dashboard/profile page load, no caching layer

**Rationale**:
- Profile data is small (<5KB per user)
- Query is simple (SELECT by user ID, no joins)
- Expected load <2s with MySQL on reasonable hardware
- No need for Redis/caching layer for this use case
- Completion calculation is O(1) - checking 7 fields

**Monitoring**:
- Track API response times in production
- If >2s p95, consider adding Redis caching
- Likely unnecessary given small data size and simple queries

## API Design

### Decision: Extend existing GET/PUT /api/student/profile endpoints

**Chosen**: Add new fields to existing endpoints rather than creating new ones

**Rationale**:
- Backward compatible: Frontend can request new fields, backend returns them
- Existing endpoints already handle profile data structure
- Avoids API proliferation
- Simpler client code (single endpoint for all profile operations)

**Updated Contract**:
```typescript
// GET /api/student/profile
{
  "success": true,
  "data": {
    "profile": {
      // Existing fields
      "id": string,
      "email": string,
      "firstName": string,
      "lastName": string,
      "timezone": string,
      // NEW fields
      "dateOfBirth": string | null,
      "phoneNumber": string | null,
      "aboutMe": string | null,
      "spanishLevel": SpanishLevel | null,
      "preferredClassTypes": ClassType[] | null,
      "learningGoals": string | null,
      "availabilityNotes": string | null
    },
    "completion": {
      "percentage": number,
      "completedCount": number,
      "totalCount": number,
      "items": Array<{
        "field": string,
        "label": string,
        "completed": boolean
      }>
    }
  }
}
```

## Summary of Key Decisions

| Area | Decision | Rationale |
|------|----------|-----------|
| Database Schema | Extend User model | Simpler queries, 1:1 relationship, already established pattern |
| Completion Calculation | Equal-weight, backend-computed | Transparent, tamper-proof, simple formula |
| View/Edit Mode | Single-page toggle with React state | Better UX, common pattern, no routing complexity |
| Dashboard Notification | Non-dismissible card | Persistent visibility, detailed progress, direct CTA |
| Validation | Multi-layer (Zod + HTML5) | Defense in depth, immediate feedback, consistent with codebase |
| Concurrency | Last-write-wins | Conflicts unlikely, simpler implementation |
| Migration | Nullable fields, zero-downtime | Backward compatible, no data backfill needed |
| Testing | Unit + Integration + E2E | Comprehensive coverage, confidence in critical user flows |

## References

- Existing codebase: packages/backend/src/routes/student.ts (lines 36-119 show profile completion stub)
- Prisma schema: packages/backend/prisma/schema.prisma (User model definition)
- Shared types: packages/shared/src/types.ts (ProfileCompletion interface already defined)
- Frontend profile page: packages/frontend/src/pages/student/StudentProfilePage.tsx (existing implementation to refactor)
