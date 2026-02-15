import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authenticate, requireStudent } from "../middleware/auth.js";
import { validate, validateQuery } from "../middleware/validate.js";
import {
  createBookingSchema,
  cancelBookingSchema,
  slotsQuerySchema,
  bookingsQuerySchema,
  updateStudentProfileSchema,
} from "@spanish-class/shared";
import { AppError } from "../middleware/error.js";
import { bookSlot, cancelBooking } from "../services/booking.js";
import {
  validateMeetingAccess,
  getMeetingDetails,
} from "../services/meeting-access.js";
import { calculateProfileCompletion } from "../services/profile-completion.js";
import type { Router as ExpressRouter } from "express";

const router: ExpressRouter = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/student/professor - Get professor contact info
router.get("/professor", async (req, res, next) => {
  try {
    const professor = await prisma.user.findFirst({
      where: { isAdmin: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    if (!professor) {
      throw new AppError(404, "Professor not found");
    }

    res.json({
      success: true,
      data: { professor },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/student/dashboard
router.get("/dashboard", async (req, res, next) => {
  try {
    const now = new Date();

    const [upcomingBookings, completedSessions, nextSession] =
      await Promise.all([
        prisma.booking.count({
          where: {
            studentId: req.user!.id,
            status: { in: ["CONFIRMED", "PENDING_CONFIRMATION"] },
            slot: {
              startTime: { gte: now },
            },
          },
        }),
        prisma.booking.count({
          where: {
            studentId: req.user!.id,
            status: "COMPLETED",
          },
        }),
        prisma.booking.findFirst({
          where: {
            studentId: req.user!.id,
            status: { in: ["CONFIRMED", "PENDING_CONFIRMATION"] },
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
              startTime: "asc",
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
router.get(
  "/slots",
  validateQuery(slotsQuerySchema),
  async (req, res, next) => {
    try {
      const { page, limit, startDate, endDate, slotType, forMeOnly } =
        req.query as unknown as {
          page: number;
          limit: number;
          startDate?: string;
          endDate?: string;
          slotType?: string;
          forMeOnly?: string;
        };

      const now = new Date();

      // Build where clause based on forMeOnly filter
      // forMeOnly=true: Only show private slots specifically assigned to this student
      // forMeOnly=false/undefined: Show public slots OR private slots assigned to this student
      const where: Record<string, unknown> = {
        status: "AVAILABLE",
        startTime: { gte: startDate ? new Date(startDate) : now },
        ...(forMeOnly === "true"
          ? {
              // Only private slots assigned to this student
              isPrivate: true,
              allowedStudents: {
                some: { studentId: req.user!.id },
              },
            }
          : {
              // Public slots OR private slots assigned to this student
              OR: [
                { isPrivate: false },
                {
                  isPrivate: true,
                  allowedStudents: {
                    some: { studentId: req.user!.id },
                  },
                },
              ],
            }),
      };

      if (endDate) {
        where.startTime = {
          ...((where.startTime as object) || {}),
          lte: new Date(endDate),
        };
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
                status: { in: ["CONFIRMED", "PENDING_CONFIRMATION"] },
              },
              select: {
                id: true,
              },
            },
          },
          orderBy: { startTime: "asc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.availabilitySlot.count({ where }),
      ]);

      // Add isBooked flag
      const slotsWithBookedFlag = slots.map((slot: (typeof slots)[number]) => ({
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
  },
);

// POST /api/student/bookings
router.post(
  "/bookings",
  validate(createBookingSchema),
  async (req, res, next) => {
    try {
      const result = await bookSlot(req.body.slotId, req.user!);

      res.status(201).json({
        success: true,
        data: result,
        message: "Booking confirmed! Check your email for details.",
      });
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/student/bookings
router.get(
  "/bookings",
  validateQuery(bookingsQuerySchema),
  async (req, res, next) => {
    try {
      const { page, limit, status, upcoming } = req.query as unknown as {
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
        where.status = "CONFIRMED";
        where.slot = {
          startTime: { gte: now },
        };
      }

      const [bookings, total] = await Promise.all([
        prisma.booking.findMany({
          where,
          include: {
            slot: {
              select: {
                id: true,
                professorId: true,
                startTime: true,
                endTime: true,
                slotType: true,
                maxParticipants: true,
                currentParticipants: true,
                status: true,
                title: true,
                description: true,
                isPrivate: true,
                meetLink: true,
                createdAt: true,
                updatedAt: true,
                recurringPatternId: true,
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
                startTime: "asc",
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
  },
);

// GET /api/student/bookings/:id
router.get("/bookings/:id", async (req, res, next) => {
  try {
    const booking = await prisma.booking.findFirst({
      where: {
        id: req.params.id,
        studentId: req.user!.id,
      },
      include: {
        slot: {
          select: {
            id: true,
            professorId: true,
            startTime: true,
            endTime: true,
            slotType: true,
            maxParticipants: true,
            currentParticipants: true,
            status: true,
            title: true,
            description: true,
            isPrivate: true,
            meetLink: true,
            createdAt: true,
            updatedAt: true,
            recurringPatternId: true,
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
      throw new AppError(404, "Booking not found");
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
router.post(
  "/bookings/:id/cancel",
  validate(cancelBookingSchema),
  async (req, res, next) => {
    try {
      await cancelBooking(req.params.id, req.user!, req.body.reason);

      res.json({
        success: true,
        message: "Booking cancelled successfully",
      });
    } catch (error) {
      next(error);
    }
  },
);

// POST /api/student/slots/:id/join - Join a meeting
router.post("/slots/:id/join", async (req, res, next) => {
  try {
    const result = await validateMeetingAccess(req.params.id, req.user!);

    res.json({
      success: true,
      data: result,
      message: "Access granted",
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/student/slots/:id/meeting - Get meeting details
router.get("/slots/:id/meeting", async (req, res, next) => {
  try {
    const details = await getMeetingDetails(req.params.id, req.user!);

    res.json({
      success: true,
      data: details,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/student/profile - Get student profile with completion indicator (US-16)
router.get("/profile", async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        timezone: true,
        languagePreference: true,
        dateOfBirth: true,
        phoneNumber: true,
        aboutMe: true,
        spanishLevel: true,
        preferredClassTypes: true,
        learningGoals: true,
        availabilityNotes: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError(404, "User not found");
    }

    // Parse preferredClassTypes from JSON string to array
    const profile = {
      ...user,
      preferredClassTypes: user.preferredClassTypes
        ? JSON.parse(user.preferredClassTypes)
        : null,
    };

    const completion = calculateProfileCompletion(user);

    res.json({
      success: true,
      data: {
        profile,
        completion,
      },
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/student/profile - Update student profile (US-17, US-18)
router.put(
  "/profile",
  validate(updateStudentProfileSchema),
  async (req, res, next) => {
    try {
      const {
        dateOfBirth,
        phoneNumber,
        aboutMe,
        spanishLevel,
        preferredClassTypes,
        learningGoals,
        availabilityNotes,
      } = req.body;

      const updateData: Record<string, unknown> = {};

      if (dateOfBirth !== undefined) {
        updateData.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
      }
      if (phoneNumber !== undefined) {
        updateData.phoneNumber = phoneNumber;
      }
      if (aboutMe !== undefined) {
        updateData.aboutMe = aboutMe;
      }
      if (spanishLevel !== undefined) {
        updateData.spanishLevel = spanishLevel;
      }
      if (preferredClassTypes !== undefined) {
        updateData.preferredClassTypes = preferredClassTypes
          ? JSON.stringify(preferredClassTypes)
          : null;
      }
      if (learningGoals !== undefined) {
        updateData.learningGoals = learningGoals;
      }
      if (availabilityNotes !== undefined) {
        updateData.availabilityNotes = availabilityNotes;
      }

      const updatedUser = await prisma.user.update({
        where: { id: req.user!.id },
        data: updateData,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          timezone: true,
          languagePreference: true,
          dateOfBirth: true,
          phoneNumber: true,
          aboutMe: true,
          spanishLevel: true,
          preferredClassTypes: true,
          learningGoals: true,
          availabilityNotes: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Parse preferredClassTypes from JSON string to array
      const profile = {
        ...updatedUser,
        preferredClassTypes: updatedUser.preferredClassTypes
          ? JSON.parse(updatedUser.preferredClassTypes)
          : null,
      };

      const completion = calculateProfileCompletion(updatedUser);

      res.json({
        success: true,
        data: {
          profile,
          completion,
        },
        message: "Profile updated successfully",
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
