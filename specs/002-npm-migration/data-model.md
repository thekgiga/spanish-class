# Data Model: npm Migration

**Feature**: 002-npm-migration
**Date**: 2026-02-14

## Overview

This migration does NOT introduce new data entities or modify existing database schemas. All data models remain unchanged. This document describes configuration entities for reference.

## Configuration Entities

### Workspace Configuration

**Entity**: `WorkspaceConfig`
**Location**: Root `package.json`
**Purpose**: Defines npm workspace structure for monorepo management

**Attributes**:
- `workspaces`: Array of glob patterns (e.g., `["packages/*"]`)
- `private`: Boolean (must be `true` for workspace roots)
- `scripts`: Object mapping script names to commands
- `devDependencies`: Development tools used by all packages

**Relationships**:
- Contains 0..N Package configurations (backend, frontend, shared)

**Validation Rules**:
- Workspace root must have `"private": true`
- `workspaces` array must not be empty
- All workspace paths must exist on filesystem

**State**: Static configuration file

---

### Package Configuration

**Entity**: `PackageConfig`
**Location**: `packages/*/package.json`
**Purpose**: Defines individual package metadata and dependencies

**Attributes**:
- `name`: Package identifier (e.g., `@spanish-class/backend`)
- `version`: Semantic version string
- `dependencies`: Production dependencies (including workspace packages)
- `devDependencies`: Development-only dependencies
- `scripts`: Package-specific build/dev/test commands
- `main/module/types`: Entry points for different import methods

**Relationships**:
- Belongs to 1 WorkspaceConfig (root)
- May depend on 0..N other Packages via dependencies

**Validation Rules**:
- Package name must match workspace convention (`@spanish-class/*`)
- Workspace dependencies must use `*` version (not `workspace:*`)
- Entry points must exist in `dist/` after build

**State**: Static configuration file

---

### Build Artifacts

**Entity**: `BuildOutput`
**Location**: `packages/*/dist/`
**Purpose**: Compiled output from TypeScript/Vite builds

**Attributes** (backend/shared):
- `dist/index.js`: CommonJS entry point
- `dist/index.mjs`: ES Module entry point (shared only)
- `dist/index.d.ts`: TypeScript definitions

**Attributes** (frontend):
- `dist/index.html`: Application entry
- `dist/assets/*.js`: JavaScript bundles
- `dist/assets/*.css`: Stylesheet bundles

**Relationships**:
- Generated from 1 Package source code
- Consumed by deployment system (unlimited.rs)

**Lifecycle**:
1. Created: `npm run build`
2. Used: `npm run start` (backend) or static serving (frontend)
3. Cleaned: `npm run clean`

**Validation Rules**:
- Must exist before deployment
- Backend dist must include valid Node.js modules
- Frontend dist must include valid HTML entry point

## Configuration Flow Diagram

```text
┌─────────────────────────────────────┐
│ Root package.json                   │
│ - workspaces: ["packages/*"]        │
│ - scripts: turbo commands           │
└────────┬────────────────────────────┘
         │ contains
         ├────────────────┬────────────────┬──────────────
         │                │                │
    ┌────▼─────┐    ┌────▼─────┐    ┌────▼─────┐
    │ backend/ │    │frontend/ │    │ shared/  │
    │package.json│  │package.json│  │package.json│
    └────┬─────┘    └────┬─────┘    └────┬─────┘
         │                │                │
         │ depends on     │ depends on     │
         └────────────────┴───────────────►│
                     (shared package)      │
                                          │
                                    ┌─────▼─────┐
                                    │   dist/   │
                                    │  (build)  │
                                    └───────────┘
```

## Database Schema

**Status**: NO CHANGES

The migration from pnpm to npm does not affect:
- Prisma schema (`backend/prisma/schema.prisma`)
- Database migrations (`backend/prisma/migrations/*`)
- Database connection configuration
- ORM models or queries

All database operations remain identical before and after migration.

## Environment Configuration

**Status**: NO CHANGES

Environment variables remain unchanged:
- `.env` files continue to work
- `process.env.*` access unchanged
- unlimited.rs environment variable configuration works the same

## Summary

This migration is **configuration-only**. No runtime data structures, database schemas, or API contracts are modified. The change is transparent to the application logic - only the package management system changes from pnpm to npm.
