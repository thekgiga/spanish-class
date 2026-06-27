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
  - [Database Migrations](#database-migrations)
  - [Production Deployment Workflow](#production-deployment-workflow)
- [Scripts Reference](#-scripts-reference)
- [Troubleshooting](#-troubleshooting)

---

## 🚀 Quick Start

### Option A — Docker (recommended) ⭐

The whole stack (backend, frontend, MySQL, Redis, Caddy reverse proxy) runs in one command. You don't need Node, MySQL, or Redis installed on your machine — only Docker Desktop.

```bash
git clone <repository-url>
cd spanish-class

# Fill in local secrets (DB password, JWT secret, etc.) — the template
# ships with sensible local-dev defaults; just save it as-is to start.
cp config/templates/.env.local.template config/local/.env

# Build images + start the stack
docker compose up -d --build

# Apply DB schema and seed users
docker compose exec backend /app/node_modules/.bin/prisma migrate deploy --schema=/app/packages/backend/prisma/schema.prisma
docker compose exec backend node --input-type=module -e "
  import {PrismaClient} from '@prisma/client';
  import bcrypt from 'bcryptjs';
  const p = new PrismaClient();
  await p.user.upsert({
    where:{email:'professor@spanishclass.com'},
    update:{},
    create:{email:'professor@spanishclass.com',passwordHash:await bcrypt.hash('Admin123!',12),firstName:'Maria',lastName:'Garcia',isAdmin:true,timezone:'Europe/Madrid'}
  });
  await p.user.upsert({
    where:{email:'student@example.com'},
    update:{},
    create:{email:'student@example.com',passwordHash:await bcrypt.hash('Student123!',12),firstName:'John',lastName:'Smith',timezone:'Europe/Madrid'}
  });
  await p.\$disconnect();
"
```

Open **http://localhost** — login with `professor@spanishclass.com` / `Admin123!`.

Useful commands:
```bash
docker compose ps                              # what's running
docker compose logs -f --tail=200 backend     # tail logs
docker compose down                            # stop, keep data
docker compose down -v                         # stop + wipe DB/Redis volumes
```

For deploying to a real cloud VM, see **[STARTHERE.md](STARTHERE.md)** and [docs/operations/](docs/operations/).

### Option B — Native (no Docker)

Use this if you want to run services directly on your host (faster reload, Prisma Studio, etc.). Requires MySQL + Redis installed locally.

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

For production / staging, migrations are applied automatically when the backend container starts (`prisma migrate deploy` in the entrypoint). To apply manually:

```bash
# Via Docker on the remote VM
docker compose exec backend /app/node_modules/.bin/prisma migrate deploy \
  --schema=/app/packages/backend/prisma/schema.prisma
```

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

Production runs on a Hetzner CX33 VM via Docker Compose, fronted by Cloudflare. See **[STARTHERE.md](STARTHERE.md)** for the initial setup runbook and **[docs/operations/](docs/operations/)** for day-to-day operations.

### Database Migrations

Migrations run automatically on container start. To apply manually to a remote VM:

```bash
# On the VM (or via SSH)
cd /opt/spanish-class
docker compose exec backend /app/node_modules/.bin/prisma migrate deploy \
  --schema=/app/packages/backend/prisma/schema.prisma
```

Use `scripts/database/migrate-remote-prod.sh` and `migrate-remote-dev.sh` to run migrations from your local machine via SSH tunnel.

⚠️ **Always test migrations in staging before applying to production.**

### Production Deployment Workflow

```bash
# 1. Push to main — GitHub Actions builds images and auto-deploys to staging
# 2. Verify staging at staging.<domain>
# 3. Trigger manual production promotion via GitHub Actions workflow dispatch
```

Full details: [docs/operations/deployment.md](docs/operations/deployment.md)

### GitHub Actions (CI/CD)

- **`.github/workflows/deploy.yml`** — build → Trivy scan → auto-deploy staging → gated manual production promotion

**Required GitHub Secrets:** `HETZNER_SSH_KEY`, `PROD_HOST`, `STAGING_HOST`, `PROD_ENV_FILE`, `STAGING_ENV_FILE`

---

## 📚 Scripts Reference

All scripts are documented in [`scripts/README.md`](scripts/README.md).

**Quick reference:**

| Task | Script | Safety |
|------|--------|--------|
| Build deployment package | `./scripts/build/build-deploy-package.sh` | ✅ Safe |
| Migrate dev database | `./scripts/database/migrate-remote-dev.sh` | ⚠️ Caution |
| Migrate prod database | `./scripts/database/migrate-remote-prod.sh` | 🔴 Extremely Dangerous |
| Initialize dev database | `./scripts/database/init-remote-db-dev.sh` | 🔴 Destructive |

---

## 🔧 Troubleshooting

### Backend won't start

**Symptoms:** Container exits immediately or keeps restarting

**Solutions:**
1. Check logs: `docker compose logs backend`
2. Verify `.env` file exists and has correct values
3. Ensure database connection string is correct
4. Verify all required environment variables are set

### Database connection fails

**Symptoms:** "ECONNREFUSED" or "Access denied" errors

**Solutions:**
1. Verify `DATABASE_URL` is correct in your `.env`
2. Check database user has ALL PRIVILEGES
3. For Docker: ensure `mysql` service is healthy before backend starts (`docker compose ps`)

### CORS errors in browser

**Symptoms:** "Access-Control-Allow-Origin" errors in browser console

**Solutions:**
1. Verify `FRONTEND_URL` in backend `.env` matches your actual frontend domain
2. Ensure both frontend and backend use same protocol (both http:// or both https://)
3. After SSL installation, update `.env` to use https://
4. Check CORS configuration in `packages/backend/src/index.ts`

### 404 errors on frontend routes

**Symptoms:** Direct URL access or refresh gives 404

**Cause:** SPA fallback not configured on the reverse proxy

**Solution:** Caddy handles this automatically via the `try_files` directive in [caddy/Caddyfile](caddy/Caddyfile). If running natively without Caddy, configure your reverse proxy to serve `index.html` for all unmatched routes.

### Build fails with TypeScript errors

**Symptoms:** `npm run build` fails with type errors

**Solutions:**
1. Ensure all dependencies are installed: `npm install`
2. Regenerate Prisma client: `cd packages/backend && npm run db:generate`
3. Check TypeScript version matches project requirements
4. Clear build cache: `rm -rf packages/*/dist packages/*/.turbo`
5. Try clean install: `rm -rf node_modules package-lock.json && npm install`

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

- **[`STARTHERE.md`](STARTHERE.md)** — First-deploy runbook (Hetzner + Docker)
- **[`docs/operations/`](docs/operations/)** — Day-to-day operations, incident response, restore procedures
- **[`scripts/README.md`](scripts/README.md)** — Scripts documentation
- **[`CLAUDE.md`](CLAUDE.md)** — Development guidelines and project structure (for AI agents)

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
│   ├── database/        - Database migrations
│   └── server/          - Server bootstrap and maintenance
├── docs/                - Documentation
│   ├── operations/      - Runbooks and ops guides
│   └── images/          - Screenshots and diagrams
├── specs/               - Feature specifications
├── caddy/               - Caddy reverse proxy config
├── e2e/                 - End-to-end tests (Playwright)
└── .github/             - GitHub Actions workflows
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
3. **Check container logs:** `docker compose logs -f backend`
4. **Review error messages** in browser console and backend logs

**For deployment issues:**
- Verify all environment variables are set correctly
- Check database connection string format
- See [docs/operations/incident-response.md](docs/operations/incident-response.md) for outage playbook

**For development issues:**
- Ensure all dependencies are installed: `npm install`
- Check Node.js version: `node --version` (should be 18+)
- Verify database is running and accessible
- Check Redis is running for job queue functionality
