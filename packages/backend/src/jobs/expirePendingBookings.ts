import type { AvailabilitySlot, UserPublic } from "@spanish-class/shared";
import { prisma } from "../lib/prisma.js";
import { sendBookingExpiredToStudent } from "../services/email.js";
import { createNotification } from "../services/notifications.js";

/**
 * Expire pending bookings that have exceeded the confirmation window.
 * Also decrements slot currentParticipants for each expired booking (B3)
 * and sends student notifications (B1) and professor in-app notifications (B2).
 */
export async function expirePendingBookings(): Promise<{ expiredCount: number }> {
  try {
    const now = new Date();

    // Fetch expired bookings with full slot + professor + student data
    const expiredBookings = await prisma.booking.findMany({
      where: {
        status: "PENDING_CONFIRMATION",
        confirmationExpiresAt: { lt: now },
      },
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

    if (expiredBookings.length === 0) {
      return { expiredCount: 0 };
    }

    // Batch update all expired bookings to EXPIRED status
    const result = await prisma.booking.updateMany({
      where: { id: { in: expiredBookings.map((b) => b.id) } },
      data: { status: "EXPIRED" },
    });

    // B3: Decrement currentParticipants per slot (group expired bookings by slotId)
    const decrementsBySlot = new Map<string, number>();
    for (const booking of expiredBookings) {
      decrementsBySlot.set(
        booking.slotId,
        (decrementsBySlot.get(booking.slotId) ?? 0) + 1,
      );
    }

    for (const [slotId, decrementCount] of decrementsBySlot) {
      const slot = await prisma.availabilitySlot.findUnique({
        where: { id: slotId },
        select: { currentParticipants: true, maxParticipants: true },
      });
      if (!slot) continue;

      const newParticipants = Math.max(0, slot.currentParticipants - decrementCount);
      const newStatus =
        newParticipants < slot.maxParticipants ? "AVAILABLE" : "FULLY_BOOKED";

      await prisma.availabilitySlot.update({
        where: { id: slotId },
        data: { currentParticipants: newParticipants, status: newStatus },
      });
    }

    // B1 + B2: Send notifications for each expired booking (non-blocking)
    for (const booking of expiredBookings) {
      const slotForEmail = booking.slot as unknown as AvailabilitySlot;
      const professorForEmail = booking.slot.professor as unknown as UserPublic;
      const studentForEmail = booking.student as unknown as UserPublic;
      const slotTitle = booking.slot.title || "Spanish Class";

      // B1: Email + in-app notification to student
      sendBookingExpiredToStudent({
        slot: slotForEmail,
        professor: professorForEmail,
        student: studentForEmail,
      }).catch((err: unknown) =>
        console.error(`[expirePendingBookings] Expired email failed for ${booking.id}:`, err),
      );

      createNotification(
        booking.studentId,
        "booking_expired",
        "Booking request expired",
        `Your booking request for ${slotTitle} was not confirmed in time and has expired.`,
        "/dashboard/book",
      ).catch(() => {});

      // B2: In-app notification to professor (email would be too noisy for expired requests)
      createNotification(
        booking.slot.professorId,
        "booking_expired_professor",
        "Booking request expired",
        `${booking.student.firstName} ${booking.student.lastName}'s request for ${slotTitle} expired without confirmation.`,
        "/admin",
      ).catch(() => {});
    }

    console.log(`[expirePendingBookings] Expired ${result.count} pending bookings`);
    return { expiredCount: result.count };
  } catch (error) {
    console.error("[expirePendingBookings] Error:", error);
    throw error;
  }
}
