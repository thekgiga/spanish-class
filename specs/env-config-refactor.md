# Environment Configuration Refactor

**Date:** 2026-02-25
**Status:** Approved

## Overview

Refactor environment configuration to use `ENV` variable-based loading with automated deployment integration.

## Architecture

**Config Structure:**
```
config/
├── local/.env    # Local dev (NOT in git)
├── dev/.env      # Dev server (NOT in git)
├── prod/.env     # Production (NOT in git)
└── templates/    # Templates (IN git)
```

**Loading Mechanism:**
- Backend loads from `config/$ENV/.env` based on `ENV` variable
- `ENV=local` for local development (default)
- `ENV=dev` or `ENV=prod` set by deployment

## Implementation

### 1. Environment Loader (NEW)

**File:** `packages/backend/src/config/env.ts`

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
  console.error(`Failed to load environment config from: ${configPath}`);
  console.error(`Error: ${result.error.message}`);
  process.exit(1);
}

console.log(`✓ Loaded environment config: ${env} (${configPath})`);
export { env };
```

### 2. Backend Entry Point (MODIFIED)

**File:** `packages/backend/src/index.ts`

```typescript
// OLD: import 'dotenv/config';
// NEW:
import './config/env.js';  // Must be first import

import express, { Express } from 'express';
// ... rest unchanged
```

### 3. NPM Scripts (MODIFIED)

**File:** `packages/backend/package.json`

All scripts set `ENV=local`:
```json
{
  "scripts": {
    "dev": "ENV=local tsx watch src/index.ts",
    "db:migrate": "ENV=local prisma migrate dev",
    "db:studio": "ENV=local prisma studio"
  }
}
```

### 4. Deployment Scripts (MODIFIED)

**Files:** `scripts/deploy/deploy-dev.sh`, `scripts/deploy/deploy-prod.sh`

Replace hardcoded .env generation with:

```bash
# Copy environment config
ENV_SOURCE="$PROJECT_ROOT/config/dev/.env"  # or prod

if [ ! -f "$ENV_SOURCE" ]; then
    echo "Error: Config not found: $ENV_SOURCE"
    exit 1
fi

if grep -q "CHANGE_ME" "$ENV_SOURCE" 2>/dev/null; then
    echo "Warning: Found 'CHANGE_ME' in config"
    read -p "Continue? (y/N): " confirm
    [[ ! "$confirm" =~ ^[Yy]$ ]] && exit 1
fi

cp "$ENV_SOURCE" deploy/backend/.env
```

## Migration Steps

1. Move files:
   ```bash
   mv packages/backend/.env.dev config/dev/.env
   mv packages/backend/.env.local config/local/.env
   mv packages/backend/.env.production config/prod/.env
   ```

2. Create `packages/backend/src/config/env.ts`

3. Update `packages/backend/src/index.ts` import

4. Update `packages/backend/package.json` scripts

5. Update deployment scripts

6. Delete old files:
   ```bash
   rm packages/backend/.env*
   rm scripts/deploy/sync-config.sh
   rm config/templates/.htaccess.*
   rm docs/.htaccess*
   rm .htaccess
   ```

7. Test:
   - Local: `npm run dev`
   - Deploy: `./scripts/deploy/deploy-dev.sh`

## Workflows

**Local Development:**
```bash
# Setup (once)
cp config/templates/.env.local.template config/local/.env
nano config/local/.env

# Daily
npm run dev  # Uses config/local/.env automatically
```

**Deployment:**
```bash
# Setup (once)
cp config/templates/.env.dev.template config/dev/.env
nano config/dev/.env

# Deploy
./scripts/deploy/deploy-dev.sh  # Includes config/dev/.env automatically
```

## Benefits

- ✅ Single source of truth (config/ directory)
- ✅ Automated deployment (no manual sync)
- ✅ Error prevention (validation)
- ✅ Clear structure
- ✅ Configs never in git
