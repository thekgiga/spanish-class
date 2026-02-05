# Quick Start: Deploy to unlimited.rs in 30 Minutes

This is a condensed deployment checklist. For detailed instructions, see `DEPLOYMENT_GUIDE.md`.

## Prerequisites

- [ ] cPanel access at https://panel.unlimited.rs
- [ ] Domain configured and pointing to hosting
- [ ] SSH access enabled

## 1. Database Setup (5 minutes)

**In cPanel → MySQL Databases:**

1. **Create Database**:
   - Database name: `spanish_class`
   - **Note the full name** (e.g., `myuser_spanish_class`)

2. **Create User**:
   - Username: `spanish_app`
   - Generate strong password
   - **Save password securely!**
   - **Note the full username** (e.g., `myuser_spanish_app`)

3. **Assign User**:
   - Add user to database
   - Grant ALL PRIVILEGES

4. **Build Connection String**:
   ```
   mysql://[FULL_USERNAME]:[PASSWORD]@localhost:3306/[FULL_DATABASE]
   ```
   Example:
   ```
   mysql://myuser_spanish_app:SecurePass123@localhost:3306/myuser_spanish_class
   ```

## 2. Upload Code (5 minutes)

**Option A: Via Git (Recommended)**
```bash
ssh username@yourdomain.com
cd ~
mkdir spanish-class
cd spanish-class
git clone https://github.com/thekgiga/spanish-class.git .
```

**Option B: Via File Manager**
1. Compress project to .zip locally
2. Upload via cPanel File Manager
3. Extract on server

## 3. Configure Environment (5 minutes)

```bash
cd ~/spanish-class/packages/backend
cp .env.production .env
nano .env
```

**Edit these values:**
```env
DATABASE_URL="mysql://YOUR_FULL_USERNAME:YOUR_PASSWORD@localhost:3306/YOUR_FULL_DATABASE"
JWT_SECRET="GENERATE_THIS_USING_openssl_rand_-base64_32"
FRONTEND_URL="https://yourdomain.com"
API_URL="https://yourdomain.com/api"
```

**Generate JWT Secret:**
```bash
openssl rand -base64 32
```

**Configure Frontend:**
```bash
cd ~/spanish-class/packages/frontend
cp .env.production .env.production
nano .env.production
```

Update:
```env
VITE_API_URL=https://yourdomain.com/api
```

## 4. Install & Build (10 minutes)

```bash
cd ~/spanish-class

# 


# Install dependencies
npm install

# Setup database
cd packages/backend
npm run db:generate
npm run db:push

# Build backend
npm run build

# Build frontend
cd ../frontend
npm run build
```

## 5. Deploy Frontend (2 minutes)

```bash
cd ~/spanish-class
cp -r packages/frontend/dist/* ~/public_html/
```

**Create .htaccess:**
```bash
nano ~/public_html/.htaccess
```

Paste:
```apache
RewriteEngine On

# Proxy API requests
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^api/(.*)$ http://localhost:3001/api/$1 [P,L]

# Frontend routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ /index.html [L]
```

## 6. Start Backend (3 minutes)

**In cPanel → Setup Node.js App:**

1. Click "Create Application"
2. Configure:
   - **Node.js version**: 18.x or higher
   - **Application mode**: Production
   - **Application root**: `/home/username/spanish-class/packages/backend`
   - **Application startup file**: `dist/index.js`
   - **Environment variables**: Copy from `.env` file

3. Click "Create" then "Start"

## 7. Install SSL Certificate (2 minutes)

1. cPanel → SSL/TLS Status
2. Select your domain
3. Click "Run AutoSSL"
4. Wait for completion

**Update .htaccess to force HTTPS:**
```bash
nano ~/public_html/.htaccess
```

Add at the top:
```apache
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

## 8. Verify Deployment (3 minutes)

**Test backend:**
```bash
curl https://yourdomain.com/api/health
```

Should return: `{"status":"ok","timestamp":"..."}`

**Test frontend:**
1. Visit https://yourdomain.com
2. Check browser console for errors
3. Try registering a new user
4. Try logging in

## Common Issues

### Backend won't start
- Check Node.js version is 18+
- Verify `.env` file has correct values
- Check cPanel error logs

### Database connection fails
- Verify connection string includes cPanel username prefix
- Check user has ALL PRIVILEGES
- Confirm host is `localhost`
- See `DATABASE_SETUP.md` for detailed troubleshooting

### CORS errors
- Verify `FRONTEND_URL` in backend `.env` matches your domain
- Ensure both use `https://` (after SSL installation)

### 404 errors on frontend routes
- Check `.htaccess` exists in `public_html`
- Verify RewriteEngine is enabled

## Post-Deployment Tasks

- [ ] Create admin user account
- [ ] Test booking functionality
- [ ] Configure email (Resend API) - optional
- [ ] Set up Google Calendar - optional
- [ ] Monitor logs for 24 hours
- [ ] Create first availability slots

## Maintenance Commands

**Update application:**
```bash
cd ~/spanish-class
git pull
npm install
cd packages/backend && npm run build
cd ../frontend && npm run build
cp -r dist/* ~/public_html/
# Restart backend via cPanel Node.js Selector
```

**View logs:**
- cPanel → Setup Node.js App → View Logs

**Backup database:**
- cPanel → Backup → Download MySQL Database

## Need Help?

1. **Detailed guides:**
   - `DEPLOYMENT_GUIDE.md` - Complete deployment instructions
   - `DATABASE_SETUP.md` - Database configuration help

2. **Support:**
   - unlimited.rs support: https://unlimited.rs/en/
   - Application logs in cPanel

## Success Checklist

- [ ] Database created and user configured
- [ ] Connection string working (no database errors)
- [ ] Backend built successfully
- [ ] Frontend built successfully
- [ ] Frontend deployed to public_html
- [ ] .htaccess configured
- [ ] Backend running via Node.js Selector
- [ ] SSL certificate installed
- [ ] Health check returns success
- [ ] Frontend loads in browser
- [ ] Can register and login
- [ ] No errors in browser console

**If all checked: Congratulations! Your Spanish Class Platform is live! 🎉**
