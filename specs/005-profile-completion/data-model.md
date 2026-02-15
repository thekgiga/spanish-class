# Data Model: Student Profile Completion

**Feature**: 005-profile-completion
**Date**: 2026-02-15
**Status**: Complete

## Overview

This document defines the data model changes required for the profile completion feature. The primary change is extending the existing `User` model with additional profile fields.

## Entity: User (Extended)

### Description
The User model represents all system users (students and professors). This feature extends it with student-specific profile fields that enable personalized learning experiences.

### Schema Changes

```prisma
model User {
  // === EXISTING FIELDS (unchanged) ===
  id                 String   @id @default(cuid())
  email              String   @unique
  passwordHash       String   @map("password_hash")
  firstName          String   @map("first_name")
  lastName           String   @map("last_name")
  isAdmin            Boolean  @default(false) @map("is_admin")
  timezone           String   @default("Europe/Madrid")
  languagePreference String?  @default("en") @map("language_preference")
  createdAt          DateTime @default(now()) @map("created_at")
  updatedAt          DateTime @updatedAt @map("updated_at")

  // === NEW FIELDS (student profile) ===
  dateOfBirth         DateTime? @map("date_of_birth") @db.Date
  phoneNumber         String?   @map("phone_number") @db.VarChar(50)
  aboutMe             String?   @map("about_me") @db.Text
  spanishLevel        String?   @map("spanish_level") @db.VarChar(50)
  preferredClassTypes String?   @map("preferred_class_types") @db.Text // JSON array
  learningGoals       String?   @map("learning_goals") @db.Text
  availabilityNotes   String?   @map("availability_notes") @db.Text

  // === EXISTING RELATIONS (unchanged) ===
  slots                    AvailabilitySlot[]
  bookings                 Booking[]
  notesWritten             StudentNote[]      @relation("NotesWritten")
  notesReceived            StudentNote[]      @relation("NotesReceived")
  allowedSlots             SlotAllowedStudent[]
  recurringPatterns        RecurringPattern[]
  allowedRecurringPatterns RecurringPatternAllowedStudent[]
  customPricing            StudentPricing[]   @relation("CustomPricing")
  referralsGiven           Referral[]         @relation("ReferralsGiven")
  referralsReceived        Referral[]         @relation("ReferralsReceived")
  ratingsGiven             Rating[]           @relation("RatingsGiven")
  ratingsReceived          Rating[]           @relation("RatingsReceived")

  @@map("users")
}
```

### Field Definitions

| Field Name | Type | Nullable | Description | Validation Rules |
|------------|------|----------|-------------|------------------|
| `dateOfBirth` | DateTime (Date) | Yes | Student's date of birth | Must be past date; reasonable age range (13-120 years from today) |
| `phoneNumber` | String (VARCHAR 50) | Yes | Contact phone number | Max 50 chars; allow international formats; basic pattern validation |
| `aboutMe` | String (TEXT) | Yes | Student's self-description and background | Max 1000 characters |
| `spanishLevel` | String (VARCHAR 50) | Yes | Current Spanish proficiency level | Must be valid SpanishLevel enum value (BEGINNER, ELEMENTARY, INTERMEDIATE, UPPER_INTERMEDIATE, ADVANCED, NATIVE) |
| `preferredClassTypes` | String (TEXT) | Yes | JSON array of preferred class types | Must be valid JSON array of ClassType enum values; stored as string "[\"PRIVATE_LESSONS\",\"GRAMMAR_FOCUS\"]" |
| `learningGoals` | String (TEXT) | Yes | Student's learning objectives | Max 2000 characters |
| `availabilityNotes` | String (TEXT) | Yes | Scheduling preferences and constraints | Max 1000 characters |

### Indexes

No additional indexes required. Existing primary key index on `id` is sufficient for profile queries (always by user ID).

### Migration

**Migration Name**: `add_student_profile_fields`

**Up Migration** (SQL):
```sql
ALTER TABLE `users`
  ADD COLUMN `date_of_birth` DATE NULL,
  ADD COLUMN `phone_number` VARCHAR(50) NULL,
  ADD COLUMN `about_me` TEXT NULL,
  ADD COLUMN `spanish_level` VARCHAR(50) NULL,
  ADD COLUMN `preferred_class_types` TEXT NULL,
  ADD COLUMN `learning_goals` TEXT NULL,
  ADD COLUMN `availability_notes` TEXT NULL;
```

**Down Migration** (SQL):
```sql
ALTER TABLE `users`
  DROP COLUMN `date_of_birth`,
  DROP COLUMN `phone_number`,
  DROP COLUMN `about_me`,
  DROP COLUMN `spanish_level`,
  DROP COLUMN `preferred_class_types`,
  DROP COLUMN `learning_goals`,
  DROP COLUMN `availability_notes`;
```

**Safety**:
- All fields are nullable → no data required for existing records
- No foreign keys → no referential integrity constraints to worry about
- Column additions are safe in MySQL → no table locks on InnoDB
- Rollback is safe → dropping nullable columns with no data doesn't affect existing functionality

## Entity: ProfileCompletion (Virtual)

### Description
ProfileCompletion is a virtual entity (not stored in database) that represents the calculated completeness of a student's profile. It is computed on-demand by the backend service.

### Structure

```typescript
interface ProfileCompletion {
  percentage: number;          // 0-100, rounded to nearest integer
  completedCount: number;      // Number of fields filled (0-7)
  totalCount: number;          // Total trackable fields (always 7)
  items: ProfileCompletionItem[];
}

interface ProfileCompletionItem {
  field: string;               // Field name (e.g., "dateOfBirth")
  label: string;               // User-friendly label (e.g., "Date of Birth")
  completed: boolean;          // Whether this field is filled
}
```

### Calculation Logic

**Source Fields** (7 total):
1. `dateOfBirth`
2. `phoneNumber`
3. `aboutMe`
4. `spanishLevel`
5. `preferredClassTypes`
6. `learningGoals`
7. `availabilityNotes`

**Excluded Fields** (required at registration, not counted):
- `firstName`
- `lastName`
- `email`

**Formula**:
```typescript
const fields = [
  { field: 'dateOfBirth', label: 'Date of Birth', value: user.dateOfBirth },
  { field: 'phoneNumber', label: 'Phone Number', value: user.phoneNumber },
  { field: 'aboutMe', label: 'About Me', value: user.aboutMe },
  { field: 'spanishLevel', label: 'Spanish Level', value: user.spanishLevel },
  { field: 'preferredClassTypes', label: 'Preferred Class Types', value: user.preferredClassTypes },
  { field: 'learningGoals', label: 'Learning Goals', value: user.learningGoals },
  { field: 'availabilityNotes', label: 'Availability Notes', value: user.availabilityNotes },
];

const items = fields.map(f => ({
  field: f.field,
  label: f.label,
  completed: isFieldFilled(f.value),
}));

const completedCount = items.filter(i => i.completed).length;
const percentage = Math.round((completedCount / 7) * 100);

function isFieldFilled(value: any): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string' && value.trim() === '') return false;
  if (Array.isArray(value) && value.length === 0) return false;
  return true;
}
```

## Enums

### SpanishLevel

Already defined in shared package (`packages/shared/src/types.ts`):

```typescript
enum SpanishLevel {
  BEGINNER = 'BEGINNER',           // A1
  ELEMENTARY = 'ELEMENTARY',       // A2
  INTERMEDIATE = 'INTERMEDIATE',   // B1
  UPPER_INTERMEDIATE = 'UPPER_INTERMEDIATE', // B2
  ADVANCED = 'ADVANCED',           // C1
  NATIVE = 'NATIVE',               // C2
}
```

### ClassType

Already defined in shared package (`packages/shared/src/types.ts`):

```typescript
enum ClassType {
  PRIVATE_LESSONS = 'PRIVATE_LESSONS',
  GROUP_CLASSES = 'GROUP_CLASSES',
  CONVERSATION_PRACTICE = 'CONVERSATION_PRACTICE',
  EXAM_PREPARATION = 'EXAM_PREPARATION',
  BUSINESS_SPANISH = 'BUSINESS_SPANISH',
  GRAMMAR_FOCUS = 'GRAMMAR_FOCUS',
  PRONUNCIATION = 'PRONUNCIATION',
  WRITING_SKILLS = 'WRITING_SKILLS',
}
```

## Validation Constraints

### Backend Validation (Zod Schema)

Extend existing `updateStudentProfileSchema` in `packages/shared/src/schemas.ts`:

```typescript
export const updateStudentProfileSchema = z.object({
  dateOfBirth: z.string().datetime().nullable().optional()
    .refine(val => {
      if (!val) return true;
      const date = new Date(val);
      const age = (Date.now() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
      return age >= 13 && age <= 120;
    }, { message: "Age must be between 13 and 120 years" }),

  phoneNumber: z.string().max(50).nullable().optional(),

  aboutMe: z.string().max(1000).nullable().optional(),

  spanishLevel: z.enum([
    'BEGINNER',
    'ELEMENTARY',
    'INTERMEDIATE',
    'UPPER_INTERMEDIATE',
    'ADVANCED',
    'NATIVE',
  ]).nullable().optional(),

  preferredClassTypes: z.array(z.enum([
    'PRIVATE_LESSONS',
    'GROUP_CLASSES',
    'CONVERSATION_PRACTICE',
    'EXAM_PREPARATION',
    'BUSINESS_SPANISH',
    'GRAMMAR_FOCUS',
    'PRONUNCIATION',
    'WRITING_SKILLS',
  ])).nullable().optional(),

  learningGoals: z.string().max(2000).nullable().optional(),

  availabilityNotes: z.string().max(1000).nullable().optional(),
});
```

### Frontend Validation (HTML5)

- **dateOfBirth**: `<input type="date" max={today}>`
- **phoneNumber**: `<input type="tel" maxLength={50}>`
- **aboutMe**: `<textarea maxLength={1000}>`
- **spanishLevel**: `<select>` with predefined options
- **preferredClassTypes**: Multiple checkbox selection
- **learningGoals**: `<textarea maxLength={2000}>`
- **availabilityNotes**: `<textarea maxLength={1000}>`

## State Transitions

Profile completion percentage transitions based on field updates:

```
Initial State: 0% (all fields null)
  ↓
User fills 1 field: ~14% (1/7)
  ↓
User fills 2 fields: ~29% (2/7)
  ↓
User fills 3 fields: ~43% (3/7)
  ↓
User fills 4 fields: ~57% (4/7)
  ↓
User fills 5 fields: ~71% (5/7)
  ↓
User fills 6 fields: ~86% (6/7)
  ↓
User fills all 7 fields: 100%
  ↓
Congratulations message displayed
```

**Bidirectional**: Users can remove data (clear fields), which decreases percentage.

## Data Flow

```
User submits profile form
  ↓
Frontend validates (HTML5 + React Hook Form)
  ↓
PUT /api/student/profile with updated fields
  ↓
Backend validates (Zod schema)
  ↓
Prisma updates User record (only modified fields)
  ↓
Backend calculates ProfileCompletion
  ↓
Response includes { profile, completion }
  ↓
Frontend updates UI:
  - Profile page shows updated data
  - Dashboard completion card updates
  - If 100%, show congratulations toast
```

## Backward Compatibility

- **Existing users**: All new fields are null → profile completion starts at 0% (expected behavior)
- **Existing API clients**: Endpoints return superset of data (new fields added); old clients ignore unknown fields
- **Database**: Nullable columns can be added without affecting existing queries
- **Rollback**: Can drop columns without data loss (all fields optional)

## Performance Considerations

- **Query performance**: SELECT by user ID with 7 additional columns → negligible impact (<1ms)
- **Completion calculation**: O(1) operation checking 7 fields → <1ms
- **Storage**: ~2-5KB additional data per user (text fields) → acceptable for 500-1000 users

## Testing Scenarios

### Unit Tests (Profile Completion Calculation)
1. All fields null → 0%
2. One field filled → ~14%
3. All fields filled → 100%
4. Empty string counts as unfilled
5. Empty array counts as unfilled
6. Whitespace-only string counts as unfilled

### Integration Tests (API)
1. Create profile with all fields → verify stored correctly
2. Update profile with partial data → verify only modified fields updated
3. Retrieve profile → verify completion calculated correctly
4. Invalid data (bad enum, over-length) → verify validation errors

### E2E Tests (User Flow)
1. Dashboard shows completion card at <100%
2. Click card → navigates to profile page
3. Fill all fields → save → verify 100% and congratulations message
4. Refresh page → verify data persisted
5. Dashboard no longer shows completion card (or shows "complete" badge)
