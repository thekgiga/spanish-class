# Dev Environment Deployment Guide

Complete guide to deploy the Spanish Class Platform to the **Dev/Staging environment** on unlimited.rs hosting.

## Overview

The Dev environment is used for:
- Testing new features before production
- Integration testing
- Stakeholder reviews
- QA validation

**Key Differences from Production:**
- Separate database (`spanish_dev`)
- Different domain/subdomain (`dev.yourdomain.com`)
- Separate Node.js application (port 3002)
- Can use test API keys and credentials
- More verbose logging enabled

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Domain Configuration](#domain-configuration)
3. [Database Setup](#database-setup)
4. [Application Deployment](#application-deployment)
5. [Verification](#verification)
6. [Updating Dev Environment](#updating-dev-environment)

---

## Prerequisites

- [x] cPanel access at https://panel.unlimited.rs
- [x] SSH access enabled
- [x] Local environment working (see [LOCAL_SETUP.md](./LOCAL_SETUP.md))
- [x] Code tested locally
- [x] Git repository access

---

## Domain Configuration

### Option 1: Subdomain (Recommended)

**Create dev.yourdomain.com:**

1. **Login to cPanel** at https://panel.unlimited.rs
2. **Navigate to "Subdomains"**
3. **Create subdomain**:
   - Subdomain: `dev`
   - Domain: `yourdomain.com`
   - Document Root: `/home/username/public_html/dev`
   - Click "Create"

4. **Wait for DNS propagation** (can take up to 24 hours, usually 5-15 minutes)

5. **Test subdomain**:
   ```bash
   ping dev.yourdomain.com
   ```

### Option 2: Path-Based (Alternative)

Use `https://yourdomain.com/dev` instead of subdomain.

- **Document Root**: `/home/username/public_html/dev`
- No subdomain creation needed
- Less separation from production

For this guide, we'll use **Option 1 (Subdomain)**.

---

## Database Setup

### Step 1: Create Dev Database

1. **cPanel → MySQL Databases**
2. **Create New Database**:
   - Name: `spanish_dev`
   - Click "Create Database"
   - **Note the full name**: `youruser_spanish_dev` (includes your cPanel username)

### Step 2: Create Database User

1. **In MySQL Users section**:
   - Username: `dev_user`
   - Password: Generate strong password (SAVE THIS!)
   - Click "Create User"
   - **Note the full username**: `youruser_dev_user`

Example credentials:
```
Database: myuser_spanish_dev
Username: myuser_dev_user
Password: DevPassword123!Secure
```

### Step 3: Assign User to Database

1. **Add User To Database**:
   - User: `youruser_dev_user`
   - Database: `youruser_spanish_dev`
   - Click "Add"

2. **Grant Privileges**:
   - Select "ALL PRIVILEGES"
   - Click "Make Changes"

### Step 4: Build Connection String

```
mysql://[FULL_USERNAME]:[PASSWORD]@localhost:3306/[FULL_DATABASE]
```

Example:
```
mysql://myuser_dev_user:DevPassword123!Secure@localhost:3306/myuser_spanish_dev
```

**Save this!** You'll need it for the `.env` file.

---

## Application Deployment

### Step 1: Connect via SSH

```bash
ssh username@yourdomain.com
# Enter your password when prompted
```

### Step 2: Clone Repository to Dev Directory

```bash
# Navigate to home directory
cd ~

# Create dev application directory
mkdir -p spanish-class-dev
cd spanish-class-dev

# Clone repository
git clone https://github.com/thekgiga/spanish-class.git .

# Checkout develop branch
git checkout develop
# Or create it if it doesn't exist:
# git checkout -b develop
```

### Step 3: Install Dependencies

```bash
# Install pnpm if not already installed
npm install -g pnpm

# Install all dependencies
pnpm install
```

### Step 4: Configure Backend Environment

```bash
cd packages/backend

# Copy dev environment template
cp .env.dev .env

# Edit environment file
nano .env
```

**Update these values:**

```env
# Database - USE YOUR ACTUAL VALUES FROM STEP 4
DATABASE_URL="mysql://myuser_dev_user:DevPassword123!Secure@localhost:3306/myuser_spanish_dev"

# JWT Secret - Generate new one
# Run: openssl rand -base64 32
JWT_SECRET="YOUR_GENERATED_DEV_SECRET_HERE"
JWT_EXPIRES_IN="7d"

# Google Calendar (Optional for dev)
# GOOGLE_SERVICE_ACCOUNT_EMAIL=""
# GOOGLE_PRIVATE_KEY=""
# GOOGLE_CALENDAR_ID=""

# Email (Optional for dev - can use test mode)
# RESEND_API_KEY=""
# EMAIL_FROM="Spanish Class Dev <noreply@dev.yourdomain.com>"
# PROFESSOR_EMAIL="professor@yourdomain.com"

# Application URLs - USE YOUR ACTUAL SUBDOMAIN
FRONTEND_URL="https://dev.yourdomain.com"
API_URL="https://dev.yourdomain.com/api"

# Environment
NODE_ENV="development"
PORT=3002

# Dev-specific
DEBUG="*"
LOG_LEVEL="debug"
```

**Save:** `Ctrl+X`, then `Y`, then `Enter`

**Generate JWT Secret:**
```bash
openssl rand -base64 32
# Copy the output and paste into JWT_SECRET
```

### Step 5: Configure Frontend Environment

```bash
cd ~/spanish-class-dev/packages/frontend

# Copy dev environment template
cp .env.dev .env.production

# Edit if needed
nano .env.production
```

**Update API URL:**
```env
VITE_API_URL=https://dev.yourdomain.com/api
VITE_DEBUG=true
VITE_ENV=dev
```

### Step 6: Initialize Database

```bash
cd ~/spanish-class-dev/packages/backend

# Generate Prisma Client
pnpm db:generate

# Push schema to database
pnpm db:push

# Seed with test data
pnpm db:seed
```

**Verify database:**
- Go to cPanel → phpMyAdmin
- Select `youruser_spanish_dev` database
- You should see tables: users, bookings, availability_slots, etc.

### Step 7: Build Application

```bash
# Build backend
cd ~/spanish-class-dev/packages/backend
pnpm build

# Verify build
ls -la dist/
# You should see index.js and other files

# Build frontend
cd ~/spanish-class-dev/packages/frontend
pnpm build

# Verify build
ls -la dist/
# You should see index.html, assets/, etc.
```

### Step 8: Deploy Frontend

```bash
# Copy frontend build to dev subdomain directory
cp -r ~/spanish-class-dev/packages/frontend/dist/* ~/public_html/dev/

# Verify files copied
ls -la ~/public_html/dev/
```

### Step 9: Create .htaccess for Dev

```bash
cd ~/public_html/dev
nano .htaccess
```

**Paste this configuration:**

```apache
# Dev Environment Configuration
RewriteEngine On

# Proxy API requests to dev backend (port 3002)
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^api/(.*)$ http://localhost:3002/api/$1 [P,L]

# Frontend routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ /index.html [L]

# Security headers
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
</IfModule>

# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>
```

**Save:** `Ctrl+X`, then `Y`, then `Enter`

### Step 10: Start Backend Application

**Using cPanel Node.js Selector:**

1. **cPanel → Setup Node.js App**
2. **Create Application**:
   - Node.js version: 18.x or higher
   - Application mode: **Production** (even for dev)
   - Application root: `/home/username/spanish-class-dev/packages/backend`
   - Application URL: `dev.yourdomain.com`
   - Application startup file: `dist/index.js`
   - **Port**: 3002 (IMPORTANT: Different from production!)

3. **Add Environment Variables**:
   Click "Add Variable" for each:
   - `DATABASE_URL`: `mysql://...` (your connection string)
   - `JWT_SECRET`: (your generated secret)
   - `FRONTEND_URL`: `https://dev.yourdomain.com`
   - `API_URL`: `https://dev.yourdomain.com/api`
   - `NODE_ENV`: `development`
   - `PORT`: `3002`
   - `LOG_LEVEL`: `debug`

4. **Click "Create"**
5. **Click "Start"**
6. **Verify status shows "Running"**

**Alternative: Using PM2 (if SSH allows):**

```bash
cd ~/spanish-class-dev/packages/backend

# Install PM2
npm install -g pm2

# Start application
pm2 start dist/index.js --name spanish-class-dev

# Save configuration
pm2 save

# Setup auto-restart on server reboot
pm2 startup
```

### Step 11: Install SSL Certificate

1. **cPanel → SSL/TLS Status**
2. **Find `dev.yourdomain.com`**
3. **Click "Run AutoSSL"**
4. **Wait for certificate installation** (usually 1-2 minutes)

**After SSL is installed, update .htaccess:**

```bash
nano ~/public_html/dev/.htaccess
```

**Add at the top:**
```apache
# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

---

## Verification

### 1. Test Backend Health

```bash
curl https://dev.yourdomain.com/api/health
```

Expected response:
```json
{"status":"ok","timestamp":"2026-02-04T..."}
```

### 2. Test Frontend

**Open browser:** https://dev.yourdomain.com

You should see the Spanish Class Platform homepage.

### 3. Test Registration

1. Register a new user
2. Check backend logs (cPanel or PM2)
3. Verify user in database (phpMyAdmin)

### 4. Test Login

1. Login with registered user
2. Navigate through the application
3. Test creating availability slots (professor)
4. Test booking slots (student)

### 5. Check Logs

**cPanel Node.js:**
- Setup Node.js App → View Application → Logs tab

**PM2:**
```bash
pm2 logs spanish-class-dev
pm2 status
```

---

## Updating Dev Environment

### Pull Latest Changes

```bash
# SSH to server
ssh username@yourdomain.com

cd ~/spanish-class-dev

# Pull latest from develop branch
git fetch origin
git checkout develop
git pull origin develop

# Install any new dependencies
pnpm install
```

### Update Database Schema (if changed)

```bash
cd packages/backend

# Regenerate Prisma Client
pnpm db:generate

# Update database schema
pnpm db:push
```

### Rebuild and Redeploy

```bash
# Rebuild backend
cd ~/spanish-class-dev/packages/backend
pnpm build

# Rebuild frontend
cd ~/spanish-class-dev/packages/frontend
pnpm build

# Redeploy frontend
cp -r dist/* ~/public_html/dev/

# Restart backend
# Via cPanel: Setup Node.js App → Restart
# Via PM2:
pm2 restart spanish-class-dev
```

### Quick Update Script

Create a script for faster updates:

```bash
cd ~/spanish-class-dev
nano update-dev.sh
```

**Paste:**
```bash
#!/bin/bash
echo "Updating Dev Environment..."

git pull origin develop
pnpm install

cd packages/backend
pnpm build

cd ../frontend
pnpm build
cp -r dist/* ~/public_html/dev/

echo "Build complete. Remember to restart backend in cPanel!"
```

**Make executable:**
```bash
chmod +x update-dev.sh
```

**Usage:**
```bash
cd ~/spanish-class-dev
./update-dev.sh
# Then restart backend via cPanel
```

---

## Troubleshooting

### Backend Not Starting

**Check Logs:**
- cPanel → Setup Node.js App → Logs

**Common Issues:**

1. **Port conflict**:
   - Verify PORT=3002 in .env
   - Check no other app uses 3002

2. **Database connection**:
   - Verify DATABASE_URL is correct
   - Test in phpMyAdmin

3. **Build issues**:
   ```bash
   cd ~/spanish-class-dev/packages/backend
   rm -rf dist node_modules
   pnpm install
   pnpm build
   ```

### Frontend Not Loading

1. **Check files exist:**
   ```bash
   ls -la ~/public_html/dev/
   # Should see index.html, assets/, etc.
   ```

2. **Check .htaccess:**
   ```bash
   cat ~/public_html/dev/.htaccess
   ```

3. **Check browser console** for errors

### API Connection Errors

1. **Verify backend is running:**
   ```bash
   curl http://localhost:3002/health
   ```

2. **Check .htaccess proxy:**
   - Should proxy /api/ to port 3002

3. **Check frontend API URL:**
   ```bash
   cat ~/spanish-class-dev/packages/frontend/.env.production
   # Should be: VITE_API_URL=https://dev.yourdomain.com/api
   ```

### SSL Certificate Issues

1. **Verify SSL is installed:**
   - cPanel → SSL/TLS Status
   - dev.yourdomain.com should show "Active"

2. **Clear browser cache** and retry

3. **Check .htaccess HTTPS redirect**

---

## Dev Environment Checklist

- [ ] Subdomain `dev.yourdomain.com` created
- [ ] Dev database created (`youruser_spanish_dev`)
- [ ] Dev database user created with privileges
- [ ] Repository cloned to `~/spanish-class-dev`
- [ ] Backend `.env` configured with dev settings
- [ ] Frontend `.env.production` configured
- [ ] Database schema pushed and seeded
- [ ] Backend built successfully
- [ ] Frontend built successfully
- [ ] Frontend deployed to `~/public_html/dev/`
- [ ] `.htaccess` configured
- [ ] Backend Node.js app created (port 3002)
- [ ] Backend running and healthy
- [ ] SSL certificate installed
- [ ] Frontend loads in browser
- [ ] API requests working
- [ ] Can register and login
- [ ] No errors in browser console

---

## Next Steps

After dev environment is working:

1. ✅ **Test all features** in dev environment
2. ✅ **Share dev URL** with team for review
3. ✅ **Run integration tests**
4. ✅ **Get stakeholder approval**
5. ✅ **Prepare for production deployment**

**When ready for production:**
- Read [PROD_DEPLOYMENT.md](./PROD_DEPLOYMENT.md)

---

## Maintenance

### Regular Tasks

1. **Keep dev updated** with latest develop branch
2. **Monitor logs** for errors
3. **Test new features** before production
4. **Backup dev database** periodically

### Backup Dev Database

```bash
# Via cPanel: Backup → Download MySQL Database Backup

# Or via SSH:
cd ~
mysqldump -u myuser_dev_user -p myuser_spanish_dev > dev_backup_$(date +%Y%m%d).sql
```

---

**Congratulations!** Your dev environment is live! 🎉

Test URL: https://dev.yourdomain.com

Next: [PROD_DEPLOYMENT.md](./PROD_DEPLOYMENT.md) for production deployment.
