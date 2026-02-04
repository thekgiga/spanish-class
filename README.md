# Spanish Class Platform

A modern web platform for booking and managing online Spanish classes. Built with React, Express, TypeScript, and MySQL.

## Features

- **Student Dashboard**: Browse available slots, book classes, manage bookings
- **Professor Dashboard**: Create availability, manage students, add notes
- **Real-time Booking**: Transactional booking with capacity management
- **Email Notifications**: Booking confirmations with .ics calendar attachments
- **Google Calendar Integration**: Auto-create Meet links for sessions
- **PWA Support**: Installable app with offline capabilities
- **Premium UI**: Modern design with Tailwind CSS and Framer Motion animations

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS + Radix UI + Framer Motion |
| Backend | Node.js + Express + TypeScript |
| Database | MySQL + Prisma ORM |
| Auth | JWT + HTTP-only cookies |
| Email | Resend + .ics generation |

## Project Structure

```
spanish-class-platform/
├── packages/
│   ├── frontend/          # React SPA
│   ├── backend/           # Express API
│   └── shared/            # Shared types & validation
├── package.json           # Workspace root
├── pnpm-workspace.yaml
└── turbo.json
```

## Prerequisites

- Node.js 18+
- pnpm 9+
- MySQL 8+

## Getting Started

### 1. Clone and Install

```bash
cd spanish-class-platform
pnpm install
```

### 2. Build Shared Package

Before running the dev servers, you need to build the shared package that contains common types and validation:

```bash
# Build the shared package
pnpm --filter @spanish-class/shared build
# Or from the shared package directory:
cd packages/shared && pnpm run build
```

### 3. Set Up Environment Variables

Copy the example env file and configure:

```bash
cp .env.example .env
```

Required variables:
```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/spanish_class"

# JWT
JWT_SECRET="your-secret-key-here"
JWT_EXPIRES_IN="7d"

# Email (Resend)
RESEND_API_KEY="re_..."
EMAIL_FROM="Spanish Class <noreply@yourdomain.com>"
PROFESSOR_EMAIL="professor@yourdomain.com"

# URLs
FRONTEND_URL="http://localhost:5173"
API_URL="http://localhost:3001"
```

### 4. Set Up Database

```bash
# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push

# Seed with initial data
pnpm db:seed
```

### 5. Start Development

```bash
pnpm dev
```

This starts both frontend (port 5173) and backend (port 3001).

## Default Accounts

After seeding, you can login with:

**Professor (Admin):**
- Email: `professor@spanishclass.com`
- Password: `Admin123!`

**Student:**
- Email: `student@example.com`
- Password: `Student123!`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new student
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Professor (Admin)
- `GET /api/professor/dashboard` - Dashboard stats
- `GET/POST /api/professor/slots` - List/create slots
- `POST /api/professor/slots/bulk` - Create recurring slots
- `GET/PUT/DELETE /api/professor/slots/:id` - Manage slot
- `GET /api/professor/students` - List students
- `GET /api/professor/students/:id` - Student detail
- `GET/POST /api/professor/students/:id/notes` - Manage notes

### Student
- `GET /api/student/dashboard` - Dashboard with next session
- `GET /api/student/slots` - Browse available slots
- `POST /api/student/bookings` - Book a slot
- `GET /api/student/bookings` - List my bookings
- `POST /api/student/bookings/:id/cancel` - Cancel booking

## Production Build

```bash
# Build all packages
pnpm build

# Frontend build output: packages/frontend/dist/
# Backend build output: packages/backend/dist/
```

## Deployment to unlimited.rs (cPanel)

### Frontend (Static Files)
1. Upload `packages/frontend/dist/*` to `public_html/`
2. The `.htaccess` file handles SPA routing

### Backend (Node.js App)
1. Go to cPanel → Setup Node.js App
2. Create app with:
   - Node.js version: 18.x or 20.x
   - Application root: `/home/user/spanish-api`
   - Startup file: `dist/index.js`
3. Set environment variables
4. Run `npm install && npm run build`
5. Start the application

### Database
1. Create MySQL database via cPanel
2. Update `DATABASE_URL` in environment variables
3. Run Prisma migrations

## Google Calendar Setup (Optional)

1. Create a Google Cloud project
2. Enable Calendar API
3. Create a service account
4. Download JSON key
5. Add service account email to your calendar with edit permissions
6. Set environment variables:
   ```env
   GOOGLE_SERVICE_ACCOUNT_EMAIL="...@...iam.gserviceaccount.com"
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
   GOOGLE_CALENDAR_ID="primary"
   ```

## License

Private - All rights reserved.
