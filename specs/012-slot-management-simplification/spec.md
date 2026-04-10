# 012 - Slot Management Simplification

**Status:** Planning
**Created:** 2026-03-04
**Priority:** High

## Problem Statement

The current slot management system has unnecessary complexity with "private invitation" functionality. The professor wants a simpler, more straightforward approach to scheduling classes.

## Current Issues

1. **Private Invitation Complexity**: The private invitation feature adds unnecessary complexity to the slot creation workflow
2. **Confusing UX**: Multiple ways to create slots (public, private, with invitations) creates confusion
3. **Over-engineered**: The feature is more complex than needed for a small educational platform

## Desired Simplified Flow

### Two Simple Modes for Professor:

1. **Public Available Slots**
   - Professor creates available time slots
   - Slots are visible to all students
   - Students can book these slots themselves
   - Use case: General availability for students to book

2. **Direct Scheduling**
   - Professor directly schedules a call with specific student(s)
   - Choose student(s) from list
   - Set time, duration, and type (individual/group)
   - Student receives notification and slot is booked
   - Use case: Professor-initiated sessions

## What to Remove

### Components to Remove:
- `PrivateInvitationList.tsx`
- `PrivateInvitationModal.tsx`
- `PrivateInvitationBadge.tsx`
- Private slot selection functionality from `SlotModal.tsx`

### Backend Features to Remove:
- Private slot endpoints
- Invitation system logic
- Student visibility filtering based on private invitations

### Database Changes:
- May need to remove/deprecate private invitation related fields
- Simplify slot schema to just: public slots vs directly booked slots

## New Simplified Features

### 1. Public Slot Creation (Keep & Simplify)
```
Professor Actions:
- Create slot (date, time, duration)
- Set type: Individual (1-on-1) or Group (max participants)
- Optional: Add title/description
- Save → Slot becomes visible to all students
```

### 2. Direct Scheduling (New Simplified Feature)
```
Professor Actions:
- Click "Schedule Session" button
- Search & select student(s)
- Set date & time
- Set duration
- Set type: Individual or Group
- Optional: Add title/description
- Confirm → Student(s) receive notification, slot is booked
```

## Benefits of Simplification

✅ **Clearer UX**: Only two clear options instead of multiple confusing modes
✅ **Faster Workflow**: Less steps to create and manage slots
✅ **Less Code**: Remove complex invitation logic and UI components
✅ **Easier to Maintain**: Simpler codebase, fewer edge cases
✅ **Better Student Experience**: Clear distinction between "available slots" and "scheduled sessions"

## Implementation Approach

### Phase 1: Remove Private Invitation Features
1. Remove frontend components for private invitations
2. Update SlotModal to remove private slot UI
3. Clean up routing and navigation

### Phase 2: Implement Direct Scheduling
1. Create new "Schedule Session" button in admin dashboard
2. Build simple modal for direct scheduling
3. Add student search/selection
4. Create booking directly (bypass approval flow)

### Phase 3: Database Cleanup
1. Migrate existing private slots to regular slots or direct bookings
2. Remove deprecated fields
3. Update API endpoints

### Phase 4: Update Documentation
1. Update user documentation
2. Update CLAUDE.md with new workflow
3. Remove references to private invitations

## Success Criteria

- [ ] All private invitation code removed
- [ ] Direct scheduling feature implemented and working
- [ ] Professor can create public available slots
- [ ] Professor can directly schedule sessions with students
- [ ] Students receive notifications for both types
- [ ] No confusion about slot types
- [ ] Simplified admin calendar UI

## Timeline

Estimated: 2-3 days of development

## Notes

This simplification aligns with the platform's goal of being straightforward and easy to use. The two-mode approach (public availability + direct scheduling) covers all use cases without unnecessary complexity.
