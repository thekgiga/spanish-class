# Deployment Workflow Guide

Complete workflow for managing code changes across Local, Dev, and Production environments.

## Overview

This guide explains the complete development and deployment workflow for the Spanish Class Platform across three environments.

---

## Environment Summary

| Environment | Purpose | Location | Branch | Database | Port |
|------------|---------|----------|--------|----------|------|
| **Local** | Active development | Your machine | Any feature branch | local MySQL | 3001 |
| **Dev** | Testing & staging | unlimited.rs | `develop` | spanish_dev | 3002 |
| **Production** | Live application | unlimited.rs | `main` | spanish_prod | 3001 |

---

## Complete Workflow

### 1. Local Development

**Start a new feature:**

```bash
# Ensure you're on develop branch
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/user-profile-update

# Verify local environment is running
cd ~/spanish-class
npm run dev

# Make your changes
# Edit files in packages/backend or packages/frontend

# Test locally
# Access: http://localhost:5173
```

**Test your changes:**

- Frontend updates in real-time (hot reload)
- Backend restarts automatically (tsx watch)
- Use Prisma Studio to inspect database: `npm run db:studio`
- Test all affected features

**Commit your changes:**

```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: Add user profile update functionality"

# Push to remote
git push origin feature/user-profile-update
```

---

### 2. Deploy to Dev Environment

**After local testing is complete:**

```bash
# Create pull request (on GitHub)
# feature/user-profile-update → develop

# After PR review and approval, merge to develop

# Or merge locally:
git checkout develop
git merge feature/user-profile-update
git push origin develop
```

**Deploy to Dev server:**

```bash
# SSH to server
ssh username@yourdomain.com

# Navigate to dev directory
cd ~/spanish-class-dev

# Pull latest develop branch
git pull origin develop

# Run dev deployment
./deploy-multi.sh --env=dev

# OR manual deployment:
npm install
cd packages/backend && npm run db:generate && npm run db:push && npm run build
cd ../frontend && npm run build
cp -r packages/frontend/dist/* ~/public_html/dev/

# Restart dev backend
pm2 restart spanish-class-dev
# OR via cPanel: Setup Node.js App → Restart
```

**Verify dev deployment:**

```bash
# Test API
curl https://dev.yourdomain.com/api/health

# Visit dev site
# Open: https://dev.yourdomain.com
# Test new feature
# Check for errors
```

**Dev testing checklist:**

- [ ] New feature works as expected
- [ ] No console errors
- [ ] Database changes applied correctly
- [ ] Existing features still work (regression test)
- [ ] Mobile responsiveness checked
- [ ] Team review completed

---

### 3. Deploy to Production

**After dev testing is complete and approved:**

```bash
# Create pull request (on GitHub)
# develop → main

# After final review and approval, merge to main
```

**Pre-production checklist:**

- [ ] All tests passing in dev
- [ ] No known bugs
- [ ] Team approval received
- [ ] Backup plan ready
- [ ] Maintenance window scheduled (if needed)
- [ ] Monitoring plan ready

**Deploy to Production:**

⚠️ **IMPORTANT**: Always backup before production deployment!

```bash
# SSH to server
ssh username@yourdomain.com

# Navigate to production directory
cd ~/spanish-class

# Backup database first!
mysqldump -u youruser_prod_user -p youruser_spanish_prod > backup_$(date +%Y%m%d_%H%M%S).sql

# Pull latest main branch
git checkout main
git pull origin main

# Run production deployment
./deploy-multi.sh --env=prod

# OR manual deployment:
npm install
cd packages/backend && npm run db:generate && npm run db:push && npm run build
cd ../frontend && npm run build
cp -r packages/frontend/dist/* ~/public_html/

# Restart production backend
pm2 restart spanish-class-prod
# OR via cPanel: Setup Node.js App → Restart
```

**Verify production deployment:**

```bash
# Test API
curl https://yourdomain.com/api/health

# Open production site
# https://yourdomain.com

# Smoke test critical paths:
# - Login
# - Registration
# - View availability slots
# - Create booking
# - Check email notifications
```

**Post-deployment monitoring:**

- Monitor for 30 minutes after deployment
- Check error logs
- Watch for user-reported issues
- Monitor server resources

---

## Switching Between Environments

### On Your Local Machine

**Switch to work on different branches:**

```bash
# Work on dev environment code
git checkout develop

# Work on production hotfix
git checkout main
git checkout -b hotfix/critical-bug

# Work on feature
git checkout feature/my-feature
```

**Use different environment files:**

```bash
# Use local environment
cp packages/backend/.env.local packages/backend/.env

# Test with dev-like settings
cp packages/backend/.env.dev packages/backend/.env

# Test with prod-like settings
cp packages/backend/.env.production packages/backend/.env
```

### On Server

**Switch between dev and prod:**

```bash
# Work in dev environment
cd ~/spanish-class-dev
git checkout develop

# Work in production environment
cd ~/spanish-class
git checkout main
```

**Check active environment:**

```bash
# Check which branch you're on
git branch

# Check which .env is active
cat packages/backend/.env | head -5

# Check backend process
pm2 status
# OR cPanel: Setup Node.js App → View Applications
```

---

## Common Workflows

### Feature Development

```
1. Local: Create feature branch → Develop → Test → Commit
2. Local: Push to GitHub → Create PR to develop
3. Dev: Merge PR → Deploy to dev → Test
4. Dev: Team review → Approval
5. Prod: Create PR develop → main
6. Prod: Final review → Merge
7. Prod: Deploy → Monitor
```

### Hotfix (Emergency Production Fix)

```
1. Local: Create hotfix branch from main
   git checkout main
   git checkout -b hotfix/critical-bug

2. Local: Fix bug → Test → Commit

3. Prod: Deploy hotfix immediately
   git checkout main
   git merge hotfix/critical-bug
   git push origin main
   ./deploy-multi.sh --env=prod

4. Backport: Merge hotfix into develop
   git checkout develop
   git merge hotfix/critical-bug
   git push origin develop
```

### Database Migration

```
1. Local: Update Prisma schema
   Edit: packages/backend/prisma/schema.prisma

2. Local: Test migration
   npm run db:push
   # Or: npm run db:migrate (for production-grade migrations)

3. Dev: Deploy and test
   Deploy to dev
   Verify schema changes
   Test data integrity

4. Prod: Deploy with caution
   BACKUP DATABASE FIRST!
   Deploy to production
   Monitor for issues
```

### Rollback Procedure

**If production deployment fails:**

```bash
# SSH to server
cd ~/spanish-class

# Stop backend
pm2 stop spanish-class-prod

# Restore from backup
rm -rf packages/backend/dist
git checkout HEAD~1  # Go back one commit
# OR: git checkout <previous-commit-hash>

# Rebuild
cd packages/backend && npm run build
cd ../frontend && npm run build
cp -r packages/frontend/dist/* ~/public_html/

# Restore database if needed
mysql -u youruser_prod_user -p youruser_spanish_prod < backup_YYYYMMDD_HHMMSS.sql

# Restart
pm2 restart spanish-class-prod

# Verify
curl https://yourdomain.com/api/health
```

---

## Git Branching Strategy

### Branch Structure

```
main (production-ready code)
  │
  ├── develop (integration branch)
  │     │
  │     ├── feature/user-authentication
  │     ├── feature/booking-system
  │     ├── feature/email-notifications
  │     └── feature/calendar-integration
  │
  └── hotfix/critical-bug (emergency fixes)
```

### Branch Naming

- `feature/*` - New features
- `bugfix/*` - Non-critical bug fixes
- `hotfix/*` - Critical production fixes
- `refactor/*` - Code refactoring
- `docs/*` - Documentation updates

Examples:
- `feature/user-profile-page`
- `bugfix/booking-validation`
- `hotfix/email-sending-failure`
- `refactor/auth-middleware`

### Commit Messages

Follow conventional commits:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `refactor:` - Code refactoring
- `test:` - Tests
- `chore:` - Maintenance

Examples:
```
feat: Add user profile update API
fix: Correct booking time validation
docs: Update deployment guide
refactor: Simplify auth middleware
```

---

## Environment Configuration Management

### Configuration Files Location

```
spanish-class/
├── packages/
│   ├── backend/
│   │   ├── .env              # Active (gitignored)
│   │   ├── .env.local        # Template for local
│   │   ├── .env.dev          # Template for dev
│   │   └── .env.production   # Template for prod
│   └── frontend/
│       ├── .env.local        # Auto-loaded in dev mode
│       ├── .env.dev          # Used in dev build
│       └── .env.production   # Used in prod build
```

### Updating Configuration

**Add new environment variable:**

1. **Update all .env templates:**
   ```bash
   # Add to .env.local, .env.dev, .env.production
   NEW_API_KEY="value"
   ```

2. **Update server environments:**
   ```bash
   # Dev server
   nano ~/spanish-class-dev/packages/backend/.env
   # Add: NEW_API_KEY="dev_value"

   # Prod server
   nano ~/spanish-class/packages/backend/.env
   # Add: NEW_API_KEY="prod_value"
   ```

3. **Restart applications:**
   ```bash
   pm2 restart spanish-class-dev
   pm2 restart spanish-class-prod
   ```

---

## Deployment Checklist

### Before Every Deployment

- [ ] Code tested locally
- [ ] All tests passing
- [ ] No console errors
- [ ] Database migrations tested
- [ ] Environment variables updated
- [ ] Dependencies up to date

### Dev Deployment

- [ ] Merged to develop branch
- [ ] Pulled latest on dev server
- [ ] Database backup created (if schema changes)
- [ ] Deployed using script or manual process
- [ ] Backend restarted
- [ ] Health check passing
- [ ] Features tested manually
- [ ] Team notified

### Production Deployment

- [ ] All dev testing complete
- [ ] Team approval received
- [ ] Merged to main branch
- [ ] **Database backup created**
- [ ] Maintenance window scheduled (if needed)
- [ ] Monitoring plan ready
- [ ] Rollback plan documented
- [ ] Deployed using script
- [ ] Backend restarted
- [ ] Health check passing
- [ ] Smoke tests complete
- [ ] Monitor for 30 minutes
- [ ] Users notified (if needed)

---

## Troubleshooting Deployment Issues

### Deployment Failed

**1. Check what failed:**
```bash
# View deployment script output
# Look for red ERROR messages
```

**2. Check logs:**
```bash
# Backend logs
pm2 logs spanish-class-dev  # or -prod

# cPanel logs
# cPanel → Setup Node.js App → Logs
```

**3. Common issues:**

- **Build failed**: Check for TypeScript errors
  ```bash
  cd packages/backend
  npm run typecheck
  ```

- **Database connection failed**: Verify `.env` DATABASE_URL

- **Dependencies missing**: Run `npm install` again

- **Port conflict**: Check PORT in `.env` and cPanel config

### Backend Not Starting After Deployment

```bash
# Check if process is running
pm2 status

# Try restarting
pm2 restart spanish-class-prod

# Check for errors
pm2 logs spanish-class-prod --lines 50

# Verify .env exists and is correct
cat packages/backend/.env | grep DATABASE_URL
```

### Frontend Not Updating

```bash
# Verify files were copied
ls -la ~/public_html/
# Should see recent timestamps

# Check .htaccess exists
cat ~/public_html/.htaccess

# Clear browser cache
# Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
```

---

## Best Practices

### Do's

✅ Always test in local before deploying to dev
✅ Always test in dev before deploying to production
✅ Create backups before production deployments
✅ Use descriptive commit messages
✅ Document breaking changes
✅ Monitor production after deployment
✅ Use feature branches
✅ Review code before merging

### Don'ts

❌ Never deploy to production without testing in dev
❌ Never skip backups in production
❌ Never commit `.env` files to git
❌ Never merge broken code to develop or main
❌ Never deploy on Friday afternoon
❌ Never deploy without a rollback plan
❌ Never use production database in dev
❌ Never share production credentials

---

## Quick Command Reference

### Local Development

```bash
# Start development
npm run dev

# Type checking
npm run typecheck

# Build
npm run build

# Database operations
cd packages/backend
npm run db:generate  # Generate Prisma Client
npm run db:push      # Sync schema
npm run db:studio    # Open GUI
npm run db:seed      # Seed data
```

### Deployment

```bash
# Deploy to dev
cd ~/spanish-class-dev
./deploy-multi.sh --env=dev

# Deploy to production
cd ~/spanish-class
./deploy-multi.sh --env=prod

# Manual deployment steps
git pull origin <branch>
npm install
cd packages/backend && npm run build
cd ../frontend && npm run build
cp -r packages/frontend/dist/* ~/public_html/
pm2 restart <app-name>
```

### Git Operations

```bash
# Feature workflow
git checkout -b feature/name
git add .
git commit -m "feat: description"
git push origin feature/name

# Update branch
git pull origin develop

# Merge feature
git checkout develop
git merge feature/name
git push origin develop
```

---

## Support

For deployment issues:
- Review logs first
- Check environment-specific guides
- Verify configuration
- Test in lower environment
- Contact unlimited.rs support for hosting issues

---

**Remember**: Test thoroughly, backup always, deploy carefully, monitor constantly!
