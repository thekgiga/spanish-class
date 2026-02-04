# Multi-Environment Architecture

Complete guide for managing Local, Dev, and Production environments for the Spanish Class Platform.

## Table of Contents

1. [Environment Overview](#environment-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Environment Configuration](#environment-configuration)
4. [Database Strategy](#database-strategy)
5. [Deployment Workflow](#deployment-workflow)
6. [Quick Reference](#quick-reference)

---

## Environment Overview

### 1. **Local Environment** (Development)

**Purpose**: Active development and testing on your local machine

- **Location**: Your local computer
- **Database**: Local MySQL (via Docker, XAMPP, or local installation)
- **URL**: `http://localhost:5173` (frontend), `http://localhost:3001` (backend)
- **Branch**: Any feature branch or `main`
- **Hot Reload**: Enabled for instant development feedback
- **Who Uses**: Developers working on new features

### 2. **Dev Environment** (Staging/Testing)

**Purpose**: Testing and integration before production release

- **Location**: unlimited.rs hosting (separate subdomain or directory)
- **Database**: MySQL on unlimited.rs (separate dev database)
- **URL**: `https://dev.yourdomain.com` or `https://yourdomain.com/dev`
- **Branch**: `develop` or `dev`
- **Who Uses**: Team testing, stakeholders reviewing features, QA
- **Deployment**: Automated or manual deployment via SSH

### 3. **Production Environment** (Live)

**Purpose**: Live application serving real users

- **Location**: unlimited.rs hosting (main domain)
- **Database**: MySQL on unlimited.rs (production database)
- **URL**: `https://yourdomain.com`
- **Branch**: `main` or `production`
- **Who Uses**: End users (students and professors)
- **Deployment**: Careful, versioned deployments with backups

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     LOCAL ENVIRONMENT                        │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Frontend   │◄───┤   Backend    │◄───┤  MySQL DB    │  │
│  │ localhost:   │    │ localhost:   │    │  spanish_    │  │
│  │    5173      │    │    3001      │    │  class_local │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│       (Vite Dev)         (tsx watch)        (Local/Docker)  │
└─────────────────────────────────────────────────────────────┘
                             │
                             │ git push
                             ▼
┌─────────────────────────────────────────────────────────────┐
│              UNLIMITED.RS - DEV ENVIRONMENT                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Frontend   │◄───┤   Backend    │◄───┤  MySQL DB    │  │
│  │dev.domain.com│    │dev.domain.com│    │  user_dev_db │  │
│  │ /public_html/│    │    /api      │    │              │  │
│  │     dev/     │    │              │    │              │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│     (Static Build)    (Node.js:3002)      (cPanel MySQL)    │
└─────────────────────────────────────────────────────────────┘
                             │
                             │ git merge → main
                             ▼
┌─────────────────────────────────────────────────────────────┐
│            UNLIMITED.RS - PRODUCTION ENVIRONMENT             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Frontend   │◄───┤   Backend    │◄───┤  MySQL DB    │  │
│  │ yourdomain.  │    │ yourdomain.  │    │  user_prod_  │  │
│  │     com      │    │   com/api    │    │     db       │  │
│  │ /public_html/│    │              │    │              │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│     (Static Build)    (Node.js:3001)      (cPanel MySQL)    │
└─────────────────────────────────────────────────────────────┘
```

---

## Environment Configuration

### Configuration Files Structure

```
spanish-class/
├── packages/
│   ├── backend/
│   │   ├── .env            # Active config (gitignored)
│   │   ├── .env.local      # Local template (committed)
│   │   ├── .env.dev        # Dev template (committed)
│   │   └── .env.production # Production template (committed)
│   │
│   └── frontend/
│       ├── .env.local      # Local template (committed)
│       ├── .env.dev        # Dev template (committed)
│       └── .env.production # Production template (committed)
```

### Environment Variables by Environment

| Variable | Local | Dev | Production |
|----------|-------|-----|------------|
| `NODE_ENV` | development | development | production |
| `DATABASE_URL` | localhost:3306 | localhost:3306 | localhost:3306 |
| `DATABASE_NAME` | spanish_class_local | user_spanish_dev | user_spanish_prod |
| `FRONTEND_URL` | http://localhost:5173 | https://dev.domain.com | https://domain.com |
| `API_URL` | http://localhost:3001 | https://dev.domain.com/api | https://domain.com/api |
| `PORT` | 3001 | 3002 | 3001 |
| `JWT_SECRET` | dev-secret | dev-secret-random | prod-secret-strong |
| `RESEND_API_KEY` | (optional) | (optional/test) | (required) |
| `GOOGLE_CALENDAR` | (optional) | (optional) | (required) |

---

## Database Strategy

### On unlimited.rs (Dev + Prod)

Since you have one cPanel account, you'll create **two separate databases**:

#### Dev Database
```
Database Name: spanish_dev
Full Name: myuser_spanish_dev
User: myuser_dev_user
Password: [Strong Dev Password]
Connection: mysql://myuser_dev_user:password@localhost:3306/myuser_spanish_dev
```

#### Production Database
```
Database Name: spanish_prod
Full Name: myuser_spanish_prod
User: myuser_prod_user
Password: [Strong Prod Password]
Connection: mysql://myuser_prod_user:password@localhost:3306/myuser_spanish_prod
```

### Local Database

**Option 1: Docker (Recommended)**
```bash
docker run --name spanish-mysql \
  -e MYSQL_ROOT_PASSWORD=rootpass \
  -e MYSQL_DATABASE=spanish_class_local \
  -e MYSQL_USER=spanish_local \
  -e MYSQL_PASSWORD=localpass \
  -p 3306:3306 \
  -d mysql:8.0
```

**Option 2: Local MySQL Installation**
```sql
CREATE DATABASE spanish_class_local;
CREATE USER 'spanish_local'@'localhost' IDENTIFIED BY 'localpass';
GRANT ALL PRIVILEGES ON spanish_class_local.* TO 'spanish_local'@'localhost';
FLUSH PRIVILEGES;
```

---

## Deployment Workflow

### Git Branching Strategy

```
main (production)
  │
  ├── develop (dev environment)
  │     │
  │     ├── feature/user-authentication
  │     ├── feature/booking-system
  │     └── feature/calendar-integration
  │
  └── hotfix/* (emergency production fixes)
```

### Development Workflow

```
1. LOCAL DEVELOPMENT
   ├── Create feature branch from develop
   ├── Develop locally with hot reload
   ├── Test on local environment
   └── Commit changes

2. DEV ENVIRONMENT (Staging)
   ├── Merge feature → develop
   ├── Deploy to dev environment
   ├── Run integration tests
   ├── Stakeholder review
   └── QA testing

3. PRODUCTION ENVIRONMENT
   ├── Merge develop → main
   ├── Create release tag (v1.0.0)
   ├── Deploy to production
   ├── Run smoke tests
   └── Monitor for issues
```

### Deployment Commands by Environment

#### Local Development
```bash
# Start local development
cd ~/spanish-class
pnpm install

# Terminal 1: Backend with hot reload
cd packages/backend
pnpm dev

# Terminal 2: Frontend with hot reload
cd packages/frontend
pnpm dev

# Access at:
# Frontend: http://localhost:5173
# Backend: http://localhost:3001
```

#### Dev Environment Deployment
```bash
# SSH to server
ssh username@yourdomain.com

# Deploy to dev
cd ~/spanish-class-dev
./deploy.sh --env=dev

# OR manually:
git fetch origin
git checkout develop
git pull origin develop
pnpm install
cd packages/backend && pnpm build
cd ../frontend && pnpm build
cp -r packages/frontend/dist/* ~/public_html/dev/
# Restart dev backend via cPanel
```

#### Production Environment Deployment
```bash
# SSH to server
ssh username@yourdomain.com

# Backup first!
cd ~/spanish-class
./backup.sh

# Deploy to production
./deploy.sh --env=production

# OR manually:
git fetch origin
git checkout main
git pull origin main
pnpm install
cd packages/backend && pnpm build
cd ../frontend && pnpm build
cp -r packages/frontend/dist/* ~/public_html/
# Restart production backend via cPanel
```

---

## Directory Structure on unlimited.rs

```
/home/username/
│
├── spanish-class/          # Production code
│   ├── packages/
│   │   ├── backend/
│   │   │   ├── .env        # Prod environment
│   │   │   └── dist/       # Prod build
│   │   └── frontend/
│   │       └── dist/       # Prod build
│   └── deploy.sh
│
├── spanish-class-dev/      # Dev code
│   ├── packages/
│   │   ├── backend/
│   │   │   ├── .env        # Dev environment
│   │   │   └── dist/       # Dev build
│   │   └── frontend/
│   │       └── dist/       # Dev build
│   └── deploy.sh
│
└── public_html/
    ├── index.html          # Production frontend
    ├── assets/
    ├── .htaccess           # Production config
    │
    └── dev/                # Dev frontend
        ├── index.html
        ├── assets/
        └── .htaccess       # Dev config
```

---

## Quick Reference

### Environment Setup Checklist

#### Local Environment
- [ ] Clone repository
- [ ] Install dependencies: `pnpm install`
- [ ] Setup local MySQL database
- [ ] Create `packages/backend/.env.local`
- [ ] Create `packages/frontend/.env.local`
- [ ] Run migrations: `pnpm db:push`
- [ ] Seed database: `pnpm db:seed`
- [ ] Start dev servers: `pnpm dev`

#### Dev Environment
- [ ] Create subdomain: `dev.yourdomain.com` in cPanel
- [ ] Create dev database: `spanish_dev` in cPanel
- [ ] Create dev database user with privileges
- [ ] Clone repo to `~/spanish-class-dev`
- [ ] Create `packages/backend/.env` with dev config
- [ ] Create `packages/frontend/.env.dev`
- [ ] Setup Node.js app in cPanel (port 3002)
- [ ] Deploy and test

#### Production Environment
- [ ] Create production database: `spanish_prod` in cPanel
- [ ] Create production database user with privileges
- [ ] Clone repo to `~/spanish-class`
- [ ] Create `packages/backend/.env` with prod config
- [ ] Create `packages/frontend/.env.production`
- [ ] Setup Node.js app in cPanel (port 3001)
- [ ] Install SSL certificate
- [ ] Deploy and test
- [ ] Setup monitoring

### Common Commands

```bash
# Switch environment locally
cp packages/backend/.env.local packages/backend/.env

# Build for specific environment
pnpm build                    # Uses current .env
NODE_ENV=production pnpm build # Production build

# Deploy specific environment
./deploy.sh --env=dev         # Deploy to dev
./deploy.sh --env=production  # Deploy to production

# Database operations per environment
# Dev
cd ~/spanish-class-dev/packages/backend
pnpm db:push
pnpm db:seed

# Production
cd ~/spanish-class/packages/backend
pnpm db:push
pnpm db:seed
```

### Environment URLs

| Environment | Frontend | Backend | Database |
|-------------|----------|---------|----------|
| Local | http://localhost:5173 | http://localhost:3001 | localhost:3306 |
| Dev | https://dev.yourdomain.com | https://dev.yourdomain.com/api | localhost:3306/dev_db |
| Production | https://yourdomain.com | https://yourdomain.com/api | localhost:3306/prod_db |

---

## Best Practices

### 1. Environment Isolation
- Never use production database from dev environment
- Never deploy dev code to production
- Keep separate API keys for dev and production

### 2. Configuration Management
- Never commit `.env` files to git
- Always use `.env.example` files as templates
- Use strong, unique passwords for each environment

### 3. Deployment Safety
- Always backup production database before deployment
- Test in dev environment first
- Use git tags for production releases (v1.0.0, v1.1.0)
- Monitor production after deployment

### 4. Database Migrations
- Test migrations in dev first
- Backup production database before migrations
- Use Prisma migrations for schema changes: `pnpm db:migrate`

### 5. Secrets Management
- Use different JWT secrets per environment
- Rotate production secrets regularly
- Use test API keys in dev environment
- Enable production API keys only when needed

---

## Troubleshooting

### Wrong Environment Active

**Problem**: Backend connected to wrong database

**Solution**:
```bash
# Check current environment
cd packages/backend
cat .env | grep DATABASE_URL

# Switch environment
cp .env.dev .env       # Switch to dev
cp packages/backend/.env.production packages/backend/.env # Switch to production
```

### Port Conflicts

**Problem**: Dev and prod backends use same port

**Solution**:
- Dev backend: Port 3002
- Prod backend: Port 3001
- Configure in cPanel Node.js Selector

### Database Not Found

**Problem**: Database connection fails after deployment

**Solution**:
1. Verify database exists in cPanel
2. Check username includes cPanel prefix
3. Verify user has privileges
4. Check .env file has correct connection string

---

## Next Steps

1. Read [LOCAL_SETUP.md](./LOCAL_SETUP.md) for local environment setup
2. Read [DEV_DEPLOYMENT.md](./DEV_DEPLOYMENT.md) for dev environment setup
3. Read [PROD_DEPLOYMENT.md](./PROD_DEPLOYMENT.md) for production setup
4. Review [DEPLOYMENT_WORKFLOW.md](./DEPLOYMENT_WORKFLOW.md) for CI/CD workflow

---

## Support

For environment-specific issues:
- Local: Check local MySQL/Docker logs
- Dev: Check cPanel error logs and Node.js logs
- Production: Contact unlimited.rs support if hosting-related

Remember: **Test in Local → Deploy to Dev → Release to Production**
