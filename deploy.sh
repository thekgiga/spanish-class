#!/bin/bash

# ===========================================
# Spanish Class Platform - Deployment Script
# For unlimited.rs cPanel Hosting
# ===========================================
#
# This script automates the deployment process for the Spanish Class Platform.
# Run this script on your cPanel server via SSH.
#
# Prerequisites:
# 1. SSH access to your server
# 2. Git installed
# 3. Node.js 18+ with npm 8+ installed
# 4. Database created and configured in .env
#
# Usage:
#   chmod +x deploy.sh
#   ./deploy.sh
#

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_step() {
    echo -e "\n${BLUE}==>${NC} ${GREEN}$1${NC}\n"
}

print_error() {
    echo -e "${RED}ERROR: $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}WARNING: $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# ===========================================
# Pre-flight Checks
# ===========================================

print_step "Running pre-flight checks..."

# Check Node.js
if ! command_exists node; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version must be 18 or higher. Current version: $(node -v)"
    exit 1
fi
print_success "Node.js $(node -v) detected"

# Check npm version
NPM_VERSION=$(npm -v | cut -d'.' -f1)
if [ "$NPM_VERSION" -lt 8 ]; then
    print_error "npm version must be 8 or higher. Current version: $(npm -v)"
    exit 1
fi
print_success "npm $(npm -v) detected"

# Check if .env exists
if [ ! -f "packages/backend/.env" ]; then
    print_error ".env file not found in packages/backend/"
    echo "Please create packages/backend/.env with your production configuration."
    echo "You can use packages/backend/.env.production as a template."
    exit 1
fi
print_success "Backend .env file found"

# ===========================================
# Install Dependencies
# ===========================================

print_step "Installing dependencies..."
npm install
print_success "Dependencies installed"

# ===========================================
# Database Setup
# ===========================================

print_step "Setting up database..."

cd packages/backend

# Generate Prisma Client
print_step "Generating Prisma Client..."
npm run db:generate
print_success "Prisma Client generated"

# Push schema to database
print_step "Pushing database schema..."
npm run db:push
print_success "Database schema updated"

# Ask about seeding
read -p "Do you want to seed the database with initial data? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_step "Seeding database..."
    npm run db:seed
    print_success "Database seeded"
else
    print_warning "Skipping database seed"
fi

cd ../..

# ===========================================
# Build Backend
# ===========================================

print_step "Building backend..."
cd packages/backend
npm run build

if [ ! -f "dist/index.js" ]; then
    print_error "Backend build failed - dist/index.js not found"
    exit 1
fi
print_success "Backend built successfully"
cd ../..

# ===========================================
# Build Frontend
# ===========================================

print_step "Building frontend..."
cd packages/frontend

# Check for frontend .env.production
if [ ! -f ".env.production" ]; then
    print_warning "Frontend .env.production not found. Using default API URL."
else
    print_success "Frontend .env.production found"
fi

npm run build

if [ ! -d "dist" ]; then
    print_error "Frontend build failed - dist directory not found"
    exit 1
fi
print_success "Frontend built successfully"
cd ../..

# ===========================================
# Deploy Frontend
# ===========================================

print_step "Deploying frontend to public_html..."

# Determine public_html path
PUBLIC_HTML="$HOME/public_html"

if [ ! -d "$PUBLIC_HTML" ]; then
    print_error "public_html directory not found at $PUBLIC_HTML"
    echo "Please specify the correct path to your public_html directory."
    exit 1
fi

# Backup existing files
if [ -d "$PUBLIC_HTML" ] && [ "$(ls -A $PUBLIC_HTML)" ]; then
    BACKUP_DIR="$HOME/public_html_backup_$(date +%Y%m%d_%H%M%S)"
    print_step "Backing up existing files to $BACKUP_DIR..."
    mkdir -p "$BACKUP_DIR"
    cp -r "$PUBLIC_HTML"/* "$BACKUP_DIR/" 2>/dev/null || true
    print_success "Backup created"
fi

# Copy frontend files
print_step "Copying frontend files..."
cp -r packages/frontend/dist/* "$PUBLIC_HTML/"
print_success "Frontend deployed to $PUBLIC_HTML"

# ===========================================
# Create/Update .htaccess
# ===========================================

print_step "Creating .htaccess for routing..."

cat > "$PUBLIC_HTML/.htaccess" << 'EOF'
# Spanish Class Platform - Production Configuration

# Enable RewriteEngine
RewriteEngine On

# Force HTTPS (uncomment after SSL is installed)
# RewriteCond %{HTTPS} off
# RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Proxy API requests to Node.js backend
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^api/(.*)$ http://localhost:3001/api/$1 [P,L]

# Frontend routing - Send all non-file/non-directory requests to index.html
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ /index.html [L]

# Security headers
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
    Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Browser caching
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType application/pdf "access plus 1 month"
    ExpiresByType text/x-javascript "access plus 1 month"
    ExpiresByType image/x-icon "access plus 1 year"
</IfModule>
EOF

print_success ".htaccess created"

# ===========================================
# Backend Deployment Instructions
# ===========================================

print_step "Backend Deployment Instructions:"
echo ""
echo "The backend has been built successfully. You now need to start it using one of these methods:"
echo ""
echo "METHOD 1: cPanel Node.js Selector (Recommended for unlimited.rs)"
echo "  1. Login to cPanel at https://panel.unlimited.rs"
echo "  2. Go to 'Setup Node.js App'"
echo "  3. Click 'Create Application'"
echo "  4. Configure:"
echo "     - Node.js version: 18.x or higher"
echo "     - Application mode: Production"
echo "     - Application root: $HOME/spanish-class/packages/backend"
echo "     - Application startup file: dist/index.js"
echo "     - Application URL: (your domain or subdomain)"
echo "  5. Add environment variables from packages/backend/.env"
echo "  6. Click 'Create' and then 'Start'"
echo ""
echo "METHOD 2: PM2 Process Manager (If you have SSH access)"
echo "  Run: cd $HOME/spanish-class/packages/backend"
echo "  Run: pm2 start dist/index.js --name spanish-class-api"
echo "  Run: pm2 save"
echo "  Run: pm2 startup"
echo ""

# ===========================================
# Post-Deployment Checklist
# ===========================================

print_step "Post-Deployment Checklist:"
echo ""
echo "[ ] Start the backend application (see instructions above)"
echo "[ ] Install SSL certificate via cPanel (SSL/TLS Status → AutoSSL)"
echo "[ ] Update .htaccess to force HTTPS (uncomment the lines)"
echo "[ ] Test API health: curl https://yourdomain.com/api/health"
echo "[ ] Test frontend: Visit https://yourdomain.com"
echo "[ ] Create first admin user"
echo "[ ] Verify email functionality (if configured)"
echo "[ ] Test booking system"
echo "[ ] Set up monitoring/alerts"
echo ""

# ===========================================
# Summary
# ===========================================

print_success "Deployment completed successfully!"
echo ""
echo -e "${GREEN}Next steps:${NC}"
echo "1. Start your backend application (see instructions above)"
echo "2. Install SSL certificate"
echo "3. Test your application"
echo ""
echo -e "${BLUE}Application locations:${NC}"
echo "  Frontend: $PUBLIC_HTML"
echo "  Backend: $HOME/spanish-class/packages/backend"
echo "  Database: MySQL via cPanel"
echo ""
echo -e "${BLUE}Useful commands:${NC}"
echo "  View logs: pm2 logs spanish-class-api (if using PM2)"
echo "  Restart: pm2 restart spanish-class-api (if using PM2)"
echo "  Database Studio: cd packages/backend && npm run db:studio"
echo ""
print_success "Happy teaching! 🎓"
