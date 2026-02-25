# Implementation Plan: npm Migration for unlimited.rs Hosting

**Branch**: `002-npm-migration` | **Date**: 2026-02-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-npm-migration/spec.md`

## Summary

Migrate the Spanish Class platform from pnpm workspaces to npm workspaces to enable deployment on unlimited.rs hosting, which only supports standard npm. The migration must maintain 100% feature parity, preserve the current monorepo structure (backend, frontend, shared packages), and ensure both development workflow efficiency and production build quality remain intact.

**Key Technical Approach**:
- Replace `pnpm-workspace.yaml` with npm `workspaces` field in root package.json
- Convert `workspace:*` protocol dependencies to standard npm workspace references
- Maintain Turbo for build orchestration (Turbo supports npm workspaces)
- Update all npm scripts to use npm workspace commands (`npm -w` instead of pnpm `-F`)
- Ensure production builds exclude pnpm-lock.yaml and include package-lock.json
- Configure unlimited.rs deployment to use `npm install` and `npm run build`

## Technical Context

**Language/Version**: Node.js 18.0.0+, TypeScript 5.4.0
**Primary Dependencies**: Express 4.19 (backend), React 18.2 + Vite 5.2 (frontend), Prisma 5.14 (ORM), Zod 3.23 (validation)
**Storage**: MySQL database (Prisma ORM), Resend (email service)
**Testing**: Vitest (backend unit/integration), React Testing Library (frontend - to be verified)
**Target Platform**: unlimited.rs Node.js hosting (backend), static hosting or Node.js serving (frontend)
**Project Type**: Web application (monorepo with backend + frontend + shared)
**Performance Goals**: Build time <3min, deployment <5min, page load <2s on 3G
**Constraints**: Must use only npm (no pnpm), plain Node.js compatible, <512MB RAM backend
**Scale/Scope**: 100+ concurrent users, 3 packages in monorepo, ~50 files per package

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: ✅ PASS - No constitution file found (using template placeholders)

**Note**: The project's constitution file (`.specify/memory/constitution.md`) contains only template placeholders and no actual principles. This migration is a refactoring task that maintains existing architecture without introducing new complexity.

**Self-Assessment**:
- **No new architecture**: Migrating package manager without changing application design
- **No new dependencies**: Removing pnpm, keeping all application dependencies identical
- **Maintains testability**: All existing tests should pass without modification
- **Deployment constraint**: Migration driven by hosting provider limitation (legitimate external requirement)

## Project Structure

### Documentation (this feature)

```text
specs/002-npm-migration/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

**Current Structure** (pnpm-based):
```text
spanish-class/
├── package.json                    # Root: packageManager: "pnpm@9.0.0"
├── pnpm-workspace.yaml             # pnpm workspace config
├── pnpm-lock.yaml                  # pnpm lockfile
├── turbo.json                      # Turbo orchestration (supports npm)
├── packages/
│   ├── backend/
│   │   ├── package.json            # @spanish-class/backend
│   │   ├── src/
│   │   │   ├── index.ts           # Express server entry
│   │   │   ├── routes/            # API endpoints
│   │   │   ├── services/          # Business logic
│   │   │   ├── middleware/        # Auth, validation
│   │   │   └── lib/               # Utilities
│   │   ├── prisma/
│   │   │   ├── schema.prisma      # Database schema
│   │   │   └── migrations/        # DB migrations
│   │   └── tests/
│   │       ├── unit/
│   │       └── integration/
│   ├── frontend/
│   │   ├── package.json            # @spanish-class/frontend
│   │   ├── src/
│   │   │   ├── main.tsx           # React entry
│   │   │   ├── pages/             # Route pages
│   │   │   ├── components/        # Reusable UI
│   │   │   ├── hooks/             # Custom hooks
│   │   │   └── services/          # API clients
│   │   ├── public/                # Static assets
│   │   └── vite.config.ts         # Vite bundler
│   └── shared/
│       ├── package.json            # @spanish-class/shared
│       ├── src/
│       │   ├── types.ts           # Shared types
│       │   ├── schemas.ts         # Zod validation schemas
│       │   └── index.ts           # Barrel exports
│       └── tsup.config.ts         # Build config
└── specs/                         # Feature specifications
```

**Target Structure** (npm-based):
```text
spanish-class/
├── package.json                    # Root: workspaces: ["packages/*"]
├── package-lock.json               # npm lockfile (replaces pnpm-lock.yaml)
├── turbo.json                      # Unchanged (Turbo supports npm)
├── packages/
│   ├── backend/
│   │   └── package.json            # Dependencies: @spanish-class/shared (no workspace:*)
│   ├── frontend/
│   │   └── package.json            # Dependencies: @spanish-class/shared (no workspace:*)
│   └── shared/
│       └── package.json            # Unchanged (no workspace deps)
└── [all other files unchanged]
```

**Structure Decision**: Maintaining existing **Web application monorepo** structure with three packages (backend, frontend, shared). The migration only affects package management configuration files, not source code organization.

**Key Changes**:
1. Remove `pnpm-workspace.yaml`, `pnpm-lock.yaml`
2. Add `workspaces` field to root `package.json`
3. Replace `workspace:*` with npm workspace syntax in package.json dependencies
4. Update root `package.json` scripts from `-w` flags to npm workspace commands
5. Generate new `package-lock.json` via `npm install`

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**Status**: N/A - No constitution violations

This is a refactoring task that reduces complexity by removing pnpm dependency and adopting standard npm, making the project more compatible with common hosting providers.
