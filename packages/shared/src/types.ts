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

export type UserPublic = Omit<User, 'passwordHash'>;

// Slot Types
export enum SlotType {
  INDIVIDUAL = 'INDIVIDUAL',
  GROUP = 'GROUP',
}

export enum SlotStatus {
  AVAILABLE = 'AVAILABLE',
  FULLY_BOOKED = 'FULLY_BOOKED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
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
  googleEventId?: string | null;
  googleMeetLink?: string | null;
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
  CONFIRMED = 'CONFIRMED',
  CANCELLED_BY_STUDENT = 'CANCELLED_BY_STUDENT',
  CANCELLED_BY_PROFESSOR = 'CANCELLED_BY_PROFESSOR',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW',
}

export interface Booking {
  id: string;
  slotId: string;
  studentId: string;
  status: BookingStatus;
  bookedAt: Date;
  cancelledAt?: Date | null;
  cancelReason?: string | null;
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

// Note: CreateSlotInput, BulkCreateSlotInput, CreateBookingInput, CancelBookingInput
// are exported from schemas.ts as Zod-inferred types
