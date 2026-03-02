# Scripts Documentation

This directory contains all automation scripts for the Spanish Class Platform, organized by function.

## Directory Structure

```
scripts/
├── build/       - Build and packaging scripts
├── deploy/      - Deployment automation
├── database/    - Database migration and initialization
└── README.md    - This file
```

---

## Build Scripts

### `build/build-deploy-package.sh`

**Purpose:** Creates deployment packages for backend and frontend with all dependencies.

**What it does:**
- Installs dependencies in packages/backend and packages/frontend
- Builds frontend (creates optimized production bundle)
- Builds backend (compiles TypeScript)
- Pre-generates Prisma client (to avoid memory issues on server)
- Copies shared packages to `_shared_lib/` directory
- Creates deployment package in `deploy/` directory with setup scripts
- Removes development dependencies from production package

**When to use:** Before any deployment (dev or prod)

**Usage:**
```bash
./scripts/build/build-deploy-package.sh
```

**Output:** `deploy/` directory with backend/ and frontend/ subdirectories

**Safety:** ✅ **SAFE** - Only creates local build artifacts, doesn't modify server

**Required before:**
- Running any deploy script
- Deploying to cPanel manually

---

## Deploy Scripts

### `deploy/deploy-dev.sh`

**Purpose:** Automated deployment to development environment (dev.casovispanskog.rs)

**What it does:**
- Runs build script automatically
- Deploys backend to `~/spanish-class-dev/`
- Deploys frontend to `~/public_html/dev.casovispanskog.rs/`
- Runs npm install on server
- Executes setup-shared-package.sh to create symlinks

**When to use:** Deploying code changes to development environment

**Usage:**
```bash
./scripts/deploy/deploy-dev.sh
```

**Safety:** ⚠️ **CAUTION** - Deploys to server but won't run database migrations

**Prerequisites:**
- SSH access to casovispanskog.rs
- cPanel credentials configured
- Node.js app set up in cPanel

**Does NOT:**
- Run database migrations (use database scripts separately)
- Overwrite test data in database

### `deploy/deploy-prod.sh`

**Purpose:** Automated deployment to production environment (casovispanskog.rs)

**What it does:**
- Creates backup of existing production deployment
- Runs build script automatically
- Deploys backend to `~/spanish-class-prod/`
- Deploys frontend to `~/public_html/`
- Runs npm install on server
- Executes setup-shared-package.sh
- Shows rollback instructions if needed

**When to use:** Deploying to production (requires extreme caution!)

**Usage:**
```bash
./scripts/deploy/deploy-prod.sh
```

**Safety:** 🔴 **DANGEROUS** - Deploys to production, creates backup first

**Prerequisites:**
- All changes tested in development
- Database migrations tested separately
- Manual approval/confirmation before running

**Does NOT:**
- Run database migrations (use database scripts separately)
- Restart Node.js app (must restart manually in cPanel)

### `deploy/deploy.sh`

**Purpose:** Generic deployment script with configurable target

**When to use:** Custom deployment scenarios or scripted deployments

**Safety:** ⚠️ **CAUTION** - Depends on configuration

### `deploy/deploy-multi.sh`

**Purpose:** Deploy to multiple environments simultaneously

**When to use:** Rare cases where identical deployment needed on multiple servers

**Safety:** 🔴 **DANGEROUS** - Affects multiple environments

---

## Database Scripts

### `database/init-remote-db-dev.sh`

**Purpose:** Initialize or completely reset the remote development database

**What it does:**
- Reads DATABASE_URL from `packages/backend/.env.dev`
- Connects to remote dev database (replaces localhost with casovispanskog.rs)
- Runs `prisma db push --force-reset` (DELETES all data!)
- Applies current schema from schema.prisma
- Marks all existing migrations as applied

**When to use:**
- First-time database setup for development
- Complete database reset during development
- Fixing migration state issues in dev

**Usage:**
```bash
./scripts/database/init-remote-db-dev.sh
```

**Safety:** 🔴 **DESTRUCTIVE** - Deletes ALL data in dev database!

**Confirmation required:** Type "reset" to confirm

**Prerequisites:**
- `packages/backend/.env.dev` configured with database credentials

**Does NOT:**
- Affect production database
- Preserve any existing data

### `database/migrate-remote-dev.sh`

**Purpose:** Apply pending database migrations to remote development database

**What it does:**
- Reads DATABASE_URL from `packages/backend/.env.dev`
- Connects to remote dev database
- Runs `prisma migrate deploy` (applies pending migrations only)
- Preserves existing data (if migrations are written correctly)

**When to use:**
- After creating new migrations with `prisma migrate dev` locally
- Deploying schema changes to development environment
- After pulling new migrations from git

**Usage:**
```bash
./scripts/database/migrate-remote-dev.sh
```

**Safety:** ⚠️ **CAUTION** - Safe if migrations are properly written, preserves data

**Confirmation required:** Type "yes" to confirm

**Prerequisites:**
- Migrations created locally and tested
- `packages/backend/.env.dev` configured

**Does NOT:**
- Create new migrations (use `npx prisma migrate dev` locally)
- Affect production database

### `database/migrate-remote-prod.sh`

**Purpose:** Apply pending database migrations to PRODUCTION database

**What it does:**
- Reads DATABASE_URL from `packages/backend/.env.production`
- Validates no placeholder values in configuration
- Shows pending migrations for review
- Connects to remote production database
- Runs `prisma migrate deploy` after multiple confirmations
- Shows post-deployment checklist

**When to use:**
- Deploying schema changes to production
- ONLY after testing migrations in development first

**Usage:**
```bash
./scripts/database/migrate-remote-prod.sh
```

**Safety:** 🔴 **EXTREMELY DANGEROUS** - Modifies production database!

**Confirmation required:**
1. Type exact database name
2. Type "MIGRATE PRODUCTION"

**Prerequisites:**
- Migrations tested in development
- Database backup created
- Production .env.production configured
- All team members notified

**Checklist before running:**
- [ ] Tested migrations in development first
- [ ] Created database backup
- [ ] Reviewed all migration files
- [ ] Informed users of potential downtime

**Does NOT:**
- Create backups automatically (do this manually in cPanel)
- Rollback automatically if issues occur

---

## Quick Decision Tree

**"I want to..."**

### Deploy Code Changes

| Scenario | Script | Safety |
|----------|--------|--------|
| Deploy to development | `./scripts/deploy/deploy-dev.sh` | ⚠️ Caution |
| Deploy to production | `./scripts/deploy/deploy-prod.sh` | 🔴 Dangerous |
| Just build package | `./scripts/build/build-deploy-package.sh` | ✅ Safe |

### Database Operations

| Scenario | Script | Safety |
|----------|--------|--------|
| First-time dev DB setup | `./scripts/database/init-remote-db-dev.sh` | 🔴 Destructive |
| Apply migrations to dev | `./scripts/database/migrate-remote-dev.sh` | ⚠️ Caution |
| Apply migrations to prod | `./scripts/database/migrate-remote-prod.sh` | 🔴 Extremely Dangerous |
| Create new migration | `cd packages/backend && npx prisma migrate dev` | ✅ Safe (local) |
| Check migration status | `cd packages/backend && npx prisma migrate status` | ✅ Safe (read-only) |

---

## Environment Files Reference

Scripts read configuration from these files:

| File | Used By | Environment |
|------|---------|-------------|
| `packages/backend/.env.dev` | migrate-remote-dev.sh, init-remote-db-dev.sh | Development |
| `packages/backend/.env.production` | migrate-remote-prod.sh | Production |

**Note:** Scripts automatically replace `@localhost:` with `@casovispanskog.rs:` for remote connections.

---

## Common Workflows

### Complete Development Deployment

```bash
# 1. Build deployment package
./scripts/build/build-deploy-package.sh

# 2. Deploy code (without database changes)
./scripts/deploy/deploy-dev.sh

# 3. Apply database migrations (if schema changed)
./scripts/database/migrate-remote-dev.sh

# 4. Restart Node.js app in cPanel UI
```

### Complete Production Deployment

```bash
# 1. Test everything in development FIRST!
./scripts/deploy/deploy-dev.sh
./scripts/database/migrate-remote-dev.sh

# 2. Verify development is working correctly
# (Test all features manually)

# 3. Create database backup in cPanel
# cPanel → Backup → Partial Backup → Download Database

# 4. Deploy code to production
./scripts/deploy/deploy-prod.sh

# 5. Apply database migrations (EXTREME CAUTION!)
./scripts/database/migrate-remote-prod.sh

# 6. Restart Node.js app in cPanel UI

# 7. Verify production is working
# (Test critical features)
```

### Creating and Deploying Schema Changes

```bash
# 1. Modify packages/backend/prisma/schema.prisma locally

# 2. Create migration locally
cd packages/backend
npx prisma migrate dev --name describe_your_change
cd ../..

# 3. Test migration locally first
# (Run local backend and verify everything works)

# 4. Deploy migration to development
./scripts/database/migrate-remote-dev.sh

# 5. Test in development environment
# (Verify all features work with new schema)

# 6. Only after dev is stable, deploy to production
./scripts/database/migrate-remote-prod.sh
```

### First-Time Setup for New Developer

```bash
# 1. Clone repository
git clone <repo-url>
cd spanish-class

# 2. Install dependencies
npm install

# 3. Configure local environment
cp packages/backend/.env.example packages/backend/.env.local
# Edit packages/backend/.env.local with local database credentials

# 4. Setup local database
cd packages/backend
npx prisma migrate dev
cd ../..

# 5. Start development
npm run dev
```

---

## Troubleshooting

### "prisma: command not found" on server

**Cause:** Prisma CLI not needed on server - client is pre-generated
**Solution:** This is expected. Use migration scripts from local machine.

### "Cannot find module '@spanish-class/shared'"

**Cause:** Symlink not created after npm install
**Solution:** Run `bash setup-shared-package.sh` in the backend directory on server

### "WebAssembly out of memory" during migration on server

**Cause:** cPanel memory limits prevent Prisma CLI from running
**Solution:** Never run Prisma CLI on server. Use migration scripts from local machine.

### Migration failed with authentication error

**Cause:** DATABASE_URL has `@localhost` but you're connecting remotely
**Solution:** Scripts auto-replace this. Ensure casovispanskog.rs is accessible.

### "deploy/ directory doesn't exist"

**Cause:** Build script hasn't been run
**Solution:** Run `./scripts/build/build-deploy-package.sh` first

---

## Safety Levels Explained

| Symbol | Level | Meaning |
|--------|-------|---------|
| ✅ | **SAFE** | Read-only or local operations only |
| ⚠️ | **CAUTION** | Modifies server but preserves data |
| 🔴 | **DANGEROUS** | Can delete data or affect production |

**Rule of thumb:** The more 🔴 warnings, the more confirmations you should expect.

---

## Script Maintenance

### Adding New Scripts

1. Create script in appropriate subdirectory:
   - `build/` - Build and packaging operations
   - `deploy/` - Deployment operations
   - `database/` - Database operations

2. Follow naming convention: `{action}-{target}.sh`
   - Examples: `deploy-staging.sh`, `backup-database.sh`

3. Make script executable:
   ```bash
   chmod +x scripts/{category}/{script-name}.sh
   ```

4. Document in this README:
   - Add to appropriate section
   - Include purpose, usage, safety level
   - Add to decision tree if applicable

5. Update CLAUDE.md with new script location

### Script Requirements

All scripts should:
- ✅ Have descriptive comments at the top
- ✅ Use absolute paths or proper working directory handling
- ✅ Include safety confirmations for destructive operations
- ✅ Display colored output for clarity (GREEN=success, RED=danger, YELLOW=warning)
- ✅ Have clear error messages
- ✅ Exit with non-zero code on failure

---

## Questions?

If you're unsure which script to use:
1. Check the "Quick Decision Tree" above
2. Read the script's description and safety level
3. When in doubt, ask team lead before running 🔴 DANGEROUS scripts
4. Always test in development before production

**Remember:** It's better to ask than to accidentally delete production data! 🔒
