import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, requireStudent } from '../middleware/auth.js';
import { validate, validateQuery } from '../middleware/validate.js';
import {
  createBookingSchema,
  cancelBookingSchema,
  slotsQuerySchema,
  bookingsQuerySchema,
} from '@spanish-class/shared';
import { AppError } from '../middleware/error.js';
import { bookSlot, cancelBooking } from '../services/booking.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/student/dashboard
router.get('/dashboard', async (req, res, next) => {
  try {
    const now = new Date();

    const [upcomingBookings, completedSessions, nextSession] = await Promise.all([
      prisma.booking.count({
        where: {
          studentId: req.user!.id,
          status: 'CONFIRMED',
          slot: {
            startTime: { gte: now },
          },
        },
      }),
      prisma.booking.count({
        where: {
          studentId: req.user!.id,
          status: 'COMPLETED',
        },
      }),
      prisma.booking.findFirst({
        where: {
          studentId: req.user!.id,
          status: 'CONFIRMED',
          slot: {
            startTime: { gte: now },
          },
        },
        include: {
          slot: {
            include: {
              professor: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: {
          slot: {
            startTime: 'asc',
          },
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          upcomingBookings,
          completedSessions,
        },
        nextSession,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/student/slots - Browse available slots
router.get('/slots', validateQuery(slotsQuerySchema), async (req, res, next) => {
  try {
    const { page, limit, startDate, endDate, slotType } = req.query as {
      page: number;
      limit: number;
      startDate?: string;
      endDate?: string;
      slotType?: string;
    };

    const now = new Date();

    // Get slots that are either:
    // 1. Public (isPrivate = false)
    // 2. Private but the student is in the allowedStudents list
    const where: Record<string, unknown> = {
      status: 'AVAILABLE',
      startTime: { gte: startDate ? new Date(startDate) : now },
      OR: [
        { isPrivate: false },
        {
          isPrivate: true,
          allowedStudents: {
            some: { studentId: req.user!.id },
          },
        },
      ],
    };

    if (endDate) {
      where.startTime = { ...(where.startTime as object || {}), lte: new Date(endDate) };
    }
    if (slotType) {
      where.slotType = slotType;
    }

    const [slots, total] = await Promise.all([
      prisma.availabilitySlot.findMany({
        where,
        include: {
          professor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          bookings: {
            where: {
              studentId: req.user!.id,
              status: 'CONFIRMED',
            },
            select: {
              id: true,
            },
          },
        },
        orderBy: { startTime: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.availabilitySlot.count({ where }),
    ]);

    // Add isBooked flag
    const slotsWithBookedFlag = slots.map((slot) => ({
      ...slot,
      isBookedByMe: slot.bookings.length > 0,
      bookings: undefined, // Remove bookings from response
    }));

    res.json({
      success: true,
      data: slotsWithBookedFlag,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/student/bookings
router.post('/bookings', validate(createBookingSchema), async (req, res, next) => {
  try {
    const result = await bookSlot(req.body.slotId, req.user!);

    res.status(201).json({
      success: true,
      data: result,
      message: 'Booking confirmed! Check your email for details.',
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/student/bookings
router.get('/bookings', validateQuery(bookingsQuerySchema), async (req, res, next) => {
  try {
    const { page, limit, status, upcoming } = req.query as {
      page: number;
      limit: number;
      status?: string;
      upcoming?: boolean;
    };

    const now = new Date();

    const where: Record<string, unknown> = {
      studentId: req.user!.id,
    };

    if (status) {
      where.status = status;
    }
    if (upcoming) {
      where.status = 'CONFIRMED';
      where.slot = {
        startTime: { gte: now },
      };
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          slot: {
            include: {
              professor: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: [
          {
            slot: {
              startTime: 'asc',
            },
          },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    res.json({
      success: true,
      data: bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/student/bookings/:id
router.get('/bookings/:id', async (req, res, next) => {
  try {
    const booking = await prisma.booking.findFirst({
      where: {
        id: req.params.id,
        studentId: req.user!.id,
      },
      include: {
        slot: {
          include: {
            professor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!booking) {
      throw new AppError(404, 'Booking not found');
    }

    res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/student/bookings/:id/cancel
router.post('/bookings/:id/cancel', validate(cancelBookingSchema), async (req, res, next) => {
  try {
    await cancelBooking(req.params.id, req.user!, req.body.reason);

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
