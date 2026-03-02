# Local Environment Setup Guide

Complete guide to set up the Spanish Class Platform on your local development machine.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Application Setup](#application-setup)
4. [Running the Application](#running-the-application)
5. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

Install the following on your local machine:

1. **Node.js 18+** (includes npm 8+)
   - Download: https://nodejs.org/
   - Verify: `node --version` (should be 18.x or higher)
   - Verify: `npm --version` (should be 8.x or higher)

2. **Git**
   - Download: https://git-scm.com/
   - Verify: `git --version`

3. **MySQL 8.0+** (Choose one option):

   **Option A: Docker (Recommended)**
   - Download: https://www.docker.com/products/docker-desktop
   - Easiest to set up and tear down

   **Option B: MySQL Community Server**
   - Download: https://dev.mysql.com/downloads/mysql/
   - Direct installation on your machine

   **Option C: XAMPP/MAMP**
   - XAMPP (Windows/Linux): https://www.apachefriends.org/
   - MAMP (macOS): https://www.mamp.info/
   - Includes MySQL, phpMyAdmin, and Apache

4. **Code Editor** (Recommended):
   - VS Code: https://code.visualstudio.com/
   - With extensions: Prisma, ESLint, Prettier

---

## Database Setup

### Option A: Docker MySQL (Recommended)

**1. Start MySQL Container**

```bash
# Create and start MySQL container
docker run --name spanish-mysql \
  -e MYSQL_ROOT_PASSWORD=rootpass \
  -e MYSQL_DATABASE=spanish_class_local \
  -e MYSQL_USER=spanish_local \
  -e MYSQL_PASSWORD=localpass \
  -p 3306:3306 \
  -d mysql:8.0

# Verify container is running
docker ps
```

**2. Test Connection**

```bash
# Connect to MySQL
docker exec -it spanish-mysql mysql -u spanish_local -plocalpass spanish_class_local

# In MySQL prompt:
SHOW DATABASES;
EXIT;
```

**3. Docker Commands Reference**

```bash
# Start existing container
docker start spanish-mysql

# Stop container
docker stop spanish-mysql

# View logs
docker logs spanish-mysql

# Remove container (WARNING: Deletes all data)
docker rm -f spanish-mysql
```

### Option B: Local MySQL Installation

**1. Install MySQL**

Download and install MySQL Community Server from https://dev.mysql.com/downloads/mysql/

**2. Create Database and User**

```bash
# Connect as root
mysql -u root -p

# In MySQL prompt, run:
CREATE DATABASE spanish_class_local;
CREATE USER 'spanish_local'@'localhost' IDENTIFIED BY 'localpass';
GRANT ALL PRIVILEGES ON spanish_class_local.* TO 'spanish_local'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

**3. Test Connection**

```bash
mysql -u spanish_local -plocalpass spanish_class_local
```

### Option C: XAMPP/MAMP

**1. Start XAMPP/MAMP**

- Open XAMPP/MAMP Control Panel
- Start MySQL service
- Click "Start" on Apache and MySQL

**2. Create Database via phpMyAdmin**

- Open phpMyAdmin: http://localhost/phpmyadmin (XAMPP) or via MAMP interface
- Click "New" to create database
- Database name: `spanish_class_local`
- Click "Create"

**3. Create User**

In phpMyAdmin SQL tab:
```sql
CREATE USER 'spanish_local'@'localhost' IDENTIFIED BY 'localpass';
GRANT ALL PRIVILEGES ON spanish_class_local.* TO 'spanish_local'@'localhost';
FLUSH PRIVILEGES;
```

---

## Application Setup

### 1. Clone Repository

```bash
# Clone the repository
git clone https://github.com/thekgiga/spanish-class.git
cd spanish-class
```

### 2. Install Dependencies

```bash
# Install all workspace dependencies
npm install
```

This will install dependencies for:
- Root workspace
- Backend package
- Frontend package
- Shared package

### 3. Configure Backend Environment

```bash
# Navigate to backend
cd packages/backend

# Copy local environment template
cp .env.local .env

# Open .env in your editor
nano .env  # or: code .env, vim .env, etc.
```

**Edit the `.env` file:**

```env
# Update this line based on your MySQL setup:

# If using Docker (default):
DATABASE_URL="mysql://spanish_local:localpass@localhost:3306/spanish_class_local"

# If using local MySQL with different credentials:
# DATABASE_URL="mysql://YOUR_USER:YOUR_PASSWORD@localhost:3306/spanish_class_local"

# If using XAMPP/MAMP with no password:
# DATABASE_URL="mysql://root:@localhost:3306/spanish_class_local"

# Keep these as-is for local development:
JWT_SECRET="local-development-secret-not-secure"
FRONTEND_URL="http://localhost:5173"
API_URL="http://localhost:3001"
NODE_ENV="development"
PORT=3001
```

**Save the file.**

### 4. Configure Frontend Environment

```bash
# Navigate to frontend
cd ../frontend

# Copy local environment template
cp .env.local .env.local

# No editing needed - defaults are correct
# Frontend will use: VITE_API_URL=http://localhost:3001
```

### 5. Initialize Database

```bash
# Navigate to backend
cd ../backend

# Generate Prisma Client
npm run db:generate

# Push database schema to MySQL
npm run db:push

# You should see:
# ✓ Your database is now in sync with your schema
```

**Verify in MySQL:**

```bash
# Docker:
docker exec -it spanish-mysql mysql -u spanish_local -plocalpass spanish_class_local -e "SHOW TABLES;"

# Local MySQL:
mysql -u spanish_local -plocalpass spanish_class_local -e "SHOW TABLES;"
```

You should see tables: `users`, `availability_slots`, `bookings`, etc.

### 6. Seed Database (Optional)

```bash
# Still in packages/backend
npm run db:seed
```

This creates sample data for testing:
- Admin user
- Test students
- Sample availability slots
- Test bookings

---

## Running the Application

### Method 1: Separate Terminals (Recommended for Development)

**Terminal 1 - Backend:**
```bash
cd packages/backend
npm run dev

# You should see:
# Server running on port 3001
# Environment: development
```

**Terminal 2 - Frontend:**
```bash
cd packages/frontend
npm run dev

# You should see:
# VITE ready in XXX ms
# ➜ Local: http://localhost:5173/
```

**Access the application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- API Health: http://localhost:3001/health

### Method 2: Root Command (Runs Both)

```bash
# From project root
npm run dev

# This runs both frontend and backend using Turbo
```

### Method 3: Individual Services

```bash
# Backend only
npm -w backend dev

# Frontend only
npm -w frontend dev
```

---

## Development Workflow

### Hot Reload

Both frontend and backend support hot reload:

- **Backend**: Edit files in `packages/backend/src/` → Server restarts automatically
- **Frontend**: Edit files in `packages/frontend/src/` → Browser updates automatically

### Database Changes

When you modify `packages/backend/prisma/schema.prisma`:

```bash
cd packages/backend

# Regenerate Prisma Client
npm run db:generate

# Update database schema
npm run db:push

# If you need to reset database (WARNING: Deletes all data)
npm run db:push --force-reset
```

### Running Prisma Studio (Database GUI)

```bash
cd packages/backend
npm run db:studio

# Opens at: http://localhost:5555
# Browse and edit database visually
```

### Type Checking

```bash
# Check types without building
npm run typecheck

# Or specific package
cd packages/backend
npm run typecheck
```

### Building for Testing

```bash
# Build everything
npm run build

# Build specific package
npm -w backend build
npm -w frontend build
```

---

## Testing Your Setup

### 1. Backend Health Check

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{"status":"ok","timestamp":"2026-02-04T..."}
```

### 2. Frontend Access

Open browser: http://localhost:5173

You should see the Spanish Class Platform homepage.

### 3. Registration Test

1. Navigate to Register page
2. Fill in details:
   - Email: test@example.com
   - Password: Test123!
   - First Name: Test
   - Last Name: User
3. Click Register
4. Check backend terminal for logs
5. Check database in Prisma Studio or MySQL

### 4. Login Test

1. Navigate to Login page
2. Use credentials from registration
3. Should successfully login and redirect to dashboard

### 5. Database Test

```bash
# Using Prisma Studio
cd packages/backend
npm run db:studio

# Or using MySQL CLI
mysql -u spanish_local -plocalpass spanish_class_local

# In MySQL:
SELECT * FROM users;
```

---

## Troubleshooting

### Backend Won't Start

**Problem**: `Error: P1001: Can't reach database server`

**Solutions**:

1. **Check MySQL is running**:
   ```bash
   # Docker:
   docker ps | grep spanish-mysql

   # Local MySQL:
   sudo systemctl status mysql  # Linux
   brew services list           # macOS with Homebrew

   # XAMPP/MAMP:
   # Check control panel
   ```

2. **Verify connection string**:
   ```bash
   cd packages/backend
   cat .env | grep DATABASE_URL
   ```

3. **Test MySQL connection**:
   ```bash
   # Docker:
   docker exec -it spanish-mysql mysql -u spanish_local -plocalpass

   # Local:
   mysql -u spanish_local -plocalpass
   ```

4. **Check MySQL port**:
   ```bash
   # Verify MySQL is on port 3306
   netstat -an | grep 3306
   # or
   lsof -i :3306
   ```

### Port Already in Use

**Problem**: `Error: listen EADDRINUSE: address already in use :::3001`

**Solutions**:

1. **Find and kill process**:
   ```bash
   # macOS/Linux:
   lsof -ti:3001 | xargs kill -9

   # Windows:
   netstat -ano | findstr :3001
   taskkill /PID [PID_NUMBER] /F
   ```

2. **Use different port**:
   ```bash
   # Edit packages/backend/.env
   PORT=3002

   # Update frontend .env.local
   VITE_API_URL=http://localhost:3002
   ```

### Prisma Client Errors

**Problem**: `@prisma/client did not initialize yet`

**Solution**:
```bash
cd packages/backend
npm run db:generate
```

### Frontend Can't Connect to Backend

**Problem**: Network errors, CORS errors

**Solutions**:

1. **Verify backend is running**:
   ```bash
   curl http://localhost:3001/health
   ```

2. **Check frontend API URL**:
   ```bash
   cd packages/frontend
   cat .env.local
   # Should be: VITE_API_URL=http://localhost:3001
   ```

3. **Check CORS configuration**:
   - Backend `src/index.ts` should allow `http://localhost:5173`

4. **Restart both services**

### Database Schema Sync Issues

**Problem**: `Invalid column` or `Table doesn't exist`

**Solution**:
```bash
cd packages/backend

# Force reset database (WARNING: Deletes all data)
npm run db:push --force-reset

# Re-seed
npm run db:seed
```

### Module Not Found Errors

**Problem**: `Cannot find module '@spanish-class/shared'`

**Solution**:
```bash
# Clean and reinstall
npm run clean
rm -rf node_modules package-lock.json
npm install
```

---

## Environment Variables Reference

### Backend (.env)

```env
DATABASE_URL="mysql://spanish_local:localpass@localhost:3306/spanish_class_local"
JWT_SECRET="local-development-secret-not-secure"
JWT_EXPIRES_IN="7d"
FRONTEND_URL="http://localhost:5173"
API_URL="http://localhost:3001"
NODE_ENV="development"
PORT=3001
```

### Frontend (.env.local)

```env
VITE_API_URL=http://localhost:3001
VITE_DEBUG=true
```

---

## Next Steps

After completing local setup:

1. ✅ **Explore the application**
   - Test registration and login
   - Browse as student and professor
   - Create availability slots
   - Make bookings

2. ✅ **Read the codebase**
   - Backend: `packages/backend/src/`
   - Frontend: `packages/frontend/src/`
   - Shared types: `packages/shared/`

3. ✅ **Make your first change**
   - Create a feature branch
   - Make changes
   - Test locally
   - Commit and push

4. ✅ **Set up Dev environment**
   - Read [DEV_DEPLOYMENT.md](./DEV_DEPLOYMENT.md)
   - Deploy to dev environment on unlimited.rs
   - Test integration

5. ✅ **Plan production deployment**
   - Read [PROD_DEPLOYMENT.md](./PROD_DEPLOYMENT.md)
   - Prepare production configuration
   - Deploy to production

---

## Useful Commands

```bash
# Start development
npm run dev

# Type checking
npm run typecheck

# Build everything
npm run build

# Clean builds
npm run clean

# Database operations
cd packages/backend
npm run db:generate      # Generate Prisma Client
npm run db:push          # Sync schema to database
npm run db:seed          # Seed database
npm run db:studio        # Open Prisma Studio GUI

# Git workflow
git checkout -b feature/my-feature
git add .
git commit -m "feat: my feature"
git push origin feature/my-feature
```

---

## Getting Help

- **Application errors**: Check backend terminal output
- **Database issues**: Use Prisma Studio or MySQL CLI
- **Prisma documentation**: https://www.prisma.io/docs
- **React documentation**: https://react.dev
- **Express documentation**: https://expressjs.com

---

**Congratulations!** Your local environment is ready for development. 🎉

Next: Read [DEV_DEPLOYMENT.md](./DEV_DEPLOYMENT.md) to deploy to staging environment.
