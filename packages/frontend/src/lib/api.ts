import axios from 'axios';
import type {
  UserPublic,
  AuthResponse,
  LoginInput,
  RegisterInput,
  AvailabilitySlot,
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

  getSlot: async (id: string): Promise<AvailabilitySlot> => {
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

  getStudents: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<UserPublic & { _count: { bookings: number } }>> => {
    const res = await api.get('/professor/students', { params });
    return res.data;
  },

  getStudent: async (id: string): Promise<UserPublic & { bookings: Booking[]; notes: StudentNote[] }> => {
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
};

// Student API
export const studentApi = {
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
};

export default api;
