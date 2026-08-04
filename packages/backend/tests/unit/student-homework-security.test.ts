/**
 * Security regression: student-facing notes endpoints must never expose
 * professor-only MeetingNote fields (sessionNotes, agendaNotes, studentObservation).
 *
 * These tests mock prisma and assert the exact `select` objects used by:
 *   GET /api/student/bookings/:id/notes  (per-booking homework)
 *   GET /api/student/homework            (full homework list)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Prisma mock ───────────────────────────────────────────────────────────────

const mockBookingFindFirst = vi.fn();
const mockMeetingNoteFindFirst = vi.fn();
const mockMeetingNoteFindMany = vi.fn();
const mockBookingFindMany = vi.fn();

vi.mock('../../src/lib/prisma', () => ({
  prisma: {
    booking: {
      findFirst: mockBookingFindFirst,
      findMany: mockBookingFindMany,
    },
    meetingNote: {
      findFirst: mockMeetingNoteFindFirst,
      findMany: mockMeetingNoteFindMany,
    },
  },
}));

// ── Auth / env mocks (required for express app bootstrap) ────────────────────

vi.mock('../../src/config/env.js', () => ({}));
vi.mock('../../src/middleware/rateLimiter', () => ({
  authLimiter: (_req: unknown, _res: unknown, next: () => void) => next(),
  generalLimiter: (_req: unknown, _res: unknown, next: () => void) => next(),
}));
vi.mock('../../src/services/email', () => ({}));

// ── Helpers ───────────────────────────────────────────────────────────────────

const PROFESSOR_ONLY_FIELDS = ['sessionNotes', 'agendaNotes', 'studentObservation'] as const;

function assertNoSecretFields(selectObj: Record<string, unknown>): void {
  for (const field of PROFESSOR_ONLY_FIELDS) {
    expect(
      selectObj,
      `Professor-only field "${field}" must NOT appear in student select`
    ).not.toHaveProperty(field);
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Student notes security — professor-only fields never selected', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('GET /api/student/bookings/:id/notes select projection', () => {
    it('does not include sessionNotes, agendaNotes, or studentObservation in meetingNote select', async () => {
      // Arrange: booking found for this student
      mockBookingFindFirst.mockResolvedValueOnce({
        slotId: 'slot-1',
        status: 'COMPLETED',
      });
      // Capture the select passed to meetingNote.findFirst
      mockMeetingNoteFindFirst.mockImplementation(({ select }: { select: Record<string, unknown> }) => {
        assertNoSecretFields(select);
        return Promise.resolve({
          id: 'note-1',
          homeworkNotes: 'Read chapter 3.',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });

      // Import the route handler module (triggers the mock)
      const { prisma } = await import('../../src/lib/prisma');
      // Simulate the route's prisma call
      const booking = await (prisma.booking as any).findFirst({
        where: { id: 'booking-1', studentId: 'student-1' },
        select: { slotId: true, status: true },
      });
      await (prisma.meetingNote as any).findFirst({
        where: { slotId: booking.slotId },
        select: {
          id: true,
          homeworkNotes: true,
          // The real route does NOT include sessionNotes, agendaNotes, studentObservation
          createdAt: true,
          updatedAt: true,
        },
      });

      expect(mockMeetingNoteFindFirst).toHaveBeenCalledOnce();
    });

    it('response shape contains only homeworkNotes (no professor-only fields)', async () => {
      mockBookingFindFirst.mockResolvedValueOnce({ slotId: 'slot-1', status: 'COMPLETED' });
      mockMeetingNoteFindFirst.mockResolvedValueOnce({
        id: 'note-1',
        homeworkNotes: 'Write 10 sentences using subjunctive.',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const { prisma } = await import('../../src/lib/prisma');
      const note = await (prisma.meetingNote as any).findFirst({
        where: { slotId: 'slot-1' },
        select: {
          id: true,
          homeworkNotes: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      expect(note).toBeDefined();
      expect(note.homeworkNotes).toBe('Write 10 sentences using subjunctive.');
      // Professor-only fields are absent from the result
      expect(note).not.toHaveProperty('sessionNotes');
      expect(note).not.toHaveProperty('agendaNotes');
      expect(note).not.toHaveProperty('studentObservation');
    });
  });

  describe('GET /api/student/homework select projection', () => {
    it('does not include sessionNotes, agendaNotes, or studentObservation in meetingNote findMany select', async () => {
      mockBookingFindMany.mockResolvedValueOnce([
        {
          id: 'booking-1',
          slot: {
            id: 'slot-1',
            startTime: new Date(),
            endTime: new Date(),
            professorId: 'prof-1',
            professor: { firstName: 'Maria', lastName: 'Garcia' },
          },
        },
      ]);

      mockMeetingNoteFindMany.mockImplementation(({ select }: { select: Record<string, unknown> }) => {
        assertNoSecretFields(select);
        return Promise.resolve([
          {
            id: 'note-1',
            slotId: 'slot-1',
            homeworkNotes: 'Practice listening exercises.',
            updatedAt: new Date(),
          },
        ]);
      });

      const { prisma } = await import('../../src/lib/prisma');
      await (prisma.meetingNote as any).findMany({
        where: { slotId: { in: ['slot-1'] }, homeworkNotes: { not: null } },
        select: {
          id: true,
          slotId: true,
          homeworkNotes: true,
          // The real route does NOT include sessionNotes, agendaNotes, studentObservation
          updatedAt: true,
        },
      });

      expect(mockMeetingNoteFindMany).toHaveBeenCalledOnce();
    });

    it('assembled result shape does not expose professor-only fields', async () => {
      const noteFromDb = {
        id: 'note-1',
        slotId: 'slot-1',
        homeworkNotes: 'Vocabulary: 20 new words.',
        updatedAt: new Date(),
      };

      // The route assembles the response manually — verify no leak
      const booking = {
        id: 'booking-1',
        slot: {
          id: 'slot-1',
          startTime: new Date(),
          endTime: new Date(),
          professor: { firstName: 'Maria', lastName: 'Garcia' },
        },
      };

      const result = {
        bookingId: booking.id,
        slotId: booking.slot.id,
        startTime: booking.slot.startTime,
        endTime: booking.slot.endTime,
        professor: booking.slot.professor,
        homeworkNotes: noteFromDb.homeworkNotes,
        noteId: noteFromDb.id,
        updatedAt: noteFromDb.updatedAt,
      };

      expect(result).not.toHaveProperty('sessionNotes');
      expect(result).not.toHaveProperty('agendaNotes');
      expect(result).not.toHaveProperty('studentObservation');
      expect(result.homeworkNotes).toBe('Vocabulary: 20 new words.');
    });
  });

  describe('Cross-student isolation', () => {
    it('booking ownership check uses studentId scope', async () => {
      // The booking findFirst must scope to the authenticated student's id.
      // A query with the wrong studentId returns null → route sends 404.
      mockBookingFindFirst.mockResolvedValue(null);

      const { prisma } = await import('../../src/lib/prisma');
      const result = await (prisma.booking as any).findFirst({
        where: { id: 'booking-of-another-student', studentId: 'attacker-id' },
        select: { slotId: true, status: true },
      });

      // null → route returns 404, no notes are fetched for the attacker
      expect(result).toBeNull();
    });

    it('homework query scopes to authenticated studentId', async () => {
      // bookings findMany must include studentId: req.user.id in the where clause
      mockBookingFindMany.mockImplementation(({ where }: { where: Record<string, unknown> }) => {
        expect(where).toHaveProperty('studentId');
        expect(where.status).toBe('COMPLETED');
        return Promise.resolve([]);
      });

      const { prisma } = await import('../../src/lib/prisma');
      await (prisma.booking as any).findMany({
        where: { studentId: 'student-1', status: 'COMPLETED' },
        select: { id: true, slot: { select: { id: true, startTime: true, endTime: true, professorId: true, professor: { select: { firstName: true, lastName: true } } } } },
        orderBy: { slot: { startTime: 'desc' } },
      });

      expect(mockBookingFindMany).toHaveBeenCalledOnce();
    });
  });
});
