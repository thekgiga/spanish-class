import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '@/stores/auth';

// Layouts
import { PublicLayout } from '@/components/layout/PublicLayout';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

// Public Pages
import { HomePage } from '@/pages/public/HomePage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';

// Admin Pages
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { SlotsPage } from '@/pages/admin/SlotsPage';
import { NewSlotPage } from '@/pages/admin/NewSlotPage';
import { StudentsPage } from '@/pages/admin/StudentsPage';
import { StudentDetailPage } from '@/pages/admin/StudentDetailPage';
import { CalendarPage } from '@/pages/admin/CalendarPage';
import { BulkSlotPage } from '@/pages/admin/BulkSlotPage';
import { EmailLogsPage } from '@/pages/admin/EmailLogsPage';

// Student Pages
import { StudentDashboard } from '@/pages/student/StudentDashboard';
import { BookPage } from '@/pages/student/BookPage';
import { BookingsPage } from '@/pages/student/BookingsPage';
import { StudentProfilePage } from '@/pages/student/StudentProfilePage';

// Shared Pages
import { SettingsPage } from '@/pages/shared/SettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function ProtectedRoute({
  children,
  requireAdmin = false,
}: {
  children: React.ReactNode;
  requireAdmin?: boolean;
}) {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-navy-800 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !user?.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!requireAdmin && user?.isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}

function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to={user?.isAdmin ? '/admin' : '/dashboard'} replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-navy-800 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/login"
          element={
            <AuthRedirect>
              <LoginPage />
            </AuthRedirect>
          }
        />
        <Route
          path="/register"
          element={
            <AuthRedirect>
              <RegisterPage />
            </AuthRedirect>
          }
        />
      </Route>

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin>
            <DashboardLayout isAdmin />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="slots" element={<SlotsPage />} />
        <Route path="slots/new" element={<NewSlotPage />} />
        <Route path="slots/bulk" element={<BulkSlotPage />} />
        <Route path="slots/:id" element={<NewSlotPage />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="students/:id" element={<StudentDetailPage />} />
        <Route path="email-logs" element={<EmailLogsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Student Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="book" element={<BookPage />} />
        <Route path="bookings" element={<BookingsPage />} />
        <Route path="profile" element={<StudentProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '12px',
              background: '#1a1f36',
              color: '#fff',
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
