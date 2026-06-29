# Content and Iconography

## Voice

- Calm, direct, supportive.
- Use verbs for actions.
- Explain what happens next.
- Avoid technical terminology and celebration overload.

## Preferred labels

- Schedule
- Students
- Insights
- Settings
- Offer this time
- Schedule a student
- Block time
- Request lesson
- Approve request
- Reject request
- Join lesson
- Book another lesson

Avoid:

- Create AvailabilitySlot
- Booking entity
- Pending confirmation token
- Submit
- Process request
- Manage records

## Status language

- Available
- Approval needed / Requested
- Confirmed
- Blocked
- Completed
- Cancelled
- Rejected
- Expired

Status nouns/adjectives are localized centrally.

## Dates and time

- Use the user’s locale and timezone.
- Always show timezone in booking review and cross-timezone contexts.
- Use start–end time, not start plus hidden duration.
- Use tabular numbers.
- Relative language may supplement, never replace, exact date/time for consequential actions.

## Icons

Use Lucide React only unless an explicit design decision approves another set.

- Default size: 18px.
- Compact: 16px.
- Prominent: 20–24px.
- Stroke: default 1.75–2px.
- Decorative icons use `aria-hidden`.
- Icon-only buttons require an accessible name and tooltip.
- Do not use emoji as permanent application icons.

## Microcopy rules

- Buttons use 1–3 words.
- Error messages say what happened and what the user can do.
- Confirmation messages include the object and resulting state.
- Destructive dialogs name the consequence.
- Empty states describe a meaningful next action.
