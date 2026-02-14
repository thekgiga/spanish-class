import { describe, it, expect, vi, beforeEach } from 'vitest';
import { detectConflicts, createPrivateInvitation } from '../../src/services/private-invitation';
import { prisma } from '../../src/lib/prisma';

// Mock dependencies
vi.mock('../../src/lib/prisma', () => ({
  prisma: {
    availabilitySlot: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    user: {
      findFirst: vi.fn(),
    },
    booking: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock('../../src/services/meeting-provider', () => ({
  createMeetingRoom: vi.fn(() => ({ roomName: 'test-room', joinUrl: 'https://meet.test/room' })),
  getMeetingProvider: vi.fn(() => ({
    getJoinUrl: vi.fn(() => 'https://meet.test/room'),
  })),
}));

vi.mock('../../src/services/email', () => ({
  sendPrivateInvitationEmail: vi.fn().mockResolvedValue(undefined),
}));

// T020: Unit tests for createPrivateInvitation service
describe('Private Invitation Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('detectConflicts', () => {
    it('should return false when no conflicts exist', async () => {
      vi.mocked(prisma.availabilitySlot.findFirst).mockResolvedValue(null);

      const result = await detectConflicts(
        'prof-1',
        new Date('2024-01-01T10:00:00Z'),
        new Date('2024-01-01T11:00:00Z')
      );

      expect(result).toBe(false);
      expect(prisma.availabilitySlot.findFirst).toHaveBeenCalledWith({
        where: {
          id: undefined,
          professorId: 'prof-1',
          startTime: { lt: new Date('2024-01-01T11:00:00Z') },
          endTime: { gt: new Date('2024-01-01T10:00:00Z') },
          bookings: {
            some: {
              status: 'CONFIRMED',
            },
          },
        },
      });
    });

    it('should return true when conflicts exist', async () => {
      vi.mocked(prisma.availabilitySlot.findFirst).mockResolvedValue({
        id: 'slot-1',
      } as any);

      const result = await detectConflicts(
        'prof-1',
        new Date('2024-01-01T10:00:00Z'),
        new Date('2024-01-01T11:00:00Z')
      );

      expect(result).toBe(true);
    });

    it('should exclude specified slot when checking conflicts', async () => {
      vi.mocked(prisma.availabilitySlot.findFirst).mockResolvedValue(null);

      await detectConflicts(
        'prof-1',
        new Date('2024-01-01T10:00:00Z'),
        new Date('2024-01-01T11:00:00Z'),
        'exclude-slot-1'
      );

      expect(prisma.availabilitySlot.findFirst).toHaveBeenCalledWith({
        where: expect.objectContaining({
          id: { not: 'exclude-slot-1' },
        }),
      });
    });
  });

  describe('createPrivateInvitation', () => {
    const mockStudent = {
      id: 'student-1',
      email: 'student@test.com',
      firstName: 'John',
      lastName: 'Doe',
      isAdmin: false,
      timezone: 'UTC',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockProfessor = {
      id: 'prof-1',
      email: 'prof@test.com',
      firstName: 'Jane',
      lastName: 'Smith',
      isAdmin: true,
      timezone: 'UTC',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockSlot = {
      id: 'slot-1',
      professorId: 'prof-1',
      startTime: new Date('2024-01-01T10:00:00Z'),
      endTime: new Date('2024-01-01T11:00:00Z'),
      slotType: 'INDIVIDUAL',
      maxParticipants: 1,
      currentParticipants: 1,
      status: 'FULLY_BOOKED',
      title: 'Private Spanish Class',
      description: null,
      isPrivate: true,
      meetLink: 'test-room',
      allowedStudents: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      recurringPatternId: null,
    };

    const mockBooking = {
      id: 'booking-1',
      slotId: 'slot-1',
      studentId: 'student-1',
      status: 'CONFIRMED',
      student: mockStudent,
    };

    it('should throw error if student not found', async () => {
      vi.mocked(prisma.user.findFirst).mockResolvedValueOnce(null);

      await expect(
        createPrivateInvitation({
          professorId: 'prof-1',
          studentId: 'invalid-student',
          startTime: new Date('2024-01-01T10:00:00Z'),
          endTime: new Date('2024-01-01T11:00:00Z'),
        })
      ).rejects.toThrow('Student not found');
    });

    it('should throw error if professor not found', async () => {
      vi.mocked(prisma.user.findFirst)
        .mockResolvedValueOnce(mockStudent as any)
        .mockResolvedValueOnce(null);

      await expect(
        createPrivateInvitation({
          professorId: 'invalid-prof',
          studentId: 'student-1',
          startTime: new Date('2024-01-01T10:00:00Z'),
          endTime: new Date('2024-01-01T11:00:00Z'),
        })
      ).rejects.toThrow('Professor not found');
    });

    it('should throw error if conflict exists', async () => {
      vi.mocked(prisma.user.findFirst)
        .mockResolvedValueOnce(mockStudent as any)
        .mockResolvedValueOnce(mockProfessor as any);

      vi.mocked(prisma.availabilitySlot.findFirst).mockResolvedValue({
        id: 'conflict-slot',
      } as any);

      await expect(
        createPrivateInvitation({
          professorId: 'prof-1',
          studentId: 'student-1',
          startTime: new Date('2024-01-01T10:00:00Z'),
          endTime: new Date('2024-01-01T11:00:00Z'),
        })
      ).rejects.toThrow('Professor has a conflicting confirmed booking');
    });

    it('should create private invitation successfully', async () => {
      vi.mocked(prisma.user.findFirst)
        .mockResolvedValueOnce(mockStudent as any)
        .mockResolvedValueOnce(mockProfessor as any);

      vi.mocked(prisma.availabilitySlot.findFirst).mockResolvedValue(null);

      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        return callback({
          availabilitySlot: {
            create: vi.fn().mockResolvedValue(mockSlot),
            update: vi.fn().mockResolvedValue({ ...mockSlot, meetLink: 'test-room' }),
          },
          booking: {
            create: vi.fn().mockResolvedValue(mockBooking),
          },
        });
      });

      const result = await createPrivateInvitation({
        professorId: 'prof-1',
        studentId: 'student-1',
        startTime: new Date('2024-01-01T10:00:00Z'),
        endTime: new Date('2024-01-01T11:00:00Z'),
        title: 'Test Class',
      });

      expect(result).toBeDefined();
      expect(result.slot).toBeDefined();
      expect(result.booking).toBeDefined();
      expect(result.meetLink).toBeDefined();
    });
  });
});
