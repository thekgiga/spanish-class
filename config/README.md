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
cp config/templates/.env.local.template packages/backend/.env

# For dev server
cp config/templates/.env.dev.template config/dev/.env
cp config/templates/.htaccess.dev.template config/dev/.htaccess

# For production
cp config/templates/.env.prod.template config/prod/.env
cp config/templates/.htaccess.prod.template config/prod/.htaccess
```

### 2. Edit Configuration Files

Replace ALL `CHANGE_ME` placeholders with actual values:

```bash
# Generate JWT secret
openssl rand -base64 32

# Edit dev config
nano config/dev/.env

# Edit prod config (use different secrets!)
nano config/prod/.env
```

### 3. Deployment

Use the sync-config script to deploy:

```bash
# Deploy to dev
./scripts/deploy/sync-config.sh dev

# Deploy to prod (requires confirmation)
./scripts/deploy/sync-config.sh prod
```

## Environment Files

### Local Development
- `.env` - Backend environment variables
- No .htaccess needed (uses Vite dev server)

### Dev Server (dev.casovispanskog.rs)
- `.env` - Backend environment variables
- `.htaccess` - Apache/Passenger configuration
- Database: `gigovicr_spanish_dev`

### Production Server (casovispanskog.rs)
- `.env` - Backend environment variables
- `.htaccess` - Apache/Passenger configuration
- Database: `gigovicr_spanish_class`

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

### .htaccess

Required for dev/prod servers only (not local):
- Passenger configuration (Node.js app setup)
- HTTPS redirect rules
- Frontend routing (React Router)
- Security headers
- Caching rules

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
- Verify file is in correct location (`dev-casovispanskog-backend/`)
- Check file permissions (should be readable)

### .htaccess typos
- Always use templates to avoid typos
- Key areas to check:
  - `PassengerStartupFile` → must be `dist/index.js` (not disct/)
  - `PassengerAppRoot` → correct backend directory path
  - `PassengerNodejs` → correct Node.js binary path

### Database connection fails
- Verify DATABASE_URL format: `mysql://user:pass@host:3306/dbname`
- Check database exists and credentials are correct
- Ensure user has permissions on the database
