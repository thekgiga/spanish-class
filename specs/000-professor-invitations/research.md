# Research: Professor-Initiated Private Invitations

**Feature**: 001-professor-invitations
**Date**: 2026-02-14
**Status**: Complete

## Research Summary

The existing codebase is well-prepared for private invitations. Key findings:

1. **Schema Support**: `isPrivate` flag and `SlotAllowedStudent` model already exist
2. **Minimal Changes**: Can leverage existing booking infrastructure
3. **Integration Ready**: Email, Jitsi, and notification systems easily extensible
4. **Performance**: Add composite index for (professorId, isPrivate, startTime)
5. **Security**: Existing auth middleware handles professor-only access

## Key Decisions

### Decision 1: Use Existing Schema
- Leverage `isPrivate=true` on AvailabilitySlot
- Use `SlotAllowedStudent` for access control
- Optional: Add `BookingSource` enum for analytics

### Decision 2: New API Endpoint
- POST /professor/private-invitations (not extend /bookings)
- Clearer intent, explicit professor-only resource
- Simpler authorization logic

### Decision 3: Email Template
- Create dedicated "Private Invitation Confirmed" template
- Emphasize professor-initiated and pre-confirmed status
- Include standard booking details + calendar invite

### Decision 4: Conflict Validation
- Hard validation before slot creation
- Check for time conflicts with existing bookings
- Clear error messages to help professors reschedule

### Decision 5: UI Integration
- Add "Create Private Invitation" in professor schedule view
- Modal dialog with student selector + date/time picker
- Visual badges to distinguish private from public slots

## Technology Best Practices

**Prisma Queries**:
```typescript
// Optimized query with proper includes
const privateInvitations = await prisma.availabilitySlot.findMany({
  where: { professorId, isPrivate: true, startTime: { gte: new Date() } },
  include: { allowedStudents: { include: { student: true }}, bookings: true }
});
```

**React Query Pattern**:
```typescript
// Optimistic updates for instant UX
const createInvitation = useMutation({
  mutationFn: createPrivateInvitation,
  onMutate: async (data) => { /* optimistic update */ },
  onError: (err, vars, context) => { /* rollback */ }
});
```

## Risk Mitigation

- **Privacy Leak**: Strict WHERE clauses + E2E tests
- **Conflicts**: Validation before creation
- **Email Failures**: Logging + retry logic
- **Performance**: Database indexes + caching

