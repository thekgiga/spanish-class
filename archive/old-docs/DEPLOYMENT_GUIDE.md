# Spanish Class Platform - cPanel Deployment Guide

Complete step-by-step guide for deploying to cPanel shared hosting (unlimited.rs or similar).

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Prerequisites](#prerequisites)
3. [Local Build Process](#local-build-process)
4. [cPanel Setup](#cpanel-setup)
5. [Backend Deployment](#backend-deployment)
6. [Frontend Deployment](#frontend-deployment)
7. [Starting the Application](#starting-the-application)
8. [Troubleshooting](#troubleshooting)
9. [Maintenance & Updates](#maintenance--updates)

---

## 🚀 Quick Start

**TL;DR for experienced users:**

```bash
# 1. Build deployment package locally
./build-deploy-package.sh

# 2. Upload deploy/backend/* to ~/spanish-class-backend/
# 3. Upload deploy/frontend/* to ~/public_html/
# 4. Create .env on server from .env.template
# 5. Run npm install via cPanel Node.js interface
# 6. Run db migrations via SSH: npm run db:generate && npm run db:push
# 7. Start Node.js app in cPanel
```

**This guide covers two deployment approaches:**
- **Option 1**: Build on cPanel server (requires more resources)
- **Option 2**: Build locally and upload production files (recommended for shared hosting)

## Architecture Overview

Your application consists of:
- **Frontend**: React + Vite SPA (Static files served by LiteSpeed)
- **Backend**: Node.js Express API (Running on Node.js)
- **Database**: MySQL (Managed via cPanel)

## Prerequisites

- Access to cPanel at https://panel.unlimited.rs
- Domain configured and pointed to your hosting
- SSH access enabled (available in OPTIMUM+ plan)
- Node.js version 18+ support in cPanel

---

## Part 1: Database Setup

### Step 1: Create MySQL Database in cPanel

1. **Login to cPanel** at https://panel.unlimited.rs
2. **Navigate to "MySQL Databases"** section
3. **Create a new database**:
   - Database name will be: `username_spanish_class` (cPanel adds your username prefix)
   - Click "Create Database"
   - **IMPORTANT**: Note the full database name shown (e.g., `myuser_spanish_class`)

### Step 2: Create Database User

1. In the same "MySQL Databases" section, scroll to "MySQL Users"
2. **Create a new user**:
   - Username: `spanish_app` (will become `username_spanish_app`)
   - Password: Generate a strong password (SAVE THIS!)
   - Click "Create User"
   - **IMPORTANT**: Note the full username (e.g., `myuser_spanish_app`)

### Step 3: Assign User to Database

1. Scroll to "Add User To Database" section
2. Select your user (`username_spanish_app`)
3. Select your database (`username_spanish_class`)
4. Click "Add"
5. On the privileges page, select "ALL PRIVILEGES"
6. Click "Make Changes"

### Step 4: Get Database Connection Details

Your database connection string will be:
```
mysql://[USERNAME]:[PASSWORD]@localhost:3306/[DATABASE_NAME]
```

Example:
```
mysql://myuser_spanish_app:SecurePassword123@localhost:3306/myuser_spanish_class
```

**IMPORTANT**: The database host is `localhost` because the database runs on the same server as your application.

---

## Part 2: Application Deployment

### **Option A: Build Locally and Deploy** (Recommended for cPanel)

This approach builds the application on your local machine and uploads only the production-ready files. This is **recommended for shared hosting** because it:
- Avoids resource-intensive builds on the server
- Reduces deployment time
- Avoids monorepo/turborepo compatibility issues with cPanel
- Smaller upload size (no source files, no dev dependencies)

#### Local Build Process

**Step 1: Build Deployment Package Locally**

On your local machine:

```bash
# Navigate to project directory
cd /path/to/spanish-class

# Make script executable (first time only)
chmod +x build-deploy-package.sh

# Run the build script
./build-deploy-package.sh
```

This creates a `deploy/` directory with:
```
deploy/
├── backend/
│   ├── dist/                   # Compiled JavaScript
│   ├── prisma/                 # Database schema
│   ├── _shared_lib/            # Bundled shared monorepo packages
│   │   └── @spanish-class/
│   │       └── shared/         # Shared package
│   ├── package.json            # Production dependencies only
│   ├── setup-shared-package.sh # Post-install symlink script
│   └── .env.template           # Environment template
├── frontend/              # Static files ready to serve
│   ├── index.html
│   ├── assets/
│   └── icons/
├── README.md              # Quick reference
└── DEPLOYMENT_SUMMARY.txt # Build info
```

**⚠️ IMPORTANT: Understanding the `_shared_lib` Directory**

cPanel's CloudLinux NodeJS Selector has a specific requirement: **`node_modules` must be a symlink** to a virtual environment created by cPanel. Our monorepo includes a shared package (`@spanish-class/shared`) that needs to be available at runtime.

**The Solution:**
- The shared package is bundled in `_shared_lib/@spanish-class/shared` (NOT `node_modules`)
- After npm install on cPanel, we run `setup-shared-package.sh` to create a symlink:
  ```
  node_modules/@spanish-class/shared → _shared_lib/@spanish-class/shared
  ```
- This satisfies both cPanel's requirement and our import resolution

**Do NOT:**
- ❌ Delete or rename the `_shared_lib` directory
- ❌ Create a `node_modules` folder manually
- ❌ Skip running `setup-shared-package.sh` after npm install

**Step 2: Upload Backend to Server**

**Via cPanel File Manager:**
1. Log in to cPanel
2. Navigate to File Manager
3. Create directory: `/home/username/spanish-class-backend`
4. Upload all files from `deploy/backend/` to this directory
   - You can zip the `deploy/backend` folder first for faster upload
   - Then extract on the server

**Via SSH/SCP:**
```bash
# From your local machine
scp -r deploy/backend/* username@yourdomain.com:~/spanish-class-backend/
```

**Via SFTP (FileZilla, Cyberduck, etc.):**
- Connect to your server via SFTP
- Navigate to `/home/username/`
- Create folder: `spanish-class-backend`
- Upload all contents of `deploy/backend/`

**Step 3: Upload Frontend to Server**

```bash
# Via SCP
scp -r deploy/frontend/* username@yourdomain.com:~/public_html/

# Or use cPanel File Manager to upload to public_html
```

**Step 4: Create Environment File on Server**

Connect via SSH or use cPanel File Manager:

```bash
cd ~/spanish-class-backend
nano .env
```

**Copy this template and fill in your values:**

```env
# Database Configuration (from Part 1)
DATABASE_URL="mysql://myuser_spanish_app:YOUR_PASSWORD@localhost:3306/myuser_spanish_class"

# JWT Authentication - GENERATE A SECURE RANDOM STRING!
JWT_SECRET="CHANGE_THIS_TO_LONG_RANDOM_STRING_MIN_32_CHARS"
JWT_EXPIRES_IN="7d"

# Email Configuration (Resend) - Optional
RESEND_API_KEY="re_your_key_here"
EMAIL_FROM="Spanish Class <noreply@yourdomain.com>"
PROFESSOR_EMAIL="professor@yourdomain.com"

# Application URLs
FRONTEND_URL="https://yourdomain.com"
API_URL="https://yourdomain.com/api"

# Environment
NODE_ENV="production"
PORT=3001
```

**Generate secure JWT_SECRET:**
```bash
# On server or local machine
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Step 5: Install Production Dependencies**

**Via cPanel Node.js Interface (Recommended):**
1. cPanel → Software → Setup Node.js App
2. Create application:
   - Node.js version: 20.x (or latest 18.x+)
   - Application mode: Production
   - Application root: `spanish-class-backend`
   - Application startup file: `dist/index.js`
3. Click "Create"
4. Scroll to "Detected configuration files"
5. Click "Run NPM Install"
6. Wait for completion (2-5 minutes)

**Via SSH:**
```bash
cd ~/spanish-class-backend
source /home/username/nodevenv/spanish-class-backend/20/bin/activate
npm install --production
```

**Step 5b: Setup Shared Package Symlink** ⭐ **CRITICAL STEP**

After npm install completes, you **MUST** run the setup script to create symlinks for the shared package:

**Via SSH:**
```bash
cd ~/spanish-class-backend
bash setup-shared-package.sh
```

**Expected output:**
```
Setting up shared package symlink...
✓ Shared package symlink created successfully
  node_modules/@spanish-class/shared -> _shared_lib/@spanish-class/shared
```

**Via cPanel Terminal:**
1. cPanel → Advanced → Terminal
2. Navigate to your backend directory: `cd ~/spanish-class-backend`
3. Run: `bash setup-shared-package.sh`

**Verification:**
```bash
ls -la node_modules/@spanish-class/
# You should see: shared -> ../../_shared_lib/@spanish-class/shared
```

**If you skip this step**, the application will fail with:
```
Error: Cannot find module '@spanish-class/shared'
```

**Step 6: Initialize Database**

```bash
cd ~/spanish-class-backend
source /home/username/nodevenv/spanish-class-backend/20/bin/activate

# Generate Prisma Client
npm run db:generate

# Create database tables
npm run db:push

# Optional: Seed initial data (creates test users)
npm run db:seed
```

**Step 7: Configure Frontend Routing**

Create `.htaccess` in `public_html`:

```bash
cd ~/public_html
nano .htaccess
```

Add:
```apache
# Enable Rewrite Engine
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Force HTTPS (uncomment after SSL installed)
  # RewriteCond %{HTTPS} off
  # RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

  # Handle React Router - redirect all requests to index.html
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>

# Cache Control
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType font/woff2 "access plus 1 year"
  ExpiresDefault "access plus 1 week"
</IfModule>

# Security Headers
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-XSS-Protection "1; mode=block"
</IfModule>

# Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
</IfModule>
```

**Step 8: Start Backend Application**

**Via cPanel:**
1. cPanel → Setup Node.js App
2. Find your application
3. Click "Start"
4. Status should show "Running"

**Verify:**
```bash
curl https://yourdomain.com/health
# Should return: {"status":"ok","timestamp":"..."}
```

**Step 9: Test Frontend**

Visit `https://yourdomain.com` - you should see the Spanish Class login page.

---

### **Option B: Build on Server via SSH**

#### Step 1: Enable SSH Access

1. In cPanel, go to "SSH Access" or "Terminal"
2. Ensure SSH is enabled
3. Note your SSH credentials

#### Step 2: Connect to Server

```bash
ssh username@your-domain.com
# OR
ssh username@server-ip-address
```

#### Step 3: Prepare Directory Structure

```bash
# Navigate to your home directory
cd ~

# Create application directory
mkdir -p spanish-class
cd spanish-class

# Create public_html link (if deploying to domain root)
# OR create a subdomain folder in public_html
```

#### Step 4: Upload Application Files

**From your local machine**, use one of these methods:

**Method 1: Git Clone (Recommended)**
```bash
# On the server
cd ~/spanish-class
git clone https://github.com/thekgiga/spanish-class.git .
```

**Method 2: SCP/SFTP Upload**
```bash
# From your local machine
scp -r /path/to/spanish-class/* username@server:/home/username/spanish-class/
```

**Method 3: cPanel File Manager**
1. Compress your project into a .zip file
2. Upload via cPanel File Manager
3. Extract on the server

#### Step 5: Install Dependencies

```bash
# On the server
cd ~/spanish-class




# Install all dependencies
npm install
```

#### Step 6: Configure Environment Variables

```bash
# Create production environment file for backend
cd ~/spanish-class/packages/backend
nano .env
```

**Copy and configure** (see `.env.production` template below):
```env
# Database (MySQL) - USE YOUR ACTUAL VALUES FROM CPANEL
DATABASE_URL="mysql://myuser_spanish_app:YourPassword123@localhost:3306/myuser_spanish_class"

# JWT Authentication - GENERATE NEW SECRET!
JWT_SECRET="your-production-secret-key-min-32-characters"
JWT_EXPIRES_IN="7d"

# Google Calendar API (Optional)
GOOGLE_SERVICE_ACCOUNT_EMAIL=""
GOOGLE_PRIVATE_KEY=""
GOOGLE_CALENDAR_ID=""

# Email (Resend) - Optional
RESEND_API_KEY=""
EMAIL_FROM="Spanish Class <noreply@yourdomain.com>"
PROFESSOR_EMAIL="professor@yourdomain.com"

# App URLs - USE YOUR ACTUAL DOMAIN
FRONTEND_URL="https://yourdomain.com"
API_URL="https://yourdomain.com/api"

# Node environment
NODE_ENV="production"
PORT=3001
```

**Save the file**: Press `Ctrl+X`, then `Y`, then `Enter`

#### Step 7: Initialize Database

```bash
# Generate Prisma client
cd ~/spanish-class/packages/backend
npm run db:generate

# Push database schema to MySQL
npm run db:push

# Optional: Seed initial data
npm run db:seed
```

#### Step 8: Build Application

```bash
# Build backend
cd ~/spanish-class/packages/backend
npm run build

# Build frontend
cd ~/spanish-class/packages/frontend
npm run build
```

#### Step 9: Setup Frontend (Static Files)

```bash
# Copy built frontend to public_html
cp -r ~/spanish-class/packages/frontend/dist/* ~/public_html/

# OR if using subdomain
cp -r ~/spanish-class/packages/frontend/dist/* ~/public_html/subdomain_folder/
```

#### Step 10: Configure Frontend API URL

Before building the frontend, update the API URL:

```bash
# Edit frontend environment or config
cd ~/spanish-class/packages/frontend
nano .env.production
```

Add:
```env
VITE_API_URL=https://yourdomain.com/api
```

**Then rebuild frontend**:
```bash
npm run build
cp -r dist/* ~/public_html/
```

#### Step 11: Start Backend Application

**Using cPanel's Node.js Selector**:

1. Go to cPanel → "Setup Node.js App"
2. Click "Create Application"
3. Configure:
   - **Node.js version**: 18.x or higher
   - **Application mode**: Production
   - **Application root**: `/home/username/spanish-class/packages/backend`
   - **Application URL**: `api.yourdomain.com` (or subdomain)
   - **Application startup file**: `dist/index.js`
   - **Environment variables**: Add all from `.env` file

4. Click "Create"
5. The system will generate a startup command

**Alternative: Using PM2 (if SSH access allows)**:

```bash
# Install PM2 globally
npm install -g pm2

# Start backend with PM2
cd ~/spanish-class/packages/backend
pm2 start dist/index.js --name spanish-class-api

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

---

## Part 3: Configure Reverse Proxy (Backend API)

### Option 1: Subdomain for API (Recommended)

1. **Create subdomain in cPanel**:
   - Go to "Subdomains"
   - Create: `api.yourdomain.com`
   - Document root: `/home/username/spanish-class/packages/backend`

2. **Create .htaccess file**:
```bash
cd ~/public_html/api
nano .htaccess
```

Add:
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:3001/$1 [P,L]
```

### Option 2: API Path on Main Domain

**Create .htaccess in public_html**:
```bash
cd ~/public_html
nano .htaccess
```

Add:
```apache
# Proxy API requests to Node.js backend
RewriteEngine On

# Proxy /api requests to Node.js
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^api/(.*)$ http://localhost:3001/api/$1 [P,L]

# All other requests go to frontend (React Router)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ /index.html [L]
```

---

## Part 4: SSL Certificate Setup

1. In cPanel, go to "SSL/TLS Status"
2. Select your domain
3. Click "Run AutoSSL" (Free Let's Encrypt certificate)
4. Wait for certificate installation
5. Update `.env` files to use `https://` URLs

---

## Part 5: Post-Deployment Verification

### Check Backend API

```bash
# Test health endpoint
curl https://yourdomain.com/api/health

# Should return: {"status":"ok","timestamp":"..."}
```

### Check Frontend

1. Visit `https://yourdomain.com` in browser
2. Verify homepage loads
3. Check browser console for errors
4. Test login/registration functionality

### Check Database Connection

```bash
# In cPanel, open phpMyAdmin
# Verify tables were created: users, bookings, availability_slots, etc.
```

---

## Part 6: Monitoring and Maintenance

### View Backend Logs

**If using Node.js Selector**:
- Check logs in cPanel → Setup Node.js App → View Logs

**If using PM2**:
```bash
pm2 logs spanish-class-api
pm2 status
```

### Database Backups

- cPanel automatically creates daily backups (OPTIMUM+ includes this)
- Manual backup: cPanel → Backup → Download MySQL Database Backup

### Application Updates

```bash
# SSH into server
cd ~/spanish-class

# Pull latest changes
git pull origin main

# Rebuild
cd packages/backend
npm install
npm run build

cd ../frontend
npm install
npm run build

# Copy frontend build
cp -r dist/* ~/public_html/

# Restart backend
pm2 restart spanish-class-api
# OR restart via cPanel Node.js Selector
```

---

## Troubleshooting

### Cannot Find Module '@spanish-class/shared'

**Problem**: Application fails with `Error: Cannot find module '@spanish-class/shared'`

**Cause**: The shared package symlink was not created after npm install.

**Solutions**:
1. Run the setup script:
   ```bash
   cd ~/spanish-class-backend
   bash setup-shared-package.sh
   ```

2. Verify symlink exists:
   ```bash
   ls -la node_modules/@spanish-class/
   # Should show: shared -> ../../_shared_lib/@spanish-class/shared
   ```

3. If symlink creation fails, check:
   - `_shared_lib` directory exists and contains the shared package
   - `node_modules` is a symlink (created by cPanel NodeJS Selector)
   - You have permissions to create symlinks in `node_modules`

4. If you accidentally created a `node_modules` folder manually:
   ```bash
   rm -rf node_modules
   # Then reinstall via cPanel NodeJS Selector
   ```

### node_modules is a Directory, Not a Symlink

**Problem**: cPanel complains about `node_modules` being a folder

**Cause**: A `node_modules` folder was uploaded or created manually, conflicting with cPanel's symlink requirement.

**Solutions**:
1. **Delete the manual `node_modules` folder:**
   ```bash
   cd ~/spanish-class-backend
   rm -rf node_modules
   ```

2. **Reinstall via cPanel NodeJS Selector:**
   - cPanel → Setup Node.js App → Find your application → Run NPM Install
   - This creates `node_modules` as a symlink to the virtual environment

3. **Run the setup script:**
   ```bash
   bash setup-shared-package.sh
   ```

**Prevention**: Never upload `node_modules` from your local machine. Always use the `./build-deploy-package.sh` script which excludes `node_modules` from the deployment package.

### Database Connection Issues

**Problem**: `Can't connect to database`

**Solutions**:
1. Verify database credentials in `.env`
2. Ensure username and database name include cPanel prefix
3. Check that database user has ALL PRIVILEGES
4. Confirm host is `localhost` (not 127.0.0.1 or IP)

### Backend Not Starting

**Problem**: Node.js app won't start

**Solutions**:
1. Check Node.js version: `node --version` (should be 18+)
2. Verify all dependencies installed: `npm install`
3. Check for build errors: `npm run build`
4. Review error logs in cPanel or PM2

### Frontend Not Loading

**Problem**: Blank page or 404 errors

**Solutions**:
1. Verify files copied to `public_html`: `ls -la ~/public_html/`
2. Check `.htaccess` exists and is configured correctly
3. Verify `index.html` exists in document root
4. Check browser console for API URL errors

### CORS Errors

**Problem**: Frontend can't communicate with backend

**Solutions**:
1. Verify `FRONTEND_URL` in backend `.env` matches actual domain
2. Check CORS configuration in `packages/backend/src/index.ts`
3. Ensure API is accessible: `curl https://yourdomain.com/api/health`

### SSL Certificate Issues

**Problem**: Mixed content warnings

**Solutions**:
1. Ensure all URLs in `.env` use `https://`
2. Force HTTPS in `.htaccess`:
```apache
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

---

## Security Checklist

- [ ] Database user has strong password
- [ ] JWT_SECRET is long and random (32+ characters)
- [ ] `.env` files are not in public_html
- [ ] SSL certificate installed and active
- [ ] File permissions set correctly (`chmod 644` for files, `755` for directories)
- [ ] RESEND_API_KEY kept secure (if using email)
- [ ] Google Calendar credentials secured (if using)
- [ ] Database backups enabled
- [ ] Error messages don't expose sensitive information

---

## Performance Optimization

1. **Enable LiteSpeed Cache**:
   - cPanel → LiteSpeed Web Cache Manager
   - Enable cache for static assets

2. **Optimize Frontend Build**:
   - Vite automatically optimizes production builds
   - Assets are minified and code-split

3. **Database Indexing**:
   - Prisma schema already includes necessary indexes
   - Monitor slow queries in phpMyAdmin

4. **CDN (Optional)**:
   - Use Cloudflare (free tier) for additional caching
   - Point domain DNS to Cloudflare

---

## Support Resources

- **unlimited.rs Support**: https://unlimited.rs/en/
- **cPanel Documentation**: https://docs.cpanel.net/
- **Node.js in cPanel**: Check cPanel's "Setup Node.js App" documentation
- **Prisma MySQL**: https://www.prisma.io/docs/concepts/database-connectors/mysql

---

## Quick Reference: Common Commands

```bash
# Restart backend (PM2)
pm2 restart spanish-class-api

# View logs (PM2)
pm2 logs spanish-class-api

# Rebuild and redeploy frontend
cd ~/spanish-class/packages/frontend
npm run build
cp -r dist/* ~/public_html/

# Database operations
cd ~/spanish-class/packages/backend
npm run db:generate  # Regenerate Prisma client
npm run db:push      # Update database schema
npm run db:seed      # Seed initial data

# Check disk space
df -h

# Check memory usage
free -m
```

---

## Contact & Next Steps

After completing this deployment:

1. Test all functionality thoroughly
2. Create your first admin user
3. Configure email settings (Resend API)
4. Set up Google Calendar integration (optional)
5. Monitor application logs for first 24-48 hours
6. Create regular backup schedule

For any issues, check the Troubleshooting section above or review application logs.
