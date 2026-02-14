# Implementation Plan: Platform Enhancements

**Branch**: `003-platform-enhancements` | **Date**: 2026-02-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-platform-enhancements/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This feature set adds critical platform enhancements to the Spanish class booking system:

**Priority 1 (P1) - Core Revenue & Control Features:**
- **Professor Booking Confirmation**: Shift from auto-confirmed bookings to professor-approval workflow via email confirmation links
- **Per-Student Pricing**: Allow professors to set custom prices in RSD for individual students (visible only to professors)

**Priority 2 (P2) - Market Expansion:**
- **Multi-Language Support**: Platform available in English, Serbian, and Spanish with geolocation-based auto-detection
- **Group Classes**: Enable multiple students in a single session with participant management

**Priority 3 (P3) - Growth & Intelligence:**
- **Advanced Analytics**: Professor and admin dashboards showing earnings, retention, platform metrics
- **Referral & Rating System**: Student referrals with rewards and mutual rating system between students/professors

**Technical Approach**: Extend existing TypeScript/Express/React/MySQL stack with Prisma schema changes, i18n library integration, email service enhancements, and analytics aggregation queries.

## Technical Context

**Language/Version**: TypeScript 5.4+, Node.js 18+
**Primary Dependencies**:
- Backend: Express.js, Prisma (MySQL), Resend (email), BullMQ (job queue), Jitsi (video)
- Frontend: React 18, Vite, Zustand (state), React Router, TailwindCSS, shadcn/ui
- i18n: NEEDS CLARIFICATION (react-i18next vs react-intl)
- Email templates: NEEDS CLARIFICATION (React Email vs Handlebars)
- Geolocation: NEEDS CLARIFICATION (IP-based service selection)

**Storage**: MySQL 8+ via Prisma ORM, Redis 6+ for BullMQ job queue
**Testing**: Vitest (unit/integration, 80% coverage threshold), Playwright (E2E)
**Target Platform**: Web application (unlimited.rs cPanel hosting)
**Project Type**: Web monorepo (backend + frontend packages via npm workspaces + Turborepo)
**Performance Goals**:
- <500ms API response time for booking operations
- <2s language switch time
- Support 10+ concurrent students in group video calls

**Constraints**:
- No payment processing (pricing tracking only, manual fulfillment)
- Email-based confirmation flow (no instant booking)
- Geolocation accuracy 90% (fallback to English)
- BullMQ for async jobs (email sending, analytics aggregation)

**Scale/Scope**:
- Support 100+ professors, 1000+ students
- 3 languages (en, sr, es)
- Up to 10 students per group class
- Analytics data retention: 1 year

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: ⚠️ CONSTITUTION NOT CONFIGURED

The constitution file at `.specify/memory/constitution.md` contains only template placeholders. No project-specific principles, testing requirements, or architectural constraints are defined.

**Proceeding with standard best practices**:
- ✅ Test-driven development (80% coverage threshold already in place via vitest.config.ts)
- ✅ Type safety (TypeScript with strict mode)
- ✅ Database migrations (Prisma schema versioning)
- ✅ Code review before merge (manual verification)

**Recommendation**: Run `/speckit.constitution` to establish project-specific architectural principles before implementing additional features.

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
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema (modifications here)
│   │   └── seed.ts              # Test data seeding
│   ├── src/
│   │   ├── index.ts             # Express server entry point
│   │   ├── lib/
│   │   │   ├── jwt.ts           # Authentication utilities
│   │   │   └── prisma.ts        # Prisma client singleton
│   │   ├── middleware/
│   │   │   ├── auth.ts          # JWT verification
│   │   │   ├── error.ts         # Error handling
│   │   │   └── validate.ts      # Request validation
│   │   ├── services/
│   │   │   ├── email.ts         # NEW: Email service (Resend)
│   │   │   ├── i18n.ts          # NEW: Translation service
│   │   │   ├── pricing.ts       # NEW: Pricing management
│   │   │   ├── analytics.ts     # NEW: Analytics aggregation
│   │   │   ├── referrals.ts     # NEW: Referral tracking
│   │   │   ├── ratings.ts       # NEW: Rating system
│   │   │   ├── jitsi.ts         # Existing: Video link generation
│   │   │   └── ics.ts           # Existing: Calendar file generation
│   │   ├── routes/
│   │   │   ├── auth.ts          # Existing: Login/register
│   │   │   ├── availability.ts  # Modify: Group class support
│   │   │   ├── bookings.ts      # Modify: Pending confirmation flow
│   │   │   ├── pricing.ts       # NEW: Professor pricing management
│   │   │   ├── analytics.ts     # NEW: Dashboard data
│   │   │   ├── referrals.ts     # NEW: Referral link generation
│   │   │   └── ratings.ts       # NEW: Rate user endpoints
│   │   └── workers/
│   │       ├── reminder.ts      # Existing: Email reminders
│   │       └── analytics.ts     # NEW: Periodic analytics aggregation
│   └── __tests__/               # Vitest tests (unit + integration)
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/          # Existing: Header, Footer
│   │   │   └── ui/              # Existing: shadcn/ui components
│   │   ├── pages/
│   │   │   ├── auth/            # Existing: Login, Register
│   │   │   ├── student/         # Modify: Add group booking, referrals
│   │   │   ├── professor/       # NEW: Pricing, analytics, confirmations
│   │   │   └── shared/          # Modify: Settings (language selector)
│   │   ├── lib/
│   │   │   ├── api.ts           # Existing: API client
│   │   │   ├── i18n.ts          # NEW: i18n configuration
│   │   │   └── utils.ts         # Existing: Utility functions
│   │   ├── locales/             # NEW: Translation files (en/sr/es)
│   │   │   ├── en.json
│   │   │   ├── sr.json
│   │   │   └── es.json
│   │   └── stores/
│   │       ├── auth.ts          # Existing: Auth state
│   │       └── i18n.ts          # NEW: Language preference state
│   └── __tests__/               # Component tests
│
└── shared/
    └── src/
        ├── types/               # Modify: Add new entity types
        └── validators/          # Modify: Add new validation schemas

tests/
└── e2e/                         # Playwright E2E tests
    ├── booking-confirmation.spec.ts  # NEW
    ├── group-classes.spec.ts         # NEW
    └── language-switching.spec.ts    # NEW
```

**Structure Decision**: Web application monorepo using npm workspaces. Backend and frontend are separate packages with a shared package for common types and validators. This structure supports the existing deployment model (backend to cPanel Node.js app, frontend static files to public_html).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitution violations identified. Standard best practices apply.

---

## Phase 0: Research Findings

### Technology Decisions

**1. Internationalization (i18n)**
- **Decision**: react-i18next
- **Rationale**: Built-in language detection, TypeScript support, <50ms language switching, JSON format
- **Alternative**: LinguiJS (smaller bundle but no built-in detection)
- **Installation**: `npm install i18next react-i18next i18next-http-backend i18next-browser-languagedetector`

**2. Email Templating**
- **Decision**: React Email
- **Rationale**: Already installed, native Resend integration, TypeScript-first, component reusability
- **Alternative**: Handlebars (simpler but lacks TypeScript support)
- **Project Structure**: `packages/backend/emails/{components,templates,i18n}`

**3. Geolocation for Language Detection**
- **Decision**: Hybrid approach (Accept-Language → Cloudflare headers → GeoJS API → English default)
- **Rationale**: Zero cost, 95-99% accuracy, <100ms latency, GDPR compliant
- **Primary Service**: GeoJS (unlimited free tier, MaxMind data)
- **Fallback**: Accept-Language header (zero latency, user preference)

**4. Booking Confirmation Tokens**
- **Decision**: JWT with jti claim, 48-hour expiration
- **Rationale**: Industry standard, prevents replay attacks, self-contained, tamper-proof
- **Security**: jti tracking in `UsedConfirmationToken` table prevents token reuse
- **Automatic Expiration**: Cron job runs hourly to expire pending bookings after 48h

**5. Analytics Implementation**
- **Decision**: Hybrid approach (pre-aggregated summary tables + on-demand + Redis caching)
- **Rationale**: <3s dashboard load, near real-time (5-15 min delay), scalable to 100k+ bookings
- **BullMQ Jobs**:
  - Hourly: Aggregate daily stats
  - Daily 2 AM: Aggregate monthly stats
  - Every 15 min: Platform-wide stats
- **Cache TTL**: 5 minutes (Redis)

### Research Summary

All "NEEDS CLARIFICATION" items from Technical Context have been resolved through comprehensive research with industry best practices, security considerations, and performance benchmarks. See research agents' detailed reports for implementation examples, code samples, and source references.
