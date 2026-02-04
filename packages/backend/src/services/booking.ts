import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error.js';
import type { UserPublic } from '@spanish-class/shared';
import {
  sendBookingConfirmationToStudent,
  sendBookingNotificationToProfessor,
  sendCancellationToStudent,
  sendCancellationToProfessor,
} from './email.js';
import { createMeetingRoom, getMeetingProvider } from './meeting-provider.js';

interface BookSlotResult {
  bookingId: string;
  slot: {
    id: string;
    title: string | null;
    startTime: Date;
    endTime: Date;
    meetingRoomName: string | null;
    meetingUrl: string | null;
  };
}

export async function bookSlot(
  slotId: string,
  student: UserPublic
): Promise<BookSlotResult> {
  // Use a transaction to ensure atomicity
  const result = await prisma.$transaction(async (tx) => {
    // Lock the slot row for update
    const slot = await tx.availabilitySlot.findUnique({
      where: { id: slotId },
      include: {
        professor: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            isAdmin: true,
            timezone: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        allowedStudents: {
          select: { studentId: true },
        },
      },
    });

    if (!slot) {
      throw new AppError(404, 'Slot not found');
    }

    // Check if slot is private and student is allowed
    if (slot.isPrivate) {
      const isAllowed = slot.allowedStudents.some((s) => s.studentId === student.id);
      if (!isAllowed) {
        throw new AppError(403, 'This slot is private and you are not authorized to book it');
      }
    }

    // Check if slot is available
    if (slot.status !== 'AVAILABLE') {
      throw new AppError(400, 'This slot is no longer available');
    }

    // Check capacity
    if (slot.currentParticipants >= slot.maxParticipants) {
      throw new AppError(400, 'This slot is fully booked');
    }

    // Check if slot is in the future
    if (new Date(slot.startTime) <= new Date()) {
      throw new AppError(400, 'Cannot book a slot in the past');
    }

    // Check for duplicate booking
    const existingBooking = await tx.booking.findFirst({
      where: {
        slotId,
        studentId: student.id,
        status: 'CONFIRMED',
      },
    });

    if (existingBooking) {
      throw new AppError(400, 'You have already booked this slot');
    }

    // Create the booking
    const booking = await tx.booking.create({
      data: {
        slotId,
        studentId: student.id,
        status: 'CONFIRMED',
      },
    });

    // Generate meeting room if not already created (idempotent)
    let meetingRoomName = slot.meetingRoomName;
    if (!meetingRoomName) {
      const meeting = createMeetingRoom(slot.id);
      meetingRoomName = meeting.roomName;
    }

    // Update slot participant count, status, and meeting room name
    const newParticipants = slot.currentParticipants + 1;
    const newStatus = newParticipants >= slot.maxParticipants ? 'FULLY_BOOKED' : 'AVAILABLE';

    const updatedSlot = await tx.availabilitySlot.update({
      where: { id: slotId },
      data: {
        currentParticipants: newParticipants,
        status: newStatus,
        meetingRoomName,
      },
    });

    return { booking, slot: { ...slot, meetingRoomName } };
  });

  // After transaction: Send emails (non-blocking)
  const { booking, slot } = result;

  // Send emails (don't await, let them run in background)
  Promise.all([
    sendBookingConfirmationToStudent({
      slot,
      professor: slot.professor,
      student,
    }),
    sendBookingNotificationToProfessor({
      slot,
      professor: slot.professor,
      student,
    }),
  ]).catch((err) => console.error('Failed to send booking emails:', err));

  // Get meeting URL from room name
  const provider = getMeetingProvider();
  const meetingUrl = slot.meetingRoomName
    ? provider.getJoinUrl(slot.meetingRoomName, `${student.firstName} ${student.lastName}`)
    : null;

  return {
    bookingId: booking.id,
    slot: {
      id: slot.id,
      title: slot.title,
      startTime: slot.startTime,
      endTime: slot.endTime,
      meetingRoomName: slot.meetingRoomName,
      meetingUrl,
    },
  };
}

export async function cancelBooking(
  bookingId: string,
  user: UserPublic,
  reason?: string
): Promise<void> {
  const result = await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
      include: {
        slot: {
          include: {
            professor: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                isAdmin: true,
                timezone: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        },
        student: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            isAdmin: true,
            timezone: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!booking) {
      throw new AppError(404, 'Booking not found');
    }

    if (booking.status !== 'CONFIRMED') {
      throw new AppError(400, 'This booking cannot be cancelled');
    }

    // Check authorization: student can cancel their own, admin can cancel any
    const isOwner = booking.studentId === user.id;
    const isAdmin = user.isAdmin;

    if (!isOwner && !isAdmin) {
      throw new AppError(403, 'You are not authorized to cancel this booking');
    }

    // Check cancellation policy (24 hours before)
    const hoursUntilStart =
      (new Date(booking.slot.startTime).getTime() - Date.now()) / (1000 * 60 * 60);

    if (hoursUntilStart < 24 && !isAdmin) {
      throw new AppError(
        400,
        'Bookings must be cancelled at least 24 hours in advance'
      );
    }

    // Determine who cancelled
    const cancelledBy = isOwner ? 'student' : 'professor';
    const status = isOwner ? 'CANCELLED_BY_STUDENT' : 'CANCELLED_BY_PROFESSOR';

    // Update booking
    await tx.booking.update({
      where: { id: bookingId },
      data: {
        status,
        cancelledAt: new Date(),
        cancelReason: reason,
      },
    });

    // Update slot participant count and status
    const newParticipants = booking.slot.currentParticipants - 1;

    await tx.availabilitySlot.update({
      where: { id: booking.slotId },
      data: {
        currentParticipants: Math.max(0, newParticipants),
        status: 'AVAILABLE',
      },
    });

    return { booking, cancelledBy };
  });

  const { booking, cancelledBy } = result;

  // Send cancellation emails
  Promise.all([
    sendCancellationToStudent({
      slot: booking.slot,
      professor: booking.slot.professor,
      student: booking.student,
      reason,
      cancelledBy: cancelledBy as 'student' | 'professor',
    }),
    cancelledBy === 'student'
      ? sendCancellationToProfessor({
          slot: booking.slot,
          professor: booking.slot.professor,
          student: booking.student,
          reason,
        })
      : Promise.resolve(),
  ]).catch((err) => console.error('Failed to send cancellation emails:', err));
}
