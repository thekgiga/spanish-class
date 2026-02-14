import { z } from "zod";

// Auth Schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    ),
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  timezone: z.string().default("Europe/Madrid"),
});

// Slot Schemas
export const slotTypeEnum = z.enum(["INDIVIDUAL", "GROUP"]);

export const createSlotSchema = z
  .object({
    startTime: z.string().datetime({ message: "Invalid start time format" }),
    endTime: z.string().datetime({ message: "Invalid end time format" }),
    slotType: slotTypeEnum.default("INDIVIDUAL"),
    maxParticipants: z.number().int().min(1).max(20).default(1),
    title: z.string().max(100).optional(),
    description: z.string().max(500).optional(),
    isPrivate: z.boolean().default(false),
    allowedStudentIds: z.array(z.string()).optional(),
    bookForStudentId: z.string().optional(), // Professor directly books for a student
  })
  .refine((data) => new Date(data.endTime) > new Date(data.startTime), {
    message: "End time must be after start time",
  })
  .refine(
    (data) =>
      !data.isPrivate ||
      (data.allowedStudentIds && data.allowedStudentIds.length > 0),
    { message: "Private slots must have at least one allowed student" },
  );

export const bulkCreateSlotSchema = z
  .object({
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
    daysOfWeek: z
      .array(z.number().int().min(0).max(6))
      .min(1, "Select at least one day"),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:mm)"),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:mm)"),
    slotType: slotTypeEnum.default("INDIVIDUAL"),
    maxParticipants: z.number().int().min(1).max(20).default(1),
    title: z.string().max(100).optional(),
    description: z.string().max(500).optional(),
    isPrivate: z.boolean().default(false),
    allowedStudentIds: z.array(z.string()).optional(),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: "End date must be on or after start date",
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "End time must be after start time",
  })
  .refine(
    (data) =>
      !data.isPrivate ||
      (data.allowedStudentIds && data.allowedStudentIds.length > 0),
    { message: "Private slots must have at least one allowed student" },
  );

// Recurring Pattern Schema
export const createRecurringPatternSchema = z
  .object({
    daysOfWeek: z
      .array(z.number().int().min(0).max(6))
      .min(1, "Select at least one day"),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:mm)"),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:mm)"),
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
      .optional()
      .nullable(),
    slotType: slotTypeEnum.default("INDIVIDUAL"),
    maxParticipants: z.number().int().min(1).max(20).default(1),
    title: z.string().max(100).optional(),
    description: z.string().max(500).optional(),
    isPrivate: z.boolean().default(false),
    allowedStudentIds: z.array(z.string()).optional(),
    generateWeeksAhead: z.number().int().min(1).max(12).default(4), // How many weeks to pre-generate
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "End time must be after start time",
  })
  .refine(
    (data) =>
      !data.isPrivate ||
      (data.allowedStudentIds && data.allowedStudentIds.length > 0),
    { message: "Private slots must have at least one allowed student" },
  );

// Professor direct booking for student
export const professorBookStudentSchema = z.object({
  slotId: z.string().min(1, "Slot ID is required"),
  studentId: z.string().min(1, "Student ID is required"),
  sendInvitation: z.boolean().default(true),
});

export const updateSlotSchema = z
  .object({
    startTime: z.string().datetime().optional(),
    endTime: z.string().datetime().optional(),
    slotType: slotTypeEnum.optional(),
    maxParticipants: z.number().int().min(1).max(20).optional(),
    title: z.string().max(100).optional().nullable(),
    description: z.string().max(500).optional().nullable(),
    status: z
      .enum([
        "AVAILABLE",
        "FULLY_BOOKED",
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELLED",
      ])
      .optional(),
  })
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        return new Date(data.endTime) > new Date(data.startTime);
      }
      return true;
    },
    { message: "End time must be after start time" },
  );

// Booking Schemas
export const createBookingSchema = z.object({
  slotId: z.string().min(1, "Slot ID is required"),
});

export const cancelBookingSchema = z.object({
  reason: z.string().max(500).optional(),
});

// Note Schemas
export const createNoteSchema = z.object({
  content: z.string().min(1, "Note content is required").max(5000),
});

export const updateNoteSchema = z.object({
  content: z.string().min(1, "Note content is required").max(5000),
});

// Student Profile Enums
export const spanishLevelEnum = z.enum([
  "BEGINNER",
  "ELEMENTARY",
  "INTERMEDIATE",
  "UPPER_INTERMEDIATE",
  "ADVANCED",
  "NATIVE",
]);

export const SpanishLevelValues = spanishLevelEnum.enum;

export const classTypeEnum = z.enum([
  "PRIVATE_LESSONS",
  "GROUP_CLASSES",
  "CONVERSATION_PRACTICE",
  "EXAM_PREPARATION",
  "BUSINESS_SPANISH",
  "GRAMMAR_FOCUS",
  "PRONUNCIATION",
  "WRITING_SKILLS",
]);

export const ClassTypeValues = classTypeEnum.enum;

// User Schemas
export const updateUserSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  timezone: z.string().optional(),
});

// Student Profile Schema (US-16, US-17, US-18)
export const updateStudentProfileSchema = z.object({
  // Personal details (US-18)
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
    .optional()
    .nullable(),
  phoneNumber: z.string().max(20).optional().nullable(),
  aboutMe: z.string().max(1000).optional().nullable(),

  // Learning preferences (US-17)
  spanishLevel: spanishLevelEnum.optional().nullable(),
  preferredClassTypes: z.array(classTypeEnum).optional().nullable(),
  learningGoals: z.string().max(2000).optional().nullable(),
  availabilityNotes: z.string().max(1000).optional().nullable(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Query Schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const slotsQuerySchema = paginationSchema.extend({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  status: z
    .enum([
      "AVAILABLE",
      "FULLY_BOOKED",
      "IN_PROGRESS",
      "COMPLETED",
      "CANCELLED",
    ])
    .optional(),
  slotType: slotTypeEnum.optional(),
});

export const bookingsQuerySchema = paginationSchema.extend({
  status: z
    .enum([
      "CONFIRMED",
      "CANCELLED_BY_STUDENT",
      "CANCELLED_BY_PROFESSOR",
      "COMPLETED",
      "NO_SHOW",
    ])
    .optional(),
  upcoming: z.coerce.boolean().optional(),
});

// Type exports from schemas
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateSlotInput = z.infer<typeof createSlotSchema>;
export type BulkCreateSlotInput = z.infer<typeof bulkCreateSlotSchema>;
export type UpdateSlotInput = z.infer<typeof updateSlotSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type SlotsQueryInput = z.infer<typeof slotsQuerySchema>;
export type BookingsQueryInput = z.infer<typeof bookingsQuerySchema>;
export type CreateRecurringPatternInput = z.infer<
  typeof createRecurringPatternSchema
>;
export type ProfessorBookStudentInput = z.infer<
  typeof professorBookStudentSchema
>;
export type UpdateStudentProfileInput = z.infer<
  typeof updateStudentProfileSchema
>;

// Export enum types for frontend use
export type SpanishLevel = z.infer<typeof spanishLevelEnum>;
export type ClassType = z.infer<typeof classTypeEnum>;

// Private Invitation Schemas
export const createPrivateInvitationSchema = z
  .object({
    studentId: z.string().min(1, "Student ID is required"),
    startTime: z.string().datetime({ message: "Invalid start time format" }),
    endTime: z.string().datetime({ message: "Invalid end time format" }),
    title: z.string().max(100).optional(),
    description: z.string().max(500).optional(),
  })
  .refine((data) => new Date(data.endTime) > new Date(data.startTime), {
    message: "End time must be after start time",
  })
  .refine(
    (data) => {
      const duration =
        (new Date(data.endTime).getTime() -
          new Date(data.startTime).getTime()) /
        (1000 * 60);
      return duration >= 15 && duration <= 180;
    },
    { message: "Duration must be between 15 minutes and 3 hours" },
  );

export const cancelPrivateInvitationSchema = z.object({
  reason: z.string().max(500).optional(),
});

export type CreatePrivateInvitationInput = z.infer<
  typeof createPrivateInvitationSchema
>;
export type CancelPrivateInvitationInput = z.infer<
  typeof cancelPrivateInvitationSchema
>;
