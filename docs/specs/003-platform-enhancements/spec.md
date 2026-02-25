# Feature Specification: Platform Enhancements

**Feature Branch**: `001-platform-enhancements`
**Created**: 2026-02-14
**Status**: Draft
**Input**: User description: "I want to implement this as well. - Pricing for classes. Professor could maintained preferred price per student. Not every student has a same price. Price should be maintained in RSD. This information should be visible to professor only. - professor needs to accept the class. Despite the fact that professor offered available slot and that student booked that slot, professor still has to confirm. That could be done by clicking on confirmation link via email. Student. Once student books and pick up the slot, he received confirmation that professor is informed and that shortly as soon as professor accepts he will receive official confirmation with joining instructions. - Multi-language support platform should be available in English, Serbian and Spanish. Based on user geo location, preferred locale should be displayed. - Group classes (multiple students in one session). Professor should be able to see, who is participating to the group class. - Advanced analytics or reporting dashboards - Referral programs or student/professor rating systems"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Professor Confirms Booking via Email (Priority: P1)

When a student books a professor's available time slot, the booking is not immediately confirmed. Instead, the professor receives an email notification with a confirmation link. The professor clicks the link to accept the booking. Once accepted, the student receives a confirmation email with joining instructions for the class.

**Why this priority**: This changes the core booking flow and prevents unwanted bookings. Critical for professor control and must be implemented before other enhancements.

**Independent Test**: Can be fully tested by having a student book a slot, professor receiving email, clicking confirm link, and student receiving final confirmation. Delivers professor veto power over bookings.

**Acceptance Scenarios**:

1. **Given** a student books an available time slot, **When** the booking is submitted, **Then** the professor receives an email with a confirmation link and the student receives a pending confirmation message
2. **Given** a professor receives a booking confirmation email, **When** they click the confirmation link, **Then** the booking is confirmed and the student receives an email with joining instructions
3. **Given** a professor has a pending booking request, **When** they do not confirm (no automatic expiry - manual management only), **Then** the booking remains pending until the professor manually confirms or rejects it

---

### User Story 2 - Professor Manages Per-Student Pricing (Priority: P1)

Professors need to charge different rates for different students based on various factors (experience level, loyalty, negotiated rates). The professor sets a custom price in RSD (Serbian Dinars) for each student. This pricing information is private and visible only to the professor, not to students or other professors.

**Why this priority**: Essential for monetization and professor flexibility. Without pricing, the platform cannot generate revenue. Must be implemented early.

**Independent Test**: Can be fully tested by professor setting different prices for different students, booking classes, and verifying pricing visibility restrictions. Delivers the revenue model foundation.

**Acceptance Scenarios**:

1. **Given** a professor is viewing their student list, **When** they select a student, **Then** they can set or update a custom price in RSD for that student
2. **Given** a professor has set different prices for different students, **When** viewing their schedule or student records, **Then** they see the appropriate price for each student
3. **Given** a student is viewing their own profile or booking classes, **When** they access the platform, **Then** they do not see any pricing information set by the professor
4. **Given** a professor has not set a price for a student, **When** viewing that student, **Then** a system-wide default price is displayed and can be overridden with a custom price

---

### User Story 3 - Multi-Language Platform Support (Priority: P2)

Users access the platform in their preferred language. The platform supports English, Serbian, and Spanish. When a user first visits the platform, their language is automatically detected based on their geographic location. Users can manually change the language at any time.

**Why this priority**: Important for user experience and market expansion, but core functionality works without it. Enables serving Serbian and Spanish-speaking markets.

**Independent Test**: Can be fully tested by accessing the platform from different geolocations, verifying automatic language detection, and manually switching languages. Delivers localized user experience.

**Acceptance Scenarios**:

1. **Given** a new user visits the platform, **When** the system detects their geolocation, **Then** the appropriate language is displayed (English for most locations, Serbian for Serbia, Spanish for Spanish-speaking countries)
2. **Given** a user is viewing the platform in any language, **When** they select a different language from the language selector, **Then** the entire interface switches to the selected language
3. **Given** a user has selected a preferred language, **When** they return to the platform later, **Then** their language preference is remembered

---

### User Story 4 - Group Classes (Priority: P2)

Professors can offer group classes where multiple students attend the same session. When creating availability, the professor specifies the maximum number of students for that slot. Students book the same time slot up to the maximum capacity. The professor can view all participants who have booked the group class.

**Why this priority**: Increases professor earning potential and student affordability. Adds complexity to booking logic, so should come after core enhancements.

**Independent Test**: Can be fully tested by professor creating group availability, multiple students booking the same slot, and professor viewing participant list. Delivers economy of scale for classes.

**Acceptance Scenarios**:

1. **Given** a professor is creating availability, **When** they define the time slot, **Then** they can specify the maximum number of students (group size) for that slot
2. **Given** a time slot has group capacity of N students, **When** students book that slot, **Then** up to N students can book the same time slot
3. **Given** a group class has multiple students booked, **When** the professor views the class details, **Then** they see a list of all participating students with their names and relevant information
4. **Given** a group class reaches maximum capacity, **When** another student attempts to book, **Then** they cannot book and see that the class is full
5. **Given** each student in a group class may have different pricing, **When** the professor views the participant list, **Then** they see the individual price for each student

---

### User Story 5 - Advanced Analytics Dashboard (Priority: P3)

Professors and platform administrators need insights into platform usage and performance. Professors see analytics about their teaching activity, earnings, student retention, and class ratings. Administrators see platform-wide metrics like total bookings, revenue, active users, and growth trends.

**Why this priority**: Valuable for decision-making and business intelligence, but not required for core operations. Can be added after the platform is functional.

**Independent Test**: Can be fully tested by conducting several classes and viewing various analytics reports showing accurate metrics. Delivers business insights.

**Acceptance Scenarios**:

1. **Given** a professor accesses their analytics dashboard, **When** they view their statistics, **Then** they see metrics including total classes taught, total earnings, average rating, student retention rate, and trend graphs
2. **Given** an administrator accesses the platform analytics, **When** they view the dashboard, **Then** they see platform-wide metrics including total bookings, active users, revenue, popular time slots, and growth trends
3. **Given** analytics data is displayed, **When** users select different time periods (week, month, year), **Then** the metrics update to reflect the selected timeframe

---

### User Story 6 - Referral Program and Rating System (Priority: P3)

Students can refer friends to the platform and receive rewards when their referrals sign up and book classes. Both students and professors can rate each other after classes, building reputation scores. High ratings help professors attract more students and help students demonstrate their commitment.

**Why this priority**: Drives growth and quality but is not essential for initial platform operation. Should be added once the platform has proven user engagement.

**Independent Test**: Can be fully tested by inviting a referred user, completing a booking, leaving ratings, and verifying reward allocation. Delivers viral growth mechanism and quality signals.

**Acceptance Scenarios**:

1. **Given** a student wants to refer a friend, **When** they generate a referral link and share it, **Then** when the friend signs up and books their first class using that link, both users receive a discount on their next booking (e.g., 20% off)
2. **Given** a student and professor complete a class, **When** the class ends, **Then** both parties can rate each other on a scale (e.g., 1-5 stars) and optionally leave written feedback
3. **Given** users have received ratings, **When** their profiles are viewed, **Then** their average rating and number of reviews are displayed
4. **Given** a student is browsing professors, **When** viewing available slots, **Then** they can see professor ratings to help make booking decisions

---

### Edge Cases

- What happens when a professor never confirms or rejects a pending booking?
- How does the system handle group classes when some students cancel (does the class still proceed)?
- What if a student refers themselves using a different email address?
- How are ratings handled if a user leaves offensive or inappropriate feedback?
- What happens when automatic language detection fails or is incorrect?
- How are prices displayed or communicated to students if they're professor-only information (do students not know what they'll pay)?
- Can professors change a student's price after classes have been booked but not yet completed?
- What happens to group class capacity when multiple students try to book the last spot simultaneously?
- How does the referral system prevent fraud or abuse?

## Requirements *(mandatory)*

### Functional Requirements

#### Professor Booking Confirmation
- **FR-001**: System MUST place bookings in "pending" status when a student books an available slot
- **FR-002**: System MUST send an email to the professor with a unique confirmation link when a booking is created
- **FR-003**: System MUST notify the student that their booking is pending professor confirmation
- **FR-004**: Professors MUST be able to confirm bookings by clicking the confirmation link in the email
- **FR-005**: System MUST send final confirmation with joining instructions to the student only after professor confirms
- **FR-006**: System MUST allow pending bookings to remain indefinitely until manually confirmed or rejected by the professor (no automatic expiry)
- **FR-007**: System MUST return the time slot to available status if a professor manually rejects a booking

#### Per-Student Pricing
- **FR-008**: Professors MUST be able to set a custom price in RSD for each individual student
- **FR-009**: System MUST store pricing information with proper decimal precision for currency values
- **FR-010**: Pricing information MUST be visible only to the professor who set it (not to students or other professors)
- **FR-011**: Professors MUST be able to view and update student prices at any time
- **FR-012**: System MUST support scenarios where different students in the same group class have different prices
- **FR-013**: System MUST provide a system-wide default price that applies to all students unless a professor sets a custom price
- **FR-013a**: Professors MUST be able to override the system default with custom pricing on a per-student basis

#### Multi-Language Support
- **FR-014**: Platform MUST support three languages: English, Serbian, and Spanish
- **FR-015**: System MUST detect user geolocation on first visit and display the appropriate language
- **FR-016**: Users MUST be able to manually select their preferred language from a language selector
- **FR-017**: System MUST persist user language preference across sessions
- **FR-018**: All user-facing text, labels, buttons, notifications, and emails MUST be translatable
- **FR-019**: System MUST handle right-to-left and left-to-right text rendering appropriately

#### Group Classes
- **FR-020**: Professors MUST be able to specify maximum student capacity when creating availability (group vs 1-on-1)
- **FR-021**: System MUST allow multiple students to book the same time slot up to the specified capacity
- **FR-022**: System MUST prevent additional bookings once a group class reaches maximum capacity
- **FR-023**: Professors MUST be able to view a list of all participants booked for a group class
- **FR-024**: System MUST generate a single video meeting room for all participants in a group class
- **FR-025**: System MUST handle participant management (cancellations, confirmations) for group classes
- **FR-026**: System MUST track individual pricing for each student in a group class

#### Advanced Analytics
- **FR-027**: Professors MUST be able to view analytics including total classes taught, total earnings, average rating, and student retention
- **FR-028**: Administrators MUST be able to view platform-wide analytics including total bookings, revenue, active users, and growth trends
- **FR-029**: Analytics MUST support filtering by time periods (week, month, year, custom range)
- **FR-030**: System MUST calculate and display trend graphs showing changes over time
- **FR-031**: Analytics data MUST be updated in near real-time or with minimal delay

#### Referral Program
- **FR-032**: Students MUST be able to generate unique referral links to share with friends
- **FR-033**: System MUST track referral attribution when new users sign up via referral links
- **FR-034**: System MUST award a discount (e.g., 20% off) on the next booking to both referrer and referred user when the referred user signs up and completes their first booking
- **FR-035**: System MUST prevent referral fraud (self-referrals, circular referrals)

#### Rating System
- **FR-036**: Both students and professors MUST be able to rate each other after completing a class
- **FR-037**: Ratings MUST include a numeric score (e.g., 1-5 stars) and optional written feedback
- **FR-038**: System MUST calculate and display average ratings for users
- **FR-039**: System MUST moderate ratings to prevent offensive or inappropriate content
- **FR-040**: Users MUST be able to view ratings before booking (students see professor ratings, professors see student ratings)

### Key Entities

- **Pending Booking**: A booking awaiting professor confirmation; includes confirmation token, expiration time, and current status
- **Student Price**: Professor's custom pricing for a specific student; stored in RSD with decimal precision, visible only to the professor
- **Language Preference**: User's selected or auto-detected language (English, Serbian, Spanish); persisted across sessions
- **Group Class**: An availability slot with capacity greater than 1; includes max participants, current participant count, and participant list
- **Participant**: A student enrolled in a specific group class; linked to both the booking and the group class
- **Analytics Metric**: Calculated statistics for professors or administrators; includes metric type, value, time period, and trend data
- **Referral**: A referral relationship between users; includes referrer, referred user, referral code, status, and reward allocation
- **Rating**: A review left by one user for another; includes numeric score (1-5), written feedback, timestamp, and moderation status

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Professors can confirm or reject pending bookings within 1 click from the email link
- **SC-002**: 95% of booking confirmations are processed within 24 hours of student booking
- **SC-003**: Professors can set custom pricing for a student in under 1 minute
- **SC-004**: Pricing information remains private with 100% access control compliance (students never see professor-set prices)
- **SC-005**: Users receive content in the correct language based on geolocation with 90% accuracy
- **SC-006**: Users can switch languages and see the entire interface update within 2 seconds
- **SC-007**: Group classes support at least 10 students per session without performance degradation
- **SC-008**: Professors can view complete participant lists for group classes with all relevant information displayed
- **SC-009**: Analytics dashboards load and display accurate data within 3 seconds
- **SC-010**: Referral attribution tracking accuracy of 98% or higher (correct referrer credit)
- **SC-011**: 80% of users leave ratings after completing classes (high engagement with rating system)
- **SC-012**: Average rating scores reflect user satisfaction and correlate with booking frequency

## Assumptions

- Professors are willing to manually confirm bookings via email (not automated acceptance)
- Students understand that bookings are not confirmed immediately and require professor approval
- RSD (Serbian Dinar) currency display and calculations follow standard currency formatting
- Professors manage pricing offline (no built-in payment processing in this phase)
- Geolocation detection is available via browser APIs or IP-based services
- All content can be accurately translated to Serbian and Spanish
- Group classes use the same video infrastructure (Jitsi) as 1-on-1 classes
- Analytics calculations can be performed efficiently without requiring dedicated analytics infrastructure
- Referral rewards are tracked but distribution/fulfillment may be manual
- Users are generally honest with ratings and abusive content is relatively rare
- Email delivery is reliable for booking confirmations and notifications

## Dependencies

- **Email Service**: Required for sending booking confirmation links, final confirmations, and notifications
- **Geolocation Service**: Required for automatic language detection based on user location
- **Translation System**: Required for managing and serving content in English, Serbian, and Spanish
- **Jitsi Video Platform**: Must support group video calls with multiple participants
- **Currency Handling**: System must support RSD currency formatting and decimal precision

## Constraints

- Booking confirmation workflow adds latency between booking request and confirmed class (not instant booking)
- Pricing is professor-managed only; students do not see prices via the platform
- Language support limited to three specific languages (English, Serbian, Spanish)
- Group classes share a single video room; students cannot be separated during class
- Analytics may have slight delays in updating (not true real-time in all cases)
- Referral rewards require manual fulfillment until payment processing is integrated
- Rating moderation may require manual review for inappropriate content

## Out of Scope

The following are explicitly out of scope for this feature set:

- Automated payment processing for the pricing system (pricing is tracked but payment is external)
- Automated booking confirmation (professors must manually confirm each booking)
- Languages beyond English, Serbian, and Spanish
- Breakout rooms or subgroups within group classes
- Real-time live analytics (acceptable delay of up to a few minutes)
- Automated referral reward distribution (tracking only, fulfillment is manual)
- AI-based rating moderation (manual review acceptable)
- Integration with external analytics tools (Google Analytics, Mixpanel, etc.)
- Professor earnings payout system (tracking only, payout is manual/external)
- Advanced fraud detection for referrals (basic checks only)
