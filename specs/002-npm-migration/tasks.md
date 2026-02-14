# Tasks: npm Migration for unlimited.rs Hosting

**Input**: Design documents from `/specs/002-npm-migration/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md

**Tests**: Not required for this configuration-only migration

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

This project uses a monorepo structure:
- **Root**: `package.json`, workspace configuration
- **Backend**: `packages/backend/`
- **Frontend**: `packages/frontend/`
- **Shared**: `packages/shared/`

---

## Phase 1: Setup (Migration Preparation)

**Purpose**: Prepare project for pnpm-to-npm migration

- [ ] T001 Verify current pnpm setup works correctly with `pnpm install && pnpm run build`
- [ ] T002 Document current dependency tree using `pnpm list --depth=0` for rollback reference
- [ ] T003 [P] Create backup branch from current state using `git checkout -b backup/pre-npm-migration`

---

## Phase 2: Foundational (Core Migration)

**Purpose**: Core package manager migration that MUST be complete before any user story validation

**⚠️ CRITICAL**: All user stories depend on this phase being completed correctly

- [ ] T004 Remove pnpm-specific files: `pnpm-workspace.yaml` and `pnpm-lock.yaml` from repository root
- [ ] T005 Update root `package.json`: Add `"workspaces": ["packages/*"]` field
- [ ] T006 Update root `package.json`: Remove `"packageManager": "pnpm@9.0.0"` field
- [ ] T007 Update root `package.json`: Add `"private": true` field (required for npm workspaces)
- [ ] T008 Update `packages/backend/package.json`: Replace `"@spanish-class/shared": "workspace:*"` with `"@spanish-class/shared": "*"`
- [ ] T009 Update `packages/frontend/package.json`: Replace `"@spanish-class/shared": "workspace:*"` with `"@spanish-class/shared": "*"`
- [ ] T010 Run `npm install` from repository root to generate `package-lock.json` and verify workspace linking
- [ ] T011 Verify shared package is correctly linked using `npm ls @spanish-class/shared` in backend and frontend packages

**Checkpoint**: Foundation ready - npm workspaces configured and dependencies installed

---

## Phase 3: User Story 1 - Deploy Application to unlimited.rs (Priority: P1) 🎯 MVP

**Goal**: Enable successful deployment of the Spanish Class application to unlimited.rs hosting using npm-based build process

**Independent Test**: Run `npm install && npm run build` in clean directory, then verify both backend and frontend build outputs exist and are functional

### Implementation for User Story 1

- [ ] T012 [US1] Verify backend builds successfully using `npm run build` in `packages/backend/`
- [ ] T013 [US1] Verify frontend builds successfully using `npm run build` in `packages/frontend/`
- [ ] T014 [US1] Verify shared package builds successfully using `npm run build` in `packages/shared/`
- [ ] T015 [US1] Test backend production start using `npm run start` in `packages/backend/` (after build)
- [ ] T016 [US1] Verify backend can connect to database and handle requests after npm build
- [ ] T017 [US1] Verify frontend static assets are correctly generated in `packages/frontend/dist/`
- [ ] T018 [US1] Test full application build from root using `npm run build` (Turbo orchestration)
- [ ] T019 [US1] Create deployment documentation for unlimited.rs in `specs/002-npm-migration/deployment-guide.md`
- [ ] T020 [US1] Document required environment variables for unlimited.rs deployment
- [ ] T021 [US1] Document unlimited.rs start command: `npm install && npm run build && npm run start` (backend)

**Checkpoint**: Application builds and runs successfully with npm - ready for unlimited.rs deployment

---

## Phase 4: User Story 2 - Maintain Development Workflow (Priority: P2)

**Goal**: Ensure developers can work efficiently with npm-based development workflow, maintaining hot-reload and fast iteration

**Independent Test**: Run `npm install` in fresh clone, then development scripts in both backend and frontend, verify hot-reload works on file changes

### Implementation for User Story 2

- [ ] T022 [US2] Test development workflow: Execute development script in `packages/backend/` and verify hot-reload
- [ ] T023 [US2] Test development workflow: Execute development script in `packages/frontend/` and verify hot-reload
- [ ] T024 [US2] Verify shared package changes trigger rebuild in dependent packages during development
- [ ] T025 [US2] Test parallel development mode from root using Turbo orchestration
- [ ] T026 [US2] Measure and document npm install time (should be <2 minutes per requirement)
- [ ] T027 [US2] Update development documentation in `README.md` to reflect npm commands
- [ ] T028 [US2] Update development documentation to remove all pnpm references
- [ ] T029 [US2] Verify linting and type-checking commands work with npm workspace structure

**Checkpoint**: Development workflow is smooth with npm - developers can work efficiently

---

## Phase 5: User Story 3 - Ensure Production Build Quality (Priority: P3)

**Goal**: Optimize production builds to be secure, performant, and free of development dependencies

**Independent Test**: Run production build, analyze bundle sizes, verify only production dependencies in node_modules, test performance

### Implementation for User Story 3

- [ ] T030 [US3] Document production build process: `npm install && npm run build && npm prune --production`
- [ ] T031 [US3] Verify backend production build excludes devDependencies after `npm prune --production`
- [ ] T032 [US3] Measure and document production bundle sizes (backend dist/, frontend dist/)
- [ ] T033 [US3] Compare bundle sizes with previous pnpm builds (should be within 10% per requirement)
- [ ] T034 [US3] Verify frontend assets are minified and optimized in production build
- [ ] T035 [US3] Test backend memory usage under load (should be <512MB per requirement)
- [ ] T036 [US3] Document optimization strategies for unlimited.rs deployment
- [ ] T037 [US3] Create production deployment checklist in `specs/002-npm-migration/production-checklist.md`

**Checkpoint**: Production builds are optimized and ready for unlimited.rs deployment at scale

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, cleanup, and documentation updates

- [ ] T038 [P] Update `.gitignore` to include `package-lock.json` and exclude `pnpm-lock.yaml`
- [ ] T039 [P] Update CI/CD documentation (if exists) to use npm instead of pnpm
- [ ] T040 Verify all npm scripts in root `package.json` work correctly with npm workspaces
- [ ] T041 Run full test suite using `npm run test` to ensure 100% feature parity
- [ ] T042 Validate all acceptance scenarios from spec.md are met
- [ ] T043 Create migration summary document with before/after comparison
- [ ] T044 [P] Update contributor documentation for new developer onboarding
- [ ] T045 Remove backup branch if migration successful: `git branch -D backup/pre-npm-migration`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can proceed sequentially in priority order (P1 → P2 → P3)
  - Or can be validated in parallel if each story's tests are run independently
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent of US1
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Independent of US1/US2

### Within Each User Story

- **User Story 1**: Build tasks should run sequentially (shared → backend/frontend → integration)
- **User Story 2**: Development workflow tests can run in parallel across packages
- **User Story 3**: Production optimization tasks should run after build verification

### Parallel Opportunities

- Phase 1: Tasks T001-T003 can run in parallel
- Phase 2: Tasks are sequential (each modifies package.json files)
- User Story 1: Tasks T012, T013, T014 (individual package builds) can run in parallel
- User Story 2: Tasks T022, T023 (workflow per package) can run in parallel
- User Story 3: Tasks T031-T036 (analysis tasks) can run in parallel after build
- Phase 6: Tasks T038, T039, T044 can run in parallel

---

## Parallel Example: User Story 1 - Build Verification

```bash
# Launch individual package builds in parallel:
Task: "Verify backend builds successfully in packages/backend/"
Task: "Verify frontend builds successfully in packages/frontend/"
Task: "Verify shared package builds successfully in packages/shared/"

# Then verify integration:
Task: "Test full application build from root (Turbo orchestration)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup → Verify current state
2. Complete Phase 2: Foundational → Migrate to npm workspaces
3. Complete Phase 3: User Story 1 → Verify deployment capability
4. **STOP and VALIDATE**: Test deployment to unlimited.rs staging
5. Merge if deployment successful

### Incremental Delivery

1. Complete Setup + Foundational → npm migration complete
2. Add User Story 1 → Deployment ready → Deploy to staging
3. Add User Story 2 → Development workflow validated → Merge
4. Add User Story 3 → Production optimization → Final deployment
5. Each story adds validation without breaking previous functionality

### Rollback Strategy

If migration fails:
1. Checkout backup branch: `git checkout backup/pre-npm-migration`
2. Restore pnpm workflow
3. Investigate specific failure points
4. Address issues and retry migration

---

## Notes

- **No source code changes**: This migration only affects package.json files and workspace configuration
- **Turbo compatibility**: turbo.json requires no changes - Turbo auto-detects npm from package-lock.json
- **Workspace protocol**: npm uses `*` version for workspace packages (not `workspace:*`)
- **Production deployment**: Use `npm install` (not `--production`) for build, then `npm prune --production`
- **Rollback safety**: Backup branch created in Phase 1 for emergency rollback
- **Testing focus**: Verify 100% feature parity - all existing functionality must work identically
- **Performance validation**: Build time <3min, install time <2min, page load <2s per requirements
- **unlimited.rs compatibility**: Standard npm commands only - no pnpm-specific features

---

## Task Summary

- **Total Tasks**: 45
- **Setup Phase**: 3 tasks
- **Foundational Phase**: 8 tasks (CRITICAL - blocks all stories)
- **User Story 1 (P1)**: 10 tasks - Deploy to unlimited.rs
- **User Story 2 (P2)**: 8 tasks - Development workflow
- **User Story 3 (P3)**: 8 tasks - Production quality
- **Polish Phase**: 8 tasks
- **Parallel Opportunities**: ~15 tasks can run in parallel within their phases
