import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  Users,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  Mail,
  UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/auth";
import { getInitials } from "@/lib/utils";
import { usePendingBookingsCount } from "@/hooks/usePendingBookingsCount";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

const adminNavItems: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/calendar", label: "Calendar", icon: Calendar },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/email-logs", label: "Email Logs", icon: Mail },
];

const studentNavItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  {
    href: "/dashboard/book",
    label: "Book Class",
    icon: Calendar,
    badge: "New",
  },
  { href: "/dashboard/bookings", label: "My Bookings", icon: BookOpen },
  { href: "/dashboard/profile", label: "My Profile", icon: UserCircle },
];

interface DashboardLayoutProps {
  isAdmin?: boolean;
}

export function DashboardLayout({ isAdmin = false }: DashboardLayoutProps) {
  const { t } = useTranslation("common");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const navItems = isAdmin ? adminNavItems : studentNavItems;

  const { data: pendingData } = usePendingBookingsCount(isAdmin);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const isActive = (href: string) => {
    // Exact match for dashboard/admin root
    if (href === "/admin" || href === "/dashboard") {
      return location.pathname === href;
    }
    // For sub-routes, check exact match or if it's a parent path followed by /
    return (
      location.pathname === href || location.pathname.startsWith(href + "/")
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-spanish-teal-50 via-white to-spanish-coral-50">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen transition-all duration-300 ease-in-out",
          collapsed ? "w-20" : "w-72",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="h-full bg-white border-r border-slate-200 shadow-xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            {!collapsed && (
              <Link to="/" className="flex items-center gap-3 group">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-spanish-teal-500 to-spanish-coral-500 flex items-center justify-center shadow-lg shadow-spanish-teal-500/30 group-hover:scale-110 transition-transform">
                  <span className="text-white font-display text-lg font-bold">
                    S
                  </span>
                </div>
                <span className="font-display text-lg font-bold text-slate-900">
                  Spanish Class
                </span>
              </Link>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ChevronLeft
                className={cn(
                  "h-5 w-5 transition-transform",
                  collapsed && "rotate-180",
                )}
              />
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User info */}
          {user && !collapsed && (
            <div className="p-4 border-b border-slate-200">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-spanish-teal-50 to-spanish-coral-50 border-2 border-spanish-teal-200">
                <Avatar className="h-10 w-10 ring-2 ring-spanish-teal-200">
                  <AvatarFallback className="bg-gradient-to-br from-spanish-teal-500 to-spanish-coral-500 text-white font-semibold">
                    {getInitials(user.firstName, user.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-slate-600 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all",
                    active
                      ? "bg-spanish-teal-500 text-white shadow-lg border-2 border-spanish-teal-600"
                      : "text-slate-600 hover:text-slate-900 hover:bg-spanish-teal-50",
                    collapsed && "justify-center",
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-700 px-2 py-0.5 text-xs font-bold">
                          {item.badge}
                        </span>
                      )}
                      {isAdmin &&
                        item.href === "/admin" &&
                        pendingData?.count &&
                        pendingData.count > 0 && (
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white shadow-lg">
                            {pendingData.count}
                          </span>
                        )}
                    </>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Logout button */}
          <div className="p-4 border-t border-slate-200">
            <button
              onClick={handleLogout}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 transition-all",
                collapsed && "justify-center",
              )}
            >
              <LogOut className="h-5 w-5" />
              {!collapsed && <span>{t("navigation.logout")}</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div
        className={cn(
          "transition-all duration-300",
          collapsed ? "lg:ml-20" : "lg:ml-72",
        )}
      >
        {/* Mobile header */}
        <div className="lg:hidden sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-all"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-spanish-teal-500 to-spanish-coral-500 flex items-center justify-center shadow-lg shadow-spanish-teal-500/30">
                <span className="text-white font-display text-sm font-bold">
                  S
                </span>
              </div>
              <span className="font-display text-lg font-bold text-slate-900">
                Spanish Class
              </span>
            </div>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </div>

        {/* Page content */}
        <main className="p-6 sm:p-8 lg:p-12">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
