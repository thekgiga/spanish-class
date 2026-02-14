# Feature Specification: Professor-Initiated Private Invitations

**Feature Branch**: `001-professor-invitations`
**Created**: 2026-02-14
**Status**: Draft
**Input**: User description: "Not sure If I have mentioned, but sometimes, professor and students are getting in touch offline something like whaatsapp and they agree on particular slot, outside of available slots on the platform. In that case, I want professor to be able to invite student to a particular slot. So that slot is not going to be available to everyone, but rather that should be an invitation to student to join. There is no explicit acceptance by the student since that slot is already agreed offline. So in hte system, mark it as accepted or approved already."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Professor Creates Private Invitation (Priority: P1)

A professor has connected with a student offline (via WhatsApp, phone, or in person) and they've agreed on a specific time for a class. The time slot may not be in the professor's publicly available schedule. The professor logs into the platform and creates a private invitation for that specific student at the agreed time. The system immediately creates a confirmed booking visible to both the professor and the invited student.

**Why this priority**: This is the core functionality that accommodates offline agreements. Without it, professors must either create public availability (which others could book) or manage offline bookings entirely outside the platform.

**Independent Test**: Can be fully tested by a professor creating a private invitation for a student at any time, and both parties seeing a confirmed booking. Delivers offline-to-online booking conversion.

**Acceptance Scenarios**:

1. **Given** a professor has agreed with a student on a class time offline, **When** the professor creates a private invitation for that student at the specified time, **Then** a confirmed booking is created immediately without requiring student acceptance
2. **Given** a professor creates a private invitation, **When** the invitation is saved, **Then** the student receives a notification about the confirmed class with joining details
3. **Given** a private invitation is created, **When** other students browse available slots, **Then** the private slot does not appear as available to anyone except the invited student

---

### User Story 2 - Student Views Private Invitation (Priority: P1)

A student who has been invited to a private class session by a professor sees the booking in their schedule as a confirmed class. The student receives a notification about the class and can access all relevant details including date, time, professor name, and video call joining link.

**Why this priority**: Students need visibility into their confirmed private classes just like regular bookings. This completes the invitation flow.

**Independent Test**: Can be fully tested by having a professor create a private invitation and verifying the student sees it correctly in their schedule with all details. Delivers student visibility and access.

**Acceptance Scenarios**:

1. **Given** a professor has created a private invitation for a student, **When** the student views their upcoming classes, **Then** they see the confirmed booking with full details
2. **Given** a student has a private invitation booking, **When** they click on the class details, **Then** they see professor information, class time, and video call joining link
3. **Given** a private invitation exists, **When** the scheduled time approaches, **Then** the student receives reminder notifications just like regular bookings

---

### User Story 3 - Professor Manages Private vs Public Availability (Priority: P2)

Professors need clarity on which time slots are private invitations versus publicly available slots. When viewing their schedule, professors can distinguish between the two types and understand their overall availability. Private invitations do not consume or block public availability slots unless they overlap.

**Why this priority**: Important for professor schedule management, but the core private invitation functionality works without this distinction being visually clear.

**Independent Test**: Can be fully tested by creating both public availability and private invitations, then verifying professors can see and understand the difference in their schedule view. Delivers schedule clarity.

**Acceptance Scenarios**:

1. **Given** a professor has both public availability and private invitations, **When** they view their schedule, **Then** they can clearly distinguish between public bookings, private invitations, and open availability
2. **Given** a professor creates a private invitation at a time that overlaps with public availability, **When** viewing the schedule, **Then** the system handles the conflict appropriately (either blocks the public slot or allows both based on group class settings)
3. **Given** a professor wants to create a private invitation, **When** they select a time, **Then** they can see if that time conflicts with existing bookings or availability

---

### User Story 4 - Canceling Private Invitations (Priority: P2)

Sometimes offline agreements fall through or need to be rescheduled. Professors need the ability to cancel private invitations, which notifies the student about the cancellation. Since these bookings were arranged offline, cancellation is treated the same as regular booking cancellations.

**Why this priority**: Necessary for managing schedule changes, but the core create-and-confirm flow is more critical than cancellation handling.

**Independent Test**: Can be fully tested by creating a private invitation and then canceling it, verifying both parties are notified and the slot is freed. Delivers schedule flexibility.

**Acceptance Scenarios**:

1. **Given** a professor has created a private invitation, **When** they cancel the booking, **Then** the student is notified and the slot is removed from both schedules
2. **Given** a private invitation is canceled, **When** the cancellation is processed, **Then** the system follows the same cancellation rules as regular bookings (refund policy, notice period, etc.)
3. **Given** a student needs to cancel a private invitation, **When** they attempt to cancel, **Then** they can do so following standard cancellation policies

---

### Edge Cases

- What happens if a professor tries to create a private invitation for a time when they already have a confirmed public booking?
- Can a professor create multiple private invitations for the same time slot (if running a group class)?
- What if the invited student doesn't have an account on the platform yet - can professors invite by email?
- How does pricing work for private invitations - is it the same per-student pricing or can professors set a custom price?
- What happens if a professor creates a private invitation and then later creates public availability at the same time?
- Can students see that a slot is a "private invitation" vs a regular booking, or does it just appear as a confirmed class?
- What if a professor accidentally invites the wrong student - can they modify or reassign the invitation?
- Do private invitations expire if not attended, or do they remain in history like regular bookings?

## Requirements *(mandatory)*

### Functional Requirements

#### Private Invitation Creation
- **FR-001**: Professors MUST be able to create a private invitation for a specific student at any date and time
- **FR-002**: System MUST allow professors to create private invitations at times outside their publicly available slots
- **FR-003**: Private invitations MUST be created in "confirmed" status immediately without requiring student acceptance
- **FR-004**: System MUST notify the invited student when a private invitation is created for them
- **FR-005**: Professors MUST be able to select a student from their existing student list when creating a private invitation
- **FR-006**: System MUST allow professors to specify class duration when creating a private invitation
- **FR-007**: System MUST support creating private invitations for both 1-on-1 and group class formats

#### Visibility and Privacy
- **FR-008**: Private invitation slots MUST NOT appear in publicly available slots visible to other students
- **FR-009**: Only the invited student MUST be able to see their private invitation booking in their schedule
- **FR-010**: Professors MUST be able to view all their private invitations in their schedule along with regular bookings
- **FR-011**: System MUST clearly distinguish private invitations from public bookings in the professor's schedule view

#### Student Experience
- **FR-012**: Students MUST be able to view private invitation bookings in their upcoming classes list
- **FR-013**: Private invitation bookings MUST include all standard booking information (date, time, professor, video link)
- **FR-014**: Students MUST receive reminders for private invitation classes just like regular bookings
- **FR-015**: Students MUST be able to access video call joining links for private invitation classes

#### Cancellation and Modification
- **FR-016**: Professors MUST be able to cancel private invitations with student notification
- **FR-017**: Students MUST be able to cancel private invitations following standard cancellation policies
- **FR-018**: System MUST handle cancellations of private invitations the same way as regular bookings

#### Conflict Management
- **FR-019**: System MUST detect when a professor attempts to create a private invitation that conflicts with existing bookings
- **FR-020**: System MUST provide clear warnings or prevent double-booking unless the professor is running a group class
- **FR-021**: System MUST track private invitations separately from public availability to avoid confusion

#### Pricing and Payments
- **FR-022**: Private invitations MUST use the same per-student pricing model as regular bookings
- **FR-023**: System MUST track the pricing associated with private invitation bookings for professor earnings calculations

### Key Entities

- **Private Invitation**: A professor-initiated booking for a specific student; created directly in confirmed status without student acceptance; includes date, time, student, professor, duration, and booking type indicator
- **Invitation Status**: Always "confirmed" upon creation; can transition to "completed" or "canceled" but never "pending"
- **Booking Type**: Indicator distinguishing between public bookings (student-initiated) and private invitations (professor-initiated); affects visibility and creation workflow
- **Invited Student**: The specific student selected by the professor for a private invitation; must be an existing user on the platform
- **Schedule Slot**: A time block that can be either publicly available, booked by a student, or reserved for a private invitation; includes visibility settings

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Professors can create a private invitation for a student in under 2 minutes
- **SC-002**: 100% of private invitations are created in confirmed status without requiring student acceptance
- **SC-003**: Students receive notifications about private invitations within 1 minute of creation
- **SC-004**: Private invitation slots are never visible to students other than the invited student (100% privacy compliance)
- **SC-005**: Professors successfully manage both private invitations and public availability without confusion (90%+ user satisfaction)
- **SC-006**: Private invitation bookings function identically to regular bookings for video calls, reminders, and class conduct
- **SC-007**: 95% of private invitations are successfully created without scheduling conflicts or errors
- **SC-008**: Students can access all private invitation details (time, professor, video link) with the same ease as regular bookings
- **SC-009**: Cancellation of private invitations works smoothly with proper notifications sent to both parties
- **SC-010**: System accurately tracks private invitations separately from public bookings for reporting and analytics

## Assumptions

- Professors and students have already agreed on class details offline before the professor creates the private invitation
- Students invited to private classes already have accounts on the platform (or professors know their email addresses)
- Private invitations use the same video call infrastructure (Jitsi) as regular bookings
- Pricing for private invitations follows the same per-student pricing model already established
- Private invitations count toward professor earnings and student payment tracking just like regular bookings
- The platform can support an unlimited number of private invitations without performance degradation
- Professors are trusted to only create private invitations for students they've actually spoken with offline
- Students understand that private invitation bookings are pre-confirmed and don't require their acceptance

## Dependencies

- **Existing Booking System**: Private invitations build upon the existing booking infrastructure
- **Student Management**: Professors must be able to select from their existing student list
- **Notification System**: Required for informing students about private invitations
- **Video Call Integration (Jitsi)**: Private invitations use the same video infrastructure as regular bookings
- **Pricing System**: Private invitations must integrate with the per-student pricing model

## Constraints

- Private invitations are only available to professors, not students
- Students cannot initiate or request private invitations - they can only receive them
- Private invitations must be created for existing users on the platform
- The system must maintain strict privacy - private slots are never visible to anyone except the invited student and the professor
- Private invitations follow the same cancellation policies as regular bookings

## Out of Scope

The following are explicitly out of scope for this feature:

- Student-initiated invitation requests (only professors can create private invitations)
- Bulk private invitation creation (creating multiple invitations at once)
- Recurring private invitations (professors must create each one individually)
- Email-based invitations for students who don't have platform accounts yet (may be added later)
- Custom pricing for individual private invitations (uses standard per-student pricing)
- Advanced conflict resolution beyond basic warnings
- Invitation templates or saved invitation presets
- Integration with external calendar systems for private invitations
- Automatic conversion of public slots to private invitations
- Student ability to decline or reject private invitations (they're pre-confirmed)
