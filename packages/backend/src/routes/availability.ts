import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../middleware/error.js";

const router = Router();

/**
 * GET /api/availability/:slotId/participants (T078)
 * Get list of participants for a group class
 */
router.get("/:slotId/participants", authenticate, async (req, res, next) => {
  try {
    const { slotId } = req.params;

    const slot = await prisma.availabilitySlot.findUnique({
      where: { id: slotId },
      include: {
        bookings: {
          where: {
            status: { in: ["CONFIRMED", "PENDING_CONFIRMATION"] },
          },
          include: {
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
        },
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
    });

    if (!slot) {
      throw new AppError(404, "Slot not found");
    }

    // Check authorization - only professor or participants can view
    const userId = req.user!.id;
    const isProfessor = slot.professorId === userId;
    const isParticipant = slot.bookings.some((b) => b.studentId === userId);

    if (!isProfessor && !isParticipant && !req.user!.isAdmin) {
      throw new AppError(403, "You are not authorized to view this slot's participants");
    }

    const participants = slot.bookings.map((booking) => ({
      bookingId: booking.id,
      status: booking.status,
      student: booking.student,
      bookedAt: booking.bookedAt,
    }));

    res.json({
      success: true,
      data: {
        slotId: slot.id,
        slotType: slot.slotType,
        maxParticipants: slot.maxParticipants,
        currentParticipants: slot.currentParticipants,
        participants,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
