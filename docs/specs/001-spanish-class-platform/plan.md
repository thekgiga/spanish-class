# Implementation Plan: Spanish Class Booking Platform

**Branch**: `001-spanish-class-platform` | **Date**: 2026-02-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-spanish-class-platform/spec.md`

**Status**: ⚠️ **ENHANCEMENT MODE** - Core platform exists, implementing spec-driven improvements
**Progress**: Phase 0 ✅ | Phase 1 ✅ | Phase 2 ⏭️

## Summary

The Spanish Class Booking Platform is a **mature TypeScript monorepo application** with substantial functionality already implemented. This plan focuses on **gap analysis and enhancements** to align with the comprehensive feature specification, particularly around:
- Race condition prevention (optimistic locking)
- Testing infrastructure (Vitest + Playwright)
- Email reminder scheduling (BullMQ integration)
- Frontend video integration (Jitsi React SDK)
- Enhanced timezone handling (date-fns-tz)

**Existing Capabilities** (90% complete):
✅ Full authentication with email verification
✅ Student booking and cancellation
✅ Professor availability management (one-time + recurring)
✅ Meeting room generation (Jitsi backend)
✅ Student profile tracking
✅ Professor notes on students
✅ Email notifications (Resend)
✅ Private invitations system

**Enhancement Focus** (this plan):
🔧 Concurrent booking protection
🔧 Comprehensive testing
🔧 Scheduled email reminders
🔧 Frontend video components
🔧 Timezone UI/UX refinements

## Technical Context

**Language/Version**: TypeScript 5.4+ (Node.js 18+)
**Primary Dependencies**:
- Frontend: React 18, Vite, TanStack Query, React Router, Radix UI, Tailwind CSS, Zustand
- Backend: Express 4, Prisma 5, bcryptjs, jsonwebtoken, Resend (email)
- Shared: Zod (validation schemas)
**Storage**: PostgreSQL via Prisma ORM
**Testing**: NEEDS CLARIFICATION (no test framework currently configured)
**Target Platform**: Web application (desktop and mobile browsers)
**Project Type**: Web (monorepo with backend/frontend/shared packages)
**Performance Goals**:
- Page loads < 3 seconds
- Booking completion < 3 minutes
- Video join < 30 seconds
- Support 50+ concurrent users
**Constraints**:
- API response time < 200ms (p95)
- 100% prevention of double-booking (race conditions)
- Video calls dependent on Jitsi service availability
- Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- Responsive design (mobile + desktop)
**Scale/Scope**:
- Initial: Small to medium scale (100s of users)
- 6 main user stories (3 P1, 2 P2, 1 P3)
- ~29 functional requirements across 5 domains

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

✅ **Project Structure**: Existing monorepo structure (backend/frontend/shared) aligns with web application architecture
✅ **Testing Requirement**: FLAGGED - No testing framework configured; must add before implementation
✅ **Technology Stack**: Consistent with existing dependencies (TypeScript, React, Express, Prisma)
✅ **Database**: Using existing PostgreSQL + Prisma setup
✅ **Simplicity**: Building on existing foundation; not introducing new architectural patterns
⚠️ **External Dependencies**: Jitsi integration is new external dependency - needs research for best practices

**Gate Status**: PASS (with testing framework requirement noted for Phase 0)

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
packages/
├── backend/
│   ├── src/
│   │   ├── index.ts              # Express app setup
│   │   ├── middleware/           # Auth, error handling
│   │   ├── routes/               # API endpoints
│   │   │   ├── auth.ts          # FR-001 to FR-005: Registration, login, logout
│   │   │   ├── bookings.ts      # FR-006 to FR-012: Student booking management
│   │   │   ├── availability.ts  # FR-013 to FR-017: Professor availability
│   │   │   ├── students.ts      # FR-018 to FR-021: Student records
│   │   │   └── video.ts         # FR-022 to FR-025: Jitsi integration
│   │   ├── services/            # Business logic
│   │   │   ├── booking.service.ts
│   │   │   ├── availability.service.ts
│   │   │   ├── notification.service.ts   # FR-026 to FR-029
│   │   │   └── video.service.ts
│   │   └── utils/
│   ├── prisma/
│   │   ├── schema.prisma        # Data model (to be extended)
│   │   ├── migrations/
│   │   └── seed.ts
│   └── tests/                   # To be created
│       ├── unit/
│       ├── integration/
│       └── e2e/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/           # Login, Register forms
│   │   │   ├── booking/        # Browse, Book, Cancel components
│   │   │   ├── availability/   # Professor schedule management
│   │   │   ├── students/       # Student records (professor view)
│   │   │   └── video/          # Jitsi embed component
│   │   ├── pages/
│   │   │   ├── student/        # Student dashboard, bookings, history
│   │   │   ├── professor/      # Professor dashboard, schedule, students
│   │   │   └── auth/           # Login, Register pages
│   │   ├── hooks/              # Custom React hooks
│   │   ├── services/           # API client functions
│   │   └── stores/             # Zustand state management
│   └── tests/                  # To be created
│       ├── unit/
│       └── e2e/
└── shared/
    ├── src/
    │   ├── types/              # TypeScript interfaces
    │   └── schemas/            # Zod validation schemas (shared)
    └── tests/                  # Schema validation tests
```

**Structure Decision**: Using existing npm workspaces monorepo with three packages (backend, frontend, shared). This aligns with the web application architecture pattern and reuses the current project setup.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations requiring justification. The project builds on the existing monorepo structure without introducing additional complexity.

---

## Phase 0: Research Findings

All "NEEDS CLARIFICATION" items from Technical Context have been resolved through parallel research agents.

### 1. Testing Framework (RESOLVED)

**Decision**: Vitest + Playwright

**Testing Package**: Vitest ^3.2.0 (unit/integration), Playwright ^1.50.0 (E2E)
- Vitest: 10-20x faster than Jest, native Vite integration, 95% Jest compatible
- Playwright: Multi-browser support, parallel execution, TypeScript-first
- Coverage: @vitest/coverage-v8 with 80% minimum threshold

**Implementation**: Per-package Vitest configs for Turbo caching, mock Resend API in tests

### 2. Jitsi Video Integration (RESOLVED)

**Decision**: Jitsi React SDK (@jitsi/react-sdk) with backend-enforced access control

**Integration Strategy**:
- Use existing meeting-provider.ts and meeting-access.ts services
- Cryptographically secure room names (64-bit entropy): `spanish-{bookingId}-{randomHash}`
- Access validation: time-window (15 min before, 30 min after) + role-based auth
- Fallback: Direct link if embedded meeting fails, availability check before rendering

**Security**: Backend enforcement (not JWT) since using public meet.jit.si instance

### 3. Double-Booking Prevention (RESOLVED)

**Decision**: Optimistic locking with version field + retry logic

**Concurrency Pattern**:
- Add `version Int @default(0)` field to AvailabilitySlot
- Use `updateMany` with version check in transaction
- Retry up to 3 times with exponential backoff (10ms, 20ms, 40ms)
- Atomic `increment` operations for currentParticipants
- Test with `Promise.allSettled` to simulate concurrent booking attempts

**Alternative Rejected**: Pessimistic locking (lower throughput, requires raw SQL)

### 4. Email Notifications (RESOLVED)

**Decision**: React Email templates + BullMQ queue + Resend

**Email Architecture**:
- Immediate (confirmations/cancellations): Fire-and-forget pattern, don't block HTTP response
- Scheduled (2-hour reminders): BullMQ + Redis with delayed jobs
- Templates: React Email components with TypeScript interfaces
- Retry: Exponential backoff for transient failures only

**Dependencies**: resend ^3.5.0, @react-email/components, bullmq, ioredis

**Testing**: Mock Resend API in unit tests, use test addresses in integration tests

### 5. Timezone Handling (RESOLVED)

**Decision**: Store UTC in database, convert to user timezone with date-fns-tz

**Timezone Strategy**:
- Database: All DateTime fields store UTC (convert in app layer before saving)
- User model: Store IANA timezone identifier (e.g., "America/Los_Angeles")
- Frontend: Install date-fns-tz, use `formatInTimeZone()` for display
- Input: Use `zonedTimeToUtc()` to convert local time to UTC
- DST: Validate slots aren't in DST gaps, store clock times for recurring patterns

**UX**: Auto-detect timezone, show abbreviations (PST, CET), display dual times when users differ

### 6. Recurring Availability (RESOLVED)

**Decision**: Enhanced pre-generation with rolling window (keep current approach)

**Recurring Pattern Strategy**:
- Pre-generate slots 4 weeks ahead (existing implementation ✓)
- Add `exceptionDates` JSON field to RecurringPattern for skip dates
- Add `isRecurringException` and `overridesRecurringSlot` booleans to AvailabilitySlot
- Nightly cron job maintains rolling window
- Conflict detection checks overlapping patterns and one-off slots

**Pattern Modifications**: Detach future instances, cancel based on strategy (all/unbooked/none), regenerate

**Performance**: Use `createMany` with `skipDuplicates: true`, add indexes on `[professorId, startTime, status]`

---

---

## Phase 0.5: Google Services Cleanup (REQUIRED BEFORE IMPLEMENTATION)

### Issue Identified
The codebase contains **stub implementations** for Google Calendar integration that are not being used and conflict with the Jitsi-only video strategy.

### Google References Found:

**Backend Files to Clean:**
1. `/packages/backend/src/services/google.ts` - **DELETE ENTIRE FILE** (stub only)
2. `/packages/backend/src/routes/professor.ts` - Remove imports and calls
3. `/packages/backend/src/routes/professor.ts.backup` - **DELETE BACKUP FILE**
4. `/packages/backend/src/services/booking.ts` - Remove Google Calendar calls
5. `/packages/backend/src/services/private-invitation.ts` - Remove Google Calendar calls
6. `/packages/backend/src/services/meeting-provider.ts` - Ensure only Jitsi references

**Frontend Files to Clean:**
1. `/packages/frontend/src/pages/admin/NewSlotPage.tsx.bak` - **DELETE BACKUP FILE**
2. Check for any `googleMeetLink` references in UI

**Code References to Remove:**
- `import { debugCalendarConnection, createBookedSessionEvent, deleteBookedSessionEvent } from "../services/google.js"`
- All calls to `createBookedSessionEvent()`
- All calls to `deleteBookedSessionEvent()`
- `/api/professor/debug/calendar` endpoint
- `bookedCalendarEventId` field references (code uses it but schema doesn't have it)
- `googleMeetLink` parameter in meeting functions (replace with Jitsi meeting URL)

### Replacement Strategy:

**Before (Google Calendar):**
```typescript
createBookedSessionEvent({
  booking: { id: booking.id },
  slot: {
    googleMeetLink: meetingUrl,
    // ... other fields
  },
  // ...
});

// Later: store eventId
data: { bookedCalendarEventId: calendarResult.eventId }
```

**After (Jitsi Only):**
```typescript
// No calendar event creation needed
// Meeting URL is already stored in slot.meetingRoomName
// Use getMeetingProvider().getJoinUrl(slot.meetingRoomName)
```

### Files to Delete:
- ❌ `/packages/backend/src/services/google.ts`
- ❌ `/packages/backend/src/routes/professor.ts.backup`
- ❌ `/packages/frontend/src/pages/admin/NewSlotPage.tsx.bak`
- ❌ `/packages/frontend/src/pages/public/HomePage.tsx.bak`

### Files to Modify:
- 🔧 `/packages/backend/src/routes/professor.ts` - Remove Google imports and calls (6 locations)
- 🔧 `/packages/backend/src/services/booking.ts` - Remove Google Calendar calls (3 locations)
- 🔧 `/packages/backend/src/services/private-invitation.ts` - Remove Google Calendar calls (1 location)

**Verification:** After cleanup, search for `google` (case-insensitive) should only find:
- Comments/documentation referencing "Google Calendar" as a future integration
- No actual code imports or function calls

---

## Phase 1: Data Model & Contracts

### Existing Implementation Analysis

**Database Schema** (`packages/backend/prisma/schema.prisma`):
✅ User model with timezone, email verification fields
✅ AvailabilitySlot model with slotType, status, privacy, meeting links
✅ RecurringPattern model with daysOfWeek, isActive
✅ Booking model with status enum (CONFIRMED, CANCELLED_BY_STUDENT, CANCELLED_BY_PROFESSOR, COMPLETED, NO_SHOW)
✅ StudentNote model for professor notes
✅ SlotAllowedStudent for private slot access control
✅ EmailLog model for email tracking
✅ Proper indexes on frequently queried fields

**API Routes** (`packages/backend/src/routes/`):
✅ auth.ts: register, login, logout, verify-email, profile update
✅ student.ts: dashboard, browse slots, bookings CRUD, cancellation, meeting join/details
✅ professor.ts: dashboard, slots CRUD, bulk slots, recurring patterns, student management, notes CRUD, private invitations

**Frontend Pages** (`packages/frontend/src/pages/`):
✅ Auth: Login, Register
✅ Student: Dashboard, Book, Bookings, Profile
✅ Admin/Professor: Dashboard, Slots, Students, Calendar, Email Logs, Bulk Slots, Student Detail

### Gaps Identified from Spec Requirements

#### Missing Schema Fields (for Phase 1 Enhancements):

**User Model Additions** (for student profiles - FR-018 to FR-021):
- ✅ Already has: `dateOfBirth`, `phoneNumber`, `aboutMe`, `spanishLevel`, `preferredClassTypes`, `learningGoals`, `availabilityNotes`
- Need to add:
  - `isEmailVerified Boolean @default(false)` (already present)
  - `emailVerificationToken String? @unique` (already present)
  - `emailVerificationExpiresAt DateTime?` (already present)

**AvailabilitySlot Model Enhancements** (from research findings):
- ❌ Missing: `version Int @default(0)` - for optimistic locking (FR-009)
- ❌ Missing: `isRecurringException Boolean @default(false)` - mark exceptional recurring slots
- ❌ Missing: `overridesRecurringSlot Boolean @default(false)` - one-time modifications
- ✅ Has: `meetLink String?` but should add `meetingRoomName String?` for Jitsi room identifier
- ⚠️ **REMOVE**: Google Calendar references (stubs only, not used)

**RecurringPattern Model Enhancements**:
- ❌ Missing: `exceptionDates String? @db.Text` - JSON array of dates to skip

**Booking Model**:
- ⚠️ **REMOVE**: `bookedCalendarEventId` references from code (Google Calendar not used)

#### Missing API Endpoints (from Functional Requirements):

**Email Notifications** (FR-026 to FR-029):
- ❌ Missing: Scheduled reminder system (2 hours before class)
- ⚠️ Partial: Email service exists but not BullMQ queue integration

**Video Call Integration** (FR-022 to FR-025):
- ✅ Has: `/api/student/slots/:id/join` - validate access
- ✅ Has: `/api/student/slots/:id/meeting` - get meeting details
- ❌ Missing: Jitsi React SDK frontend component
- ✅ Has: Backend meeting-provider.ts service

**Student Booking History** (FR-012):
- ✅ Has: `/api/student/bookings?status=COMPLETED` endpoint exists

**Testing Infrastructure** (from research):
- ❌ Missing: Vitest configuration
- ❌ Missing: Playwright configuration
- ❌ Missing: Test files structure

### Required Schema Migrations

```prisma
// Migration 1: Add concurrency control and Jitsi-only meeting fields
model AvailabilitySlot {
  // ... existing fields
  version                Int      @default(0)
  isRecurringException   Boolean  @default(false) @map("is_recurring_exception")
  overridesRecurringSlot Boolean  @default(false) @map("overrides_recurring_slot")
  meetingRoomName        String?  @map("meeting_room_name")  // Jitsi room name
  // REMOVED: googleMeetLink - using Jitsi only
}

// Migration 2: Add recurring pattern exceptions
model RecurringPattern {
  // ... existing fields
  exceptionDates String? @map("exception_dates") @db.Text
}

// NO Migration 3: Removed bookedCalendarEventId (Google Calendar not used)
```

### API Contract Enhancements Needed

**New Endpoints to Add**:
1. `POST /api/professor/recurring-patterns/:id/exceptions` - Add exception date
2. `PATCH /api/professor/slots/:id/override` - One-time modify recurring instance
3. `GET /api/professor/recurring-patterns/:id/conflicts` - Preview conflicts

**Existing Endpoints to Enhance**:
1. Update booking creation to use optimistic locking with retry
2. Add Jitsi SDK configuration endpoint
3. Implement reminder scheduling when booking created

### Data Model Summary

The existing data model is **very mature** and covers 90% of spec requirements. Key additions needed:

1. **Concurrency Control**: Add `version` field to AvailabilitySlot
2. **Recurring Enhancements**: Add `exceptionDates` to RecurringPattern, flags to AvailabilitySlot
3. **Schema Alignment**: Add missing fields that code references (`googleMeetLink`, `bookedCalendarEventId`)
4. **Testing Infrastructure**: Configure Vitest, Playwright per research findings

### Contracts Directory Structure

```
specs/001-spanish-class-platform/contracts/
├── openapi.yaml               # Full API specification
├── schemas/
│   ├── user.schema.json
│   ├── slot.schema.json
│   ├── booking.schema.json
│   ├── recurring-pattern.schema.json
│   └── student-note.schema.json
└── sequences/
    ├── book-slot.sequence.md
    ├── cancel-booking.sequence.md
    └── join-meeting.sequence.md
```

---

---

## Developer Quickstart (Phase 1 Output)

### Current State Overview

The Spanish Class Booking Platform is **already substantially built** with:
- Complete authentication system (registration, login, email verification)
- Full professor dashboard with availability management
- Student booking and browsing functionality
- Recurring pattern system with 4-week pre-generation
- Private invitations and slot access control
- Student profile tracking
- Email notifications via Resend
- Meeting integration scaffolding (Jitsi room generation)

### What Needs Enhancement

Based on spec requirements vs current implementation:

**1. Concurrency & Race Conditions** (HIGH PRIORITY)
- Add `version` field to AvailabilitySlot for optimistic locking
- Implement retry logic in booking service
- Add concurrent booking tests

**2. Testing Infrastructure** (HIGH PRIORITY)
- Configure Vitest for unit/integration tests
- Set up Playwright for E2E tests
- Add test files structure per package

**3. Email Reminders** (MEDIUM PRIORITY)
- Install BullMQ + Redis
- Create reminder queue service
- Schedule reminders when bookings created
- Cancel jobs when bookings cancelled

**4. Jitsi Frontend Integration** (MEDIUM PRIORITY)
- Install `@jitsi/react-sdk`
- Create `<JitsiMeeting />` component
- Add to student/professor booking detail pages
- Implement fallback strategies

**5. Timezone Display** (LOW PRIORITY - backend ready)
- Install `date-fns-tz` in frontend
- Create `<TimeDisplay />` component
- Show dual timezones when users differ
- Add timezone validation for DST gaps

**6. Recurring Pattern Enhancements** (LOW PRIORITY)
- Add `exceptionDates` field to RecurringPattern
- Implement exception management UI
- Add one-time override capability

### Technology Stack (Current)

**Backend:**
- Node.js 18+, TypeScript 5.4
- Express 4.19
- Prisma 5.14 + MySQL
- bcryptjs, jsonwebtoken (auth)
- Resend (email)

**Frontend:**
- React 18, Vite 5
- TanStack Query 5
- React Router 6
- Radix UI components
- Tailwind CSS
- Zustand (state)
- date-fns 3.6

**DevOps:**
- Turbo (monorepo)
- npm workspaces

### Quick Setup

```bash
# Install dependencies
npm install

# Configure environment
cp packages/backend/.env.example packages/backend/.env
# Edit .env with DATABASE_URL, JWT_SECRET, RESEND_API_KEY

# Database setup
npm run db:push
npm run db:seed

# Start development
npm run dev
```

### Key Files to Understand

**Backend Services:**
- `/packages/backend/src/services/booking.ts` - Core booking logic (needs optimistic locking)
- `/packages/backend/src/services/meeting-provider.ts` - Jitsi integration
- `/packages/backend/src/services/email.ts` - Email templates (needs BullMQ)
- `/packages/backend/src/middleware/auth.ts` - JWT authentication

**Frontend Services:**
- `/packages/frontend/src/services/api.ts` - API client
- `/packages/frontend/src/services/studentApi.ts` - Student endpoints
- `/packages/frontend/src/services/professorApi.ts` - Professor endpoints

**Database Schema:**
- `/packages/backend/prisma/schema.prisma` - Complete data model

### Next Steps for Developers

1. Review this plan document thoroughly
2. Check Phase 1 gap analysis to understand what's missing
3. Choose a high-priority enhancement to work on
4. Follow TDD workflow from research findings
5. Use existing patterns (booking.ts is a good reference)

---

---

## API Contracts Overview (Phase 1)

### Authentication Endpoints (✅ Complete)
```
POST   /api/auth/register           - Create new user account
POST   /api/auth/login              - Authenticate and get JWT
GET    /api/auth/me                 - Get current user
POST   /api/auth/logout             - Clear session
POST   /api/auth/verify-email       - Verify email with token
POST   /api/auth/resend-verification - Resend verification email
PUT    /api/auth/profile            - Update user profile
```

### Student Endpoints (✅ Complete, ⚠️ Enhancement needed)
```
GET    /api/student/dashboard       - Get dashboard stats
GET    /api/student/professor       - Get professor contact
GET    /api/student/slots           - Browse available slots (with filters)
POST   /api/student/bookings        - Book a slot ⚠️ needs optimistic locking
GET    /api/student/bookings        - List student's bookings
GET    /api/student/bookings/:id    - Get booking details
POST   /api/student/bookings/:id/cancel - Cancel booking
POST   /api/student/slots/:id/join  - Validate meeting access ✅
GET    /api/student/slots/:id/meeting - Get meeting details ✅
GET    /api/student/profile         - Get profile with completion %
PUT    /api/student/profile         - Update student profile
```

### Professor Endpoints (✅ Complete, ⚠️ Enhancement needed)
```
GET    /api/professor/dashboard     - Dashboard stats
GET    /api/professor/slots         - List professor's slots
POST   /api/professor/slots         - Create single slot
POST   /api/professor/slots/bulk    - Bulk create slots
GET    /api/professor/slots/:id     - Get slot details
PUT    /api/professor/slots/:id     - Update slot
DELETE /api/professor/slots/:id     - Cancel slot (no bookings)
POST   /api/professor/slots/:id/cancel-with-bookings - Cancel with notifications

POST   /api/professor/recurring-patterns - Create recurring pattern ✅
GET    /api/professor/recurring-patterns - List patterns
DELETE /api/professor/recurring-patterns/:id - Deactivate pattern
🔧 POST   /api/professor/recurring-patterns/:id/exceptions - Add exception (to implement)
🔧 PATCH  /api/professor/slots/:id/override - Override recurring instance (to implement)

GET    /api/professor/students      - List all students
GET    /api/professor/students/:id  - Get student details + profile
GET    /api/professor/students/:id/notes - Get student notes
POST   /api/professor/students/:id/notes - Create note
PUT    /api/professor/students/:studentId/notes/:noteId - Update note
DELETE /api/professor/students/:studentId/notes/:noteId - Delete note

POST   /api/professor/book-student  - Professor-initiated booking
POST   /api/professor/private-invitations - Create private invitation
GET    /api/professor/private-invitations - List invitations
DELETE /api/professor/private-invitations/:id - Cancel invitation

GET    /api/professor/email-logs    - View email logs
POST   /api/professor/slots/:id/join - Validate meeting access ✅
GET    /api/professor/slots/:id/meeting - Get meeting details ✅
```

### Request/Response Patterns

**Standard Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

**Pagination Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

**Error Response:**
```json
{
  "error": "Error message",
  "statusCode": 400,
  "details": { ... } // Optional
}
```

---

---

## Phase 2: Implementation Tasks ✅

**Total Tasks**: 22 tasks created (Task #7 - #28)
**Status**: Ready for execution
**Tracking**: Use `/tasks` command to view task list and status

### Task Execution Order

**Phase 0: Google Cleanup (MUST DO FIRST)**
- Task #7: Delete Google Calendar stub files
- Task #8: Remove Google Calendar imports from professor routes
- Task #9: Remove Google Calendar calls from booking service
- Task #10: Remove Google Calendar calls from private invitation service
- Task #11: Verify Google removal and update documentation

**Phase 1: Foundation (Can run in parallel after Google cleanup)**
- Task #15: Configure Vitest for backend and frontend
- Task #18: Install React Email for email templates (independent)
- Task #19: Install Jitsi React SDK in frontend (independent)
- Task #21: Install date-fns-tz for timezone handling (independent)
- Task #28: Create quickstart guide for new developers (independent)

**Phase 2: Database & Core (After Phase 0 complete)**
- Task #12: Add database migration for concurrency control [blocked by #7-11]
- Task #13: Implement optimistic locking in booking service [blocked by #12]
- Task #16: Configure Playwright for E2E testing [blocked by #15]
- Task #17: Install and configure BullMQ for email reminders [blocked by #15]

**Phase 3: Features (After dependencies ready)**
- Task #20: Integrate Jitsi component into booking pages [blocked by #19]
- Task #22: Add timezone display to booking interfaces [blocked by #21]
- Task #23: Add recurring pattern exception management [blocked by #12]
- Task #24: Add one-time recurring slot override [blocked by #12]

**Phase 4: Testing & Polish**
- Task #14: Add concurrent booking tests [blocked by #13, #15]
- Task #25: Write E2E test for complete booking flow [blocked by #16, #20]
- Task #26: Document testing strategy in README [blocked by #15, #16]
- Task #27: Add Redis and BullMQ to deployment documentation [blocked by #17]

### Priority Levels

**🔴 Critical (Must complete first):**
- Tasks #7-11: Google cleanup (blocks database migration)
- Task #12: Database migration (blocks concurrency and recurring features)
- Task #13: Optimistic locking (prevents double-booking - HIGH PRIORITY)
- Task #15: Vitest setup (enables testing for all other work)

**🟡 High Priority:**
- Task #17: BullMQ setup (enables email reminders - spec requirement)
- Task #19: Jitsi SDK (enables video integration - spec requirement)
- Task #16: Playwright setup (enables E2E testing)

**🟢 Medium Priority:**
- Tasks #18, #20-22: Email templates, video UI, timezone display
- Task #14: Concurrent booking tests

**🔵 Low Priority:**
- Tasks #23-24: Recurring pattern enhancements
- Tasks #26-28: Documentation updates

### Success Criteria

Implementation complete when:
- ✅ All Google Calendar references removed
- ✅ Database migration applied with new fields
- ✅ Optimistic locking prevents race conditions (verified by tests)
- ✅ Vitest + Playwright configured and running
- ✅ BullMQ queue scheduling email reminders
- ✅ Jitsi video component integrated in student/professor booking pages
- ✅ Timezone display working with date-fns-tz
- ✅ Concurrent booking tests passing
- ✅ E2E booking flow test passing
- ✅ Documentation updated (README, deployment guides)

---

## Next Steps

1. **Review the plan**: Ensure you understand the cleanup strategy and implementation roadmap
2. **Start with Google cleanup** (Tasks #7-11): This is blocking other work
3. **Run tasks in dependency order**: Check task list with `/tasks` command
4. **Follow TDD workflow**: Write tests before implementation where applicable
5. **Request code review**: After completing major features

The platform is well-architected and 90% complete. These enhancements add robustness, testing, and complete the video integration as specified.
