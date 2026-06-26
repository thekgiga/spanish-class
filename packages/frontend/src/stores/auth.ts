import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserPublic } from '@spanish-class/shared';
import { authApi } from '@/lib/api';

interface AuthState {
  user: UserPublic | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  setUser: (user: UserPublic | null) => void;
  login: (email: string, password: string) => Promise<{ totpRequired?: boolean; emailVerified?: boolean }>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    timezone?: string;
  }) => Promise<{ requiresEmailVerification: boolean }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string, confirmPassword: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  setup2FA: () => Promise<{ qrCodeDataUrl: string; recoveryCodes: string[] }>;
  confirm2FA: (code: string) => Promise<void>;
  disable2FA: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      emailVerified: true,
      twoFactorEnabled: false,

      setUser: (user) =>
        set({ user, isAuthenticated: !!user, isLoading: false }),

      login: async (email, password) => {
        const result = await authApi.login({ email, password });
        if (result.totpRequired) {
          return { totpRequired: true };
        }
        set({
          user: result.user,
          isAuthenticated: true,
          isLoading: false,
          emailVerified: result.emailVerified !== false,
        });
        return { emailVerified: result.emailVerified !== false };
      },

      register: async (data) => {
        const result = await authApi.register({
          ...data,
          timezone: data.timezone || 'Europe/Madrid',
        });
        // After register: not auto-logged-in (requires email verification)
        // result.requiresEmailVerification is true for new users
        return { requiresEmailVerification: result.requiresEmailVerification ?? false };
      },

      logout: async () => {
        await authApi.logout();
        set({ user: null, isAuthenticated: false, emailVerified: true, twoFactorEnabled: false });
      },

      checkAuth: async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            set({ user: null, isAuthenticated: false, isLoading: false });
            return;
          }
          const user = await authApi.me();
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            twoFactorEnabled: user.twoFactorEnabled ?? false,
          });
        } catch {
          localStorage.removeItem('token');
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      forgotPassword: async (email) => {
        await authApi.forgotPassword(email);
      },

      resetPassword: async (token, password, confirmPassword) => {
        const result = await authApi.resetPassword(token, password, confirmPassword);
        set({
          user: result.user,
          isAuthenticated: true,
          isLoading: false,
          emailVerified: result.emailVerified !== false,
        });
      },

      verifyEmail: async (token) => {
        const result = await authApi.verifyEmail(token);
        set({
          user: result.user,
          isAuthenticated: true,
          isLoading: false,
          emailVerified: true,
        });
      },

      resendVerification: async (email) => {
        await authApi.resendVerification(email);
      },

      setup2FA: async () => {
        return authApi.setup2FA();
      },

      confirm2FA: async (code) => {
        await authApi.confirm2FA(code);
        set({ twoFactorEnabled: true });
      },

      disable2FA: async () => {
        await authApi.disable2FA();
        set({ twoFactorEnabled: false });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        emailVerified: state.emailVerified,
        twoFactorEnabled: state.twoFactorEnabled,
      }),
    },
  ),
);
