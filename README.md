# Spanish Class Platform

Online Spanish class booking platform. React + Express + TypeScript + MySQL.

## Quick Start

```bash
npm install
npm run build      # Build all packages
npm run dev        # Start development servers
```

## Prerequisites

- Node.js 18+
- MySQL 8+
- Redis 6+ (for job queue and caching)

## Environment Setup

Create `.env` in project root:

```env
DATABASE_URL="mysql://user:password@localhost:3306/spanish_class"
JWT_SECRET="your-secret-key"
RESEND_API_KEY="re_..."
EMAIL_FROM="Spanish Class <noreply@yourdomain.com>"
FRONTEND_URL="http://localhost:5173"
API_URL="http://localhost:3001"

# Optional: Custom Jitsi domain (defaults to meet.jit.si)
JITSI_DOMAIN="meet.jit.si"

# Redis for BullMQ job queue (class reminders)
REDIS_HOST="localhost"
REDIS_PORT="6379"
```

## Database Setup

```bash
npm run db:generate    # Generate Prisma client
npm run db:push        # Create tables
npm run db:seed        # Add test data
```

**Default Logins:**
- Professor: `professor@spanishclass.com` / `Admin123!`
- Student: `student@example.com` / `Student123!`

## Video Conferencing

This platform uses **Jitsi Meet** for live video classes:
- Public instance (meet.jit.si) by default - no setup required
- Secure room names generated server-side (cryptographically random)
- Access control enforced by backend
- Optional: Configure custom Jitsi domain via `JITSI_DOMAIN` environment variable

**Note:** Google Calendar/Meet integration was removed in favor of Jitsi-only approach.

## Testing

### Unit & Integration Tests (Vitest)
```bash
npm test              # Run tests in watch mode
npm run test:coverage # Run with coverage report
npm run test:ui       # Open Vitest UI
```

**Coverage Thresholds**: 80% for lines, functions, branches, and statements

**Test Organization**:
- Backend tests: `src/**/__tests__/*.test.ts`
- Frontend tests: `src/**/*.test.tsx`
- Mock Prisma and external services in unit tests

### End-to-End Tests (Playwright)
```bash
npx playwright install          # Install browsers
npx playwright test             # Run E2E tests
npx playwright test --ui        # Run with UI mode
npx playwright test --debug     # Debug mode
npx playwright show-report      # View HTML report
```

**E2E Test Coverage**:
- Complete booking flow (student books → receives confirmation → joins meeting)
- Concurrent booking race conditions (optimistic locking verification)
- Cancellation workflows
- Professor-student interactions

## Production Deployment (unlimited.rs)

### Build
```bash
npm install
npm run build
npm prune --production
```

### Frontend
Upload `packages/frontend/dist/*` to `public_html/`

### Backend
1. **Redis Setup** (for BullMQ job queue):
   - Install Redis on server
   - Default port: 6379
   - Configure `REDIS_HOST` and `REDIS_PORT` in environment variables
   - Redis is used for scheduling class reminder emails (2 hours before class)

2. cPanel → Setup Node.js App
3. Node version: 18+
4. Startup file: `dist/index.js`
5. Set environment variables (including REDIS_HOST and REDIS_PORT)
6. Run: `npm install && npm run build`

**Background Jobs**:
- Class reminder worker runs automatically when backend starts
- Sends email reminders 2 hours before each confirmed class
- Failed jobs are automatically retried with exponential backoff

## License

Private - All rights reserved.
