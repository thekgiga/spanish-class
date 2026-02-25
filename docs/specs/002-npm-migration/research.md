# Research: npm Migration for unlimited.rs Hosting

**Feature**: 002-npm-migration
**Date**: 2026-02-14
**Status**: Complete

## Research Questions

### Q1: npm Workspaces Compatibility with Current Setup

**Decision**: Use npm workspaces (native support since npm 7+)

**Rationale**:
- npm 7+ (released 2020) includes native workspace support
- Node.js 18+ includes npm 9+ by default
- Current project already uses Node 18+, so npm workspaces are natively available
- No additional tools needed beyond standard npm

**Alternatives Considered**:
- Lerna: Rejected - adds unnecessary complexity for simple monorepo
- Yarn workspaces: Rejected - introduces another package manager instead of standard npm
- Rush: Rejected - over-engineered for 3-package monorepo

**Implementation Details**:
- Add `"workspaces": ["packages/*"]` to root package.json
- Remove `packageManager` field (or change to npm)
- Replace `workspace:*` protocol with standard package names
- npm will automatically link workspace packages during install

### Q2: Turbo Compatibility with npm

**Decision**: Keep Turbo build system unchanged

**Rationale**:
- Turbo officially supports npm, yarn, and pnpm equally
- Turbo detects package manager automatically from lockfiles
- Current turbo.json configuration is package-manager agnostic
- No changes needed to turbo.json - it will work with npm workspaces

**Alternatives Considered**:
- Remove Turbo: Rejected - would lose build caching and parallel execution benefits
- nx: Rejected - more complex migration, Turbo already works

**Implementation Details**:
- No turbo.json changes required
- Turbo will detect npm from package-lock.json presence
- All `turbo run <task>` commands remain unchanged

### Q3: Handling workspace:* Protocol Dependencies

**Decision**: Replace `workspace:*` with package names (npm auto-resolves)

**Rationale**:
- `workspace:*` is pnpm-specific protocol
- npm workspaces use standard package names in dependencies
- npm automatically resolves to local workspace if package name matches
- No version numbers needed for internal workspace dependencies

**Alternatives Considered**:
- `file:` protocol: Rejected - creates symlinks but doesn't support proper versioning
- `link:` protocol: Rejected - deprecated in npm
- Version ranges: Rejected - unnecessary for internal packages that always use latest

**Implementation Details**:
```json
// Before (pnpm):
{
  "dependencies": {
    "@spanish-class/shared": "workspace:*"
  }
}

// After (npm):
{
  "dependencies": {
    "@spanish-class/shared": "*"
  }
}
```

### Q4: unlimited.rs Deployment Requirements

**Decision**: Standard Node.js deployment with npm install + npm run build

**Rationale**:
- unlimited.rs supports standard Node.js applications
- Uses standard npm commands (no pnpm support confirmed by user)
- Deployment script: `npm install --production && npm run start`
- Frontend can be served as static build output from Vite

**Alternatives Considered**:
- Docker deployment: Would work but adds complexity, not required
- Pre-built artifacts: Would skip npm install but requires CI/CD setup

**Implementation Details**:
- Backend deployment: `npm install && npm run build && npm run start`
- Frontend deployment: `npm install && npm run build` → serve `dist/` directory
- Environment variables set in unlimited.rs dashboard
- Start command for backend: `node dist/index.js`

### Q5: Production vs Development Dependencies

**Decision**: Maintain current dependency separation, add --production flag for deploy

**Rationale**:
- Backend needs devDependencies for build (TypeScript, tsx)
- Frontend needs devDependencies for build (Vite, TypeScript)
- Production deployment should run `npm install` (not --production) to enable builds
- After build, only production dependencies needed for runtime

**Alternatives Considered**:
- Move all build tools to production: Rejected - bloats deployment
- Pre-compile before deployment: Requires CI/CD, adds complexity

**Implementation Details**:
```bash
# Deployment sequence:
npm install              # Install all deps (needed for build)
npm run build           # Build all packages (requires devDeps)
npm prune --production  # Remove devDeps after build
node dist/index.js      # Run production server
```

### Q6: Shared Package Build Strategy

**Decision**: Keep tsup for shared package, ensure build before dependent packages

**Rationale**:
- Current setup uses tsup for shared package (works with npm)
- Turbo `dependsOn: ["^build"]` ensures shared builds before dependents
- No changes needed to build order

**Implementation Details**:
- shared/package.json: `"build": "tsup"` (unchanged)
- turbo.json: `"build": { "dependsOn": ["^build"] }` (unchanged)
- npm will install shared package from workspace, Turbo will build in correct order

## Summary of Technical Decisions

| Aspect | Decision | Reason |
|--------|----------|--------|
| Package Manager | npm workspaces (native) | Standard, no extra tools, unlimited.rs compatible |
| Build Orchestration | Keep Turbo unchanged | Already supports npm, provides caching + parallel builds |
| Workspace Protocol | Replace `workspace:*` with `*` | npm standard, auto-resolves local packages |
| Lockfile | package-lock.json | npm standard, replaces pnpm-lock.yaml |
| Deployment | Standard npm commands | unlimited.rs compatibility requirement |
| Build Tools | Keep current (tsup, tsc, vite) | All work with npm, no changes needed |

## Migration Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Dependency resolution differences | Medium | High | Test full build locally before deploying |
| Breaking changes in npm vs pnpm | Low | High | Run full test suite after migration |
| Build time increase | Low | Medium | Turbo caching mitigates this |
| Deployment script errors | Medium | High | Test deployment in staging environment first |
| Missing dependencies | Low | High | Verify package-lock.json completeness |

## Next Steps (Phase 1)

1. Generate data-model.md (minimal - this is config migration, not data change)
2. Generate quickstart.md (local testing + deployment guide)
3. No contracts needed (no API changes)
