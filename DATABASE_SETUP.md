# Database Setup Guide for unlimited.rs cPanel

This guide explains how to set up and configure MySQL database on unlimited.rs hosting and resolve the "no connection string" concern.

## Understanding cPanel MySQL Database Connections

Unlike cloud platforms that provide ready-made connection strings, cPanel requires you to **manually create and assemble** the database connection string from several pieces:

1. **Database Name** (created in cPanel)
2. **Database User** (created in cPanel)
3. **User Password** (set in cPanel)
4. **Database Host** (always `localhost` on shared hosting)
5. **Port** (default MySQL port: `3306`)

## Step-by-Step Database Configuration

### Step 1: Access cPanel MySQL Databases

1. Login to cPanel at https://panel.unlimited.rs
2. Find and click **"MySQL Databases"** (usually in the "Databases" section)

### Step 2: Create Database

1. In the **"Create New Database"** section:
   - **New Database**: Enter `spanish_class` (or any name you prefer)
   - Click **"Create Database"**

2. **IMPORTANT**: cPanel will add your username as a prefix
   - If your cPanel username is `myuser`
   - The actual database name becomes: `myuser_spanish_class`
   - **Write down the FULL database name!**

Example:
```
You entered: spanish_class
Actual database name: myuser_spanish_class  ← USE THIS IN CONNECTION STRING
```

### Step 3: Create Database User

1. Scroll to **"MySQL Users"** section
2. In **"Add New User"**:
   - **Username**: Enter `spanish_app` (or any name)
   - **Password**: Click "Generate Password" or create a strong password
   - **IMPORTANT**: Copy and save this password securely!
   - Click **"Create User"**

3. **IMPORTANT**: Note the full username (with prefix)
   - If your cPanel username is `myuser`
   - The actual username becomes: `myuser_spanish_app`
   - **Write down the FULL username!**

Example:
```
You entered: spanish_app
Actual username: myuser_spanish_app  ← USE THIS IN CONNECTION STRING
Password: aB3$xYz9!qW2  ← SAVE THIS SECURELY!
```

### Step 4: Assign User to Database

1. Scroll to **"Add User To Database"** section
2. Select:
   - **User**: `myuser_spanish_app` (your full username)
   - **Database**: `myuser_spanish_class` (your full database name)
3. Click **"Add"**

4. On the **"Manage User Privileges"** page:
   - Check **"ALL PRIVILEGES"** (or click "Check All" button)
   - Scroll down and click **"Make Changes"**

### Step 5: Build Your Connection String

Now you have all the pieces! Build your connection string:

**Format:**
```
mysql://[USERNAME]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]
```

**Your values:**
- **USERNAME**: `myuser_spanish_app` (from Step 3)
- **PASSWORD**: `aB3$xYz9!qW2` (from Step 3)
- **HOST**: `localhost` (always this on cPanel shared hosting)
- **PORT**: `3306` (default MySQL port)
- **DATABASE**: `myuser_spanish_class` (from Step 2)

**Example connection string:**
```
mysql://myuser_spanish_app:aB3$xYz9!qW2@localhost:3306/myuser_spanish_class
```

### Step 6: Add Connection String to .env File

1. On your server (via SSH or File Manager), edit `packages/backend/.env`
2. Replace the `DATABASE_URL` line with your connection string:

```env
DATABASE_URL="mysql://myuser_spanish_app:aB3$xYz9!qW2@localhost:3306/myuser_spanish_class"
```

3. Save the file

## Common Issues and Solutions

### Issue 1: "Can't connect to database"

**Symptoms:**
- Backend fails to start
- Error: `Error: P1001: Can't reach database server`

**Solutions:**
1. **Verify the database exists**:
   - Go to cPanel → MySQL Databases
   - Check that your database is listed

2. **Verify the user has privileges**:
   - In cPanel → MySQL Databases
   - Scroll to "Current Databases"
   - Verify your user is listed under "Privileged Users"

3. **Double-check the connection string**:
   - Username includes cPanel prefix: `myuser_spanish_app` not `spanish_app`
   - Database includes cPanel prefix: `myuser_spanish_class` not `spanish_class`
   - Host is `localhost` (not `127.0.0.1` or an IP address)
   - Password has no extra spaces or characters

4. **Check for special characters in password**:
   - If password contains special characters like `@`, `$`, `#`, etc.
   - You may need to URL-encode them:
     - `@` becomes `%40`
     - `$` becomes `%24`
     - `#` becomes `%23`
     - `&` becomes `%26`

   Example with special characters:
   ```
   Password: my$ecret@pass
   Encoded: my%24ecret%40pass
   Connection string: mysql://user:my%24ecret%40pass@localhost:3306/dbname
   ```

### Issue 2: "Access denied for user"

**Symptoms:**
- Error: `Access denied for user 'spanish_app'@'localhost'`

**Solutions:**
1. **Check username format**:
   - Make sure you're using the FULL username with prefix
   - Wrong: `spanish_app`
   - Correct: `myuser_spanish_app`

2. **Verify password**:
   - Re-enter the password in cPanel
   - MySQL Databases → Current Users → Change Password

3. **Re-assign privileges**:
   - MySQL Databases → Add User To Database
   - Select your user and database again
   - Grant ALL PRIVILEGES

### Issue 3: "Unknown database"

**Symptoms:**
- Error: `Unknown database 'spanish_class'`

**Solutions:**
1. **Use full database name**:
   - Wrong: `spanish_class`
   - Correct: `myuser_spanish_class`

2. **Verify database exists**:
   - cPanel → MySQL Databases → Current Databases
   - Check the exact name shown

### Issue 4: Connection string in wrong format

**Symptoms:**
- Prisma errors about invalid DATABASE_URL

**Common mistakes:**
```
❌ Wrong: DATABASE_URL=mysql://user:pass@localhost/dbname
✅ Correct: DATABASE_URL="mysql://user:pass@localhost:3306/dbname"

❌ Wrong: mysql://localhost/mydb (missing user and password)
✅ Correct: mysql://user:pass@localhost:3306/mydb

❌ Wrong: DATABASE_URL='mysql://...' (single quotes)
✅ Correct: DATABASE_URL="mysql://..." (double quotes)
```

## Verifying Database Connection

### Method 1: Via cPanel phpMyAdmin

1. cPanel → phpMyAdmin
2. Select your database from the left sidebar
3. You should see it open without errors

### Method 2: Via Prisma CLI

```bash
cd ~/spanish-class/packages/backend

# Generate Prisma client
pnpm db:generate

# Test connection by pushing schema
pnpm db:push
```

If successful, you'll see:
```
✓ Prisma schema loaded from prisma/schema.prisma
✓ Datasource "db": MySQL database "myuser_spanish_class" at "localhost:3306"
✓ Your database is now in sync with your schema
```

### Method 3: Via Application Health Check

After starting your backend:
```bash
curl http://localhost:3001/health
```

Should return:
```json
{"status":"ok","timestamp":"2026-02-04T..."}
```

## Database Management

### Viewing Database Contents

**Via phpMyAdmin:**
1. cPanel → phpMyAdmin
2. Select your database
3. Browse tables (users, bookings, availability_slots, etc.)

**Via Prisma Studio (Development):**
```bash
cd ~/spanish-class/packages/backend
pnpm db:studio
```

### Backing Up Database

**Via cPanel:**
1. cPanel → Backup
2. Under "Download a MySQL Database Backup"
3. Click your database name to download

**Via Command Line:**
```bash
mysqldump -u myuser_spanish_app -p myuser_spanish_class > backup.sql
```

### Restoring Database

**Via phpMyAdmin:**
1. Select database
2. Click "Import" tab
3. Choose your backup .sql file
4. Click "Go"

**Via Command Line:**
```bash
mysql -u myuser_spanish_app -p myuser_spanish_class < backup.sql
```

## Quick Reference

### Connection String Template

```env
DATABASE_URL="mysql://[CPANEL_USER]_[DB_USER]:[PASSWORD]@localhost:3306/[CPANEL_USER]_[DB_NAME]"
```

### Example with Real Values

If your cPanel username is `spanish`:
```env
# Database created: spanish_class
# User created: app_user
# Password: MySecurePass123

# Full connection string:
DATABASE_URL="mysql://spanish_app_user:MySecurePass123@localhost:3306/spanish_spanish_class"
```

### Checklist

Before using the connection string, verify:
- [ ] Database exists in cPanel MySQL Databases
- [ ] User exists in cPanel MySQL Databases
- [ ] User has ALL PRIVILEGES on the database
- [ ] Connection string includes cPanel username prefix for both user and database
- [ ] Connection string uses `localhost` as host
- [ ] Connection string includes port `3306`
- [ ] Password is correct and properly encoded if it has special characters
- [ ] Connection string is wrapped in double quotes in .env file

## Security Best Practices

1. **Strong Passwords**:
   - Use cPanel's password generator
   - Minimum 16 characters
   - Mix of uppercase, lowercase, numbers, symbols

2. **File Permissions**:
   ```bash
   chmod 600 ~/spanish-class/packages/backend/.env
   ```

3. **Never Commit .env**:
   - Ensure `.env` is in `.gitignore`
   - Never push to GitHub

4. **Regular Backups**:
   - cPanel provides automatic daily backups
   - Create manual backups before major changes

5. **Monitoring**:
   - Check database size regularly (cPanel → MySQL Databases)
   - OPTIMUM+ allows 100 databases, unlimited size

## Support

If you continue to have database connection issues:

1. Check cPanel error logs: cPanel → Errors
2. Check application logs: `pm2 logs` or cPanel Node.js logs
3. Contact unlimited.rs support: https://unlimited.rs/en/
4. Include error messages and what you've already tried

## Additional Resources

- [Prisma MySQL Documentation](https://www.prisma.io/docs/concepts/database-connectors/mysql)
- [cPanel MySQL Database Documentation](https://docs.cpanel.net/cpanel/databases/mysql-databases/)
- [MySQL Connection String Format](https://dev.mysql.com/doc/refman/8.0/en/connecting-using-uri-or-key-value-pairs.html)

---

**Remember**: The key to solving the "no connection string" issue is understanding that on cPanel, you build the connection string yourself from the database name, username, password, and host information that cPanel provides.
