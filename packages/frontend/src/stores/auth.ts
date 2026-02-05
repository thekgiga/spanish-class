import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserPublic } from '@spanish-class/shared';
import { authApi } from '@/lib/api';

interface AuthState {
  user: UserPublic | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: UserPublic | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    timezone?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        }),

      login: async (email, password) => {
        const { user } = await authApi.login({ email, password });
        set({ user, isAuthenticated: true, isLoading: false });
      },

      register: async (data) => {
        const { user } = await authApi.register({
          ...data,
          timezone: data.timezone || 'Europe/Madrid',
        });
        set({ user, isAuthenticated: true, isLoading: false });
      },

      logout: async () => {
        await authApi.logout();
        set({ user: null, isAuthenticated: false });
      },

      checkAuth: async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            set({ user: null, isAuthenticated: false, isLoading: false });
            return;
          }

          const user = await authApi.me();
          set({ user, isAuthenticated: true, isLoading: false });
        } catch {
          localStorage.removeItem('token');
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
