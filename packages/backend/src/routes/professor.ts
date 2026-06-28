import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import { validate, validateQuery } from "../middleware/validate.js";
import { autoAudit } from "../middleware/auditLog.js";
import {
  createSlotSchema,
  bulkCreateSlotSchema,
  updateSlotSchema,
  createNoteSchema,
  slotsQuerySchema,
  paginationSchema,
  createRecurringPatternSchema,
  professorBookStudentSchema,
  createPrivateInvitationSchema,
  cancelPrivateInvitationSchema,
  cancelSlotWithBookingsSchema,
  upsertMeetingNoteSchema,
} from "@spanish-class/shared";
import { AppError } from "../middleware/error.js";
import {
  createMeetingRoom,
  getMeetingProvider,
} from "../services/meeting-provider.js";
import {
  sendBookingConfirmation,
  sendCancellationToStudent,
  sendBookingConfirmedToStudent,
  sendBookingRejectionToStudent,
} from "../services/email.js";
import {
  validateMeetingAccess,
  getMeetingDetails,
} from "../services/meeting-access.js";
import {
  createPrivateInvitation,
  listPrivateInvitations,
  cancelPrivateInvitation,
} from "../services/private-invitation.js";
import type { Router as ExpressRouter } from "express";
import type { AvailabilitySlot, UserPublic } from "@spanish-class/shared";
import { createNotification } from "../services/notifications.js";
import { applyRejectionSideEffects } from "../services/bookingRejection.js";
import {
  createStudentInvitation,
  assignStudent,
  unassignStudent,
  createCover,
  deleteCover,
  listPendingInvitations,
} from "../services/studentInvitation.js";
import {
  sendStudentInvitationEmail,
} from "../services/email.js";
import {
  inviteStudentSchema,
  assignStudentSchema,
  createCoverSchema,
  updateRecurringPatternSchema,
} from "@spanish-class/shared";
import { getMeetingNote, upsertMeetingNote } from "../services/meetingNotes.js";

const router: ExpressRouter = Router();

// All routes require authentication and admin access
router.use(authenticate, requireAdmin);
// Auto-audit all mutating admin requests (POST/PUT/PATCH/DELETE)
router.use(autoAudit("professor"));

// Debug endpoint removed - Google Calendar integration removed in favor of Jitsi-only approach

// GET /api/professor/dashboard
router.get("/dashboard", async (req, res, next) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    const [
      totalStudents,
      totalBookings,
      upcomingSlots,
      todaySessions,
      completedThisMonth,
    ] = await Promise.all([
      prisma.user.count({ where: { isAdmin: false } }),
      prisma.booking.count({ where: { status: "CONFIRMED" } }),
      prisma.availabilitySlot.count({
        where: {
          startTime: { gte: new Date() },
          status: { in: ["AVAILABLE", "FULLY_BOOKED"] },
        },
      }),
      prisma.availabilitySlot.count({
        where: {
          startTime: { gte: startOfDay, lte: endOfDay },
          status: { in: ["AVAILABLE", "FULLY_BOOKED", "IN_PROGRESS"] },
        },
      }),
      prisma.booking.count({
        where: {
          status: "COMPLETED",
          slot: {
            endTime: { gte: startOfMonth, lte: endOfMonth },
          },
        },
      }),
    ]);

    // Get today's sessions with details
    const todaysSlots = await prisma.availabilitySlot.findMany({
      where: {
        startTime: { gte: startOfDay, lte: endOfDay },
      },
      include: {
        bookings: {
          where: { status: { in: ["CONFIRMED", "PENDING_CONFIRMATION"] } },
          include: {
            student: {
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
      orderBy: { startTime: "asc" },
    });

    res.json({
      success: true,
      data: {
        stats: {
          totalStudents,
          totalBookings,
          upcomingSlots,
          todaySessions,
          completedThisMonth,
        },
        todaysSlots,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/professor/slots
router.get(
  "/slots",
  validateQuery(slotsQuerySchema),
  async (req, res, next) => {
    try {
      const { page, limit, startDate, endDate, status, slotType } =
        req.query as unknown as {
          page: number;
          limit: number;
          startDate?: string;
          endDate?: string;
          status?: string;
          slotType?: string;
        };

      const where: Record<string, unknown> = {
        professorId: req.user!.id,
      };

      if (startDate) {
        where.startTime = {
          ...((where.startTime as object) || {}),
          gte: new Date(startDate),
        };
      }
      if (endDate) {
        where.startTime = {
          ...((where.startTime as object) || {}),
          lte: new Date(endDate),
        };
      }
      if (status) {
        where.status = status;
      }
      if (slotType) {
        where.slotType = slotType;
      }

      const [slots, total] = await Promise.all([
        prisma.availabilitySlot.findMany({
          where,
          include: {
            bookings: {
              where: { status: { in: ["CONFIRMED", "PENDING_CONFIRMATION"] } },
              include: {
                student: {
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
          orderBy: { startTime: "asc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.availabilitySlot.count({ where }),
      ]);

      res.json({
        success: true,
        data: slots,
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

// POST /api/professor/slots
router.post("/slots", validate(createSlotSchema), async (req, res, next) => {
  try {
    const {
      startTime,
      endTime,
      slotType,
      maxParticipants,
      title,
      description,
      isPrivate,
      allowedStudentIds,
      bookForStudentId,
    } = req.body;

    // Check for overlapping slots
    const overlap = await prisma.availabilitySlot.findFirst({
      where: {
        professorId: req.user!.id,
        status: { notIn: ["CANCELLED", "COMPLETED"] },
        OR: [
          {
            startTime: { lt: new Date(endTime) },
            endTime: { gt: new Date(startTime) },
          },
        ],
      },
    });

    if (overlap) {
      throw new AppError(400, "This time slot overlaps with an existing slot");
    }

    // Validate allowed students exist
    if (isPrivate && allowedStudentIds?.length) {
      const students = await prisma.user.findMany({
        where: { id: { in: allowedStudentIds }, isAdmin: false },
      });
      if (students.length !== allowedStudentIds.length) {
        throw new AppError(400, "One or more student IDs are invalid");
      }
    }

    // Validate bookForStudentId if provided
    if (bookForStudentId) {
      const student = await prisma.user.findFirst({
        where: { id: bookForStudentId, isAdmin: false },
      });
      if (!student) {
        throw new AppError(400, "Invalid student ID for direct booking");
      }
    }

    // Create slot with allowed students
    const slot = await prisma.availabilitySlot.create({
      data: {
        professorId: req.user!.id,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        slotType,
        maxParticipants: maxParticipants || 1,
        currentParticipants: bookForStudentId ? 1 : 0,
        status:
          bookForStudentId && slotType === "INDIVIDUAL"
            ? "FULLY_BOOKED"
            : "AVAILABLE",
        title,
        description,
        isPrivate: isPrivate || false,
        allowedStudents:
          isPrivate && allowedStudentIds?.length
            ? {
                create: allowedStudentIds.map((studentId: string) => ({
                  studentId,
                })),
              }
            : undefined,
      },
      include: {
        allowedStudents: {
          include: {
            student: {
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

    // Generate and store meeting room name using slot ID
    const meeting = createMeetingRoom(slot.id);
    await prisma.availabilitySlot.update({
      where: { id: slot.id },
      data: { meetLink: meeting.joinUrl },
    });

    // Update slot object with meeting room name for response
    slot.meetLink = meeting.joinUrl;

    // If direct booking, create the booking
    let booking = null;
    if (bookForStudentId) {
      booking = await prisma.booking.create({
        data: {
          slotId: slot.id,
          studentId: bookForStudentId,
          status: "CONFIRMED",
        },
        include: {
          student: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      });

      // Send invitation email to the student
      const student = await prisma.user.findUnique({
        where: { id: bookForStudentId },
      });
      if (student) {
        const meetingUrl = meeting.joinUrl;
        sendBookingConfirmation({
          studentEmail: student.email,
          studentName: `${student.firstName} ${student.lastName}`,
          professorName: `${req.user!.firstName} ${req.user!.lastName}`,
          slotTitle: title || "Spanish Class",
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          meetLink: meetingUrl,
        }).catch(console.error);
      }
    }

    res.status(201).json({
      success: true,
      data: { slot, booking },
      message: bookForStudentId
        ? "Slot created and student invited!"
        : "Slot created successfully!",
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/professor/slots/bulk
router.post(
  "/slots/bulk",
  validate(bulkCreateSlotSchema),
  async (req, res, next) => {
    try {
      const {
        startDate,
        endDate,
        daysOfWeek,
        startTime,
        endTime,
        slotType,
        maxParticipants,
        title,
        description,
        isPrivate,
        allowedStudentIds,
      } = req.body;

      const slots: Array<{
        startTime: Date;
        endTime: Date;
      }> = [];

      const start = new Date(startDate);
      const end = new Date(endDate);
      const [startHour, startMinute] = startTime.split(":").map(Number);
      const [endHour, endMinute] = endTime.split(":").map(Number);

      // Generate all dates
      const current = new Date(start);
      while (current <= end) {
        if (daysOfWeek.includes(current.getDay())) {
          const slotStart = new Date(current);
          slotStart.setHours(startHour, startMinute, 0, 0);

          const slotEnd = new Date(current);
          slotEnd.setHours(endHour, endMinute, 0, 0);

          slots.push({
            startTime: slotStart,
            endTime: slotEnd,
          });
        }
        current.setDate(current.getDate() + 1);
      }

      // S1: Check for overlaps per slot — skip overlapping ones instead of failing the whole batch
      const skippedDates: string[] = [];
      const slotsToCreate: Array<{ startTime: Date; endTime: Date }> = [];

      for (const s of slots) {
        const overlap = await prisma.availabilitySlot.findFirst({
          where: {
            professorId: req.user!.id,
            status: { notIn: ["CANCELLED", "COMPLETED"] },
            OR: [
              {
                startTime: { lt: s.endTime },
                endTime: { gt: s.startTime },
              },
            ],
          },
        });

        if (overlap) {
          skippedDates.push(s.startTime.toISOString().split("T")[0]);
        } else {
          slotsToCreate.push(s);
        }
      }

      // Create all non-overlapping slots
      const createdSlots = await Promise.all(
        slotsToCreate.map(async (s) => {
          const slot = await prisma.availabilitySlot.create({
            data: {
              professorId: req.user!.id,
              startTime: s.startTime,
              endTime: s.endTime,
              slotType,
              maxParticipants: maxParticipants || 1,
              title,
              description,
              isPrivate: isPrivate || false,
              allowedStudents:
                isPrivate && allowedStudentIds?.length
                  ? {
                      create: allowedStudentIds.map((studentId: string) => ({
                        studentId,
                      })),
                    }
                  : undefined,
            },
          });

          // Generate and store meeting room name
          const meeting = createMeetingRoom(slot.id);
          await prisma.availabilitySlot.update({
            where: { id: slot.id },
            data: { meetLink: meeting.joinUrl },
          });

          return { ...slot, meetLink: meeting.joinUrl };
        }),
      );

      res.status(201).json({
        success: true,
        data: createdSlots,
        skippedDates,
        message: skippedDates.length > 0
          ? `Created ${createdSlots.length} slot(s). Skipped ${skippedDates.length} date(s) due to overlap.`
          : `Created ${createdSlots.length} slot(s)`,
      });
    } catch (error) {
      next(error);
    }
  },
);

// POST /api/professor/recurring-patterns - Create recurring pattern
router.post(
  "/recurring-patterns",
  validate(createRecurringPatternSchema),
  async (req, res, next) => {
    try {
      const {
        daysOfWeek,
        startTime,
        endTime,
        startDate,
        endDate,
        slotType,
        maxParticipants,
        title,
        description,
        isPrivate,
        allowedStudentIds,
        generateWeeksAhead,
      } = req.body;

      // Create recurring pattern
      const pattern = await prisma.recurringPattern.create({
        data: {
          professorId: req.user!.id,
          title,
          description,
          slotType,
          maxParticipants: maxParticipants || 1,
          daysOfWeek: JSON.stringify(daysOfWeek),
          startTime,
          endTime,
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : null,
          isPrivate: isPrivate || false,
          allowedStudents:
            isPrivate && allowedStudentIds?.length
              ? {
                  create: allowedStudentIds.map((studentId: string) => ({
                    studentId,
                  })),
                }
              : undefined,
        },
      });

      // Generate slots for the next N weeks
      const slotsToCreate: Array<{ startTime: Date; endTime: Date }> = [];
      const [startHour, startMinute] = startTime.split(":").map(Number);
      const [endHour, endMinute] = endTime.split(":").map(Number);

      const patternStart = new Date(startDate);
      const patternEnd = endDate ? new Date(endDate) : new Date(patternStart);
      if (!endDate) {
        patternEnd.setDate(patternEnd.getDate() + generateWeeksAhead * 7);
      }

      const current = new Date(patternStart);
      while (current <= patternEnd) {
        if (daysOfWeek.includes(current.getDay())) {
          const slotStart = new Date(current);
          slotStart.setHours(startHour, startMinute, 0, 0);

          const slotEnd = new Date(current);
          slotEnd.setHours(endHour, endMinute, 0, 0);

          // Only create future slots
          if (slotStart > new Date()) {
            slotsToCreate.push({ startTime: slotStart, endTime: slotEnd });
          }
        }
        current.setDate(current.getDate() + 1);
      }

      // Filter out overlapping slots
      const nonOverlappingSlots = [];
      for (const s of slotsToCreate) {
        const overlap = await prisma.availabilitySlot.findFirst({
          where: {
            professorId: req.user!.id,
            status: { notIn: ["CANCELLED", "COMPLETED"] },
            startTime: { lt: s.endTime },
            endTime: { gt: s.startTime },
          },
        });
        if (!overlap) {
          nonOverlappingSlots.push(s);
        }
      }

      // Create slots
      const createdSlots = await Promise.all(
        nonOverlappingSlots.map(async (s) => {
          const slot = await prisma.availabilitySlot.create({
            data: {
              professorId: req.user!.id,
              recurringPatternId: pattern.id,
              startTime: s.startTime,
              endTime: s.endTime,
              slotType,
              maxParticipants: maxParticipants || 1,
              title,
              description,
              isPrivate: isPrivate || false,
              allowedStudents:
                isPrivate && allowedStudentIds?.length
                  ? {
                      create: allowedStudentIds.map((studentId: string) => ({
                        studentId,
                      })),
                    }
                  : undefined,
            },
          });

          // Generate and store meeting room name
          const meeting = createMeetingRoom(slot.id);
          await prisma.availabilitySlot.update({
            where: { id: slot.id },
            data: { meetLink: meeting.joinUrl },
          });

          return { ...slot, meetLink: meeting.joinUrl };
        }),
      );

      res.status(201).json({
        success: true,
        data: { pattern, slots: createdSlots },
        message: `Created recurring pattern with ${createdSlots.length} slots`,
      });
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/professor/recurring-patterns - List recurring patterns
router.get("/recurring-patterns", async (req, res, next) => {
  try {
    const patterns = await prisma.recurringPattern.findMany({
      where: { professorId: req.user!.id },
      include: {
        allowedStudents: {
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        _count: { select: { slots: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: patterns.map((p: (typeof patterns)[number]) => ({
        ...p,
        daysOfWeek: JSON.parse(p.daysOfWeek),
      })),
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/professor/recurring-patterns/:id - Delete recurring pattern
router.delete("/recurring-patterns/:id", async (req, res, next) => {
  try {
    const pattern = await prisma.recurringPattern.findFirst({
      where: { id: req.params.id, professorId: req.user!.id },
    });

    if (!pattern) {
      throw new AppError(404, "Recurring pattern not found");
    }

    // Cancel all future slots from this pattern
    const cancelledSlots = await prisma.availabilitySlot.findMany({
      where: {
        recurringPatternId: pattern.id,
        startTime: { gt: new Date() },
        status: "AVAILABLE",
      },
      select: { id: true },
    });
    const cancelledSlotIds = cancelledSlots.map((s) => s.id);

    await prisma.availabilitySlot.updateMany({
      where: { id: { in: cancelledSlotIds } },
      data: { status: "CANCELLED" },
    });

    // W2: Remove waitlist entries for all cancelled slots
    if (cancelledSlotIds.length > 0) {
      await prisma.waitlistEntry.deleteMany({ where: { slotId: { in: cancelledSlotIds } } });
    }

    // Deactivate the pattern
    await prisma.recurringPattern.update({
      where: { id: pattern.id },
      data: { isActive: false },
    });

    res.json({
      success: true,
      message: `Deactivated recurring pattern and cancelled ${cancelledSlotIds.length} future slots`,
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/professor/recurring-patterns/:id — S2: bulk-update title/description/maxParticipants for all future slots
router.patch(
  "/recurring-patterns/:id",
  validate(updateRecurringPatternSchema),
  async (req, res, next) => {
    try {
      const pattern = await prisma.recurringPattern.findFirst({
        where: { id: req.params.id, professorId: req.user!.id },
      });

      if (!pattern) throw new AppError(404, "Recurring pattern not found");

      const { title, description, maxParticipants } = req.body;

      // Update pattern metadata
      const updatedPattern = await prisma.recurringPattern.update({
        where: { id: pattern.id },
        data: {
          ...(title !== undefined ? { title } : {}),
          ...(description !== undefined ? { description } : {}),
          ...(maxParticipants !== undefined ? { maxParticipants } : {}),
        },
      });

      // Bulk-update all future AVAILABLE slots from this pattern
      const updateCount = await prisma.availabilitySlot.updateMany({
        where: {
          recurringPatternId: pattern.id,
          startTime: { gt: new Date() },
          status: "AVAILABLE",
        },
        data: {
          ...(title !== undefined ? { title } : {}),
          ...(description !== undefined ? { description } : {}),
          ...(maxParticipants !== undefined ? { maxParticipants } : {}),
        },
      });

      res.json({
        success: true,
        data: updatedPattern,
        message: `Updated pattern and ${updateCount.count} future slot(s)`,
      });
    } catch (error) {
      next(error);
    }
  },
);

// POST /api/professor/book-student - Professor directly books a student
router.post(
  "/book-student",
  validate(professorBookStudentSchema),
  async (req, res, next) => {
    try {
      const { slotId, studentId, sendInvitation } = req.body;

      // Verify slot exists and belongs to professor
      const slot = await prisma.availabilitySlot.findFirst({
        where: { id: slotId, professorId: req.user!.id },
      });

      if (!slot) {
        throw new AppError(404, "Slot not found");
      }

      if (slot.status === "FULLY_BOOKED") {
        throw new AppError(400, "This slot is fully booked");
      }

      if (slot.status === "CANCELLED" || slot.status === "COMPLETED") {
        throw new AppError(400, "This slot is no longer available");
      }

      // Verify student exists
      const student = await prisma.user.findFirst({
        where: { id: studentId, isAdmin: false },
      });

      if (!student) {
        throw new AppError(404, "Student not found");
      }

      // Check if already booked
      const existingBooking = await prisma.booking.findFirst({
        where: {
          slotId,
          studentId,
          status: { in: ["CONFIRMED", "PENDING_CONFIRMATION"] },
        },
      });

      if (existingBooking) {
        throw new AppError(400, "Student is already booked for this slot");
      }

      // Create booking
      const newParticipants = slot.currentParticipants + 1;
      const newStatus =
        newParticipants >= slot.maxParticipants ? "FULLY_BOOKED" : "AVAILABLE";

      const [booking] = await prisma.$transaction([
        prisma.booking.create({
          data: {
            slotId,
            studentId,
            status: "CONFIRMED",
          },
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            slot: true,
          },
        }),
        prisma.availabilitySlot.update({
          where: { id: slotId },
          data: {
            currentParticipants: newParticipants,
            status: newStatus,
          },
        }),
      ]);

      // Send invitation email
      if (sendInvitation && slot.meetLink) {
        const { getMeetingProvider } =
          await import("../services/meeting-provider.js");
        const provider = getMeetingProvider();
        const meetingUrl = provider.getJoinUrl(
          slot.meetLink,
          `${student.firstName} ${student.lastName}`,
        );

        sendBookingConfirmation({
          studentEmail: student.email,
          studentName: `${student.firstName} ${student.lastName}`,
          professorName: `${req.user!.firstName} ${req.user!.lastName}`,
          slotTitle: slot.title || "Spanish Class",
          startTime: slot.startTime,
          endTime: slot.endTime,
          meetLink: meetingUrl,
        }).catch(console.error);
      }

      // S6/S7: Create in-app notification for student (always, regardless of sendInvitation)
      createNotification(
        student.id,
        "booking_confirmed",
        "You've been booked into a class",
        `${req.user!.firstName} ${req.user!.lastName} has booked you into ${slot.title || "Spanish Class"}.`,
        "/dashboard/bookings",
      ).catch(console.error);

      res.status(201).json({
        success: true,
        data: booking,
        message: sendInvitation
          ? "Student booked and invitation sent!"
          : "Student booked successfully!",
      });
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/professor/slots/:id
router.get("/slots/:id", async (req, res, next) => {
  try {
    const slot = await prisma.availabilitySlot.findFirst({
      where: {
        id: req.params.id,
        professorId: req.user!.id,
      },
      include: {
        bookings: {
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                timezone: true,
              },
            },
          },
        },
      },
    });

    if (!slot) {
      throw new AppError(404, "Slot not found");
    }

    res.json({
      success: true,
      data: slot,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/professor/slots/:id
router.put("/slots/:id", validate(updateSlotSchema), async (req, res, next) => {
  try {
    const slot = await prisma.availabilitySlot.findFirst({
      where: {
        id: req.params.id,
        professorId: req.user!.id,
      },
    });

    if (!slot) {
      throw new AppError(404, "Slot not found");
    }

    // Check for overlaps if time is being changed
    if (req.body.startTime || req.body.endTime) {
      const newStart = req.body.startTime
        ? new Date(req.body.startTime)
        : slot.startTime;
      const newEnd = req.body.endTime
        ? new Date(req.body.endTime)
        : slot.endTime;

      const overlap = await prisma.availabilitySlot.findFirst({
        where: {
          id: { not: slot.id },
          professorId: req.user!.id,
          status: { notIn: ["CANCELLED", "COMPLETED"] },
          OR: [
            {
              startTime: { lt: newEnd },
              endTime: { gt: newStart },
            },
          ],
        },
      });

      if (overlap) {
        throw new AppError(
          400,
          "This time slot overlaps with an existing slot",
        );
      }
    }

    const updated = await prisma.availabilitySlot.update({
      where: { id: slot.id },
      data: {
        ...req.body,
        startTime: req.body.startTime
          ? new Date(req.body.startTime)
          : undefined,
        endTime: req.body.endTime ? new Date(req.body.endTime) : undefined,
      },
    });

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/professor/slots/:id
router.delete("/slots/:id", async (req, res, next) => {
  try {
    const slot = await prisma.availabilitySlot.findFirst({
      where: {
        id: req.params.id,
        professorId: req.user!.id,
      },
      include: {
        bookings: {
          where: { status: { in: ["CONFIRMED", "PENDING_CONFIRMATION"] } },
        },
      },
    });

    if (!slot) {
      throw new AppError(404, "Slot not found");
    }

    if (slot.bookings.length > 0) {
      throw new AppError(
        400,
        "Cannot delete a slot with active bookings. Cancel the bookings first.",
      );
    }

    await prisma.availabilitySlot.update({
      where: { id: slot.id },
      data: { status: "CANCELLED" },
    });

    // W2: Remove any waitlist entries (defensive — simple delete has no bookings but may have waitlist)
    await prisma.waitlistEntry.deleteMany({ where: { slotId: slot.id } });

    res.json({
      success: true,
      message: "Slot cancelled successfully",
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/professor/slots/:id/cancel-with-bookings
router.post("/slots/:id/cancel-with-bookings", validate(cancelSlotWithBookingsSchema), async (req, res, next) => {
  try {
    const { reason } = req.body;

    const slot = await prisma.availabilitySlot.findFirst({
      where: {
        id: req.params.id,
        professorId: req.user!.id,
      },
      include: {
        bookings: {
          where: { status: { in: ["CONFIRMED", "PENDING_CONFIRMATION"] } },
          select: {
            id: true,
            student: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                timezone: true,
              },
            },
          },
        },
      },
    });

    if (!slot) {
      throw new AppError(404, "Slot not found");
    }

    if (slot.status === "CANCELLED") {
      throw new AppError(400, "Slot is already cancelled");
    }

    const confirmedBookings = slot.bookings;

    // Cancel all bookings and slot in a transaction
    await prisma.$transaction([
      // Cancel all confirmed and pending bookings
      prisma.booking.updateMany({
        where: {
          slotId: slot.id,
          status: { in: ["CONFIRMED", "PENDING_CONFIRMATION"] },
        },
        data: {
          status: "CANCELLED_BY_PROFESSOR",
          cancelledAt: new Date(),
          cancelReason: reason || null,
        },
      }),
      // W2: Remove all waitlist entries for this slot
      prisma.waitlistEntry.deleteMany({ where: { slotId: slot.id } }),
      // Cancel the slot
      prisma.availabilitySlot.update({
        where: { id: slot.id },
        data: {
          status: "CANCELLED",
          currentParticipants: 0,
        },
      }),
    ]);

    // Send cancellation emails to all affected students
    const professor = req.user!;
    for (const booking of confirmedBookings) {
      sendCancellationToStudent({
        slot: slot as any,
        professor: professor as any,
        student: booking.student as any,
        reason,
        cancelledBy: "professor",
      }).catch((err) =>
        console.error(
          `Failed to send cancellation email to ${booking.student.email}:`,
          err,
        ),
      );
    }

    res.json({
      success: true,
      data: {
        cancelledBookingsCount: confirmedBookings.length,
      },
      message:
        confirmedBookings.length > 0
          ? `Slot cancelled and ${confirmedBookings.length} student(s) notified`
          : "Slot cancelled successfully",
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/professor/students
router.get(
  "/students",
  validateQuery(paginationSchema),
  async (req, res, next) => {
    try {
      const { page, limit } = req.query as unknown as {
        page: number;
        limit: number;
      };

      const professorId = req.user!.id;

      const [assignments, total] = await Promise.all([
        prisma.professorStudent.findMany({
          where: { professorId },
          include: {
            student: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                timezone: true,
                createdAt: true,
                _count: {
                  select: {
                    bookings: {
                      where: {
                        status: { in: ["CONFIRMED", "PENDING_CONFIRMATION"] },
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.professorStudent.count({ where: { professorId } }),
      ]);

      const students = assignments.map((a) => ({
        ...a.student,
        assignmentId: a.id,
      }));

      res.json({
        success: true,
        data: students,
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

// GET /api/professor/students/:id - includes student profile (US-19)
router.get("/students/:id", async (req, res, next) => {
  try {
    const student = await prisma.user.findFirst({
      where: {
        id: req.params.id,
        isAdmin: false,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        timezone: true,
        createdAt: true,
        // Student profile fields (US-19) - not yet implemented in schema
        // dateOfBirth: true,
        // phoneNumber: true,
        // aboutMe: true,
        // spanishLevel: true,
        // preferredClassTypes: true,
        // learningGoals: true,
        // availabilityNotes: true,
        bookings: {
          include: {
            slot: {
              select: {
                id: true,
                title: true,
                startTime: true,
                endTime: true,
                slotType: true,
              },
            },
          },
          orderBy: { bookedAt: "desc" },
        },
      },
    });

    if (!student) {
      throw new AppError(404, "Student not found");
    }

    // Get notes for this student
    const notes = await prisma.studentNote.findMany({
      where: {
        studentId: student.id,
        professorId: req.user!.id,
      },
      orderBy: { createdAt: "desc" },
    });

    // Note: preferredClassTypes field not yet in schema
    // Parse preferredClassTypes from JSON string to array
    const profile = {
      ...student,
      // preferredClassTypes: student.preferredClassTypes
      //   ? JSON.parse(student.preferredClassTypes)
      //   : null,
    };

    res.json({
      success: true,
      data: {
        ...profile,
        notes,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/professor/students/:id/notes
router.get("/students/:id/notes", async (req, res, next) => {
  try {
    const notes = await prisma.studentNote.findMany({
      where: {
        studentId: req.params.id,
        professorId: req.user!.id,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: notes,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/professor/students/:id/notes
router.post(
  "/students/:id/notes",
  validate(createNoteSchema),
  async (req, res, next) => {
    try {
      // Verify student exists
      const student = await prisma.user.findFirst({
        where: {
          id: req.params.id,
          isAdmin: false,
        },
      });

      if (!student) {
        throw new AppError(404, "Student not found");
      }

      const note = await prisma.studentNote.create({
        data: {
          professorId: req.user!.id,
          studentId: req.params.id,
          content: req.body.content,
        },
      });

      res.status(201).json({
        success: true,
        data: note,
      });
    } catch (error) {
      next(error);
    }
  },
);

// PUT /api/professor/students/:studentId/notes/:noteId
router.put(
  "/students/:studentId/notes/:noteId",
  validate(createNoteSchema),
  async (req, res, next) => {
    try {
      const note = await prisma.studentNote.findFirst({
        where: {
          id: req.params.noteId,
          studentId: req.params.studentId,
          professorId: req.user!.id,
        },
      });

      if (!note) {
        throw new AppError(404, "Note not found");
      }

      const updated = await prisma.studentNote.update({
        where: { id: note.id },
        data: { content: req.body.content },
      });

      res.json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },
);

// DELETE /api/professor/students/:studentId/notes/:noteId
router.delete("/students/:studentId/notes/:noteId", async (req, res, next) => {
  try {
    const note = await prisma.studentNote.findFirst({
      where: {
        id: req.params.noteId,
        studentId: req.params.studentId,
        professorId: req.user!.id,
      },
    });

    if (!note) {
      throw new AppError(404, "Note not found");
    }

    await prisma.studentNote.delete({
      where: { id: note.id },
    });

    res.json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/professor/email-logs
router.get("/email-logs", async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const emailType = req.query.emailType as string | undefined;

    const where: Record<string, unknown> = {};
    if (emailType) {
      where.emailType = emailType;
    }

    const [logs, total] = await Promise.all([
      prisma.emailLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.emailLog.count({ where }),
    ]);

    res.json({
      success: true,
      data: logs,
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

// GET /api/professor/email-logs/:id
router.get("/email-logs/:id", async (req, res, next) => {
  try {
    const log = await prisma.emailLog.findUnique({
      where: { id: req.params.id },
    });

    if (!log) {
      throw new AppError(404, "Email log not found");
    }

    res.json({
      success: true,
      data: log,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/professor/slots/:id/join - Join a meeting
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

// GET /api/professor/slots/:id/meeting - Get meeting details
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

// T010, T011, T013: Private Invitation Routes

// POST /api/professor/private-invitations - Create private invitation
router.post(
  "/private-invitations",
  validate(createPrivateInvitationSchema),
  async (req, res, next) => {
    try {
      const { studentId, startTime, endTime, title, description } = req.body;

      const result = await createPrivateInvitation({
        professorId: req.user!.id,
        studentId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        title,
        description,
      });

      res.status(201).json({
        success: true,
        data: result,
        message: "Private invitation created and student notified!",
      });
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/professor/private-invitations - List private invitations
router.get("/private-invitations", async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const startDate = req.query.startDate
      ? new Date(req.query.startDate as string)
      : undefined;
    const endDate = req.query.endDate
      ? new Date(req.query.endDate as string)
      : undefined;

    const result = await listPrivateInvitations(req.user!.id, {
      startDate,
      endDate,
      page,
      limit,
    });

    res.json({
      success: true,
      data: result.invitations,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/professor/private-invitations/:id - Cancel private invitation
router.delete(
  "/private-invitations/:id",
  validate(cancelPrivateInvitationSchema),
  async (req, res, next) => {
    try {
      const { reason } = req.body;

      await cancelPrivateInvitation(req.params.id, req.user!.id, reason);

      res.json({
        success: true,
        message: "Private invitation cancelled successfully",
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * GET /api/professor/pending-bookings
 * Get all pending bookings awaiting professor approval
 */
router.get("/pending-bookings", async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const pendingBookings = await prisma.booking.findMany({
      where: {
        status: "PENDING_CONFIRMATION",
        confirmationExpiresAt: {
          gte: new Date(),
        },
        slot: {
          professorId: req.user!.id,
        },
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        slot: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
            title: true,
            slotType: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      skip: offset,
      take: limit,
    });

    const total = await prisma.booking.count({
      where: {
        status: "PENDING_CONFIRMATION",
        confirmationExpiresAt: {
          gte: new Date(),
        },
        slot: {
          professorId: req.user!.id,
        },
      },
    });

    res.json({
      success: true,
      data: pendingBookings,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/professor/bookings/:id/approve
 * Approve a pending booking (professor admin panel)
 */
router.post("/bookings/:id/approve", async (req, res, next) => {
  try {
    const bookingId = req.params.id;

    // Get the booking with slot details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        slot: {
          include: {
            professor: true,
          },
        },
        student: true,
      },
    });

    if (!booking) {
      throw new AppError(404, "Booking not found");
    }

    // Verify professor owns this booking's slot
    if (booking.slot.professorId !== req.user!.id) {
      throw new AppError(
        403,
        "You don't have permission to approve this booking",
      );
    }

    // Verify booking is pending
    if (booking.status !== "PENDING_CONFIRMATION") {
      throw new AppError(400, "This booking cannot be approved");
    }

    // Check if token has expired
    if (
      booking.confirmationExpiresAt &&
      booking.confirmationExpiresAt < new Date()
    ) {
      throw new AppError(400, "Booking confirmation has expired");
    }

    // Update booking to confirmed
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "CONFIRMED",
        confirmedAt: new Date(),
      },
      include: {
        slot: true,
        student: true,
      },
    });

    // Get pricing for email
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
    const studentForEmail = booking.student as unknown as UserPublic;
    const professorForEmail = booking.slot.professor as unknown as UserPublic;

    await sendBookingConfirmedToStudent({
      slot: slotForEmail,
      student: studentForEmail,
      professor: professorForEmail,
      price: pricing?.priceRSD,
    });

    // In-app notification to student
    createNotification(
      booking.studentId,
      "booking_confirmed",
      "Booking confirmed!",
      `${booking.slot.professor.firstName} confirmed your booking for ${booking.slot.title || "Spanish Class"}.`,
      "/dashboard/bookings",
    ).catch(() => {});

    res.json({
      success: true,
      data: updatedBooking,
      message: "Booking approved successfully",
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/professor/bookings/:id/reject
 * Reject a pending booking (professor admin panel)
 */
router.post("/bookings/:id/reject", async (req, res, next) => {
  try {
    const bookingId = req.params.id;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      throw new AppError(400, "Rejection reason is required");
    }

    // Get the booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        slot: {
          include: {
            professor: true,
          },
        },
        student: true,
      },
    });

    if (!booking) {
      throw new AppError(404, "Booking not found");
    }

    // Verify professor owns this booking's slot
    if (booking.slot.professorId !== req.user!.id) {
      throw new AppError(
        403,
        "You don't have permission to reject this booking",
      );
    }

    // Verify booking is pending
    if (booking.status !== "PENDING_CONFIRMATION") {
      throw new AppError(400, "This booking cannot be rejected");
    }

    // Update booking to rejected
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "REJECTED",
        rejectedAt: new Date(),
        cancelReason: reason,
      },
      include: {
        slot: true,
        student: true,
      },
    });

    // Send rejection email to student
    const slotForEmail = booking.slot as unknown as AvailabilitySlot;
    const studentForEmail = booking.student as unknown as UserPublic;
    const professorForEmail = booking.slot.professor as unknown as UserPublic;

    await sendBookingRejectionToStudent({
      slot: slotForEmail,
      student: studentForEmail,
      professor: professorForEmail,
      reason,
    });

    // B3: decrement slot participants and notify student (non-blocking)
    // W1: pass fromWaitlist so student is re-queued if their promoted booking was rejected
    applyRejectionSideEffects(
      booking.studentId,
      booking.slotId,
      booking.slot.currentParticipants,
      booking.slot.maxParticipants,
      booking.slot.title ?? undefined,
      booking.fromWaitlist,
    ).catch((err: unknown) => console.error("[professor/reject] side-effects failed:", err));

    res.json({
      success: true,
      data: updatedBooking,
      message: "Booking rejected successfully",
    });
  } catch (error) {
    next(error);
  }
});

// ── Professor settings ─────────────────────────────────────────────────────

// GET /api/professor/settings — return current settings (upsert defaults on first access)
router.get("/settings", async (req, res, next) => {
  try {
    const settings = await prisma.professorSettings.upsert({
      where: { userId: req.user!.id },
      update: {},
      create: { userId: req.user!.id },
    });
    res.json({ success: true, data: { settings } });
  } catch (error) {
    next(error);
  }
});

// PUT /api/professor/settings — update configurable fields
router.put("/settings", async (req, res, next) => {
  try {
    const { cancellationWindowHours, noShowThreshold } = req.body;

    const allowedWindows = [2, 4, 12, 24, 48];
    if (
      cancellationWindowHours !== undefined &&
      !allowedWindows.includes(Number(cancellationWindowHours))
    ) {
      res.status(400).json({
        success: false,
        error: `cancellationWindowHours must be one of: ${allowedWindows.join(", ")}`,
      });
      return;
    }

    if (
      noShowThreshold !== undefined &&
      (Number(noShowThreshold) < 1 || Number(noShowThreshold) > 10)
    ) {
      res.status(400).json({
        success: false,
        error: "noShowThreshold must be between 1 and 10",
      });
      return;
    }

    const settings = await prisma.professorSettings.upsert({
      where: { userId: req.user!.id },
      update: {
        ...(cancellationWindowHours !== undefined && {
          cancellationWindowHours: Number(cancellationWindowHours),
        }),
        ...(noShowThreshold !== undefined && {
          noShowThreshold: Number(noShowThreshold),
        }),
      },
      create: {
        userId: req.user!.id,
        ...(cancellationWindowHours !== undefined && {
          cancellationWindowHours: Number(cancellationWindowHours),
        }),
        ...(noShowThreshold !== undefined && {
          noShowThreshold: Number(noShowThreshold),
        }),
      },
    });

    res.json({ success: true, data: { settings } });
  } catch (error) {
    next(error);
  }
});

// ── No-show marking ────────────────────────────────────────────────────────

// POST /api/professor/bookings/:id/no-show — mark a confirmed past booking as no-show
router.post("/bookings/:id/no-show", async (req, res, next) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: {
        slot: true,
        student: {
          select: {
            id: true, email: true, firstName: true, lastName: true,
            isAdmin: true, timezone: true, createdAt: true, updatedAt: true,
          },
        },
      },
    });

    if (!booking) throw new AppError(404, "Booking not found");
    if (booking.slot.professorId !== req.user!.id) {
      throw new AppError(403, "You do not own this booking's slot");
    }
    if (booking.status !== "CONFIRMED") {
      throw new AppError(400, "Only confirmed bookings can be marked as no-show");
    }
    if (new Date(booking.slot.startTime) > new Date()) {
      throw new AppError(400, "Cannot mark no-show before the class has started");
    }

    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: "NO_SHOW" },
    });

    // Increment student engagement stats
    await prisma.studentEngagementStats.upsert({
      where: { studentId: booking.studentId },
      update: { noShowCount: { increment: 1 } },
      create: { studentId: booking.studentId, noShowCount: 1 },
    });

    // Increment professor daily stats for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await prisma.professorDailyStats.upsert({
      where: { professorId_date: { professorId: req.user!.id, date: today } },
      update: { noShowClasses: { increment: 1 } },
      create: { professorId: req.user!.id, date: today, noShowClasses: 1 },
    });

    // Get updated no-show count and threshold for the professor
    const [engagementStats, settings] = await Promise.all([
      prisma.studentEngagementStats.findUnique({
        where: { studentId: booking.studentId },
      }),
      prisma.professorSettings.findUnique({ where: { userId: req.user!.id } }),
    ]);

    const noShowCount = engagementStats?.noShowCount ?? 1;
    const threshold = settings?.noShowThreshold ?? 3;

    // Non-blocking email notification to student
    import("../services/email.js")
      .then(({ sendNoShowNotificationToStudent }) =>
        sendNoShowNotificationToStudent({
          student: booking.student,
          slot: booking.slot as any,
        }).catch((err: unknown) =>
          console.error("[no-show] Failed to send email:", err),
        ),
      )
      .catch(() => {});

    res.json({
      success: true,
      message: "Booking marked as no-show",
      data: {
        noShowCount,
        threshold,
        atThreshold: noShowCount >= threshold,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/professor/slots/:id/waitlist — view waitlist for a slot
router.get("/slots/:id/waitlist", async (req, res, next) => {
  try {
    const slot = await prisma.availabilitySlot.findUnique({
      where: { id: req.params.id },
      select: { professorId: true },
    });
    if (!slot || slot.professorId !== req.user!.id) {
      throw new AppError(404, "Slot not found");
    }
    const entries = await prisma.waitlistEntry.findMany({
      where: { slotId: req.params.id },
      orderBy: { position: "asc" },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true, createdAt: true },
        },
      },
    });
    res.json({ success: true, data: { waitlist: entries, count: entries.length } });
  } catch (error) {
    next(error);
  }
});

// ── Professor–Student Assignment Routes ──────────────────────────────────────

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// POST /api/professor/invite-student — invite an unregistered student by email
router.post("/invite-student", validate(inviteStudentSchema), async (req, res, next) => {
  try {
    const { email } = req.body;
    const professorId = req.user!.id;

    const result = await createStudentInvitation(professorId, email);

    if ("alreadyRegistered" in result) {
      // Student is already registered — assign directly
      await assignStudent(professorId, result.userId, false);
      res.json({ success: true, message: "Student assigned successfully (already registered)" });
      return;
    }

    const inviteLink = `${FRONTEND_URL}/api/auth/accept-invitation?token=${result.tokenRaw}`;
    await sendStudentInvitationEmail({
      email,
      professorFirstName: req.user!.firstName,
      professorLastName: req.user!.lastName,
      inviteLink,
      expiresAt: result.expiresAt,
    });

    res.json({ success: true, message: "Invitation sent successfully" });
  } catch (error) {
    next(error);
  }
});

// POST /api/professor/assign-student — assign a registered student directly
router.post("/assign-student", validate(assignStudentSchema), async (req, res, next) => {
  try {
    const { studentId, allowOverride } = req.body;
    const professorId = req.user!.id;

    // Verify student exists and is not admin
    const student = await prisma.user.findFirst({
      where: { id: studentId, isAdmin: false, deletedAt: null },
      select: { id: true },
    });
    if (!student) throw new AppError(404, "Student not found");

    await assignStudent(professorId, studentId, allowOverride);
    res.json({ success: true, message: "Student assigned successfully" });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/professor/students/:studentId — remove a student assignment
router.delete("/students/:studentId", async (req, res, next) => {
  try {
    await unassignStudent(req.user!.id, req.params.studentId);
    res.json({ success: true, message: "Student removed successfully" });
  } catch (error) {
    next(error);
  }
});

// POST /api/professor/covers — create cover period for students
router.post("/covers", validate(createCoverSchema), async (req, res, next) => {
  try {
    const { coverProfessorId, studentIds, applyToAllStudents, startsAt, endsAt } = req.body;
    const result = await createCover(
      req.user!.id,
      coverProfessorId,
      studentIds,
      applyToAllStudents,
      new Date(startsAt),
      new Date(endsAt),
    );
    res.json({ success: true, data: result, message: `Cover period created for ${result.count} student(s)` });
  } catch (error) {
    next(error);
  }
});

// GET /api/professor/covers — list cover periods for this professor's students
router.get("/covers", async (req, res, next) => {
  try {
    const professorId = req.user!.id;
    const covers = await prisma.studentCover.findMany({
      where: { student: { assignedProfessor: { professorId } } },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, email: true } },
        coverProfessor: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { startsAt: "desc" },
    });
    res.json({ success: true, data: covers });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/professor/covers/:coverId — delete a cover period
router.delete("/covers/:coverId", async (req, res, next) => {
  try {
    await deleteCover(req.params.coverId, req.user!.id);
    res.json({ success: true, message: "Cover period deleted" });
  } catch (error) {
    next(error);
  }
});

// GET /api/professor/pending-invitations — list pending student invitations
router.get("/pending-invitations", async (req, res, next) => {
  try {
    const invitations = await listPendingInvitations(req.user!.id);
    res.json({ success: true, data: invitations });
  } catch (error) {
    next(error);
  }
});

// GET /api/professor/bookings/:id/meeting-notes — get meeting notes for a booking (M2)
router.get("/bookings/:id/meeting-notes", async (req, res, next) => {
  try {
    const note = await getMeetingNote(req.params.id, req.user!.id);
    res.json({ success: true, data: note });
  } catch (error) {
    next(error);
  }
});

// PUT /api/professor/bookings/:id/meeting-notes — create or update meeting notes (M2)
router.put(
  "/bookings/:id/meeting-notes",
  validate(upsertMeetingNoteSchema),
  async (req, res, next) => {
    try {
      const { agendaNotes, sessionNotes } = req.body;
      const note = await upsertMeetingNote(
        req.params.id,
        req.user!.id,
        agendaNotes,
        sessionNotes,
      );
      res.json({ success: true, data: note });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
