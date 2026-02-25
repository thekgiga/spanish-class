# Environment Configuration Refactor - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refactor environment configuration to use ENV-based loading with automated deployment integration

**Architecture:** Backend loads configs from `config/{local,dev,prod}/.env` based on `ENV` variable. Deployment scripts automatically copy correct config into deployment package.

**Tech Stack:** TypeScript, Node.js, dotenv, bash scripts

---

## Summary of Tasks

1. **Prepare Config Directory** - Ensure structure exists
2. **Move Existing Files** - Move .env files to config/
3. **Create Env Loader** - New env.ts file
4. **Update Backend Entry** - Change index.ts import
5. **Update NPM Scripts** - Add ENV=local
6. **Update Deploy-Dev** - Auto-copy config
7. **Update Deploy-Prod** - Auto-copy config
8. **Clean Up Old Files** - Delete obsolete files
9. **Test Local Dev** - Verify works locally
10. **Test Deployment** - Dry run deploy script
11. **Update Docs** - Update README and CLAUDE.md
12. **Final Verification** - Complete testing

---

## Detailed Implementation

### Task 1: Prepare Config Directory Structure

```bash
# Ensure directories
mkdir -p config/local config/dev config/prod config/templates

# Verify .gitignore
grep "config/local/" .gitignore || echo "config/local/" >> .gitignore
grep "config/dev/" .gitignore || echo "config/dev/" >> .gitignore
grep "config/prod/" .gitignore || echo "config/prod/" >> .gitignore

# Commit
git add .gitignore
git commit -m "chore: ensure config directory structure in gitignore"
```

### Task 2: Move Existing Environment Files

```bash
# Move files
mv packages/backend/.env.dev config/dev/.env
mv packages/backend/.env.local config/local/.env
mv packages/backend/.env.production config/prod/.env

# Verify
find config -name '.env' -type f

# Commit
git add -A
git commit -m "refactor: move env files to config directory"
```

### Task 3: Create Environment Loader

Create `packages/backend/src/config/env.ts`:

```typescript
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const env = process.env.ENV || 'local';
const configPath = path.resolve(__dirname, '../../../config', env, '.env');

const result = dotenv.config({ path: configPath });

if (result.error) {
  console.error(`❌ Failed to load config from: ${configPath}`);
  console.error(`Error: ${result.error.message}`);
  process.exit(1);
}

console.log(`✓ Loaded environment config: ${env} (${configPath})`);

export { env };
```

```bash
git add packages/backend/src/config/env.ts
git commit -m "feat: add environment-based config loader"
```

### Task 4: Update Backend Entry Point

In `packages/backend/src/index.ts`, change line 1:

```typescript
// OLD: import 'dotenv/config';
// NEW:
import './config/env.js';
```

```bash
git add packages/backend/src/index.ts
git commit -m "refactor: use env loader instead of dotenv/config"
```

### Task 5: Update NPM Scripts

In `packages/backend/package.json`, update scripts:

```json
{
  "scripts": {
    "dev": "ENV=local tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "clean": "rm -rf dist",
    "typecheck": "tsc --noEmit",
    "db:generate": "ENV=local prisma generate",
    "db:push": "ENV=local prisma db push",
    "db:migrate": "ENV=local prisma migrate dev",
    "db:seed": "ENV=local tsx prisma/seed.ts",
    "db:studio": "ENV=local prisma studio"
  }
}
```

```bash
git add packages/backend/package.json
git commit -m "chore: add ENV=local to all npm scripts"
```

### Task 6-7: Update Deployment Scripts

In `scripts/deploy/deploy-dev.sh` and `scripts/deploy/deploy-prod.sh`, replace the .env generation section (around line 40-68) with:

```bash
# Step 2: Copy environment configuration
echo -e "${GREEN}[2/6]${NC} Copying environment configuration..."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
ENV_SOURCE="$PROJECT_ROOT/config/dev/.env"  # or prod for deploy-prod.sh

if [ ! -f "$ENV_SOURCE" ]; then
    echo -e "${RED}Error: Config not found: $ENV_SOURCE${NC}"
    exit 1
fi

if grep -q "CHANGE_ME" "$ENV_SOURCE" 2>/dev/null; then
    echo -e "${YELLOW}Warning: Found 'CHANGE_ME' in config${NC}"
    read -p "Continue? (y/N): " confirm
    [[ ! "$confirm" =~ ^[Yy]$ ]] && exit 1
fi

cp "$ENV_SOURCE" deploy/backend/.env
echo -e "${GREEN}✓ Config copied${NC}"
```

```bash
git add scripts/deploy/deploy-dev.sh scripts/deploy/deploy-prod.sh
git commit -m "refactor: deployment scripts auto-copy configs"
```

### Task 8: Clean Up Old Files

```bash
# Remove old files
rm -f packages/backend/.env
rm -f packages/backend/.env.example
rm -f scripts/deploy/sync-config.sh
rm -f config/templates/.htaccess.dev.template
rm -f config/templates/.htaccess.prod.template
rm -f docs/.htaccess
rm -f docs/.htaccess.template
rm -f .htaccess

# Commit
git add -A
git commit -m "chore: remove obsolete config files"
```

### Task 9: Test Local Development

```bash
# Test loader
cd packages/backend
ENV=local node --loader tsx/esm -e "import './src/config/env.js'"

# Build
npm run build

# Test
npm run dev
# Should show: ✓ Loaded environment config: local
```

### Task 10: Test Deployment (Dry Run)

```bash
# Build package
./scripts/build/build-deploy-package.sh

# Verify .env copied to deploy/backend/
ls -la deploy/backend/.env
```

### Task 11: Update Documentation

Update `config/README.md` with new workflow (see design doc)

Update `CLAUDE.md` with environment configuration section (see design doc)

```bash
git add config/README.md CLAUDE.md
git commit -m "docs: update config workflow documentation"
```

### Task 12: Final Verification

```bash
# Review commits
git log --oneline -12

# Test full cycle
cd packages/backend
npm run build
ENV=local node dist/index.js

# Success!
```

---

## Testing Checklist

- [ ] `npm run dev` starts and loads config/local/.env
- [ ] Console shows "✓ Loaded environment config: local"
- [ ] Database connection works
- [ ] `./scripts/deploy/deploy-dev.sh` copies config/dev/.env
- [ ] No old .env files in packages/backend/
- [ ] All obsolete files deleted

---

## Rollback

```bash
git revert --no-commit <first-commit>..HEAD
git commit -m "revert: rollback env config refactor"
```
