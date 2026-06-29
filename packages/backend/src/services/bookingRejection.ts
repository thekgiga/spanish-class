import { prisma } from "../lib/prisma.js";
import { createNotification } from "./notifications.js";

/**
 * Apply side-effects when a PENDING_CONFIRMATION booking is rejected (B3).
 * Decrements slot currentParticipants and updates slot status.
 * Creates an in-app notification for the student.
 * W1: If the booking was promoted from the waitlist, re-adds the student to the waitlist.
 */
export async function applyRejectionSideEffects(
  bookingStudentId: string,
  slotId: string,
  slotCurrentParticipants: number,
  slotMaxParticipants: number,
  slotTitle?: string,
  fromWaitlist?: boolean,
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

  // W1: If the rejected booking was promoted from the waitlist, re-add student to the end
  if (fromWaitlist) {
    const position = (await prisma.waitlistEntry.count({ where: { slotId } })) + 1;
    await prisma.waitlistEntry.upsert({
      where: { slotId_userId: { slotId, userId: bookingStudentId } },
      create: { slotId, userId: bookingStudentId, position },
      update: { position },
    });
  }

  await createNotification(
    bookingStudentId,
    "booking_rejected",
    "Booking request declined",
    fromWaitlist
      ? `Your waitlist booking for ${slotTitle || "Spanish Class"} was declined. You've been returned to the waitlist.`
      : `Your request for ${slotTitle || "Spanish Class"} was declined. You can book another slot.`,
    "/dashboard/book",
  );
}
