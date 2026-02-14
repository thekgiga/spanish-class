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

## Environment Setup

Create `.env` in project root:

```env
DATABASE_URL="mysql://user:password@localhost:3306/spanish_class"
JWT_SECRET="your-secret-key"
RESEND_API_KEY="re_..."
EMAIL_FROM="Spanish Class <noreply@yourdomain.com>"
FRONTEND_URL="http://localhost:5173"
API_URL="http://localhost:3001"
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
1. cPanel → Setup Node.js App
2. Node version: 18+
3. Startup file: `dist/index.js`
4. Set environment variables
5. Run: `npm install && npm run build`

## License

Private - All rights reserved.
