import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuthStore } from '@/stores/auth';
import { getInitials } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const adminNavItems: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/calendar', label: 'Calendar', icon: Calendar },
  { href: '/admin/slots', label: 'Availability', icon: BookOpen },
  { href: '/admin/students', label: 'Students', icon: Users },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

const studentNavItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/book', label: 'Book Class', icon: Calendar },
  { href: '/dashboard/bookings', label: 'My Bookings', icon: BookOpen },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
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

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (href: string) => {
    if (href === '/admin' || href === '/dashboard') {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r transition-all duration-300',
          collapsed ? 'w-20' : 'w-64',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b">
          <Link to={isAdmin ? '/admin' : '/dashboard'} className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg gradient-navy flex items-center justify-center flex-shrink-0">
              <span className="text-gold-500 font-display text-xl font-bold">S</span>
            </div>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-display text-lg font-semibold text-navy-800"
              >
                Spanish Class
              </motion.span>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex"
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronLeft
              className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')}
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

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive(item.href)
                      ? 'bg-navy-800 text-white'
                      : 'text-navy-600 hover:bg-navy-50 hover:text-navy-800'
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>

          {/* Quick action */}
          {isAdmin && (
            <div className="mt-6 pt-6 border-t">
              <Button
                className={cn('w-full', collapsed && 'px-0')}
                variant="primary"
                asChild
              >
                <Link to="/admin/slots/new">
                  <Plus className="h-4 w-4" />
                  {!collapsed && <span className="ml-2">New Slot</span>}
                </Link>
              </Button>
            </div>
          )}
        </nav>

        {/* User section */}
        <div className="p-4 border-t">
          <div
            className={cn(
              'flex items-center gap-3',
              collapsed && 'justify-center'
            )}
          >
            <Avatar>
              <AvatarFallback className="bg-navy-100 text-navy-700">
                {user && getInitials(user.firstName, user.lastName)}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-navy-800 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            className={cn('w-full mt-3 justify-start', collapsed && 'justify-center px-0')}
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
          'transition-all duration-300',
          collapsed ? 'lg:pl-20' : 'lg:pl-64'
        )}
      >
        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white px-4 lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <Link to={isAdmin ? '/admin' : '/dashboard'} className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg gradient-navy flex items-center justify-center">
              <span className="text-gold-500 font-display text-lg font-bold">S</span>
            </div>
            <span className="font-display text-lg font-semibold text-navy-800">
              Spanish Class
            </span>
          </Link>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
