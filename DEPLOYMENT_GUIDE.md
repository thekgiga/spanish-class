# Deployment Guide for unlimited.rs OPTIMUM+ Hosting

This guide will help you deploy the Spanish Class Platform on your unlimited.rs cPanel hosting.

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

### Option A: Deployment via SSH (Recommended)

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

# Install pnpm if not available
npm install -g pnpm

# Install all dependencies
pnpm install
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
pnpm db:generate

# Push database schema to MySQL
pnpm db:push

# Optional: Seed initial data
pnpm db:seed
```

#### Step 8: Build Application

```bash
# Build backend
cd ~/spanish-class/packages/backend
pnpm build

# Build frontend
cd ~/spanish-class/packages/frontend
pnpm build
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
pnpm build
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
pnpm install
pnpm build

cd ../frontend
pnpm install
pnpm build

# Copy frontend build
cp -r dist/* ~/public_html/

# Restart backend
pm2 restart spanish-class-api
# OR restart via cPanel Node.js Selector
```

---

## Troubleshooting

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
2. Verify all dependencies installed: `pnpm install`
3. Check for build errors: `pnpm build`
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
pnpm build
cp -r dist/* ~/public_html/

# Database operations
cd ~/spanish-class/packages/backend
pnpm db:generate  # Regenerate Prisma client
pnpm db:push      # Update database schema
pnpm db:seed      # Seed initial data

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
