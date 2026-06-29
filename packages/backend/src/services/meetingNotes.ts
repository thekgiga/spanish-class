import { prisma } from "../lib/prisma.js";
import { AppError } from "../middleware/error.js";

export async function getMeetingNote(bookingId: string, professorId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { slot: { select: { professorId: true } } },
  });
  if (!booking) throw new AppError(404, "Booking not found");
  if (booking.slot.professorId !== professorId) throw new AppError(403, "Not your booking");

  return prisma.meetingNote.findUnique({ where: { bookingId } });
}

export async function upsertMeetingNote(
  bookingId: string,
  professorId: string,
  agendaNotes?: string,
  sessionNotes?: string,
) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { slot: { select: { professorId: true } } },
  });
  if (!booking) throw new AppError(404, "Booking not found");
  if (booking.slot.professorId !== professorId) throw new AppError(403, "Not your booking");

  return prisma.meetingNote.upsert({
    where: { bookingId },
    create: { bookingId, professorId, agendaNotes, sessionNotes },
    update: { agendaNotes, sessionNotes },
  });
}
