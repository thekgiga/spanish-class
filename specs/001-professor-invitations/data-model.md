# Data Model: Professor-Initiated Private Invitations

**Feature**: 001-professor-invitations
**Date**: 2026-02-14
**Status**: Design Complete

## Schema Changes

### Option 1: Minimal Changes (RECOMMENDED)

**Status**: Use existing schema with no migrations

**Rationale**: The current Prisma schema already supports private invitations:
- `AvailabilitySlot.isPrivate` boolean flag
- `SlotAllowedStudent` junction table for access control
- `BookingStatus.CONFIRMED` for auto-confirmed bookings

**Usage Pattern**:
```typescript
// Create private invitation
const slot = await prisma.availabilitySlot.create({
  data: {
    professorId,
    startTime,
    endTime,
    isPrivate: true,  // Key flag
    maxParticipants: 1,
    status: 'AVAILABLE',
    allowedStudents: {
      create: { studentId }  // Only this student can see/book
    }
  }
});

// Auto-create confirmed booking
const booking = await prisma.booking.create({
  data: {
    slotId: slot.id,
    studentId,
    status: 'CONFIRMED'  // Skip PENDING
  }
});
```

### Option 2: Add Booking Source Tracking (OPTIONAL)

**Migration**:
```prisma
enum BookingSource {
  STUDENT_INITIATED
  PROFESSOR_INVITED
}

model Booking {
  // ... existing fields
  source BookingSource @default(STUDENT_INITIATED)
}
```

**Benefits**: Analytics, reporting, different cancellation policies
**Cost**: Migration required, added complexity
**Decision**: DEFER until analytics requirements are clear

## Entity Relationships

```
User (Professor)
  ↓ (1:N)
AvailabilitySlot (isPrivate=true)
  ↓ (1:N)
SlotAllowedStudent ←→ User (Student)
  ↓ (1:N)
Booking (status=CONFIRMED)
  ↓ (N:1)
User (Student)
```

## Key Queries

### Professor: List Private Invitations

```typescript
const privateInvitations = await prisma.availabilitySlot.findMany({
  where: {
    professorId: req.user.id,
    isPrivate: true,
    startTime: { gte: new Date() }
  },
  include: {
    allowedStudents: {
      include: { student: { select: { id: true, firstName: true, lastName: true, email: true }}}
    },
    bookings: {
      where: { status: { in: ['CONFIRMED', 'COMPLETED'] }},
      include: { student: true }
    }
  },
  orderBy: { startTime: 'asc' }
});
```

### Student: View Private Invitations

```typescript
const myInvitations = await prisma.booking.findMany({
  where: {
    studentId: req.user.id,
    slot: { isPrivate: true },
    status: { in: ['CONFIRMED', 'COMPLETED'] }
  },
  include: {
    slot: {
      include: {
        professor: { select: { id: true, firstName: true, lastName: true }}
      }
    }
  },
  orderBy: { slot: { startTime: 'asc' }}
});
```

### Conflict Detection

```typescript
const conflicts = await prisma.availabilitySlot.findFirst({
  where: {
    professorId,
    startTime: { lt: endTime },
    endTime: { gt: startTime },
    bookings: {
      some: { status: 'CONFIRMED' }
    }
  }
});

if (conflicts) {
  throw new Error('Professor has conflicting booking at this time');
}
```

## Database Indexes

### Add Composite Index (REQUIRED)

```prisma
model AvailabilitySlot {
  // ... existing fields
  
  @@index([professorId, isPrivate, startTime]) // NEW
  @@index([professorId]) // EXISTING
  @@index([startTime]) // EXISTING
}
```

**Migration File**: `20260214_add_private_slot_index.sql`
```sql
CREATE INDEX `availability_slots_professor_id_is_private_start_time_idx`
ON `availability_slots` (`professor_id`, `is_private`, `start_time`);
```

**Impact**: 
- Significantly faster queries for professor's private invitations
- Improves conflict detection performance
- Minimal storage overhead (~5MB for 100k slots)

## State Transitions

### Private Invitation Lifecycle

```
[Not Exists] 
  ↓ POST /professor/private-invitations
[Slot Created (isPrivate=true, AVAILABLE)]
  ↓ Simultaneously
[Booking Created (CONFIRMED)]
  ↓ Student/Professor cancels
[Booking: CANCELLED_BY_STUDENT or CANCELLED_BY_PROFESSOR]
  ↓ Time passes
[Booking: COMPLETED]
```

**Key Differences from Public Bookings**:
- No PENDING status (goes straight to CONFIRMED)
- Slot remains AVAILABLE even with CONFIRMED booking (design choice)
- Slot is isPrivate=true (visibility control)

## Data Validation Rules

### Slot Creation
- `startTime` must be in future
- `endTime` must be after `startTime`
- `duration` = endTime - startTime (15min to 3 hours)
- `professorId` must exist and be a professor
- `studentId` must exist

### Conflict Check
- No overlapping CONFIRMED bookings for professor at same time
- Student also checked for conflicts (optional, depends on policy)

### Access Control
- Private slot only visible to professor + allowed students
- Booking creation only allowed for allowed students
- Professor can cancel any private invitation
- Student can cancel per standard policy

## Migration Strategy

### Phase 1: Index Addition (REQUIRED)
```bash
npx prisma migrate dev --name add_private_slot_index
```

### Phase 2: Optional Enum (FUTURE)
```bash
# Only if analytics tracking needed later
npx prisma migrate dev --name add_booking_source_enum
```

## Rollback Plan

**If Issues Arise**:
1. Indexes can be dropped without data loss
2. `isPrivate` flag defaults to false (no impact on existing slots)
3. `SlotAllowedStudent` is junction table (delete entries if needed)
4. Bookings with CONFIRMED status are valid in current system

**Zero Downtime**: All changes are additive, no breaking changes
