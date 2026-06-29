---
paths:
  - "packages/frontend/src/**/*calendar*"
  - "packages/frontend/src/**/*booking*"
  - "packages/frontend/src/**/*Booking*"
  - "packages/frontend/src/**/*Slot*"
  - "packages/frontend/src/**/*Lesson*"
---
# Booking and Calendar Domain

Core states:

- available;
- requested / pending professor approval;
- confirmed;
- blocked;
- completed;
- cancelled/rejected/expired in history.

Rules:

- Student booking always creates a pending request.
- A pending request temporarily reserves the time.
- Professor approve/reject is the primary pending-state action.
- Professor direct scheduling creates a confirmed lesson.
- Status must always include text and/or icon, never color alone.
- Requested events are amber and clearly say `Approval needed`.
- Available events are visually quiet.
- Confirmed events have the strongest calendar emphasis.
- Cancelled, rejected, and expired events do not dominate the live calendar.
- Display request expiry in human language, not token terminology.
- Preserve concurrency and lifecycle rules from BPMN; the UI must handle stale-slot conflicts gracefully.
