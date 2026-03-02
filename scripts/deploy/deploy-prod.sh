#!/bin/bash
###############################################################################
# Spanish Class Platform - Production Environment Deployment
#
# This script builds and deploys to the PRODUCTION environment on cPanel.
#
# Prerequisites:
# - SSH access to cPanel server
# - Production domain configured (yourdomain.com)
# - Node.js app created in cPanel for spanish-class-prod
#
# Usage: ./deploy-prod.sh
###############################################################################

set -e

# Configuration - UPDATE THESE VALUES
CPANEL_USER="gigovicr"
CPANEL_HOST="casovispanskog.rs"
BACKEND_PATH="spanish-class-prod"
FRONTEND_PATH="public_html"
NODE_VERSION="20"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m'

echo -e "${MAGENTA}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║  Spanish Class Platform - PRODUCTION Deployment              ║${NC}"
echo -e "${MAGENTA}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Production deployment confirmation
echo -e "${RED}⚠️  WARNING: This will deploy to PRODUCTION!${NC}"
echo ""
echo "This will:"
echo "  • Build and deploy to https://yourdomain.com"
echo "  • Update production backend and frontend"
echo "  • Run database migrations on production database"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo -e "${YELLOW}Deployment cancelled.${NC}"
    exit 1
fi

echo ""

# Step 1: Build deployment package
echo -e "${GREEN}[1/7]${NC} Building production deployment package..."
./scripts/build/build-deploy-package.sh

# Step 2: Copy production environment configuration
echo -e "${GREEN}[2/7]${NC} Copying PRODUCTION environment configuration..."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
PROD_ENV_SOURCE="$PROJECT_ROOT/config/prod/.env"

if [ ! -f "$PROD_ENV_SOURCE" ]; then
    echo -e "${RED}Error: Production config not found: $PROD_ENV_SOURCE${NC}"
    echo ""
    echo "Create it from template:"
    echo "  cp config/templates/.env.prod.template config/prod/.env"
    echo "  nano config/prod/.env  # Fill in actual values"
    exit 1
fi

if grep -q "CHANGE_ME" "$PROD_ENV_SOURCE" 2>/dev/null; then
    echo -e "${RED}Error: Found 'CHANGE_ME' in config/prod/.env${NC}"
    echo "Production config must not contain placeholder values."
    exit 1
fi

cp "$PROD_ENV_SOURCE" deploy/backend/.env
echo -e "${GREEN}✓ Config copied from config/prod/.env${NC}"
echo ""

# Step 3: Create backup before deployment
echo -e "${GREEN}[3/7]${NC} Creating backup of current production..."
BACKUP_NAME="spanish-class-prod-backup-$(date +%Y%m%d-%H%M%S).tar.gz"

ssh ${CPANEL_USER}@${CPANEL_HOST} << ENDSSH
echo "Creating backup: ~/${BACKUP_NAME}"
cd ~
tar -czf ${BACKUP_NAME} ${BACKEND_PATH}/ || echo "Backup failed (may not exist yet)"
echo "Backup created (if previous deployment existed)"
ENDSSH

echo -e "${GREEN}Backup saved as: ~/${BACKUP_NAME}${NC}"
echo ""

# Step 4: Deploy backend
echo -e "${GREEN}[4/7]${NC} Deploying backend to production..."
echo "Target: ${CPANEL_USER}@${CPANEL_HOST}:~/${BACKEND_PATH}/"

rsync -avz --delete \
  -e "ssh" \
  --exclude='.env' \
  deploy/backend/ \
  ${CPANEL_USER}@${CPANEL_HOST}:~/${BACKEND_PATH}/

# Step 5: Deploy frontend
echo ""
echo -e "${GREEN}[5/7]${NC} Deploying frontend to production..."
echo "Target: ${CPANEL_USER}@${CPANEL_HOST}:~/${FRONTEND_PATH}/"

rsync -avz --delete \
  -e "ssh" \
  --exclude='.htaccess' \
  deploy/frontend/ \
  ${CPANEL_USER}@${CPANEL_HOST}:~/${FRONTEND_PATH}/

# Step 6: Run post-deploy setup on server
echo ""
echo -e "${GREEN}[6/7]${NC} Running post-deploy setup on production server..."

ssh ${CPANEL_USER}@${CPANEL_HOST} << ENDSSH
echo "Navigating to backend directory..."
cd ~/${BACKEND_PATH}

echo "Activating Node.js environment..."
source ~/nodevenv/${BACKEND_PATH}/${NODE_VERSION}/bin/activate || true

echo "Installing production dependencies (postinstall will run automatically)..."
npm install --production

echo "Verifying shared package symlink..."
if ls -la node_modules/@spanish-class/ 2>/dev/null | grep -q "shared ->"; then
  echo "✓ Shared package symlink verified"
else
  echo "⚠️  Symlink verification failed - check setup-shared-package.sh"
fi

echo ""
echo "⚠️  Database operations NOT run automatically in PRODUCTION"
echo "    This prevents accidental data loss."
echo "    Run these manually in cPanel ONLY when needed:"
echo "    - npm run db:generate (after schema changes)"
echo "    - npm run db:migrate (after creating migrations)"
echo ""
echo "    ⚠️  NEVER use db:push in production!"

echo ""
echo "Post-deploy setup complete!"
ENDSSH

# Step 7: Restart application
echo ""
echo -e "${GREEN}[7/7]${NC} Restarting production application..."

# Manual restart via cPanel
echo -e "${YELLOW}Manual step required:${NC}"
echo "  1. Go to cPanel → Setup Node.js App"
echo "  2. Find 'spanish-class-prod' application"
echo "  3. Click 'Restart'"
echo ""

# If using PM2 (uncomment if you have PM2)
# ssh ${CPANEL_USER}@${CPANEL_HOST} << 'ENDSSH'
# cd ~/${BACKEND_PATH}
# pm2 restart spanish-class-prod || pm2 start dist/index.js --name spanish-class-prod
# echo "Application restarted via PM2"
# ENDSSH

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ PRODUCTION Deployment Complete!                           ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Frontend:${NC} https://yourdomain.com"
echo -e "${BLUE}Backend:${NC}  https://yourdomain.com/api"
echo ""
echo -e "${MAGENTA}Post-Deployment Checklist:${NC}"
echo "  1. Restart the Node.js app in cPanel"
echo "  2. Test login/registration"
echo "  3. Test booking creation"
echo "  4. Verify email sending works"
echo "  5. Check application logs in cPanel"
echo ""
echo -e "${RED}Database Scripts (run manually ONLY when needed):${NC}"
echo "  • db:generate - After schema changes"
echo "  • db:migrate  - After creating new migrations"
echo "  ${YELLOW}⚠️  NEVER use db:push in production!${NC}"
echo ""
echo -e "${BLUE}Available in: cPanel → Setup Node.js App → Run Script${NC}"
echo ""
echo -e "${GREEN}Rollback instructions:${NC}"
echo "  If something goes wrong, restore the backup:"
echo "    ssh ${CPANEL_USER}@${CPANEL_HOST}"
echo "    cd ~"
echo "    rm -rf ${BACKEND_PATH}"
echo "    tar -xzf ${BACKUP_NAME}"
echo "    # Restart application in cPanel"
echo ""
