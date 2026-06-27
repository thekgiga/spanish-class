import { prisma } from "../lib/prisma.js";
import { createNotification } from "./notifications.js";

/**
 * Apply side-effects when a PENDING_CONFIRMATION booking is rejected (B3).
 * Decrements slot currentParticipants and updates slot status.
 * Creates an in-app notification for the student.
 * Does NOT promote the waitlist — that only happens on student cancellation.
 */
export async function applyRejectionSideEffects(
  bookingStudentId: string,
  slotId: string,
  slotCurrentParticipants: number,
  slotMaxParticipants: number,
  slotTitle?: string,
): Promise<void> {
  const newParticipants = Math.max(0, slotCurrentParticipants - 1);
  const newStatus =
    newParticipants < slotMaxParticipants ? "AVAILABLE" : "FULLY_BOOKED";

  await prisma.availabilitySlot.update({
    where: { id: slotId },
    data: {
      currentParticipants: newParticipants,
      status: newStatus,
    },
  });

  await createNotification(
    bookingStudentId,
    "booking_rejected",
    "Booking request declined",
    `Your request for ${slotTitle || "Spanish Class"} was declined. You can book another slot.`,
    "/dashboard/book",
  );
}
