import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  Plus,
  Mail,
  UserCircle,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
  { href: "/admin/slots", label: "Availability", icon: BookOpen },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/email-logs", label: "Email Logs", icon: Mail },
  { href: "/admin/settings", label: "Settings", icon: Settings },
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
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

interface DashboardLayoutProps {
  isAdmin?: boolean;
}

export function DashboardLayout({ isAdmin = false }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const navItems = isAdmin ? adminNavItems : studentNavItems;

  // Fetch pending bookings count for admin badge
  const { data: pendingData } = usePendingBookingsCount(isAdmin);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const isActive = (href: string) => {
    if (href === "/admin" || href === "/dashboard") {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-spanish-cream-50/50">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-navy-900/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-spanish-cream-200 transition-all duration-300 ease-out",
          collapsed ? "w-20" : "w-72",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Logo */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-spanish-cream-200">
          <Link
            to={isAdmin ? "/admin" : "/dashboard"}
            className="flex items-center gap-3"
          >
            <img
              src="/icons/elite_logo.png"
              alt="Elite Spanish Class"
              className="h-10 w-10 rounded-xl object-contain flex-shrink-0 shadow-glow-red"
            />
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col"
              >
                <span className="font-display text-lg font-semibold text-navy-800">
                  Spanish Class
                </span>
                <span className="text-xs text-spanish-red-500 font-medium">
                  {isAdmin ? "Professor Portal" : "Student Portal"}
                </span>
              </motion.div>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon-sm"
            className="hidden lg:flex text-navy-400 hover:text-navy-600"
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronLeft
              className={cn(
                "h-4 w-4 transition-transform duration-300",
                collapsed && "rotate-180",
              )}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Quick action - Admin only */}
        {isAdmin && !collapsed && (
          <div className="px-4 py-4">
            <Button
              className="w-full justify-start gap-2"
              variant="primary"
              asChild
            >
              <Link to="/admin/slots/new">
                <Plus className="h-4 w-4" />
                Create New Slot
              </Link>
            </Button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-4">
          <div className="space-y-1">
            {navItems.map((item, index) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive(item.href)
                      ? "bg-gradient-to-r from-spanish-red-500 to-spanish-red-600 text-white shadow-glow-red"
                      : "text-navy-600 hover:bg-spanish-cream-100 hover:text-navy-800",
                    collapsed && "justify-center px-0",
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5 flex-shrink-0",
                      isActive(item.href) && "text-white",
                    )}
                  />
                  {!collapsed && <span className="flex-1">{item.label}</span>}
                  {!collapsed && item.badge && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-gold-400 text-navy-900">
                      {item.badge}
                    </span>
                  )}
                  {!collapsed &&
                    isAdmin &&
                    item.href === "/admin" &&
                    pendingData &&
                    pendingData.count > 0 && (
                      <Badge variant="warning" className="text-xs px-2 py-0.5">
                        {pendingData.count}
                      </Badge>
                    )}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Decorative divider */}
          {!collapsed && (
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-spanish-cream-300 to-transparent" />
              <Sparkles className="h-3 w-3 text-gold-400" />
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-spanish-cream-300 to-transparent" />
            </div>
          )}

          {/* Quick stats for admin */}
          {isAdmin && !collapsed && (
            <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-gold-50 to-spanish-cream-100 border border-gold-200/50">
              <p className="text-xs font-medium text-gold-700 uppercase tracking-wider">
                Quick Tip
              </p>
              <p className="mt-1 text-sm text-navy-600">
                Use bulk create to schedule recurring classes faster.
              </p>
            </div>
          )}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-spanish-cream-200 bg-spanish-cream-50/50">
          <div
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl bg-white shadow-soft",
              collapsed && "justify-center p-2",
            )}
          >
            <Avatar className="h-10 w-10 ring-2 ring-spanish-red-100 ring-offset-2">
              <AvatarFallback className="bg-gradient-to-br from-spanish-red-100 to-gold-100 text-spanish-red-700 font-semibold">
                {user && getInitials(user.firstName, user.lastName)}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-navy-800 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-navy-500 truncate">{user?.email}</p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            className={cn(
              "w-full mt-3 justify-start text-navy-500 hover:text-spanish-red-600 hover:bg-spanish-red-50",
              collapsed && "justify-center px-0",
            )}
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="ml-2">Log out</span>}
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div
        className={cn(
          "transition-all duration-300 min-h-screen",
          collapsed ? "lg:pl-20" : "lg:pl-72",
        )}
      >
        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-spanish-cream-200 bg-white/80 backdrop-blur-xl px-4 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5 text-navy-600" />
          </Button>
          <Link
            to={isAdmin ? "/admin" : "/dashboard"}
            className="flex items-center gap-3"
          >
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-spanish-red-500 to-spanish-red-700 flex items-center justify-center shadow-sm">
              <span className="text-white font-display text-lg font-bold">
                S
              </span>
            </div>
            <span className="font-display text-lg font-semibold text-navy-800">
              Spanish Class
            </span>
          </Link>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="border-t border-spanish-cream-200 bg-white/50 px-4 py-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-navy-500">
            <p>Spanish Class Platform</p>
            <div className="flex items-center gap-1">
              <span>Made with</span>
              <span className="text-spanish-red-500">love</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
