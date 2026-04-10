# Implementation Plan: Slot Management Simplification

## Overview
Simplify slot management by removing private invitation complexity and implementing two clear modes: Public Available Slots and Direct Scheduling.

## Current State Analysis

### Components Using Private Invitations:
1. `SlotModal.tsx` - Has private slot selection UI
2. `PrivateInvitationList.tsx` - Displays private invitations
3. `PrivateInvitationModal.tsx` - Modal for managing invitations
4. `PrivateInvitationBadge.tsx` - Badge for invitation status
5. `CalendarPage.tsx` - References private slots
6. `NewSlotPage.tsx` - Has private slot creation
7. `BookingsPage.tsx` - Shows invitations

### Backend Impact:
- API endpoints for private slots
- Database fields for invitation system
- Email templates for invitations

## Implementation Phases

### Phase 1: Remove Private Invitation Frontend (Day 1)

#### Step 1.1: Remove Components
```bash
# Delete files
rm packages/frontend/src/components/professor/PrivateInvitationList.tsx
rm packages/frontend/src/components/professor/PrivateInvitationModal.tsx
rm packages/frontend/src/components/professor/PrivateInvitationBadge.tsx
```

#### Step 1.2: Clean Up SlotModal
- Remove private slot selection UI section
- Remove student search/filter for private slots
- Keep only: public slot creation fields
- Simplify to basic slot form (date, time, type, capacity)

Files to modify:
- `packages/frontend/src/components/admin/SlotModal.tsx`

#### Step 1.3: Update Calendar & Slot Pages
- Remove private slot filtering
- Remove private invitation displays
- Simplify slot cards to show only public/booked status

Files to modify:
- `packages/frontend/src/pages/admin/CalendarPage.tsx`
- `packages/frontend/src/pages/admin/NewSlotPage.tsx`

#### Step 1.4: Update Student Bookings Page
- Remove invitation section
- Show only: booked slots and available slots

Files to modify:
- `packages/frontend/src/pages/student/BookingsPage.tsx`

### Phase 2: Implement Direct Scheduling (Day 2)

#### Step 2.1: Create DirectSchedulingModal Component
Location: `packages/frontend/src/components/admin/DirectSchedulingModal.tsx`

Features:
- Student search/selection (multi-select for group)
- Date & time picker
- Duration presets (30, 45, 60, 90 min)
- Session type toggle (Individual/Group)
- Optional title & description
- Confirm button → creates booking directly

#### Step 2.2: Add Schedule Session Button
Location: Admin Dashboard & Calendar Page

```tsx
<Button onClick={() => setDirectSchedulingOpen(true)}>
  <Calendar className="h-4 w-4 mr-2" />
  Schedule Session
</Button>
```

#### Step 2.3: Backend API for Direct Scheduling
Create new endpoint:
```
POST /api/professor/schedule-session
Body: {
  studentIds: string[],
  startTime: Date,
  duration: number,
  type: 'INDIVIDUAL' | 'GROUP',
  title?: string,
  description?: string
}
```

Logic:
- Create slot with professor as creator
- Create booking(s) for selected student(s)
- Set status to CONFIRMED (no approval needed)
- Send notification emails to students
- Return created slot & bookings

#### Step 2.4: Integration
- Add button to AdminDashboard
- Add button to CalendarPage
- Connect modal to API
- Handle success/error states
- Show toast notifications

### Phase 3: Backend Cleanup (Day 3)

#### Step 3.1: Database Migration
- Audit existing private slots
- Convert to regular slots or mark as legacy
- Keep historical data but deprecate private fields

#### Step 3.2: API Cleanup
- Remove private slot endpoints
- Remove invitation logic
- Simplify slot creation endpoint
- Add new direct scheduling endpoint

#### Step 3.3: Email Template Updates
- Remove invitation email templates
- Keep booking confirmation emails
- Add "professor scheduled session" email template

### Phase 4: Documentation & Polish (Day 3)

#### Step 4.1: Update CLAUDE.md
Add simplified workflow documentation:
```markdown
## Slot Management Workflow

### For Professors:

**Option 1: Create Available Slots**
- Create public slots at available times
- Students can browse and book these slots
- Booking requires professor approval

**Option 2: Direct Scheduling**
- Schedule session directly with specific student(s)
- No approval needed (professor-initiated)
- Student receives notification

### Slot Types:
- **AVAILABLE**: Public slot, students can request to book
- **BOOKED**: Student has booked, awaiting approval
- **CONFIRMED**: Session confirmed by professor
- **DIRECT**: Professor scheduled directly with student
```

#### Step 4.2: Update UI Text & Translations
- Update button labels to be clearer
- Add translations for new "Direct Scheduling" feature
- Update slot status badges

#### Step 4.3: Testing
- Test public slot creation
- Test direct scheduling (individual & group)
- Test student notifications
- Test calendar display
- Test booking flow

## File Checklist

### To Delete:
- [ ] `PrivateInvitationList.tsx`
- [ ] `PrivateInvitationModal.tsx`
- [ ] `PrivateInvitationBadge.tsx`

### To Modify:
- [ ] `SlotModal.tsx` - Remove private slot UI
- [ ] `CalendarPage.tsx` - Remove private slot filtering
- [ ] `NewSlotPage.tsx` - Simplify slot creation
- [ ] `BookingsPage.tsx` - Remove invitation section
- [ ] `AdminDashboard.tsx` - Add "Schedule Session" button

### To Create:
- [ ] `DirectSchedulingModal.tsx` - New direct scheduling UI
- [ ] Backend: `POST /api/professor/schedule-session`
- [ ] Email template: Professor-scheduled session

### To Update:
- [ ] CLAUDE.md - New workflow documentation
- [ ] Translation files (en/sr/es)
- [ ] Backend: Simplify slot creation logic

## Risk Assessment

### Low Risk:
- Removing frontend components (can always restore from git)
- Adding new direct scheduling feature (additive)

### Medium Risk:
- Backend API changes (need to test thoroughly)
- Database migration (existing private slots)

### Mitigation:
- Keep git history for rollback
- Test on dev environment first
- Migrate data carefully with backups

## Success Metrics

After implementation:
- Professor creates slots in < 30 seconds
- Students clearly understand slot types
- No confusion about private vs public slots
- Code is 20-30% smaller
- Fewer support questions about slot management

## Timeline

- **Day 1**: Remove private invitation frontend
- **Day 2**: Implement direct scheduling
- **Day 3**: Backend cleanup + documentation
- **Total**: 3 days

## Next Steps

1. Get user approval on simplified workflow
2. Start with Phase 1 (safest - removing unused UI)
3. Implement Phase 2 (adds value immediately)
4. Complete backend cleanup (Phase 3)
5. Polish and document (Phase 4)
