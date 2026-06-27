# Scripts Documentation

All automation scripts for the Spanish Class Platform, organized by function.

## Directory Structure

```
scripts/
├── build/       - Build and packaging scripts
├── database/    - Database migration and initialization
├── server/      - Server bootstrap and maintenance
├── backup/      - Encrypted off-box backup and restore
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
- Creates deployment package in `deploy/` directory

**Usage:**
```bash
./scripts/build/build-deploy-package.sh
```

**Safety:** ✅ **SAFE** — Only creates local build artifacts, doesn't modify server

---

## Database Scripts

### `database/init-remote-db-dev.sh`

**Purpose:** Initialize or completely reset the remote development database

**What it does:**
- Connects to the remote dev database via the DATABASE_URL in `config/dev/.env`
- Runs `prisma db push --force-reset` (DELETES all data!)
- Applies current schema and marks all migrations as applied

**When to use:**
- First-time database setup for staging
- Complete database reset during development
- Fixing migration state issues in staging

**Usage:**
```bash
./scripts/database/init-remote-db-dev.sh
```

**Safety:** 🔴 **DESTRUCTIVE** — Deletes ALL data in dev/staging database!

**Confirmation required:** Type "reset" to confirm

---

### `database/migrate-remote-dev.sh`

**Purpose:** Apply pending database migrations to the remote staging database from your local machine

**What it does:**
- Reads DATABASE_URL from `config/dev/.env`
- Connects to the staging DB via SSH tunnel
- Runs `prisma migrate deploy` (applies pending migrations only, preserves data)

**When to use:**
- After creating new migrations with `prisma migrate dev` locally
- After pulling new migration files from git

**Usage:**
```bash
./scripts/database/migrate-remote-dev.sh
```

**Safety:** ⚠️ **CAUTION** — Safe if migrations are properly written; preserves data

**Note:** On Docker, migrations also run automatically on container start via the backend entrypoint.

---

### `database/migrate-remote-prod.sh`

**Purpose:** Apply pending database migrations to the PRODUCTION database from your local machine

**What it does:**
- Reads DATABASE_URL from `config/prod/.env`
- Shows pending migrations for review
- Connects to production DB via SSH tunnel after multiple confirmations
- Runs `prisma migrate deploy`

**When to use:** Deploying schema changes to production — ONLY after testing in staging

**Usage:**
```bash
./scripts/database/migrate-remote-prod.sh
```

**Safety:** 🔴 **EXTREMELY DANGEROUS** — Modifies production database!

**Confirmation required:**
1. Type exact database name
2. Type "MIGRATE PRODUCTION"

**Checklist before running:**
- [ ] Tested migrations in staging first
- [ ] Database backup created (`docker compose exec mysql mysqldump ...` or via Hetzner snapshot)
- [ ] Reviewed all migration files
- [ ] Informed users of potential downtime

**Note:** In the normal Docker deploy flow, migrations run automatically on container start. Only use this script if you need to apply migrations independently of a deploy.

---

## Server Scripts

### `server/bootstrap.sh`

**Purpose:** Idempotent Ubuntu hardening for fresh Hetzner VMs

**What it does:**
- Installs Docker and Docker Compose plugin
- Hardens SSH (disables root login, password auth)
- Configures ufw firewall (allow 22/80/443 only)
- Installs fail2ban
- Creates directory structure for the stack

**When to use:** Once, on a fresh VM before first deploy

**Usage:**
```bash
# Run on the remote VM via SSH
bash <(curl -fsSL https://raw.githubusercontent.com/.../bootstrap.sh)
# or after uploading:
./scripts/server/bootstrap.sh
```

**Safety:** ✅ **SAFE** — Idempotent; re-running does no harm

---

## Backup Scripts

See [`backup/`](backup/) directory for encrypted off-box backup and restore scripts targeting Backblaze B2.

---

## Quick Decision Tree

### Database Operations

| Scenario | Action |
|----------|--------|
| First-time staging DB setup | `./scripts/database/init-remote-db-dev.sh` |
| Apply migrations to staging | `./scripts/database/migrate-remote-dev.sh` |
| Apply migrations to prod | `./scripts/database/migrate-remote-prod.sh` |
| Create new migration locally | `cd packages/backend && npx prisma migrate dev` |
| Check migration status | `cd packages/backend && npx prisma migrate status` |

### Deployment

All code deployments go through GitHub Actions (see `.github/workflows/deploy.yml`):
- Push to `main` → auto-deploy to staging
- Manual workflow dispatch → production promotion

---

## Common Workflows

### Creating and Deploying Schema Changes

```bash
# 1. Modify packages/backend/prisma/schema.prisma locally

# 2. Create migration locally
cd packages/backend
npx prisma migrate dev --name describe_your_change
cd ../..

# 3. Commit migration files — CI applies them to staging automatically on next push

# 4. Verify staging, then promote to production via GitHub Actions workflow dispatch
#    (the backend container runs prisma migrate deploy on start)
```

### Emergency: apply migration manually to prod

```bash
# Only if you need to apply a migration outside a normal deploy:
./scripts/database/migrate-remote-prod.sh
```

---

## Safety Levels Explained

| Symbol | Level | Meaning |
|--------|-------|---------|
| ✅ | **SAFE** | Read-only or local operations only |
| ⚠️ | **CAUTION** | Modifies server but preserves data |
| 🔴 | **DANGEROUS** | Can delete data or affect production |

---

## Adding New Scripts

1. Place in the appropriate subdirectory (`build/`, `database/`, `server/`, `backup/`)
2. Follow naming convention: `{action}-{target}.sh`
3. Make executable: `chmod +x scripts/{category}/{name}.sh`
4. Include descriptive header comments, colored output, and safety confirmations for destructive operations
5. Document here and update `CLAUDE.md` if adding a new category
