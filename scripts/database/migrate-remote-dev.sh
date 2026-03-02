#!/bin/bash
###############################################################################
# Remote Database Migration - Development
#
# This script runs Prisma migrations against the REMOTE development database
# from your local machine (cPanel memory limits prevent running migrations on server)
#
# Uses: packages/backend/.env.dev for database connection
#
# Usage: ./migrate-remote-dev.sh
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ENV_FILE="packages/backend/.env.dev"

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Remote Database Migration - Development                     ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if .env.dev exists
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}Error: $ENV_FILE not found${NC}"
    echo ""
    echo "Create $ENV_FILE with your remote database connection."
    echo "See packages/backend/.env.dev for template."
    echo ""
    exit 1
fi

# Extract DATABASE_URL from .env.dev
DATABASE_URL=$(grep "^DATABASE_URL=" "$ENV_FILE" | cut -d '=' -f2- | tr -d '"')

if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}Error: DATABASE_URL not found in $ENV_FILE${NC}"
    exit 1
fi

# Replace localhost with casovispanskog.rs for remote connection
# (On server, localhost is correct, but from local we need the remote host)
DATABASE_URL=$(echo "$DATABASE_URL" | sed 's/@localhost:/@casovispanskog.rs:/')

# Display database info (hide password)
DB_INFO=$(echo "$DATABASE_URL" | sed 's/:.*@/:***@/')
echo -e "${YELLOW}⚠️  This will run migrations against the REMOTE development database${NC}"
echo -e "${YELLOW}   Database: $DB_INFO${NC}"
echo ""
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo -e "${YELLOW}Migration cancelled${NC}"
    exit 0
fi

echo ""
echo -e "${GREEN}[1/2]${NC} Loading database connection from $ENV_FILE..."

# Export DATABASE_URL
export DATABASE_URL

echo -e "${GREEN}[2/2]${NC} Running migrations..."

cd packages/backend
npx prisma migrate deploy

echo ""
echo -e "${GREEN}✅ Migrations completed successfully!${NC}"
echo ""
