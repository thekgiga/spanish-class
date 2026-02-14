// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithPassword extends User {
  passwordHash: string;
}

export type UserPublic = Omit<User, "passwordHash"> & {
  dateOfBirth?: string | null;
  phoneNumber?: string | null;
  aboutMe?: string | null;
  spanishLevel?: string | null;
  preferredClassTypes?: string[] | null;
  learningGoals?: string | null;
  availabilityNotes?: string | null;
};

// Slot Types
export enum SlotType {
  INDIVIDUAL = "INDIVIDUAL",
  GROUP = "GROUP",
}

export enum SlotStatus {
  AVAILABLE = "AVAILABLE",
  FULLY_BOOKED = "FULLY_BOOKED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export interface AvailabilitySlot {
  id: string;
  professorId: string;
  startTime: Date;
  endTime: Date;
  slotType: SlotType;
  maxParticipants: number;
  currentParticipants: number;
  status: SlotStatus;
  title?: string | null;
  description?: string | null;
  meetLink?: string | null;
  isPrivate: boolean;
  recurringPatternId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecurringPattern {
  id: string;
  professorId: string;
  title?: string | null;
  description?: string | null;
  slotType: SlotType;
  maxParticipants: number;
  daysOfWeek: number[]; // 0=Sunday, 1=Monday, etc.
  startTime: string; // "10:00" format
  endTime: string; // "11:00" format
  startDate: Date;
  endDate?: Date | null;
  isPrivate: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecurringPatternWithSlots extends RecurringPattern {
  slots: AvailabilitySlot[];
  allowedStudents?: UserPublic[];
}

export interface AvailabilitySlotWithProfessor extends AvailabilitySlot {
  professor: UserPublic;
}

export interface AvailabilitySlotWithBookings extends AvailabilitySlot {
  bookings: BookingWithStudent[];
}

// Booking Types
export enum BookingStatus {
  CONFIRMED = "CONFIRMED",
  CANCELLED_BY_STUDENT = "CANCELLED_BY_STUDENT",
  CANCELLED_BY_PROFESSOR = "CANCELLED_BY_PROFESSOR",
  COMPLETED = "COMPLETED",
  NO_SHOW = "NO_SHOW",
  PENDING_CONFIRMATION = "PENDING_CONFIRMATION",
  REJECTED = "REJECTED",
  EXPIRED = "EXPIRED",
}

export interface Booking {
  id: string;
  slotId: string;
  studentId: string;
  status: BookingStatus;
  bookedAt: Date;
  cancelledAt?: Date | null;
  cancelReason?: string | null;
  confirmedAt?: Date | null;
  rejectedAt?: Date | null;
  confirmationToken?: string | null;
  confirmationExpiresAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingWithSlot extends Booking {
  slot: AvailabilitySlotWithProfessor;
}

export interface BookingWithStudent extends Booking {
  student: UserPublic;
}

export interface BookingFull extends Booking {
  slot: AvailabilitySlotWithProfessor;
  student: UserPublic;
}

// Student Note Types
export interface StudentNote {
  id: string;
  professorId: string;
  studentId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentNoteWithProfessor extends StudentNote {
  professor: UserPublic;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  timezone?: string;
}

export interface AuthResponse {
  user: UserPublic;
  token: string;
}

// Dashboard Stats
export interface ProfessorDashboardStats {
  totalStudents: number;
  totalBookings: number;
  upcomingSlots: number;
  todaySessions: number;
  completedThisMonth: number;
}

export interface StudentDashboardStats {
  upcomingBookings: number;
  completedSessions: number;
  nextSession?: BookingWithSlot | null;
}

// Private Invitation Types
export interface PrivateInvitation {
  slotId: string;
  bookingId: string;
  studentId: string;
  startTime: Date;
  endTime: Date;
  title?: string | null;
  description?: string | null;
  status: BookingStatus;
  createdAt: Date;
}

export interface PrivateInvitationWithDetails extends PrivateInvitation {
  student: UserPublic;
  professor: UserPublic;
  meetLink?: string | null;
}

export interface CreatePrivateInvitationData {
  studentId: string;
  startTime: Date;
  endTime: Date;
  title?: string;
  description?: string;
}

export interface CancelPrivateInvitationData {
  reason?: string;
}

// Student Profile Types
export interface StudentProfile {
  dateOfBirth?: string | null;
  phoneNumber?: string | null;
  aboutMe?: string | null;
  spanishLevel?: string | null;
  preferredClassTypes?: string[] | null;
  learningGoals?: string | null;
  availabilityNotes?: string | null;
}

export interface ProfileCompletion {
  isComplete: boolean;
  completedFields: number;
  totalFields: number;
  completedCount: number;
  totalCount: number;
  percentage: number;
  missingFields: string[];
  items?: Array<{
    field: string;
    label: string;
    isComplete: boolean;
  }>;
}

// Booking Confirmation Types
export interface ConfirmBookingRequest {
  token: string;
}

export interface RejectBookingRequest {
  token: string;
  reason?: string;
}

export interface ConfirmationTokenPayload {
  bookingId: string;
  professorId: string;
  studentId: string;
  jti: string;
  exp: number;
}

// Pricing Types
export interface StudentPricing {
  id: string;
  professorId: string;
  studentId: string;
  priceRSD: number;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePricingRequest {
  studentId: string;
  priceRSD: number;
  notes?: string;
}

export interface UpdatePricingRequest {
  priceRSD: number;
  notes?: string;
}

export interface StudentPricingWithStudent extends StudentPricing {
  student: UserPublic;
}

// i18n Types
export enum Locale {
  EN = "en",
  SR = "sr",
  ES = "es",
}

export interface LanguageDetectionResult {
  detectedLocale: Locale;
  confidence: number;
  source: "header" | "ip" | "default";
}

export interface UserLanguagePreference {
  userId: string;
  locale: Locale;
}

// Analytics Types
export interface ProfessorDailyStats {
  id: string;
  professorId: string;
  date: Date;
  classesCompleted: number;
  totalEarningsRSD: number;
  uniqueStudents: number;
  cancelledClasses: number;
  noShowClasses: number;
  averageRating?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProfessorMonthlyStats {
  id: string;
  professorId: string;
  year: number;
  month: number;
  classesCompleted: number;
  totalEarningsRSD: number;
  uniqueStudents: number;
  retentionRate?: number | null;
  averageRating?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentEngagementStats {
  id: string;
  studentId: string;
  totalClassesBooked: number;
  totalClassesAttended: number;
  totalClassesCancelled: number;
  noShowCount: number;
  lastBookingDate?: Date | null;
  averageRatingGiven?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlatformDailyStats {
  id: string;
  date: Date;
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  activeStudents: number;
  activeProfessors: number;
  newRegistrations: number;
  totalRevenueRSD: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProfessorAnalytics {
  daily: ProfessorDailyStats[];
  monthly: ProfessorMonthlyStats[];
  summary: {
    totalEarnings: number;
    totalClasses: number;
    averageRating: number;
    uniqueStudents: number;
  };
}

export interface PlatformAnalytics {
  daily: PlatformDailyStats[];
  summary: {
    totalRevenue: number;
    totalBookings: number;
    activeUsers: number;
    growthRate: number;
  };
}

// Referral Types
export interface Referral {
  id: string;
  referrerId: string;
  referredId: string;
  referralCode: string;
  status: "pending" | "completed" | "rewarded";
  rewardGranted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReferralStats {
  totalReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
  rewardsEarned: number;
}

export interface CreateReferralRequest {
  referredEmail: string;
  referralCode: string;
}

// Rating Types
export interface Rating {
  id: string;
  raterId: string;
  rateeId: string;
  bookingId?: string | null;
  rating: number;
  comment?: string | null;
  isAnonymous: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRatingRequest {
  rateeId: string;
  bookingId?: string;
  rating: number;
  comment?: string;
  isAnonymous?: boolean;
}

export interface RatingWithRater extends Rating {
  rater: UserPublic;
}

export interface UserRatingsSummary {
  averageRating: number;
  totalRatings: number;
  ratings: RatingWithRater[];
}

// Note: CreateSlotInput, BulkCreateSlotInput, CreateBookingInput, CancelBookingInput
// are exported from schemas.ts as Zod-inferred types
