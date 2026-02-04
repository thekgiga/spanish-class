#!/bin/bash

# ===========================================
# Spanish Class Platform - Multi-Environment Deployment Script
# For unlimited.rs cPanel Hosting
# ===========================================
#
# This script automates deployment to dev or production environments.
#
# Usage:
#   chmod +x deploy-multi.sh
#   ./deploy-multi.sh --env=dev      # Deploy to dev environment
#   ./deploy-multi.sh --env=prod     # Deploy to production
#   ./deploy-multi.sh --env=production  # Same as prod
#

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT=""
SKIP_SEED=false
SKIP_BACKUP=false

# Functions
print_banner() {
    echo -e "${MAGENTA}"
    echo "╔════════════════════════════════════════════════╗"
    echo "║   Spanish Class Platform - Deployment         ║"
    echo "║   Environment: $1"
    echo "╚════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

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

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Parse arguments
for arg in "$@"; do
    case $arg in
        --env=*)
        ENVIRONMENT="${arg#*=}"
        shift
        ;;
        --skip-seed)
        SKIP_SEED=true
        shift
        ;;
        --skip-backup)
        SKIP_BACKUP=true
        shift
        ;;
        --help)
        echo "Usage: ./deploy-multi.sh --env=<dev|prod> [options]"
        echo ""
        echo "Options:"
        echo "  --env=dev|prod|production   Target environment (required)"
        echo "  --skip-seed                  Skip database seeding"
        echo "  --skip-backup                Skip backup creation"
        echo "  --help                       Show this help message"
        echo ""
        echo "Examples:"
        echo "  ./deploy-multi.sh --env=dev"
        echo "  ./deploy-multi.sh --env=prod --skip-seed"
        exit 0
        ;;
        *)
        print_error "Unknown argument: $arg"
        echo "Use --help for usage information"
        exit 1
        ;;
    esac
done

# Validate environment
if [ -z "$ENVIRONMENT" ]; then
    print_error "Environment not specified. Use --env=dev or --env=prod"
    exit 1
fi

# Normalize environment names
case "$ENVIRONMENT" in
    dev|development)
        ENVIRONMENT="dev"
        ENV_FULL="Development"
        ENV_FILE=".env.dev"
        PUBLIC_HTML_DIR="$HOME/public_html/dev"
        BACKEND_PORT="3002"
        BACKEND_NAME="spanish-class-dev"
        GIT_BRANCH="develop"
        ;;
    prod|production)
        ENVIRONMENT="prod"
        ENV_FULL="Production"
        ENV_FILE=".env.production"
        PUBLIC_HTML_DIR="$HOME/public_html"
        BACKEND_PORT="3001"
        BACKEND_NAME="spanish-class-prod"
        GIT_BRANCH="main"
        ;;
    *)
        print_error "Invalid environment: $ENVIRONMENT. Use 'dev' or 'prod'"
        exit 1
        ;;
esac

print_banner "$ENV_FULL"

# Production warning
if [ "$ENVIRONMENT" == "prod" ]; then
    echo -e "${RED}⚠️  WARNING: You are deploying to PRODUCTION! ⚠️${NC}"
    echo ""
    read -p "Are you sure you want to continue? (yes/NO): " -r
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        echo "Deployment cancelled."
        exit 0
    fi
    echo ""
fi

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

# Check pnpm
if ! command_exists pnpm; then
    print_warning "pnpm not found. Installing pnpm..."
    npm install -g pnpm
fi
print_success "pnpm $(pnpm -v) detected"

# Check Git
if ! command_exists git; then
    print_error "Git is not installed"
    exit 1
fi
print_success "Git detected"

# Check .env file
if [ ! -f "packages/backend/$ENV_FILE" ]; then
    print_error "$ENV_FILE not found in packages/backend/"
    echo "Please create packages/backend/$ENV_FILE with your $ENV_FULL configuration."
    exit 1
fi
print_success "Backend $ENV_FILE found"

# ===========================================
# Git Operations
# ===========================================

print_step "Updating code from $GIT_BRANCH branch..."

# Check current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
print_warning "Current branch: $CURRENT_BRANCH"

if [ "$CURRENT_BRANCH" != "$GIT_BRANCH" ]; then
    print_warning "Switching to $GIT_BRANCH branch..."
    git checkout "$GIT_BRANCH"
fi

# Pull latest changes
print_step "Pulling latest changes..."
git pull origin "$GIT_BRANCH"
print_success "Code updated from $GIT_BRANCH"

# Show last commit
LAST_COMMIT=$(git log -1 --pretty=format:"%h - %s (%an, %ar)")
echo "Latest commit: $LAST_COMMIT"

# ===========================================
# Backup (Production only)
# ===========================================

if [ "$ENVIRONMENT" == "prod" ] && [ "$SKIP_BACKUP" == false ]; then
    print_step "Creating backup..."

    BACKUP_DIR="$HOME/backup_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"

    # Backup frontend
    if [ -d "$PUBLIC_HTML_DIR" ]; then
        print_step "Backing up frontend..."
        cp -r "$PUBLIC_HTML_DIR" "$BACKUP_DIR/frontend" 2>/dev/null || true
        print_success "Frontend backed up to $BACKUP_DIR/frontend"
    fi

    # Backup backend
    if [ -d "packages/backend/dist" ]; then
        print_step "Backing up backend..."
        cp -r "packages/backend/dist" "$BACKUP_DIR/backend" 2>/dev/null || true
        print_success "Backend backed up to $BACKUP_DIR/backend"
    fi

    echo "Backup location: $BACKUP_DIR"
fi

# ===========================================
# Install Dependencies
# ===========================================

print_step "Installing dependencies..."
pnpm install
print_success "Dependencies installed"

# ===========================================
# Setup Environment
# ===========================================

print_step "Setting up $ENV_FULL environment..."

# Copy environment file for backend
cp "packages/backend/$ENV_FILE" "packages/backend/.env"
print_success "Backend .env configured for $ENV_FULL"

# Copy environment file for frontend
if [ -f "packages/frontend/$ENV_FILE" ]; then
    cp "packages/frontend/$ENV_FILE" "packages/frontend/.env.production"
    print_success "Frontend .env.production configured for $ENV_FULL"
else
    print_warning "Frontend $ENV_FILE not found, using defaults"
fi

# ===========================================
# Database Setup
# ===========================================

print_step "Setting up database..."

cd packages/backend

# Generate Prisma Client
print_step "Generating Prisma Client..."
pnpm db:generate
print_success "Prisma Client generated"

# Push schema to database
print_step "Pushing database schema..."
pnpm db:push
print_success "Database schema updated"

# Seeding
if [ "$SKIP_SEED" == false ]; then
    if [ "$ENVIRONMENT" == "dev" ]; then
        read -p "Seed database with test data? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_step "Seeding database..."
            pnpm db:seed
            print_success "Database seeded"
        fi
    else
        print_warning "Skipping database seed for production (use --skip-seed flag)"
    fi
fi

cd ../..

# ===========================================
# Build Backend
# ===========================================

print_step "Building backend for $ENV_FULL..."
cd packages/backend
pnpm build

if [ ! -f "dist/index.js" ]; then
    print_error "Backend build failed - dist/index.js not found"
    exit 1
fi
print_success "Backend built successfully"
cd ../..

# ===========================================
# Build Frontend
# ===========================================

print_step "Building frontend for $ENV_FULL..."
cd packages/frontend

pnpm build

if [ ! -d "dist" ]; then
    print_error "Frontend build failed - dist directory not found"
    exit 1
fi
print_success "Frontend built successfully"
cd ../..

# ===========================================
# Deploy Frontend
# ===========================================

print_step "Deploying frontend to $PUBLIC_HTML_DIR..."

# Create directory if it doesn't exist
mkdir -p "$PUBLIC_HTML_DIR"

# Clear existing files (except .htaccess if exists)
if [ "$ENVIRONMENT" == "prod" ]; then
    # In production, backup .htaccess
    if [ -f "$PUBLIC_HTML_DIR/.htaccess" ]; then
        cp "$PUBLIC_HTML_DIR/.htaccess" "$PUBLIC_HTML_DIR/.htaccess.backup"
    fi
fi

# Copy frontend files
cp -r packages/frontend/dist/* "$PUBLIC_HTML_DIR/"
print_success "Frontend deployed to $PUBLIC_HTML_DIR"

# ===========================================
# Create/Update .htaccess
# ===========================================

print_step "Creating .htaccess for $ENV_FULL..."

# Create .htaccess
cat > "$PUBLIC_HTML_DIR/.htaccess" << EOF
# Spanish Class Platform - $ENV_FULL Environment Configuration

# Enable RewriteEngine
RewriteEngine On

$(if [ "$ENVIRONMENT" == "prod" ]; then
echo "# Force HTTPS (Production)"
echo "RewriteCond %{HTTPS} off"
echo "RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]"
else
echo "# Force HTTPS (uncomment after SSL is installed)"
echo "# RewriteCond %{HTTPS} off"
echo "# RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]"
fi)

# Proxy API requests to Node.js backend (port $BACKEND_PORT)
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^api/(.*)$ http://localhost:$BACKEND_PORT/api/\$1 [P,L]

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
$(if [ "$ENVIRONMENT" == "prod" ]; then
echo "    # HSTS for production"
echo "    Header always set Strict-Transport-Security \"max-age=31536000; includeSubDomains\""
fi)
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
</IfModule>

$(if [ "$ENVIRONMENT" == "prod" ]; then
echo "# Block access to sensitive files (Production)"
echo "<FilesMatch \"^\.\">"
echo "    Order allow,deny"
echo "    Deny from all"
echo "</FilesMatch>"
echo ""
echo "# Disable directory browsing"
echo "Options -Indexes"
fi)
EOF

print_success ".htaccess created for $ENV_FULL"

# ===========================================
# Backend Deployment Instructions
# ===========================================

print_step "Backend Deployment Instructions:"
echo ""
echo "The backend has been built successfully. Start it using cPanel Node.js Selector:"
echo ""
echo "  1. Login to cPanel at https://panel.unlimited.rs"
echo "  2. Go to 'Setup Node.js App'"
echo "  3. Find or create application for $ENV_FULL:"
echo "     - Application root: $(pwd)/packages/backend"
echo "     - Application startup file: dist/index.js"
echo "     - Port: $BACKEND_PORT"
echo "  4. Restart the application"
echo ""
echo "OR using PM2:"
echo "  cd $(pwd)/packages/backend"
echo "  pm2 restart $BACKEND_NAME || pm2 start dist/index.js --name $BACKEND_NAME"
echo ""

# ===========================================
# Post-Deployment Checklist
# ===========================================

print_step "Post-Deployment Checklist for $ENV_FULL:"
echo ""
if [ "$ENVIRONMENT" == "prod" ]; then
    echo "[ ] Restart backend via cPanel or PM2"
    echo "[ ] Test API: curl https://yourdomain.com/api/health"
    echo "[ ] Test frontend: https://yourdomain.com"
    echo "[ ] Verify SSL certificate is active"
    echo "[ ] Test user registration and login"
    echo "[ ] Test booking functionality"
    echo "[ ] Check error logs for issues"
    echo "[ ] Monitor application for 30 minutes"
else
    echo "[ ] Restart backend via cPanel or PM2"
    echo "[ ] Test API: curl https://dev.yourdomain.com/api/health"
    echo "[ ] Test frontend: https://dev.yourdomain.com"
    echo "[ ] Test new features"
    echo "[ ] Share with team for review"
fi
echo ""

# ===========================================
# Summary
# ===========================================

print_success "Deployment to $ENV_FULL completed successfully!"
echo ""
echo -e "${GREEN}Deployment Summary:${NC}"
echo "  Environment: $ENV_FULL"
echo "  Branch: $GIT_BRANCH"
echo "  Frontend: $PUBLIC_HTML_DIR"
echo "  Backend Port: $BACKEND_PORT"
echo "  Backend Name: $BACKEND_NAME"
if [ "$ENVIRONMENT" == "prod" ] && [ "$SKIP_BACKUP" == false ]; then
    echo "  Backup: $BACKUP_DIR"
fi
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "  1. Restart backend application"
echo "  2. Test application thoroughly"
if [ "$ENVIRONMENT" == "prod" ]; then
    echo "  3. Monitor logs and performance"
else
    echo "  3. Share with team for review"
fi
echo ""
print_success "Happy teaching! 🎓"
