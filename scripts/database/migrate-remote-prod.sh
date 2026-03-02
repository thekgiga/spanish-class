#!/bin/bash
###############################################################################
# Remote Database Migration - PRODUCTION
#
# ⚠️  PRODUCTION DATABASE - USE WITH EXTREME CAUTION ⚠️
#
# This script runs Prisma migrations against the PRODUCTION database
# from your local machine (cPanel memory limits prevent running migrations on server)
#
# Uses: packages/backend/.env.production for database connection
#
# Usage: ./migrate-remote-prod.sh
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m'

ENV_FILE="packages/backend/.env.production"

echo -e "${RED}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${RED}║  ⚠️  PRODUCTION DATABASE MIGRATION ⚠️                         ║${NC}"
echo -e "${RED}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if .env.production exists
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}Error: $ENV_FILE not found${NC}"
    echo ""
    echo "Create $ENV_FILE with your production database credentials."
    echo ""
    exit 1
fi

# Extract DATABASE_URL from .env.production
DATABASE_URL=$(grep "^DATABASE_URL=" "$ENV_FILE" | cut -d '=' -f2- | tr -d '"')

if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}Error: DATABASE_URL not found in $ENV_FILE${NC}"
    exit 1
fi

# Check if it contains placeholder text
if echo "$DATABASE_URL" | grep -q "REPLACE"; then
    echo -e "${RED}Error: DATABASE_URL in $ENV_FILE contains placeholder values!${NC}"
    echo ""
    echo "Please update $ENV_FILE with actual production credentials."
    echo ""
    exit 1
fi

# Replace localhost with casovispanskog.rs for remote connection
DATABASE_URL=$(echo "$DATABASE_URL" | sed 's/@localhost:/@casovispanskog.rs:/')

# Display database info (hide password)
DB_INFO=$(echo "$DATABASE_URL" | sed 's/:.*@/:***@/')

echo -e "${RED}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${RED}║                    ⚠️  CRITICAL WARNING ⚠️                    ║${NC}"
echo -e "${RED}╠═══════════════════════════════════════════════════════════════╣${NC}"
echo -e "${RED}║  This will run migrations against your PRODUCTION database!  ║${NC}"
echo -e "${RED}║  This can modify or delete data. Make sure you have:         ║${NC}"
echo -e "${RED}║                                                               ║${NC}"
echo -e "${RED}║  ✓ Tested migrations in development first                    ║${NC}"
echo -e "${RED}║  ✓ Created a database backup                                 ║${NC}"
echo -e "${RED}║  ✓ Reviewed all migration files                              ║${NC}"
echo -e "${RED}║  ✓ Informed users of potential downtime                      ║${NC}"
echo -e "${RED}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Database: $DB_INFO${NC}"
echo ""
echo -e "${MAGENTA}Migrations to be applied:${NC}"

# Show pending migrations
export DATABASE_URL
cd packages/backend
npx prisma migrate status --short 2>/dev/null || echo "  (Run to see pending migrations)"
cd ../..

echo ""
echo -e "${RED}Type the database name to confirm (without prefix):${NC}"
read -p "Database name: " db_confirm

# Extract expected database name from URL (last part after /)
expected_db=$(echo "$DATABASE_URL" | sed 's/.*\///')

if [ "$db_confirm" != "$expected_db" ]; then
    echo -e "${YELLOW}Database name mismatch. Migration cancelled.${NC}"
    exit 0
fi

echo ""
echo -e "${YELLOW}Final confirmation - Type 'MIGRATE PRODUCTION' to proceed:${NC}"
read -p "> " final_confirm

if [ "$final_confirm" != "MIGRATE PRODUCTION" ]; then
    echo -e "${YELLOW}Migration cancelled${NC}"
    exit 0
fi

echo ""
echo -e "${GREEN}[1/2]${NC} Loading database connection from $ENV_FILE..."
echo -e "${GREEN}[2/2]${NC} Running migrations on PRODUCTION database..."

cd packages/backend
npx prisma migrate deploy

echo ""
echo -e "${GREEN}✅ Production migrations completed successfully!${NC}"
echo ""
echo -e "${MAGENTA}Post-deployment checklist:${NC}"
echo "  1. Test critical functionality on production"
echo "  2. Monitor error logs for issues"
echo "  3. Verify data integrity"
echo "  4. Notify team of deployment completion"
echo ""
