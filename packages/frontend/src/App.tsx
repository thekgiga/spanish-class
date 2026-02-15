import { useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "@/stores/auth";
import { SkipLink } from "@/components/shared/SkipLink";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";

// Layouts - Keep non-lazy to avoid layout shift
import { PublicLayout } from "@/components/layout/PublicLayout";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

// Lazy-loaded Public Pages
const HomePage = lazy(() =>
  import("@/pages/public/HomePage").then((m) => ({ default: m.HomePage })),
);
const AboutPage = lazy(() =>
  import("@/pages/public/AboutPage").then((m) => ({ default: m.AboutPage })),
);
const LoginPage = lazy(() =>
  import("@/pages/auth/LoginPage").then((m) => ({ default: m.LoginPage })),
);
const RegisterPage = lazy(() =>
  import("@/pages/auth/RegisterPage").then((m) => ({
    default: m.RegisterPage,
  })),
);

// Lazy-loaded Admin Pages
const AdminDashboard = lazy(() =>
  import("@/pages/admin/AdminDashboard").then((m) => ({
    default: m.AdminDashboard,
  })),
);
const SlotsPage = lazy(() =>
  import("@/pages/admin/SlotsPage").then((m) => ({ default: m.SlotsPage })),
);
const NewSlotPage = lazy(() =>
  import("@/pages/admin/NewSlotPage").then((m) => ({ default: m.NewSlotPage })),
);
const StudentsPage = lazy(() =>
  import("@/pages/admin/StudentsPage").then((m) => ({
    default: m.StudentsPage,
  })),
);
const StudentDetailPage = lazy(() =>
  import("@/pages/admin/StudentDetailPage").then((m) => ({
    default: m.StudentDetailPage,
  })),
);
const CalendarPage = lazy(() =>
  import("@/pages/admin/CalendarPage").then((m) => ({
    default: m.CalendarPage,
  })),
);
const BulkSlotPage = lazy(() =>
  import("@/pages/admin/BulkSlotPage").then((m) => ({
    default: m.BulkSlotPage,
  })),
);
const EmailLogsPage = lazy(() =>
  import("@/pages/admin/EmailLogsPage").then((m) => ({
    default: m.EmailLogsPage,
  })),
);
const PendingApprovalsPage = lazy(() =>
  import("@/pages/admin/PendingApprovalsPage").then((m) => ({
    default: m.PendingApprovalsPage,
  })),
);

// Lazy-loaded Student Pages
const StudentDashboard = lazy(() =>
  import("@/pages/student/StudentDashboard").then((m) => ({
    default: m.StudentDashboard,
  })),
);
const BookPage = lazy(() =>
  import("@/pages/student/BookPage").then((m) => ({ default: m.BookPage })),
);
const BookingsPage = lazy(() =>
  import("@/pages/student/BookingsPage").then((m) => ({
    default: m.BookingsPage,
  })),
);
const StudentProfilePage = lazy(() =>
  import("@/pages/student/StudentProfilePage").then((m) => ({
    default: m.StudentProfilePage,
  })),
);

// Lazy-loaded Shared Pages
const SettingsPage = lazy(() =>
  import("@/pages/shared/SettingsPage").then((m) => ({
    default: m.SettingsPage,
  })),
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
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
    return <Navigate to={user?.isAdmin ? "/admin" : "/dashboard"} replace />;
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
    <>
      <SkipLink />
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
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
            <Route
              path="pending-approvals"
              element={<PendingApprovalsPage />}
            />
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
      </Suspense>
    </>
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
              borderRadius: "12px",
              background: "#1a1f36",
              color: "#fff",
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
