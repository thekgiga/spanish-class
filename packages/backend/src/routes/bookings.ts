import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../middleware/error.js";
import { validateConfirmationToken, markTokenAsUsed } from "../services/confirmation-token.js";
import {
  sendBookingConfirmedToStudent,
  sendBookingRejectionToStudent,
} from "../services/email.js";
import type { AvailabilitySlot, UserPublic } from "@spanish-class/shared";

const router = Router();

/**
 * POST /api/bookings/confirm-booking (T043)
 * Confirm a booking using a confirmation token (professor only)
 */
router.post("/confirm-booking", async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      throw new AppError(400, "Confirmation token is required");
    }

    // Validate token and check if it's been used
    const payload = await validateConfirmationToken(token);

    // Get the booking
    const booking = await prisma.booking.findUnique({
      where: { id: payload.bookingId },
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
      throw new AppError(404, "Booking not found");
    }

    // Verify the booking status
    if (booking.status !== "PENDING_CONFIRMATION") {
      throw new AppError(400, "This booking cannot be confirmed");
    }

    // Check if token has expired
    if (booking.confirmationExpiresAt && booking.confirmationExpiresAt < new Date()) {
      throw new AppError(400, "Confirmation token has expired");
    }

    // Update booking status to CONFIRMED
    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: "CONFIRMED",
        confirmedAt: new Date(),
      },
    });

    // Mark token as used to prevent replay attacks
    await markTokenAsUsed(payload.jti, booking.id);

    // Get pricing for this student if it exists
    const pricing = await prisma.studentPricing.findUnique({
      where: {
        professorId_studentId: {
          professorId: booking.slot.professorId,
          studentId: booking.studentId,
        },
      },
    });

    // Send confirmation email to student
    const slotForEmail = booking.slot as unknown as AvailabilitySlot;
    await sendBookingConfirmedToStudent({
      slot: slotForEmail,
      professor: booking.slot.professor,
      student: booking.student,
      price: pricing?.priceRSD,
    });

    res.json({
      success: true,
      message: "Booking confirmed successfully",
      data: { booking: updatedBooking },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/bookings/reject-booking (T044)
 * Reject a booking using a confirmation token (professor only)
 */
router.post("/reject-booking", async (req, res, next) => {
  try {
    const { token, reason } = req.body;

    if (!token) {
      throw new AppError(400, "Confirmation token is required");
    }

    // Validate token and check if it's been used
    const payload = await validateConfirmationToken(token);

    // Get the booking
    const booking = await prisma.booking.findUnique({
      where: { id: payload.bookingId },
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
      throw new AppError(404, "Booking not found");
    }

    // Verify the booking status
    if (booking.status !== "PENDING_CONFIRMATION") {
      throw new AppError(400, "This booking cannot be rejected");
    }

    // Check if token has expired
    if (booking.confirmationExpiresAt && booking.confirmationExpiresAt < new Date()) {
      throw new AppError(400, "Confirmation token has expired");
    }

    // Update booking status to REJECTED
    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: "REJECTED",
        rejectedAt: new Date(),
        cancelReason: reason,
      },
    });

    // Mark token as used to prevent replay attacks
    await markTokenAsUsed(payload.jti, booking.id);

    // Send rejection email to student
    const slotForEmail = booking.slot as unknown as AvailabilitySlot;
    await sendBookingRejectionToStudent({
      slot: slotForEmail,
      professor: booking.slot.professor,
      student: booking.student,
      reason,
    });

    res.json({
      success: true,
      message: "Booking rejected successfully",
      data: { booking: updatedBooking },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
