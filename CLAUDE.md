# spanish-class Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-02-25

## Active Technologies

- TypeScript 5.4+ (Node.js 18+ for backend, ES2020 for frontend)
- Prisma ORM (Database schema and migrations)
- React + Vite (Frontend)
- Express.js (Backend API)

## Project Structure

```text
spanish-class/
├── packages/
│   ├── backend/          - Express API server
│   ├── frontend/         - React frontend
│   └── shared/           - Shared types and utilities
├── scripts/              - All automation scripts (organized by function)
│   ├── build/           - Build and packaging scripts
│   ├── deploy/          - Deployment automation
│   ├── database/        - Database migration and initialization
│   └── README.md        - Comprehensive scripts documentation
├── docs/                - Project documentation
├── specs/               - Feature specifications
└── e2e/                 - End-to-end tests
```

## Scripts Organization

**IMPORTANT:** All automation scripts are located in `/scripts/` directory, organized by function.

### Script Categories

- **`scripts/build/`** - Build and packaging operations
  - `build-deploy-package.sh` - Creates deployment packages for backend/frontend

- **`scripts/deploy/`** - Deployment automation
  - `deploy-dev.sh` - Deploy to development environment
  - `deploy-prod.sh` - Deploy to production environment
  - `deploy.sh` - Generic deployment script
  - `deploy-multi.sh` - Multi-environment deployment

- **`scripts/database/`** - Database operations
  - `init-remote-db-dev.sh` - Initialize/reset development database
  - `migrate-remote-dev.sh` - Apply migrations to development
  - `migrate-remote-prod.sh` - Apply migrations to production

**Documentation:** See `scripts/README.md` for detailed usage, safety levels, and decision trees.

## Development Rules

### Script Management

1. **All new scripts MUST be placed in `/scripts/{category}/`**
   - Choose appropriate category: build, deploy, or database
   - Follow naming convention: `{action}-{target}.sh`
   - Examples: `backup-database.sh`, `deploy-staging.sh`

2. **Script Requirements**
   - Include descriptive header comments
   - Use absolute paths or proper working directory handling
   - Add safety confirmations for destructive operations
   - Use colored output (GREEN=success, RED=danger, YELLOW=warning)
   - Provide clear error messages
   - Exit with non-zero code on failures

3. **Documentation**
   - Document new scripts in `scripts/README.md`
   - Include purpose, usage, prerequisites, safety level
   - Add to decision tree if applicable
   - Update this file (CLAUDE.md) if adding new categories

### Deployment Workflow

**Development:**
```bash
./scripts/build/build-deploy-package.sh
./scripts/deploy/deploy-dev.sh
./scripts/database/migrate-remote-dev.sh  # Only if schema changed
```

**Production:**
```bash
# Test in dev first, then:
./scripts/deploy/deploy-prod.sh
./scripts/database/migrate-remote-prod.sh  # EXTREME CAUTION!
```

### Database Operations

- **Local development:** Use `npx prisma migrate dev` in `packages/backend/`
- **Remote databases:** Use scripts in `scripts/database/` (run from local machine)
- **Never run Prisma CLI on cPanel** - Memory limits prevent it from working
- **Migrations are pre-generated** during build and included in deployment package

### cPanel Deployment Notes

- Backend deployed to `~/spanish-class-{env}/`
- Frontend deployed to `~/public_html/{env}/`
- `node_modules` must be a symlink (managed by cPanel Node.js Selector)
- Shared packages placed in `_shared_lib/` with post-install symlinks
- Prisma client pre-generated locally (not on server)
- Restart Node.js app in cPanel UI after deployment

## Commands

```bash
# Development
npm run dev          # Start all packages in dev mode
npm test            # Run all tests
npm run lint        # Lint all packages

# Build
npm run build       # Build all packages

# Database (local)
cd packages/backend
npx prisma migrate dev        # Create and apply migration
npx prisma migrate status     # Check migration status
npx prisma studio            # Open Prisma Studio
```

## Code Style

- TypeScript 5.4+ (Node.js 18+ for backend, ES2020 for frontend)
- Follow standard TypeScript conventions
- Use ESLint for code quality
- Use Prettier for formatting (if configured)

## Recent Changes

- 2026-02-25: Organized all scripts into `/scripts/` directory with categories
- 2026-02-25: Created comprehensive scripts documentation in `scripts/README.md`
- 2026-02-25: Updated GitHub Actions workflows for new script paths
- 005-profile-completion: Added TypeScript 5.4+ (Node.js 18+ for backend, ES2020 for frontend)

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
