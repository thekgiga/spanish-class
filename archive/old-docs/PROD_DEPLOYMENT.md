# Production Environment Deployment Guide

Complete guide to deploy the Spanish Class Platform to **Production environment** on unlimited.rs hosting.

⚠️ **WARNING**: This guide deploys to your live production environment. Follow all steps carefully and create backups before proceeding.

## Overview

The Production environment is for:
- Live application serving real users
- Real student and professor data
- Actual bookings and payments (if applicable)
- Production-grade security and monitoring

**Key Characteristics:**
- High security requirements
- Strong passwords and secrets
- SSL certificate mandatory
- Minimal logging (errors only)
- Backup strategy required
- Zero-downtime deployment preferred

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Database Setup](#database-setup)
3. [Application Deployment](#application-deployment)
4. [SSL and Security](#ssl-and-security)
5. [Verification](#verification)
6. [Post-Deployment](#post-deployment)
7. [Updating Production](#updating-production)

---

## Pre-Deployment Checklist

### Before You Begin

- [ ] **Dev environment fully tested** and approved
- [ ] All features working in dev environment
- [ ] Database migrations tested in dev
- [ ] Security audit completed
- [ ] Backup strategy planned
- [ ] Monitoring plan in place
- [ ] Rollback plan documented

### Required Information

Prepare these before starting:

- [ ] Production domain (e.g., `yourdomain.com`)
- [ ] Strong database password (16+ characters)
- [ ] Strong JWT secret (32+ characters)
- [ ] Production API keys (Resend, Google Calendar)
- [ ] SSH credentials
- [ ] cPanel credentials

### Tools Ready

- [ ] SSH client
- [ ] Git installed on server
- [ ] Node.js 18+ available
- [ ] npm installed

⚠️ **STOP**: Do not proceed until all boxes are checked!

---

## Database Setup

### Step 1: Create Production Database

1. **Login to cPanel** at https://panel.unlimited.rs
2. **Navigate to MySQL Databases**
3. **Create New Database**:
   - Name: `spanish_prod`
   - Click "Create Database"
   - **Note the full name**: `youruser_spanish_prod`

### Step 2: Create Database User with Strong Password

1. **In MySQL Users section**:
   - Username: `prod_user`
   - **Password**: Generate STRONG password (16+ characters)
     - Use cPanel password generator
     - Include: uppercase, lowercase, numbers, symbols
     - **SAVE THIS SECURELY** (password manager recommended)
   - Click "Create User"
   - **Note the full username**: `youruser_prod_user`

Example (DO NOT use these actual values):
```
Database: myuser_spanish_prod
Username: myuser_prod_user
Password: Xk9$mP2#vQ8@wL5!nY7^
```

### Step 3: Assign User to Database

1. **Add User To Database**:
   - User: `youruser_prod_user`
   - Database: `youruser_spanish_prod`
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
mysql://myuser_prod_user:Xk9$mP2#vQ8@wL5!nY7^@localhost:3306/myuser_spanish_prod
```

⚠️ **Important**: If password contains special characters, you may need to URL-encode them:
- `@` → `%40`
- `$` → `%24`
- `#` → `%23`
- `&` → `%26`

**Save this connection string securely!**

---

## Application Deployment

### Step 1: Connect via SSH

```bash
ssh username@yourdomain.com
# Enter your password
```

### Step 2: Clone Repository to Production Directory

```bash
# Navigate to home directory
cd ~

# Create production application directory
mkdir -p spanish-class
cd spanish-class

# Clone repository
git clone https://github.com/thekgiga/spanish-class.git .

# Checkout main/production branch
git checkout main
```

### Step 3: Install Dependencies

```bash
# 


# Install all dependencies
npm install
```

### Step 4: Configure Backend Environment

⚠️ **CRITICAL**: Use strong, unique secrets for production!

```bash
cd packages/backend

# Copy production environment template
cp .env.production .env

# Edit environment file
nano .env
```

**Configure with PRODUCTION values:**

```env
# Database - USE YOUR PRODUCTION DATABASE
DATABASE_URL="mysql://myuser_prod_user:Xk9$mP2#vQ8@wL5!nY7^@localhost:3306/myuser_spanish_prod"

# JWT Secret - MUST BE STRONG AND UNIQUE!
# Generate: openssl rand -base64 48
JWT_SECRET="YOUR_STRONG_PRODUCTION_SECRET_MINIMUM_32_CHARACTERS"
JWT_EXPIRES_IN="7d"

# Google Calendar API (Required if using calendar features)
GOOGLE_SERVICE_ACCOUNT_EMAIL="your-prod-service@project.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Production_Key\n-----END PRIVATE KEY-----"
GOOGLE_CALENDAR_ID="primary"

# Email Service (Required for production)
# Use PRODUCTION API key from Resend
RESEND_API_KEY="re_YOUR_PRODUCTION_API_KEY"
EMAIL_FROM="Spanish Class <noreply@yourdomain.com>"
PROFESSOR_EMAIL="professor@yourdomain.com"

# Application URLs - USE YOUR PRODUCTION DOMAIN
FRONTEND_URL="https://yourdomain.com"
API_URL="https://yourdomain.com/api"

# Environment
NODE_ENV="production"
PORT=3001

# Production logging (errors only)
LOG_LEVEL="error"
```

**Save:** `Ctrl+X`, then `Y`, then `Enter`

**Generate Strong JWT Secret:**
```bash
# Generate 48-byte base64 secret (even stronger)
openssl rand -base64 48

# Copy output and paste into JWT_SECRET
```

### Step 5: Secure Environment File

```bash
# Restrict permissions on .env file
chmod 600 .env

# Verify
ls -la .env
# Should show: -rw------- (only owner can read/write)
```

### Step 6: Configure Frontend Environment

```bash
cd ~/spanish-class/packages/frontend

# Edit production environment (if needed)
nano .env.production
```

**Verify/Update API URL:**
```env
VITE_API_URL=https://yourdomain.com/api
VITE_DEBUG=false
VITE_ENV=production
```

### Step 7: Initialize Database

⚠️ **IMPORTANT**: This will create tables in your production database.

```bash
cd ~/spanish-class/packages/backend

# Generate Prisma Client
npm run db:generate

# Push schema to production database
npm run db:push

# Verify in cPanel → phpMyAdmin
# You should see tables created
```

**Do NOT run `npm run db:seed` in production** unless you want test data!

### Step 8: Create First Admin User

Instead of seeding, create your real admin user:

```bash
cd ~/spanish-class/packages/backend

# Start a Node REPL
node
```

In Node REPL:
```javascript
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdmin() {
  const hash = await bcrypt.hash('YourSecurePassword123!', 10)

  const admin = await prisma.user.create({
    data: {
      email: 'admin@yourdomain.com',
      passwordHash: hash,
      firstName: 'Admin',
      lastName: 'User',
      isAdmin: true,
      isEmailVerified: true
    }
  })

  console.log('Admin created:', admin.email)
  process.exit(0)
}

createAdmin()
```

**Or use a script** (recommended):

```bash
# Create admin script
nano create-admin.js
```

**Paste:**
```javascript
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const email = process.argv[2]
const password = process.argv[3]
const firstName = process.argv[4] || 'Admin'
const lastName = process.argv[5] || 'User'

if (!email || !password) {
  console.error('Usage: node create-admin.js email password [firstName] [lastName]')
  process.exit(1)
}

async function main() {
  const passwordHash = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName,
      lastName,
      isAdmin: true,
      isEmailVerified: true
    }
  })

  console.log('Admin user created:', user.email)
}

main().then(() => process.exit(0)).catch(console.error)
```

**Run:**
```bash
node create-admin.js admin@yourdomain.com YourSecurePassword123!
```

### Step 9: Build Application

```bash
# Build backend
cd ~/spanish-class/packages/backend
npm run build

# Verify build
ls -la dist/
# Should see index.js and other compiled files

# Build frontend
cd ~/spanish-class/packages/frontend
npm run build

# Verify build
ls -la dist/
# Should see index.html, assets/, etc.
```

### Step 10: Deploy Frontend

```bash
# Backup existing public_html (if any)
cd ~
if [ -d "public_html" ] && [ "$(ls -A public_html)" ]; then
  cp -r public_html public_html_backup_$(date +%Y%m%d_%H%M%S)
  echo "Backup created"
fi

# Deploy frontend to production
cp -r ~/spanish-class/packages/frontend/dist/* ~/public_html/

# Verify deployment
ls -la ~/public_html/
```

### Step 11: Create Production .htaccess

```bash
cd ~/public_html
nano .htaccess
```

**Paste this PRODUCTION configuration:**

```apache
# Spanish Class Platform - Production Configuration
RewriteEngine On

# Force HTTPS (IMPORTANT for production)
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Proxy API requests to production backend (port 3001)
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^api/(.*)$ http://localhost:3001/api/$1 [P,L]

# Frontend routing (React Router)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ /index.html [L]

# Security Headers
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
    Header set Referrer-Policy "strict-origin-when-cross-origin"

    # HSTS (Strict Transport Security) - Force HTTPS
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"

    # Hide server information
    Header unset Server
    Header unset X-Powered-By
</IfModule>

# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Browser Caching
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType image/x-icon "access plus 1 year"
    ExpiresByType font/ttf "access plus 1 year"
    ExpiresByType font/woff "access plus 1 year"
    ExpiresByType font/woff2 "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType text/javascript "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
</IfModule>

# Block access to sensitive files
<FilesMatch "^\.">
    Order allow,deny
    Deny from all
</FilesMatch>

<FilesMatch "\.(env|log|sql|bak|backup|swp|old)$">
    Order allow,deny
    Deny from all
</FilesMatch>

# Disable directory browsing
Options -Indexes
```

**Save:** `Ctrl+X`, then `Y`, then `Enter`

### Step 12: Start Backend Application

**Using cPanel Node.js Selector (Recommended):**

1. **cPanel → Setup Node.js App**
2. **Create Application**:
   - Node.js version: **18.x or higher**
   - Application mode: **Production**
   - Application root: `/home/username/spanish-class/packages/backend`
   - Application URL: `yourdomain.com`
   - Application startup file: `dist/index.js`
   - **Port**: `3001`

3. **Add Environment Variables**:
   - Click "Add Variable" for each variable from your `.env` file
   - **DO NOT** include quotes around values
   - Variables to add:
     - `DATABASE_URL`
     - `JWT_SECRET`
     - `FRONTEND_URL`
     - `API_URL`
     - `NODE_ENV` = `production`
     - `PORT` = `3001`
     - `LOG_LEVEL` = `error`
     - (Add others as needed: RESEND_API_KEY, GOOGLE_*, etc.)

4. **Click "Create"**
5. **Click "Start"**
6. **Verify status shows "Running"**

**Alternative: Using PM2:**

```bash
cd ~/spanish-class/packages/backend

# Install PM2 globally
npm install -g pm2

# Start application
pm2 start dist/index.js --name spanish-class-prod

# Save PM2 configuration
pm2 save

# Setup auto-restart on server reboot
pm2 startup

# Verify running
pm2 status
```

---

## SSL and Security

### Step 1: Install SSL Certificate

⚠️ **REQUIRED**: Never run production without SSL!

1. **cPanel → SSL/TLS Status**
2. **Find `yourdomain.com`**
3. **Click "Run AutoSSL"**
4. **Wait for completion** (1-5 minutes)
5. **Verify certificate is active**

### Step 2: Test HTTPS

```bash
curl https://yourdomain.com/api/health
```

Should return `{"status":"ok",...}` without SSL errors.

### Step 3: Security Checklist

- [ ] SSL certificate installed and active
- [ ] HTTPS forced via .htaccess
- [ ] Strong database password (16+ characters)
- [ ] Strong JWT secret (32+ characters)
- [ ] `.env` file permissions set to 600
- [ ] `.env` file NOT in git repository
- [ ] Production API keys configured
- [ ] Security headers enabled in .htaccess
- [ ] Directory browsing disabled
- [ ] Sensitive files blocked from access
- [ ] Server information hidden

---

## Verification

### 1. Backend Health Check

```bash
curl https://yourdomain.com/api/health
```

Expected:
```json
{"status":"ok","timestamp":"2026-02-04T..."}
```

### 2. Frontend Access

**Open browser:** https://yourdomain.com

- [ ] Homepage loads
- [ ] No JavaScript errors in console
- [ ] HTTPS padlock shows in browser
- [ ] All assets load correctly

### 3. SSL Certificate

**Check SSL:**
- Click padlock icon in browser
- Verify certificate is valid
- Verify issued by Let's Encrypt
- Verify no mixed content warnings

### 4. Authentication Test

1. **Register new user**:
   - Go to /register
   - Create test account
   - Should receive email (if configured)

2. **Login test**:
   - Login with test account
   - Should redirect to dashboard
   - Check browser console for errors

3. **Admin login**:
   - Login with admin account created earlier
   - Verify admin features visible

### 5. Database Verification

- **cPanel → phpMyAdmin**
- Select `youruser_spanish_prod`
- Check `users` table contains admin and test users
- Verify data integrity

### 6. API Endpoints Test

```bash
# Health (should work without auth)
curl https://yourdomain.com/api/health

# Login (should return JWT)
curl -X POST https://yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@yourdomain.com","password":"YourPassword"}'

# Should return: {"token":"...","user":{...}}
```

---

## Post-Deployment

### 1. Create Initial Backup

```bash
# Backup database
mysqldump -u youruser_prod_user -p youruser_spanish_prod > prod_initial_backup.sql

# Or via cPanel: Backup → Download MySQL Database Backup
```

### 2. Setup Monitoring

**Create health check script:**

```bash
cd ~
nano health-check.sh
```

**Paste:**
```bash
#!/bin/bash
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://yourdomain.com/api/health)

if [ $RESPONSE -eq 200 ]; then
  echo "OK - Application is running"
else
  echo "ERROR - Application returned $RESPONSE"
  # Optional: Send alert email
  # echo "Application down!" | mail -s "Spanish Class Alert" admin@yourdomain.com
fi
```

**Setup cron job (cPanel → Cron Jobs):**
```
*/5 * * * * /home/username/health-check.sh
```

### 3. Setup Backup Schedule

**cPanel → Backup → Backup Schedule**
- Enable automatic backups
- Set frequency (daily recommended)
- Configure backup retention

### 4. Document Production Info

Create a production runbook:

```bash
nano PRODUCTION_RUNBOOK.md
```

Include:
- Database credentials
- Server access info
- Deployment procedure
- Rollback procedure
- Emergency contacts
- Monitoring URLs

---

## Updating Production

### Pre-Update Checklist

- [ ] Changes tested in dev environment
- [ ] Database migrations tested
- [ ] Backup created
- [ ] Rollback plan ready
- [ ] Maintenance window scheduled (if needed)

### Update Procedure

1. **Backup Everything:**
   ```bash
   # Backup database
   cd ~
   mysqldump -u youruser_prod_user -p youruser_spanish_prod > backup_$(date +%Y%m%d_%H%M%S).sql

   # Backup application files
   cp -r spanish-class spanish-class_backup_$(date +%Y%m%d_%H%M%S)

   # Backup frontend
   cp -r public_html public_html_backup_$(date +%Y%m%d_%H%M%S)
   ```

2. **Pull Latest Code:**
   ```bash
   cd ~/spanish-class
   git fetch origin
   git checkout main
   git pull origin main
   ```

3. **Update Dependencies:**
   ```bash
   npm install
   ```

4. **Update Database (if schema changed):**
   ```bash
   cd packages/backend
   npm run db:generate
   npm run db:push
   ```

5. **Rebuild Application:**
   ```bash
   # Backend
   cd ~/spanish-class/packages/backend
   npm run build

   # Frontend
   cd ~/spanish-class/packages/frontend
   npm run build
   ```

6. **Deploy Frontend:**
   ```bash
   cp -r ~/spanish-class/packages/frontend/dist/* ~/public_html/
   ```

7. **Restart Backend:**
   - **cPanel**: Setup Node.js App → Restart
   - **PM2**: `pm2 restart spanish-class-prod`

8. **Verify Update:**
   ```bash
   curl https://yourdomain.com/api/health
   # Open browser and test functionality
   ```

### Rollback Procedure

If update fails:

```bash
# Stop backend
# Via cPanel: Setup Node.js App → Stop
# Via PM2: pm2 stop spanish-class-prod

# Restore application files
cd ~
rm -rf spanish-class
mv spanish-class_backup_YYYYMMDD_HHMMSS spanish-class

# Restore frontend
rm -rf public_html/*
cp -r public_html_backup_YYYYMMDD_HHMMSS/* public_html/

# Restore database
mysql -u youruser_prod_user -p youruser_spanish_prod < backup_YYYYMMDD_HHMMSS.sql

# Restart backend
# Via cPanel: Setup Node.js App → Start
# Via PM2: pm2 restart spanish-class-prod
```

---

## Troubleshooting

### Application Not Starting

1. **Check logs:**
   - cPanel → Setup Node.js App → Logs
   - PM2: `pm2 logs spanish-class-prod`

2. **Check environment variables:**
   ```bash
   cd ~/spanish-class/packages/backend
   cat .env | grep DATABASE_URL
   ```

3. **Test database connection:**
   ```bash
   mysql -u youruser_prod_user -p youruser_spanish_prod
   ```

### SSL Certificate Issues

1. **Verify certificate:**
   - cPanel → SSL/TLS Status
   - Should show "Active"

2. **Regenerate certificate:**
   - Click "Run AutoSSL" again

3. **Check .htaccess HTTPS redirect**

### Performance Issues

1. **Check server resources:**
   ```bash
   top
   free -m
   df -h
   ```

2. **Check database slow queries:**
   - cPanel → phpMyAdmin → Status

3. **Enable caching:**
   - cPanel → LiteSpeed Cache Manager

### Database Connection Lost

1. **Check MySQL service:**
   - Contact unlimited.rs support if down

2. **Verify credentials:**
   - Test connection string manually

3. **Check connection limits:**
   - cPanel may have connection limits

---

## Production Checklist

Final verification before going live:

- [ ] Database created and secured
- [ ] Strong passwords used everywhere
- [ ] SSL certificate installed and working
- [ ] HTTPS forced via .htaccess
- [ ] Admin user created
- [ ] Backend running on port 3001
- [ ] Frontend deployed to public_html
- [ ] API health check returns 200
- [ ] Frontend loads without errors
- [ ] Can register and login
- [ ] Email notifications working (if configured)
- [ ] Google Calendar working (if configured)
- [ ] All features tested
- [ ] Initial backup created
- [ ] Monitoring setup
- [ ] Documentation updated
- [ ] Team trained on deployment
- [ ] Rollback procedure documented

---

## Maintenance

### Daily Tasks

- [ ] Check application health
- [ ] Review error logs
- [ ] Monitor database size

### Weekly Tasks

- [ ] Review user registrations
- [ ] Check backup status
- [ ] Update dependencies (if needed)

### Monthly Tasks

- [ ] Security audit
- [ ] Performance review
- [ ] Database optimization
- [ ] Backup verification

---

## Support

**Production Issues:**
1. Check logs first
2. Review recent changes
3. Check server status
4. Contact unlimited.rs support if hosting-related

**Emergency Contact:**
- unlimited.rs Support: https://unlimited.rs/en/
- cPanel documentation: https://docs.cpanel.net/

---

**🎉 Congratulations!** Your Spanish Class Platform is live in production!

**Production URL:** https://yourdomain.com

**Remember:**
- Always test in dev before deploying to production
- Always backup before making changes
- Monitor logs and performance
- Keep dependencies updated
- Review security regularly

**Next Steps:**
- Set up monitoring alerts
- Create user documentation
- Plan marketing launch
- Schedule regular maintenance
