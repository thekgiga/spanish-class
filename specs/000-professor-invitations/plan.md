# Implementation Plan: Professor-Initiated Private Invitations

**Branch**: `001-professor-invitations` | **Date**: 2026-02-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-professor-invitations/spec.md`

## Summary

Enable professors to create confirmed class bookings for specific students based on offline agreements (WhatsApp, phone, etc.), bypassing the normal public availability and booking flow. The feature extends the existing booking system to support professor-initiated private slots that auto-confirm without student acceptance, maintaining strict privacy (only visible to invited student and professor).

**Technical Approach**: Leverage existing `isPrivate` flag and `SlotAllowedStudent` model in the Prisma schema, extend booking service to support direct creation with "CONFIRMED" status, add new professor routes for private invitation management, and enhance frontend with private invitation UI components.

## Technical Context

**Language/Version**: TypeScript 5.4.0, Node.js 18+
**Primary Dependencies**: Express 4.19, Prisma 5.14, React 18.2, Vite 5.2, TanStack Query 5.32
**Storage**: MySQL (via Prisma ORM)
**Testing**: Vitest (inferred from stack), Playwright (for E2E)
**Target Platform**: Web (desktop + mobile responsive)
**Project Type**: Web application (monorepo with backend + frontend packages)
**Performance Goals**: <200ms API response time, <3s page load, support 100 concurrent professors creating invitations
**Constraints**: Must maintain 100% privacy (private slots never visible to non-invited students), must integrate seamlessly with existing booking/video call infrastructure
**Scale/Scope**: ~1000 active professors, ~10,000 students, ~10,000 private invitations per month

## Constitution Check

*Note: Constitution template is empty, assuming standard web application best practices*

**Assumed Gates** (based on standard practices):
- ✅ **Test Coverage**: Will add unit tests for new services, integration tests for API endpoints, E2E tests for professor invitation flow
- ✅ **Code Reuse**: Extending existing booking/slot models and services rather than creating parallel systems
- ✅ **API Design**: Following existing RESTful conventions in professor.ts routes
- ✅ **Type Safety**: Full TypeScript coverage for new code with Zod validation schemas
- ✅ **Performance**: Leveraging existing database indexes, adding new indexes as needed for private slot queries

**Re-check after Phase 1**: Will validate that data model changes don't introduce N+1 queries or performance regressions

## Project Structure

### Documentation (this feature)

```text
specs/001-professor-invitations/
├── plan.md              # This file
├── research.md          # Phase 0 output (research findings)
├── data-model.md        # Phase 1 output (schema changes, migrations)
├── quickstart.md        # Phase 1 output (developer quickstart guide)
├── contracts/           # Phase 1 output (API contracts)
│   ├── create-private-invitation.json
│   ├── list-private-invitations.json
│   └── cancel-private-invitation.json
└── tasks.md             # Phase 2 output (NOT created by this command)
```

### Source Code (repository root)

**Monorepo Structure** (Turborepo with npm workspaces):

```text
packages/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── professor.ts            # EXTEND: Add private invitation routes
│   │   │   └── student.ts              # EXTEND: Add private invitation viewing
│   │   ├── services/
│   │   │   ├── booking.ts              # EXTEND: Add createPrivateInvitation method
│   │   │   ├── email.ts                # EXTEND: Add private invitation email template
│   │   │   └── private-invitation.ts   # NEW: Private invitation business logic
│   │   ├── middleware/
│   │   │   └── auth.ts                 # EXISTING: Role-based auth (professor check)
│   │   └── lib/
│   │       └── validation.ts           # EXTEND: Add private invitation validation schemas
│   ├── prisma/
│   │   ├── schema.prisma               # REVIEW: Existing isPrivate flag, may need new enum values
│   │   └── migrations/                 # NEW: Migrations for any schema changes
│   └── tests/
│       ├── unit/
│       │   └── private-invitation.test.ts
│       ├── integration/
│       │   └── professor-routes.test.ts
│       └── e2e/
│           └── private-invitation-flow.spec.ts
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── professor/
│   │   │   │   ├── PrivateInvitationModal.tsx      # NEW: Create invitation UI
│   │   │   │   ├── PrivateInvitationList.tsx       # NEW: View/manage invitations
│   │   │   │   └── StudentSelector.tsx             # NEW: Select student for invitation
│   │   │   └── student/
│   │   │       └── BookingCard.tsx                 # EXTEND: Show private vs public booking type
│   │   ├── pages/
│   │   │   ├── professor/
│   │   │   │   └── ProfessorSchedule.tsx          # EXTEND: Add private invitation creation button
│   │   │   └── student/
│   │   │       └── StudentBookings.tsx            # REVIEW: Ensure private invitations display
│   │   ├── services/
│   │   │   └── api/
│   │   │       └── private-invitations.ts          # NEW: API client for private invitations
│   │   └── hooks/
│   │       └── usePrivateInvitations.ts            # NEW: React Query hooks
│   └── tests/
│       └── e2e/
│           └── private-invitation.spec.ts
│
└── shared/
    └── types/
        └── private-invitation.ts                    # NEW: Shared TypeScript types
```

**Structure Decision**: Web application (Option 2) with existing backend/frontend separation. Private invitation feature extends both packages with minimal new files - primarily adding new routes, services, and UI components while leveraging existing infrastructure (booking system, email service, Jitsi integration).

## Complexity Tracking

> **No Constitution violations detected.** This feature extends existing patterns without introducing new architectural complexity.

**Design Principles Followed**:
- Extending existing `Booking` and `AvailabilitySlot` models rather than creating parallel "PrivateBooking" entity
- Reusing existing `SlotAllowedStudent` junction table for access control
- Following established Express route patterns and Prisma service patterns
- Maintaining existing TypeScript + Zod validation approach
- Leveraging existing email notification infrastructure
