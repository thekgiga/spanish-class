# Implementation Plan: Student Profile Completion Enhancement

**Branch**: `005-profile-completion` | **Date**: 2026-02-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-profile-completion/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement a LinkedIn-style profile completion system that motivates students to complete their profile by displaying completion percentage on the dashboard, separating view/edit modes on the profile page, and ensuring all profile fields (date of birth, phone number, about me, Spanish level, preferred class types, learning goals, availability notes) are fully persisted in the database. The system will calculate completion percentage in real-time and congratulate students upon reaching 100% completion.

## Technical Context

**Language/Version**: TypeScript 5.4+ (Node.js 18+ for backend, ES2020 for frontend)
**Primary Dependencies**:
- Backend: Express 4.19, Prisma 5.14 (ORM), Zod 3.23 (validation), MySQL 8.0
- Frontend: React 18.2, React Hook Form 7.51, Zustand 4.5 (state), TailwindCSS 3.4
- Shared: Zod 3.23 (schemas)
**Storage**: MySQL 8.0 via Prisma ORM - extend User model with 7 new profile fields
**Testing**: Vitest 4.0 (unit/integration), Playwright 1.58 (E2E)
**Target Platform**: Web application (responsive desktop/mobile browser)
**Project Type**: Monorepo web application (packages/backend, packages/frontend, packages/shared)
**Performance Goals**: Profile load <2s, save operation <1s, completion calculation <100ms
**Constraints**:
- Profile fields must be nullable (optional completion)
- Real-time completion % recalculation on backend
- Graceful handling of concurrent profile edits
- Backward compatible with existing User records
**Scale/Scope**:
- 7 new database fields on User model
- 2 new API endpoints (GET/PUT /api/student/profile - extend existing)
- 1 new component (ProfileCompletionCard for dashboard)
- 1 major refactor (StudentProfilePage - add view/edit modes)
- Target: ~500-1000 students

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: ✅ PASSED - No constitution file defined for this project

**Note**: The project does not have a defined constitution file at `.specify/memory/constitution.md`. The constitution template is present but contains only placeholder content. Therefore, no constitutional gates are enforced for this feature.

**Default Quality Gates Applied**:
- Code must have test coverage
- API contracts must be documented
- Database migrations must be reversible
- Breaking changes require version bump

## Project Structure

### Documentation (this feature)

```text
specs/005-profile-completion/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── profile-api.yaml # OpenAPI spec for profile endpoints
├── checklists/
│   └── requirements.md  # Spec validation checklist
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
packages/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   └── student.ts              # Extend existing GET/PUT /api/student/profile
│   │   └── services/
│   │       └── profile-completion.ts   # NEW: Profile completion calculation service
│   ├── prisma/
│   │   ├── schema.prisma               # MODIFY: Add 7 fields to User model
│   │   └── migrations/                 # NEW: Migration for profile fields
│   └── tests/
│       ├── unit/
│       │   └── profile-completion.test.ts
│       └── integration/
│           └── student-profile.test.ts
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── student/
│   │   │   │   └── ProfileCompletionCard.tsx  # NEW: Dashboard completion widget
│   │   │   └── ui/
│   │   │       └── [existing components]      # Reuse existing UI components
│   │   ├── pages/
│   │   │   └── student/
│   │   │       ├── StudentDashboard.tsx       # MODIFY: Add ProfileCompletionCard
│   │   │       └── StudentProfilePage.tsx     # MODIFY: Add view/edit mode separation
│   │   └── lib/
│   │       └── api.ts                         # MODIFY: Type updates for new fields
│   └── tests/
│       └── e2e/
│           └── profile-completion.spec.ts     # NEW: E2E tests for completion flow
│
└── shared/
    └── src/
        ├── types.ts                    # MODIFY: Add new profile field types
        └── schemas.ts                  # MODIFY: Update updateStudentProfileSchema
```

**Structure Decision**: This is a **web application monorepo** with three packages. The feature extends existing profile endpoints in the backend and adds new UI components in the frontend. The shared package provides type-safe contracts between frontend and backend using Zod schemas.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**Status**: N/A - No constitutional violations detected

This feature follows existing architectural patterns:
- Extends existing User model (no new tables)
- Uses existing API endpoints (no new routes, just enhanced)
- Leverages existing UI components (Card, Button, Input, etc.)
- Follows established validation patterns (Zod schemas)
- No additional dependencies required
- No new architectural patterns introduced

## Phase 0: Research Findings

**Status**: ✅ Complete
**Output**: [research.md](./research.md)

### Key Decisions Made

1. **Database Schema**: Extend User model with 7 nullable fields instead of creating separate StudentProfile table
2. **Completion Calculation**: Equal-weight formula (100% / 7 fields), backend-computed for consistency
3. **View/Edit Mode**: Single-page toggle pattern using React state
4. **Dashboard Notification**: Non-dismissible card with progress bar and CTA
5. **Validation**: Multi-layer (Zod + HTML5) following existing patterns
6. **Concurrency**: Last-write-wins (no optimistic locking needed)
7. **Migration**: Zero-downtime with nullable fields

All technical unknowns resolved. See [research.md](./research.md) for detailed rationale and alternatives considered.

---

## Phase 1: Design Artifacts

**Status**: ✅ Complete

### Generated Artifacts

1. **Data Model**: [data-model.md](./data-model.md)
   - User model extension with 7 new fields
   - ProfileCompletion virtual entity definition
   - Field validation rules and constraints
   - Migration scripts (up/down)
   - State transition diagram

2. **API Contracts**: [contracts/profile-api.yaml](./contracts/profile-api.yaml)
   - OpenAPI 3.0 specification
   - GET /api/student/profile
   - PUT /api/student/profile
   - Complete request/response schemas
   - Error response definitions

3. **Quickstart Guide**: [quickstart.md](./quickstart.md)
   - Step-by-step implementation instructions
   - 8 phases with time estimates
   - File-by-file modification guide
   - Testing strategy
   - Troubleshooting section
   - Success metrics

4. **Agent Context**: Updated CLAUDE.md
   - Added TypeScript 5.4+ to project context
   - Added MySQL 8.0 with Prisma ORM
   - Added monorepo web application structure

### Constitution Re-check

**Status**: ✅ PASSED (post-design)

No new violations introduced. Design follows existing patterns:
- No new tables (extends existing User model)
- No new architectural patterns (uses existing Prisma/Express/React)
- No additional dependencies
- Maintains backward compatibility

---

## Phase 2: Task Generation

**Status**: ⏳ Pending - Use `/speckit.tasks` command

This phase will be completed by the `/speckit.tasks` command, which will:
- Break down implementation into dependency-ordered tasks
- Assign time estimates to each task
- Create task tracking file at [tasks.md](./tasks.md)

---

## Implementation Readiness

**Overall Status**: ✅ Ready for Implementation

### Checklist

- [x] Specification complete and validated
- [x] All technical unknowns resolved (research.md)
- [x] Data model designed (data-model.md)
- [x] API contracts defined (contracts/profile-api.yaml)
- [x] Implementation guide created (quickstart.md)
- [x] Agent context updated (CLAUDE.md)
- [x] Constitution checks passed (pre and post design)
- [ ] Tasks generated (pending /speckit.tasks command)

### Next Steps

1. Run `/speckit.tasks` to generate implementation task list
2. Review and approve tasks
3. Run `/speckit.implement` to execute tasks
4. Alternatively, implement manually following quickstart.md

### Estimated Effort

- **Backend**: 2.5 hours (schema, service, API, tests)
- **Frontend**: 2.5 hours (components, pages, E2E tests)
- **Testing & Polish**: 1 hour
- **Total**: ~6-7 hours for complete implementation

### Risk Assessment

**Low Risk Feature**:
- Extends existing functionality (no greenfield development)
- All fields optional/nullable (no data migration risk)
- Backward compatible (existing users unaffected)
- Simple business logic (field counting)
- Well-understood UI patterns (view/edit modes common)

**Mitigation Strategies**:
- Comprehensive test coverage (unit, integration, E2E)
- Gradual rollout possible (feature flag not needed but easy to add)
- Rollback plan: Drop new columns if issues arise

---

## References

- **Specification**: [spec.md](./spec.md)
- **Research**: [research.md](./research.md)
- **Data Model**: [data-model.md](./data-model.md)
- **API Contract**: [contracts/profile-api.yaml](./contracts/profile-api.yaml)
- **Quickstart**: [quickstart.md](./quickstart.md)
- **Requirements Checklist**: [checklists/requirements.md](./checklists/requirements.md)

---

**Plan Version**: 1.0
**Last Updated**: 2026-02-15
**Author**: Claude Code (speckit.plan command)
