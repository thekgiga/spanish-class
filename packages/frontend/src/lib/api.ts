import axios from 'axios';
import type {
  UserPublic,
  AuthResponse,
  LoginInput,
  RegisterInput,
  AvailabilitySlot,
  AvailabilitySlotWithBookings,
  Booking,
  BookingWithSlot,
  CreateSlotInput,
  BulkCreateSlotInput,
  UpdateSlotInput,
  StudentNote,
  ProfessorDashboardStats,
  StudentDashboardStats,
  PaginatedResponse,
  RecurringPattern,
  CreateRecurringPatternInput,
  ProfessorBookStudentInput,
  StudentProfile,
  ProfileCompletion,
  UpdateStudentProfileInput,
} from '@spanish-class/shared';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: async (data: RegisterInput): Promise<AuthResponse> => {
    const res = await api.post<{ data: AuthResponse }>('/auth/register', data);
    if (res.data.data.token) {
      localStorage.setItem('token', res.data.data.token);
    }
    return res.data.data;
  },

  login: async (data: LoginInput): Promise<AuthResponse> => {
    const res = await api.post<{ data: AuthResponse }>('/auth/login', data);
    if (res.data.data.token) {
      localStorage.setItem('token', res.data.data.token);
    }
    return res.data.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
    localStorage.removeItem('token');
  },

  me: async (): Promise<UserPublic> => {
    const res = await api.get<{ data: { user: UserPublic } }>('/auth/me');
    return res.data.data.user;
  },

  updateProfile: async (data: { firstName: string; lastName: string; timezone: string }): Promise<UserPublic> => {
    const res = await api.put<{ data: { user: UserPublic } }>('/auth/profile', data);
    return res.data.data.user;
  },
};

// Professor API
export const professorApi = {
  getDashboard: async (): Promise<{
    stats: ProfessorDashboardStats;
    todaysSlots: AvailabilitySlot[];
  }> => {
    const res = await api.get('/professor/dashboard');
    return res.data.data;
  },

  getSlots: async (params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    status?: string;
    slotType?: string;
  }): Promise<PaginatedResponse<AvailabilitySlot>> => {
    const res = await api.get('/professor/slots', { params });
    return res.data;
  },

  getSlot: async (id: string): Promise<AvailabilitySlotWithBookings> => {
    const res = await api.get(`/professor/slots/${id}`);
    return res.data.data;
  },

  createSlot: async (data: CreateSlotInput): Promise<AvailabilitySlot> => {
    const res = await api.post('/professor/slots', data);
    return res.data.data;
  },

  createBulkSlots: async (data: BulkCreateSlotInput): Promise<AvailabilitySlot[]> => {
    const res = await api.post('/professor/slots/bulk', data);
    return res.data.data;
  },

  updateSlot: async (id: string, data: UpdateSlotInput): Promise<AvailabilitySlot> => {
    const res = await api.put(`/professor/slots/${id}`, data);
    return res.data.data;
  },

  deleteSlot: async (id: string): Promise<void> => {
    await api.delete(`/professor/slots/${id}`);
  },

  cancelSlotWithBookings: async (id: string, reason?: string): Promise<{ cancelledBookingsCount: number }> => {
    const res = await api.post(`/professor/slots/${id}/cancel-with-bookings`, { reason });
    return res.data.data;
  },

  getStudents: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<UserPublic & { _count: { bookings: number } }>> => {
    const res = await api.get('/professor/students', { params });
    return res.data;
  },

  getStudent: async (id: string): Promise<UserPublic & { bookings: BookingWithSlot[]; notes: StudentNote[] }> => {
    const res = await api.get(`/professor/students/${id}`);
    return res.data.data;
  },

  createNote: async (studentId: string, content: string): Promise<StudentNote> => {
    const res = await api.post(`/professor/students/${studentId}/notes`, { content });
    return res.data.data;
  },

  updateNote: async (studentId: string, noteId: string, content: string): Promise<StudentNote> => {
    const res = await api.put(`/professor/students/${studentId}/notes/${noteId}`, { content });
    return res.data.data;
  },

  deleteNote: async (studentId: string, noteId: string): Promise<void> => {
    await api.delete(`/professor/students/${studentId}/notes/${noteId}`);
  },

  // Recurring Patterns
  getRecurringPatterns: async (): Promise<RecurringPattern[]> => {
    const res = await api.get('/professor/recurring-patterns');
    return res.data.data;
  },

  createRecurringPattern: async (data: CreateRecurringPatternInput): Promise<{ pattern: RecurringPattern; slots: AvailabilitySlot[] }> => {
    const res = await api.post('/professor/recurring-patterns', data);
    return res.data.data;
  },

  deleteRecurringPattern: async (id: string): Promise<void> => {
    await api.delete(`/professor/recurring-patterns/${id}`);
  },

  // Direct booking
  bookStudent: async (data: ProfessorBookStudentInput): Promise<Booking> => {
    const res = await api.post('/professor/book-student', data);
    return res.data.data;
  },

  // Email logs
  getEmailLogs: async (params?: {
    page?: number;
    limit?: number;
    emailType?: string;
  }): Promise<PaginatedResponse<EmailLog>> => {
    const res = await api.get('/professor/email-logs', { params });
    return res.data;
  },

  getEmailLog: async (id: string): Promise<EmailLog> => {
    const res = await api.get(`/professor/email-logs/${id}`);
    return res.data.data;
  },
};

// Email Log type
export interface EmailLog {
  id: string;
  emailType: string;
  fromAddress: string;
  toAddress: string;
  subject: string;
  htmlContent: string;
  status: string;
  error?: string | null;
  metadata?: string | null;
  createdAt: string;
}

// Student API
export const studentApi = {
  getProfessor: async (): Promise<{ id: string; firstName: string; lastName: string; email: string }> => {
    const res = await api.get('/student/professor');
    return res.data.data.professor;
  },

  getDashboard: async (): Promise<{
    stats: StudentDashboardStats;
    nextSession: BookingWithSlot | null;
  }> => {
    const res = await api.get('/student/dashboard');
    return res.data.data;
  },

  getSlots: async (params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    slotType?: string;
    forMeOnly?: boolean;
  }): Promise<PaginatedResponse<AvailabilitySlot & { isBookedByMe: boolean }>> => {
    const res = await api.get('/student/slots', { params });
    return res.data;
  },

  bookSlot: async (slotId: string): Promise<{ bookingId: string; slot: AvailabilitySlot }> => {
    const res = await api.post('/student/bookings', { slotId });
    return res.data.data;
  },

  getBookings: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    upcoming?: boolean;
  }): Promise<PaginatedResponse<BookingWithSlot>> => {
    const res = await api.get('/student/bookings', { params });
    return res.data;
  },

  getBooking: async (id: string): Promise<BookingWithSlot> => {
    const res = await api.get(`/student/bookings/${id}`);
    return res.data.data;
  },

  cancelBooking: async (id: string, reason?: string): Promise<void> => {
    await api.post(`/student/bookings/${id}/cancel`, { reason });
  },

  // Profile (US-16, US-17, US-18)
  getProfile: async (): Promise<{ profile: StudentProfile; completion: ProfileCompletion }> => {
    const res = await api.get('/student/profile');
    return res.data.data;
  },

  updateProfile: async (data: UpdateStudentProfileInput): Promise<{ profile: StudentProfile; completion: ProfileCompletion }> => {
    const res = await api.put('/student/profile', data);
    return res.data.data;
  },
};

export default api;

// Booking Confirmation APIs (T050)
export const confirmBooking = async (token: string): Promise<void> => {
  await api.post('/bookings/confirm-booking', { token });
};

export const rejectBooking = async (token: string, reason?: string): Promise<void> => {
  await api.post('/bookings/reject-booking', { token, reason });
};

// Pricing APIs (T061)
export const getStudentsWithPricing = async (): Promise<any[]> => {
  const response = await api.get('/pricing/students');
  return response.data.data;
};

export const getStudentPricing = async (studentId: string): Promise<any> => {
  const response = await api.get(`/pricing/students/${studentId}`);
  return response.data.data;
};

export const createStudentPricing = async (
  studentId: string,
  priceRSD: number,
  notes?: string
): Promise<any> => {
  const response = await api.post(`/pricing/students/${studentId}`, {
    priceRSD,
    notes,
  });
  return response.data.data;
};

export const updateStudentPricing = async (
  studentId: string,
  priceRSD: number,
  notes?: string
): Promise<any> => {
  const response = await api.put(`/pricing/students/${studentId}`, {
    priceRSD,
    notes,
  });
  return response.data.data;
};

export const deleteStudentPricing = async (studentId: string): Promise<void> => {
  await api.delete(`/pricing/students/${studentId}`);
};

// Language detection API (T074)
export const detectLanguage = async (): Promise<any> => {
  const response = await api.get('/language/detect');
  return response.data.data;
};

export const updateLanguagePreference = async (locale: string): Promise<any> => {
  const response = await api.post('/language/preference', { locale });
  return response.data.data;
};

// Group Classes APIs
export const getSlotParticipants = async (slotId: string): Promise<any> => {
  const response = await api.get(`/availability/${slotId}/participants`);
  return response.data.data;
};

// Analytics APIs
export const getProfessorAnalytics = async (startDate?: string, endDate?: string): Promise<any> => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  const response = await api.get(`/analytics/professor?${params.toString()}`);
  return response.data.data;
};

export const getStudentEngagementStats = async (studentId: string): Promise<any> => {
  const response = await api.get(`/analytics/student/${studentId}`);
  return response.data.data;
};

export const getPlatformAnalytics = async (startDate?: string, endDate?: string): Promise<any> => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  const response = await api.get(`/analytics/platform?${params.toString()}`);
  return response.data.data;
};

// Referral APIs
export const getMyReferralCode = async (): Promise<any> => {
  const response = await api.get('/referrals/my-code');
  return response.data.data;
};

export const trackReferral = async (referralCode: string): Promise<any> => {
  const response = await api.post('/referrals/track', { referralCode });
  return response.data.data;
};

export const getReferralStats = async (): Promise<any> => {
  const response = await api.get('/referrals/stats');
  return response.data.data;
};

// Rating APIs
export const submitRating = async (
  rateeId: string,
  rating: number,
  comment?: string,
  bookingId?: string,
  isAnonymous?: boolean
): Promise<any> => {
  const response = await api.post('/ratings', {
    rateeId,
    rating,
    comment,
    bookingId,
    isAnonymous,
  });
  return response.data.data;
};

export const getUserRatings = async (userId: string): Promise<any> => {
  const response = await api.get(`/ratings/user/${userId}`);
  return response.data.data;
};

export const getPendingRatings = async (): Promise<any> => {
  const response = await api.get('/ratings/pending');
  return response.data.data;
};
