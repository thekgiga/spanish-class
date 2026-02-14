import { describe, it, expect, beforeEach, vi } from 'vitest';
import { bookSlot } from '../booking';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/error';

// Mock Prisma
vi.mock('../../lib/prisma', () => ({
  prisma: {
    $transaction: vi.fn(),
    availabilitySlot: {
      findUnique: vi.fn(),
      updateMany: vi.fn(),
    },
    booking: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

// Mock meeting provider
vi.mock('../meeting-provider', () => ({
  createMeetingRoom: vi.fn(() => ({ roomName: 'test-room-123' })),
  getMeetingProvider: vi.fn(() => ({
    getJoinUrl: vi.fn(() => 'https://meet.jit.si/test-room-123'),
  })),
}));

// Mock email service
vi.mock('../email', () => ({
  sendBookingConfirmationToStudent: vi.fn().mockResolvedValue(undefined),
  sendBookingNotificationToProfessor: vi.fn().mockResolvedValue(undefined),
}));

describe('Concurrent Booking Tests', () => {
  const mockStudent = {
    id: 'student-1',
    email: 'student@test.com',
    firstName: 'John',
    lastName: 'Doe',
    isAdmin: false,
    timezone: 'America/New_York',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSlot = {
    id: 'slot-1',
    professorId: 'prof-1',
    startTime: new Date(Date.now() + 86400000), // Tomorrow
    endTime: new Date(Date.now() + 90000000),
    slotType: 'INDIVIDUAL',
    maxParticipants: 1,
    currentParticipants: 0,
    status: 'AVAILABLE',
    title: 'Spanish Class',
    description: null,
    meetLink: null,
    isPrivate: false,
    recurringPatternId: null,
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    professor: {
      id: 'prof-1',
      email: 'prof@test.com',
      firstName: 'Maria',
      lastName: 'Garcia',
      isAdmin: true,
      timezone: 'Europe/Madrid',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    allowedStudents: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle optimistic locking conflict and retry', async () => {
    let attemptCount = 0;

    // Mock transaction to simulate version conflict on first attempt, success on second
    (prisma.$transaction as any).mockImplementation(async (callback: any) => {
      attemptCount++;

      // Mock the transaction client
      const mockTx = {
        availabilitySlot: {
          findUnique: vi.fn().mockResolvedValue(mockSlot),
          updateMany: vi.fn().mockResolvedValue({
            count: attemptCount === 1 ? 0 : 1, // Fail first, succeed second
          }),
        },
        booking: {
          findFirst: vi.fn().mockResolvedValue(null),
          create: vi.fn().mockResolvedValue({
            id: 'booking-1',
            slotId: mockSlot.id,
            studentId: mockStudent.id,
            status: 'CONFIRMED',
            bookedAt: new Date(),
            cancelledAt: null,
            cancelReason: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
        },
      };

      return await callback(mockTx);
    });

    const result = await bookSlot(mockSlot.id, mockStudent);

    // Should have retried after first failure
    expect(attemptCount).toBe(2);
    expect(result.bookingId).toBe('booking-1');
  });

  it('should fail after max retries on persistent conflicts', async () => {
    // Always return 0 to simulate persistent version conflicts
    (prisma.$transaction as any).mockImplementation(async (callback: any) => {
      const mockTx = {
        availabilitySlot: {
          findUnique: vi.fn().mockResolvedValue(mockSlot),
          updateMany: vi.fn().mockResolvedValue({ count: 0 }), // Always fail
        },
        booking: {
          findFirst: vi.fn().mockResolvedValue(null),
          create: vi.fn().mockResolvedValue({
            id: 'booking-1',
            slotId: mockSlot.id,
            studentId: mockStudent.id,
            status: 'CONFIRMED',
          }),
        },
      };

      return await callback(mockTx);
    });

    await expect(bookSlot(mockSlot.id, mockStudent)).rejects.toThrow(AppError);
    await expect(bookSlot(mockSlot.id, mockStudent)).rejects.toThrow(/409/);
  });

  it('should increment version on successful booking', async () => {
    let capturedUpdate: any = null;

    (prisma.$transaction as any).mockImplementation(async (callback: any) => {
      const mockTx = {
        availabilitySlot: {
          findUnique: vi.fn().mockResolvedValue(mockSlot),
          updateMany: vi.fn().mockImplementation((args) => {
            capturedUpdate = args;
            return Promise.resolve({ count: 1 });
          }),
        },
        booking: {
          findFirst: vi.fn().mockResolvedValue(null),
          create: vi.fn().mockResolvedValue({
            id: 'booking-1',
            slotId: mockSlot.id,
            studentId: mockStudent.id,
            status: 'CONFIRMED',
          }),
        },
      };

      return await callback(mockTx);
    });

    await bookSlot(mockSlot.id, mockStudent);

    // Check that version was checked in WHERE clause
    expect(capturedUpdate.where.version).toBe(1);
    // Check that version was incremented in UPDATE
    expect(capturedUpdate.data.version).toEqual({ increment: 1 });
  });

  it('should prevent booking fully booked slot', async () => {
    const fullyBookedSlot = { ...mockSlot, currentParticipants: 1, status: 'FULLY_BOOKED' };

    (prisma.$transaction as any).mockImplementation(async (callback: any) => {
      const mockTx = {
        availabilitySlot: {
          findUnique: vi.fn().mockResolvedValue(fullyBookedSlot),
        },
      };

      return await callback(mockTx);
    });

    await expect(bookSlot(mockSlot.id, mockStudent)).rejects.toThrow('no longer available');
  });

  it('should prevent duplicate bookings', async () => {
    (prisma.$transaction as any).mockImplementation(async (callback: any) => {
      const mockTx = {
        availabilitySlot: {
          findUnique: vi.fn().mockResolvedValue(mockSlot),
        },
        booking: {
          findFirst: vi.fn().mockResolvedValue({
            id: 'existing-booking',
            slotId: mockSlot.id,
            studentId: mockStudent.id,
            status: 'CONFIRMED',
          }),
        },
      };

      return await callback(mockTx);
    });

    await expect(bookSlot(mockSlot.id, mockStudent)).rejects.toThrow('already booked');
  });
});
