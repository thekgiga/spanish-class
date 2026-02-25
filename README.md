# Spanish Class Platform

Online Spanish class booking platform with video conferencing, automated reminders, and multi-environment deployment support.

**Tech Stack:** React + Vite | Express.js | TypeScript | MySQL | Prisma | Jitsi Meet | BullMQ

---

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Local Development Setup](#-local-development-setup)
- [Environment Configuration](#-environment-configuration)
- [Database Setup](#-database-setup)
- [Testing](#-testing)
- [Deployment](#-deployment)
  - [Deployment Scripts](#deployment-scripts)
  - [Database Migrations](#database-migrations)
  - [Production Deployment Workflow](#production-deployment-workflow)
- [Scripts Reference](#-scripts-reference)
- [Troubleshooting](#-troubleshooting)

---

## 🚀 Quick Start

**Clone and install:**
```bash
git clone <repository-url>
cd spanish-class
npm install
```

**Setup database:**
```bash
cd packages/backend
cp .env.example .env
# Edit .env with your database credentials
npx prisma migrate dev
npx prisma db seed
cd ../..
```

**Start development:**
```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api

**Default logins:**
- Professor: `professor@spanishclass.com` / `Admin123!`
- Student: `student@example.com` / `Student123!`

---

## 💻 Local Development Setup

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **MySQL** 8+
- **Redis** 6+ (for job queue and caching)
- **Git** 2.x+

### Installation

```bash
# 1. Install all dependencies (monorepo)
npm install

# 2. Setup backend environment
cd packages/backend
cp .env.example .env
# Edit .env with your local credentials

# 3. Generate Prisma client
npm run db:generate

# 4. Initialize database
npx prisma migrate dev

# 5. Seed test data
npm run db:seed

# 6. Return to root
cd ../..
```

### Development Commands

```bash
# Start all packages in dev mode
npm run dev

# Run tests
npm test                  # Watch mode
npm run test:coverage     # With coverage report
npm run test:ui           # Vitest UI

# Lint code
npm run lint

# Build for production
npm run build

# Database operations (in packages/backend/)
npx prisma studio         # Open Prisma Studio GUI
npx prisma migrate dev    # Create new migration
npx prisma migrate status # Check migration status
```

---

## ⚙️ Environment Configuration

### Backend Environment (`packages/backend/.env`)

```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/spanish_class"

# Authentication
JWT_SECRET="your-secret-key-min-32-chars"
JWT_EXPIRES_IN="7d"

# Email (Resend)
RESEND_API_KEY="re_your_api_key"
EMAIL_FROM="Spanish Class <noreply@yourdomain.com>"
PROFESSOR_EMAIL="professor@yourdomain.com"

# URLs
FRONTEND_URL="http://localhost:5173"
API_URL="http://localhost:3001"

# Redis (for BullMQ job queue)
REDIS_HOST="localhost"
REDIS_PORT="6379"

# Environment
NODE_ENV="development"
PORT=3001

# Optional: Jitsi
JITSI_DOMAIN="meet.jit.si"  # Or your custom Jitsi instance
```

### Frontend Environment (`packages/frontend/.env.local`)

```env
VITE_API_URL=http://localhost:3001
```

### Environment Files Reference

| File | Purpose | Tracked in Git |
|------|---------|----------------|
| `.env.example` | Template with all variables | ✅ Yes |
| `.env` | Local development config | ❌ No |
| `.env.dev` | Remote dev database config | ❌ No |
| `.env.production` | Production config template | ✅ Yes (with placeholders) |
| `.env.local` | Local overrides | ❌ No |

**Security:** Never commit actual credentials. Use `.env.example` as a template only.

---

## 🗄️ Database Setup

### Local Development

```bash
cd packages/backend

# Generate Prisma client from schema
npm run db:generate

# Option 1: Run migrations (recommended)
npx prisma migrate dev

# Option 2: Push schema directly (for prototyping)
npx prisma db push

# Seed test data
npm run db:seed
```

### Creating Schema Changes

```bash
# 1. Modify packages/backend/prisma/schema.prisma

# 2. Create migration
npx prisma migrate dev --name describe_your_change

# 3. Test locally
npm run dev

# 4. Commit migration files
git add prisma/migrations/
git commit -m "feat: add new schema changes"
```

### Remote Database Setup

For cPanel/remote databases, see [Database Migration Scripts](#database-migrations).

**Important:** Never run Prisma CLI on cPanel directly (memory limits). Use migration scripts from local machine.

---

## 🧪 Testing

### Unit & Integration Tests (Vitest)

```bash
npm test                    # Watch mode
npm run test:coverage       # Coverage report
npm run test:ui             # Open Vitest UI
```

**Coverage Thresholds:** 80% for lines, functions, branches, statements

**Test Organization:**
- Backend: `packages/backend/src/**/__tests__/*.test.ts`
- Frontend: `packages/frontend/src/**/*.test.tsx`
- Shared: `packages/shared/src/**/*.test.ts`

### End-to-End Tests (Playwright)

```bash
# Install browsers (first time only)
npx playwright install

# Run E2E tests
npx playwright test

# Run with UI
npx playwright test --ui

# Debug mode
npx playwright test --debug

# View report
npx playwright show-report
```

**E2E Test Coverage:**
- Complete booking flow
- Concurrent booking race conditions
- Cancellation workflows
- Professor-student interactions

---

## 🚢 Deployment

### Deployment Scripts

All deployment scripts are in `/scripts/` directory:

```
scripts/
├── build/        - Build and packaging
├── deploy/       - Deployment automation
└── database/     - Database migrations
```

**Quick deployment:**

```bash
# Development environment
./scripts/deploy/deploy-dev.sh

# Production environment (with safety confirmations)
./scripts/deploy/deploy-prod.sh
```

📖 **Detailed documentation:** See [`scripts/README.md`](scripts/README.md)

### Database Migrations

**Development database:**
```bash
# Apply migrations to remote dev database
./scripts/database/migrate-remote-dev.sh

# Initialize/reset dev database (DESTRUCTIVE!)
./scripts/database/init-remote-db-dev.sh
```

**Production database:**
```bash
# Apply migrations to production (EXTREME CAUTION!)
./scripts/database/migrate-remote-prod.sh
```

⚠️ **Always test in development first before migrating production!**

### Production Deployment Workflow

**Complete production deployment:**

```bash
# 1. Test everything in development FIRST
./scripts/deploy/deploy-dev.sh
./scripts/database/migrate-remote-dev.sh
# Verify all features work in dev

# 2. Create database backup (in cPanel)
# cPanel → Backup → Download MySQL Database

# 3. Deploy code to production
./scripts/deploy/deploy-prod.sh

# 4. Apply database migrations (with extreme caution)
./scripts/database/migrate-remote-prod.sh

# 5. Restart Node.js app in cPanel UI
# cPanel → Setup Node.js App → spanish-class-prod → Restart

# 6. Verify production
# Test critical features manually
```

### Multi-Environment Setup

The platform supports multiple environments on the same cPanel server:

**Environments:**
- **Development:** `dev.casovispanskog.rs` → `~/spanish-class-dev/`
- **Production:** `casovispanskog.rs` → `~/spanish-class-prod/`

**Configuration:**
- Backend: Deployed to `~/spanish-class-{env}/`
- Frontend: Deployed to `~/public_html/{env}/`
- Databases: Separate for each environment
- Node.js apps: Configured in cPanel NodeJS Selector

### GitHub Actions (CI/CD)

Automated deployment workflows:

- **`.github/workflows/deploy-dev.yml`** - Auto-deploy on push to `develop` branch
- **`.github/workflows/deploy-prod.yml`** - Deploy on push to `main` (requires manual approval)

**Required GitHub Secrets:**
- `CPANEL_SSH_KEY` - SSH private key for deployment
- `CPANEL_HOST` - Your domain (e.g., casovispanskog.rs)
- `CPANEL_USERNAME` - Your cPanel username
- `DEV_DATABASE_URL`, `PROD_DATABASE_URL`
- `DEV_JWT_SECRET`, `PROD_JWT_SECRET`

### cPanel Deployment Notes

**Important considerations:**

1. **Shared packages:** `node_modules` must be a symlink (managed by cPanel). Shared monorepo packages are placed in `_shared_lib/` with post-install symlinks.

2. **Prisma client:** Pre-generated during build and included in deployment package (cPanel memory limits prevent generating on server).

3. **Database migrations:** Must be run from local machine using scripts in `scripts/database/`.

4. **After deployment:**
   - Restart Node.js app in cPanel UI
   - Verify application health
   - Check logs for errors

---

## 📚 Scripts Reference

All scripts are documented in [`scripts/README.md`](scripts/README.md).

**Quick reference:**

| Task | Script | Safety |
|------|--------|--------|
| Build deployment package | `./scripts/build/build-deploy-package.sh` | ✅ Safe |
| Deploy to development | `./scripts/deploy/deploy-dev.sh` | ⚠️ Caution |
| Deploy to production | `./scripts/deploy/deploy-prod.sh` | 🔴 Dangerous |
| Migrate dev database | `./scripts/database/migrate-remote-dev.sh` | ⚠️ Caution |
| Migrate prod database | `./scripts/database/migrate-remote-prod.sh` | 🔴 Extremely Dangerous |
| Initialize dev database | `./scripts/database/init-remote-db-dev.sh` | 🔴 Destructive |

---

## 🔧 Troubleshooting

### Backend won't start

**Symptoms:** Node.js app crashes or won't start in cPanel

**Solutions:**
1. Check Node.js version is 18+ in cPanel NodeJS Selector
2. Verify `.env` file exists and has correct values
3. Check cPanel error logs: Setup Node.js App → View Logs
4. Ensure database connection string is correct
5. Verify all required environment variables are set

### Database connection fails

**Symptoms:** "ECONNREFUSED" or "Access denied" errors

**Solutions:**
1. Verify DATABASE_URL includes cPanel username prefix:
   - ❌ Wrong: `mysql://user:pass@localhost:3306/database`
   - ✅ Right: `mysql://cpanel_user:pass@localhost:3306/cpanel_database`
2. Check database user has ALL PRIVILEGES
3. Confirm host is `localhost` (not domain name)
4. Test connection string in cPanel → phpMyAdmin

### "Cannot find module '@spanish-class/shared'"

**Symptoms:** Backend crashes with module not found error

**Cause:** Shared package symlink not created after npm install

**Solution:**
```bash
cd ~/spanish-class-{env}
bash setup-shared-package.sh
```

This is automatically run by the postinstall script, but may need manual execution if npm install fails.

### "prisma: command not found" on server

**Symptoms:** Prisma commands fail when run on cPanel

**Cause:** Prisma CLI not included in production dependencies (by design)

**Solution:** This is expected! Use database migration scripts from your **local machine**:
```bash
./scripts/database/migrate-remote-dev.sh
./scripts/database/migrate-remote-prod.sh
```

### "WebAssembly out of memory" during migration

**Symptoms:** Prisma commands fail with memory errors on cPanel

**Cause:** cPanel shared hosting has memory limits (4GB) that prevent Prisma CLI from running

**Solution:** Never run Prisma CLI directly on cPanel. Always use migration scripts from local machine (they connect remotely).

### CORS errors in browser

**Symptoms:** "Access-Control-Allow-Origin" errors in browser console

**Solutions:**
1. Verify `FRONTEND_URL` in backend `.env` matches your actual frontend domain
2. Ensure both frontend and backend use same protocol (both http:// or both https://)
3. After SSL installation, update `.env` to use https://
4. Check CORS configuration in `packages/backend/src/index.ts`

### 404 errors on frontend routes

**Symptoms:** Direct URL access or refresh gives 404

**Cause:** Missing or incorrect `.htaccess` configuration

**Solution:** Ensure `.htaccess` exists in `public_html/` with proper rewrite rules:
```apache
RewriteEngine On

# Frontend routing (SPA)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ /index.html [L]
```

### Build fails with TypeScript errors

**Symptoms:** `npm run build` fails with type errors

**Solutions:**
1. Ensure all dependencies are installed: `npm install`
2. Regenerate Prisma client: `cd packages/backend && npm run db:generate`
3. Check TypeScript version matches project requirements
4. Clear build cache: `rm -rf packages/*/dist packages/*/.turbo`
5. Try clean install: `rm -rf node_modules package-lock.json && npm install`

### Deployment package is missing files

**Symptoms:** `deploy/` directory incomplete after build

**Cause:** Build script failed or was interrupted

**Solution:**
```bash
# Clean previous build
rm -rf deploy/

# Run build again
./scripts/build/build-deploy-package.sh

# Verify deploy/ contains backend/ and frontend/
ls -la deploy/
```

### Tests failing locally

**Symptoms:** Tests pass in CI but fail locally

**Solutions:**
1. Check Node.js version matches CI (18+)
2. Ensure test database is clean: `npx prisma migrate reset` (in test env)
3. Check for environment-specific issues in `.env.test`
4. Clear Vitest cache: `npx vitest run --no-cache`
5. Ensure Redis is running if testing queue jobs

---

## 📖 Additional Documentation

- **[`scripts/README.md`](scripts/README.md)** - Comprehensive scripts documentation with decision trees
- **[`CLAUDE.md`](CLAUDE.md)** - Development guidelines and project structure (for AI agents)
- **[`docs/specs/`](docs/specs/)** - Feature specifications and planning documents
- **[`docs/.htaccess`](docs/.htaccess)** - Apache configuration reference

---

## 🏗️ Project Structure

```
spanish-class/
├── packages/
│   ├── backend/          - Express API server
│   │   ├── src/          - Source code
│   │   ├── prisma/       - Database schema and migrations
│   │   └── dist/         - Compiled output (gitignored)
│   ├── frontend/         - React + Vite frontend
│   │   ├── src/          - Source code
│   │   └── dist/         - Build output (gitignored)
│   └── shared/           - Shared types and utilities
├── scripts/              - All automation scripts
│   ├── build/           - Build and packaging
│   ├── deploy/          - Deployment automation
│   └── database/        - Database migrations
├── docs/                - Documentation
│   ├── specs/           - Feature specifications
│   └── images/          - Screenshots and diagrams
├── e2e/                 - End-to-end tests (Playwright)
├── .github/             - GitHub Actions workflows
└── deploy/              - Generated deployment package (gitignored)
```

---

## 🎯 Features

- ✅ **Student booking system** with availability slots
- ✅ **Professor management** of availability and bookings
- ✅ **Video conferencing** integration (Jitsi Meet)
- ✅ **Automated reminders** via email (24h before class)
- ✅ **Recurring availability** with exception handling
- ✅ **Multi-environment deployment** (dev/staging/prod)
- ✅ **Comprehensive testing** (unit, integration, E2E)
- ✅ **Type-safe API** with TypeScript across stack
- ✅ **Database migrations** with Prisma
- ✅ **Job queue** with BullMQ for background tasks

---

## 📝 License

Private - All rights reserved.

---

## 🤝 Contributing

This is a private project. For development guidelines, see [`CLAUDE.md`](CLAUDE.md).

---

## 💡 Need Help?

1. **Check troubleshooting section above**
2. **Review scripts documentation:** [`scripts/README.md`](scripts/README.md)
3. **Check deployment logs** in cPanel
4. **Review error messages** in browser console and backend logs

**For deployment issues:**
- Verify all environment variables are set correctly
- Check database connection string format
- Ensure Node.js version is 18+ in cPanel
- Review cPanel error logs for detailed error messages

**For development issues:**
- Ensure all dependencies are installed: `npm install`
- Check Node.js version: `node --version` (should be 18+)
- Verify database is running and accessible
- Check Redis is running for job queue functionality
