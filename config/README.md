# Environment-Specific Configuration

This directory contains environment-specific configuration files that are **NOT committed to git** for security reasons.

## Structure

```
config/
├── local/          - Local development configuration
├── dev/            - Development server configuration
├── prod/           - Production server configuration
└── templates/      - Templates for generating configs
```

## Security

**IMPORTANT**: This entire `config/` directory is git-ignored. Never commit actual credentials or secrets.

## Usage

### 1. Initial Setup

Copy templates and fill in actual values:

```bash
# For local development
cp config/templates/.env.local.template config/local/.env

# For dev server
cp config/templates/.env.dev.template config/dev/.env

# For production
cp config/templates/.env.prod.template config/prod/.env
```

### 2. Edit Configuration Files

Replace ALL `CHANGE_ME` placeholders with actual values:

```bash
# Generate JWT secret
openssl rand -base64 32

# Edit local config
nano config/local/.env

# Edit dev config
nano config/dev/.env

# Edit prod config (use different secrets!)
nano config/prod/.env
```

### 3. Deployment

Configs are **automatically copied** during deployment. Just run:

```bash
# Deploy to dev (includes config/dev/.env automatically)
./scripts/deploy/deploy-dev.sh

# Deploy to prod (includes config/prod/.env automatically)
./scripts/deploy/deploy-prod.sh
```

The deployment scripts will:
- Validate that config file exists
- Check for `CHANGE_ME` placeholders and warn if found
- Copy config to deployment package automatically
- Deploy everything together

## Environment Files

### Local Development (config/local/)
- `.env` - Backend environment variables
- No .htaccess needed (uses Vite dev server)
- Loaded via `ENV=local` (default)

### Dev Server (config/dev/)
- `.env` - Backend environment variables
- Database: `gigovicr_spanish_dev`
- Loaded via `ENV=dev` (set by deployment)

### Production Server (config/prod/)
- `.env` - Backend environment variables
- Database: `gigovicr_spanish_class`
- Loaded via `ENV=prod` (set by deployment)

## Configuration Variables

### Backend (.env)

Required for all environments:
- `NODE_ENV` - Environment name (development/production)
- `PORT` - Backend port (3001 typically)
- `DATABASE_URL` - MySQL connection string
- `JWT_SECRET` - Secret for JWT tokens (MUST be unique per env)
- `JWT_EXPIRES_IN` - Token expiration (e.g., "7d")
- `FRONTEND_URL` - Frontend URL for CORS
- `API_URL` - API URL for absolute links

Optional:
- `RESEND_API_KEY` - Email service API key
- `EMAIL_FROM` - Sender email address
- `GOOGLE_SERVICE_ACCOUNT_EMAIL` - Google Calendar integration
- `GOOGLE_PRIVATE_KEY` - Google Calendar private key
- `JITSI_APP_ID` - Jitsi video conferencing
- `JITSI_API_KEY` - Jitsi API key

## Environment Loading

The backend uses the `ENV` variable to determine which config to load:

```typescript
// Backend loads from config/$ENV/.env
ENV=local  → config/local/.env  (default for development)
ENV=dev    → config/dev/.env    (set by deploy-dev.sh)
ENV=prod   → config/prod/.env   (set by deploy-prod.sh)
```

This is handled automatically by:
- `packages/backend/src/config/env.ts` - Environment loader
- NPM scripts set `ENV=local` for local development
- Deployment scripts set `ENV=dev` or `ENV=prod` on the server

## Generating Secrets

```bash
# Generate JWT secret
openssl rand -base64 32

# Generate random password
openssl rand -base64 24
```

## Troubleshooting

### Backend not loading .env
- Check file is named `.env` exactly (no .template suffix)
- Verify file is in correct location: `config/local/.env`, `config/dev/.env`, or `config/prod/.env`
- Check `ENV` variable is set correctly (local/dev/prod)
- Check file permissions (should be readable)
- Look for "Loaded environment config" message in console output

### Database connection fails
- Verify DATABASE_URL format: `mysql://user:pass@host:3306/dbname`
- Check database exists and credentials are correct
- Ensure user has permissions on the database
