/**
 * Test users seeded by [packages/backend/prisma/seed.ts].
 *
 * Phase 0 baseline tests depend on the seed running before the suite.
 * The orchestration script (or local /run + manual seed) is responsible
 * for ensuring these users exist.
 */

export const SEEDED = {
  professor: {
    email: 'professor@spanishclass.com',
    password: 'Admin123!',
    firstName: 'Maria',
    lastName: 'Garcia',
  },
  student: {
    email: 'student@example.com',
    password: 'Student123!',
    firstName: 'John',
    lastName: 'Doe',
  },
} as const;
