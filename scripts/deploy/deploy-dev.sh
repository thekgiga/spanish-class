#!/bin/bash
###############################################################################
# Spanish Class Platform - Development Environment Deployment
#
# This script builds and deploys to the DEV environment on cPanel.
#
# Prerequisites:
# - SSH access to cPanel server
# - dev subdomain configured (dev.yourdomain.com)
# - Node.js app created in cPanel for spanish-class-dev
#
# Usage: ./deploy-dev.sh
###############################################################################

set -e

# Configuration - UPDATE THESE VALUES
CPANEL_USER="gigovicr"
CPANEL_HOST="casovispanskog.rs"
BACKEND_PATH="spanish-class-dev"
FRONTEND_PATH="public_html/dev.casovispanskog.rs"
NODE_VERSION="20"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Spanish Class Platform - DEV Deployment                     ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Step 1: Build deployment package
echo -e "${GREEN}[1/6]${NC} Building deployment package..."
./scripts/build/build-deploy-package.sh

# Step 2: Copy dev environment configuration
echo -e "${GREEN}[2/6]${NC} Copying DEV environment configuration..."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
DEV_ENV_SOURCE="$PROJECT_ROOT/config/dev/.env"

if [ ! -f "$DEV_ENV_SOURCE" ]; then
    echo -e "${RED}Error: Dev config not found: $DEV_ENV_SOURCE${NC}"
    echo ""
    echo "Create it from template:"
    echo "  cp config/templates/.env.dev.template config/dev/.env"
    echo "  nano config/dev/.env  # Fill in actual values"
    exit 1
fi

if grep -q "CHANGE_ME" "$DEV_ENV_SOURCE" 2>/dev/null; then
    echo -e "${YELLOW}Warning: Found 'CHANGE_ME' in config/dev/.env${NC}"
    read -p "Continue anyway? (y/N): " confirm
    [[ ! "$confirm" =~ ^[Yy]$ ]] && exit 1
fi

cp "$DEV_ENV_SOURCE" deploy/backend/.env
echo -e "${GREEN}✓ Config copied from config/dev/.env${NC}"
echo ""

# Step 3: Deploy backend
echo -e "${GREEN}[3/6]${NC} Deploying backend to cPanel..."
echo "Target: ${CPANEL_USER}@${CPANEL_HOST}:~/${BACKEND_PATH}/"

rsync -avz --delete \
  -e "ssh" \
  --exclude='.env' \
  deploy/backend/ \
  ${CPANEL_USER}@${CPANEL_HOST}:~/${BACKEND_PATH}/

# Step 4: Deploy frontend
echo ""
echo -e "${GREEN}[4/6]${NC} Deploying frontend to cPanel..."
echo "Target: ${CPANEL_USER}@${CPANEL_HOST}:~/${FRONTEND_PATH}/"

rsync -avz --delete \
  -e "ssh" \
  deploy/frontend/ \
  ${CPANEL_USER}@${CPANEL_HOST}:~/${FRONTEND_PATH}/

# Step 5: Run post-deploy setup on server
echo ""
echo -e "${GREEN}[5/6]${NC} Running post-deploy setup on server..."

ssh ${CPANEL_USER}@${CPANEL_HOST} << ENDSSH
echo "Navigating to backend directory..."
cd ~/${BACKEND_PATH}

echo "Activating Node.js environment..."
source ~/nodevenv/${BACKEND_PATH}/${NODE_VERSION}/bin/activate || true

echo "Installing dependencies (postinstall will run automatically)..."
npm install --production

echo "Verifying shared package symlink..."
if ls -la node_modules/@spanish-class/ 2>/dev/null | grep -q "shared ->"; then
  echo "✓ Shared package symlink verified"
else
  echo "⚠️  Symlink verification failed - check setup-shared-package.sh"
fi

echo ""
echo "ℹ️  Prisma client was pre-generated locally (cPanel memory limits)"
echo ""
echo "⚠️  Database migrations CANNOT run on cPanel (memory limits)"
echo "    Run migrations from your local machine instead:"
echo "    ./migrate-remote-dev.sh"
echo ""
echo "    This connects to the remote database and runs migrations locally."

echo ""
echo "Post-deploy setup complete!"
ENDSSH

# Step 6: Restart application
echo ""
echo -e "${GREEN}[6/6]${NC} Restarting Node.js application..."

# Option A: Restart via cPanel NodeJS Selector (manual)
echo -e "${YELLOW}Manual step required:${NC}"
echo "  1. Go to cPanel → Setup Node.js App"
echo "  2. Find 'spanish-class-dev' application"
echo "  3. Click 'Restart'"
echo ""

# Option B: If using PM2 (uncomment if you have PM2 set up)
# ssh ${CPANEL_USER}@${CPANEL_HOST} << 'ENDSSH'
# cd ~/${BACKEND_PATH}
# pm2 restart spanish-class-dev || pm2 start dist/index.js --name spanish-class-dev
# ENDSSH

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ DEV Deployment Complete!                                  ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Frontend:${NC} https://dev.casovispanskog.rs"
echo -e "${BLUE}Backend:${NC}  https://dev.casovispanskog.rs/api"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Restart the Node.js app in cPanel"
echo "  2. Test the application: https://dev.casovispanskog.rs"
echo ""
echo -e "${MAGENTA}Database Scripts (run manually only when needed):${NC}"
echo "  • db:generate - After schema changes in prisma/schema.prisma"
echo "  • db:migrate  - After creating new migrations"
echo "  • db:push     - Quick schema sync (DEV only, skips migrations)"
echo ""
echo -e "${GREEN}These are available in: cPanel → Setup Node.js App → Run Script${NC}"
echo ""
