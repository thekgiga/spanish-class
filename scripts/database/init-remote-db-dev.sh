#!/bin/bash
###############################################################################
# Initialize Remote Database - Development
#
# This script initializes a fresh remote development database
# Use this ONLY for first-time setup or database reset
#
# Usage: ./init-remote-db-dev.sh
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m'

ENV_FILE="packages/backend/.env.dev"

echo -e "${MAGENTA}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║  Initialize Remote Database - Development                    ║${NC}"
echo -e "${MAGENTA}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if .env.dev exists
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}Error: $ENV_FILE not found${NC}"
    exit 1
fi

# Extract and modify DATABASE_URL
DATABASE_URL=$(grep "^DATABASE_URL=" "$ENV_FILE" | cut -d '=' -f2- | tr -d '"')
DATABASE_URL=$(echo "$DATABASE_URL" | sed 's/@localhost:/@casovispanskog.rs:/')

if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}Error: DATABASE_URL not found in $ENV_FILE${NC}"
    exit 1
fi

# Display database info
DB_INFO=$(echo "$DATABASE_URL" | sed 's/:.*@/:***@/')
echo -e "${RED}⚠️  WARNING: This will RESET the remote development database!${NC}"
echo -e "${RED}   All existing data will be replaced with the current schema.${NC}"
echo ""
echo -e "${YELLOW}   Database: $DB_INFO${NC}"
echo ""
read -p "Are you absolutely sure? (type 'reset' to confirm): " confirm

if [ "$confirm" != "reset" ]; then
    echo -e "${YELLOW}Operation cancelled${NC}"
    exit 0
fi

echo ""
export DATABASE_URL

echo -e "${GREEN}[1/3]${NC} Pushing schema to database..."
cd packages/backend
npx prisma db push --force-reset

echo ""
echo -e "${GREEN}[2/3]${NC} Marking migrations as applied..."
for migration in prisma/migrations/*/; do
    migration_name=$(basename "$migration")
    if [ "$migration_name" != "migration_lock.toml" ]; then
        echo "  Marking: $migration_name"
        npx prisma migrate resolve --applied "$migration_name" || true
    fi
done

echo ""
echo -e "${GREEN}[3/3]${NC} Verifying setup..."
npx prisma migrate status

echo ""
echo -e "${GREEN}✅ Database initialized successfully!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "  1. Deploy your application: ./deploy-dev.sh"
echo "  2. (Optional) Seed data: npm run db:seed in packages/backend"
echo ""
