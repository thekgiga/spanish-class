import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error.js';

/**
 * Skip a specific occurrence of a recurring pattern
 * This prevents the slot from being generated for a specific date
 */
export async function skipRecurringOccurrence(
  professorId: string,
  recurringPatternId: string,
  skipDate: Date
): Promise<void> {
  // Verify pattern belongs to professor
  const pattern = await prisma.recurringPattern.findFirst({
    where: {
      id: recurringPatternId,
      professorId,
    },
  });

  if (!pattern) {
    throw new AppError(404, 'Recurring pattern not found');
  }

  // Find and cancel any existing slot for this date
  const startOfDay = new Date(skipDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(skipDate);
  endOfDay.setHours(23, 59, 59, 999);

  const existingSlots = await prisma.availabilitySlot.findMany({
    where: {
      recurringPatternId,
      startTime: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: {
        not: 'CANCELLED',
      },
    },
    include: {
      bookings: {
        where: { status: 'CONFIRMED' },
        include: {
          student: true,
        },
      },
    },
  });

  // Cancel each slot and notify students
  for (const slot of existingSlots) {
    if (slot.bookings.length > 0) {
      // Has confirmed bookings - cancel them
      await prisma.booking.updateMany({
        where: {
          slotId: slot.id,
          status: 'CONFIRMED',
        },
        data: {
          status: 'CANCELLED_BY_PROFESSOR',
          cancelledAt: new Date(),
          cancelReason: 'Recurring class cancelled for this date',
        },
      });
    }

    // Cancel the slot
    await prisma.availabilitySlot.update({
      where: { id: slot.id },
      data: {
        status: 'CANCELLED',
        currentParticipants: 0,
      },
    });
  }
}

/**
 * Modify a single occurrence of a recurring pattern
 * Creates an independent slot with different time/details
 */
export async function modifyRecurringOccurrence(
  professorId: string,
  slotId: string,
  updates: {
    startTime?: Date;
    endTime?: Date;
    title?: string;
    description?: string;
    maxParticipants?: number;
  }
): Promise<void> {
  const slot = await prisma.availabilitySlot.findFirst({
    where: {
      id: slotId,
      professorId,
      recurringPatternId: {
        not: null,
      },
    },
  });

  if (!slot) {
    throw new AppError(404, 'Recurring slot not found');
  }

  // Detach from recurring pattern and apply modifications
  await prisma.availabilitySlot.update({
    where: { id: slotId },
    data: {
      recurringPatternId: null, // Detach from pattern
      ...updates,
    },
  });
}

/**
 * Stop a recurring pattern from a specific date forward
 */
export async function stopRecurringPattern(
  professorId: string,
  recurringPatternId: string,
  stopDate: Date
): Promise<void> {
  const pattern = await prisma.recurringPattern.findFirst({
    where: {
      id: recurringPatternId,
      professorId,
    },
  });

  if (!pattern) {
    throw new AppError(404, 'Recurring pattern not found');
  }

  // Set end date to stop pattern
  await prisma.recurringPattern.update({
    where: { id: recurringPatternId },
    data: {
      endDate: stopDate,
      isActive: false,
    },
  });

  // Cancel future slots that were already generated
  await prisma.availabilitySlot.updateMany({
    where: {
      recurringPatternId,
      startTime: {
        gte: stopDate,
      },
      status: {
        in: ['AVAILABLE', 'FULLY_BOOKED'],
      },
    },
    data: {
      status: 'CANCELLED',
    },
  });
}
