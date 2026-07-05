import { useState, useEffect, useRef, Suspense } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  StudentDashboardSkeleton,
  AdminShellSkeleton,
} from "@/components/shared/RouteSkeletons";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n";
import { updateLanguagePreference } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { EmailVerificationBanner } from "@/components/shared/EmailVerificationBanner";
import { NotificationBell } from "@/components/shared/NotificationBell";
import {
  Calendar,
  BookOpen,
  Users,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  Settings,
  Home,
  User,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/auth";
import { getInitials } from "@/lib/utils";
import { usePendingBookingsCount } from "@/hooks/usePendingBookingsCount";
import {
  AppSkipLink,
  AppSidebar,
  AppTopbar,
  AppMain,
} from "@/components/ui/app-shell";

// ── Nav item definitions ───────────────────────────────────────────────────

interface NavItemDef {
  to: string;
  labelKey: string;
  icon: React.ElementType;
  end?: boolean;
}

const ADMIN_NAV: NavItemDef[] = [
  { to: "/admin",          labelKey: "navigation.schedule",  icon: Calendar,   end: true },
  { to: "/admin/students", labelKey: "navigation.students",  icon: Users },
  { to: "/admin/insights", labelKey: "navigation.insights",  icon: TrendingUp },
  { to: "/admin/settings", labelKey: "navigation.settings",  icon: Settings },
];

const STUDENT_NAV: NavItemDef[] = [
  { to: "/dashboard",          labelKey: "navigation.home",        icon: Home,     end: true },
  { to: "/dashboard/book",     labelKey: "navigation.bookALesson", icon: Calendar },
  { to: "/dashboard/bookings", labelKey: "navigation.myLessons",   icon: BookOpen },
  { to: "/dashboard/profile",  labelKey: "navigation.profile",     icon: User },
];

// ── Logo mark ──────────────────────────────────────────────────────────────

function LogoMark({ className }: { className?: string }) {
  return (
    <div className={cn("h-9 w-9 rounded-ui-sm bg-brand flex items-center justify-center shrink-0", className)}>
      <span className="text-brand-contrast font-semibold text-title">S</span>
    </div>
  );
}

// ── Language switcher ──────────────────────────────────────────────────────

function LangSwitcher() {
  return (
    <div className="flex items-center gap-0.5">
      {(["en", "sr", "es"] as const).map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => {
            i18n.changeLanguage(lang);
            updateLanguagePreference(lang).catch(() => {});
          }}
          className={cn(
            "px-2 py-1 rounded-ui-xs text-caption font-semibold uppercase tracking-wide transition-colors duration-micro",
            i18n.language.startsWith(lang)
              ? "bg-brand/10 text-brand"
              : "text-ink-tertiary hover:text-ink hover:bg-surface-muted",
          )}
        >
          {lang}
        </button>
      ))}
    </div>
  );
}

// ── Single nav item ────────────────────────────────────────────────────────

interface NavItemProps extends NavItemDef {
  collapsed: boolean;
  badge?: React.ReactNode;
}

function SideNavItem({ to, labelKey, icon: Icon, end, collapsed, badge }: NavItemProps) {
  const { t } = useTranslation("common");
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-ui-sm text-small font-semibold",
          "transition-colors duration-micro focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
          isActive
            ? "bg-brand text-brand-contrast"
            : "text-ink-secondary hover:text-ink hover:bg-surface-muted",
          collapsed && "justify-center px-2",
        )
      }
    >
      <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{t(labelKey)}</span>
          {badge}
        </>
      )}
    </NavLink>
  );
}

// ── Main layout ────────────────────────────────────────────────────────────

interface DashboardLayoutProps {
  isAdmin?: boolean;
}

export function DashboardLayout({ isAdmin = false }: DashboardLayoutProps) {
  const { t } = useTranslation("common");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { user, logout, twoFactorEnabled } = useAuthStore();
  const { data: pendingData } = usePendingBookingsCount(isAdmin);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const navItems = isAdmin ? ADMIN_NAV : STUDENT_NAV;
  const pendingCount = isAdmin && pendingData?.count && pendingData.count > 0 ? pendingData.count : null;

  // ── Mobile sidebar keyboard/focus management ─────────────────────────────

  // Escape closes the sidebar and returns focus to the hamburger
  useEffect(() => {
    if (!sidebarOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSidebarOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [sidebarOpen]);

  // Move focus into the sidebar when it opens
  useEffect(() => {
    if (sidebarOpen) {
      // Focus the first focusable element inside the sidebar
      const first = sidebarRef.current?.querySelector<HTMLElement>(
        "a, button, [tabindex]:not([tabindex='-1'])",
      );
      first?.focus();
    }
  }, [sidebarOpen]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // Pending-approval badge for professor "Schedule" nav item
  const pendingBadge = pendingCount ? (
    <span
      className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-status-requested-foreground text-caption font-bold text-status-requested-surface"
      aria-hidden="true"
    >
      {pendingCount > 9 ? "9+" : pendingCount}
    </span>
  ) : null;

  // Accessible text for pending count (sr-only)
  const pendingLabel = pendingCount ? (
    <span className="sr-only">
      {t("navigation.pending_count", { count: pendingCount })}
    </span>
  ) : null;

  // 2FA nudge badge for Settings nav item
  const twoFaBadge = isAdmin && !twoFactorEnabled ? (
    <>
      <span className="h-2 w-2 rounded-full bg-feedback-warning shrink-0" aria-hidden="true" />
      <span className="sr-only">{t("navigation.two_factor_nudge")}</span>
    </>
  ) : null;

  return (
    <div className="relative min-h-screen bg-canvas">
      <AppSkipLink />

      {/* Mobile backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-40 bg-surface-inverse/40 lg:hidden"
            onClick={() => { setSidebarOpen(false); menuButtonRef.current?.focus(); }}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <div ref={sidebarRef}>
      <AppSidebar
        collapsed={collapsed}
        id="sidebar-panel"
        className={cn(
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          "z-50 transition-transform lg:transition-all",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-line shrink-0">
          {!collapsed && (
            <NavLink to="/" className="flex items-center gap-2.5 min-w-0">
              <LogoMark />
              <span className="font-semibold text-title text-ink truncate">Spanish Class</span>
            </NavLink>
          )}
          {collapsed && <LogoMark />}
          {/* Desktop collapse toggle */}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={t("aria_labels.toggle_sidebar")}
            className="hidden lg:flex p-1.5 rounded-ui-xs text-ink-tertiary hover:text-ink hover:bg-surface-muted transition-colors duration-micro focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} aria-hidden="true" />
          </button>
          {/* Mobile close */}
          <button
            type="button"
            onClick={() => { setSidebarOpen(false); menuButtonRef.current?.focus(); }}
            aria-label={t("aria_labels.close_sidebar")}
            className="lg:hidden p-1.5 rounded-ui-xs text-ink-tertiary hover:text-ink hover:bg-surface-muted transition-colors duration-micro focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* User identity (expanded only) */}
        {user && !collapsed && (
          <div className="px-4 py-3 border-b border-line shrink-0">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarFallback className="bg-brand text-brand-contrast text-caption font-semibold">
                  {getInitials(user.firstName, user.lastName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-small font-semibold text-ink truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-caption text-ink-tertiary truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Language switcher (expanded only) */}
        {!collapsed && (
          <div className="px-4 py-2 border-b border-line shrink-0">
            <LangSwitcher />
          </div>
        )}

        {/* Navigation */}
        <nav
          className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5"
          aria-label={t("aria_labels.primary_navigation")}
          id="primary-nav"
        >
          {navItems.map((item) => (
            <SideNavItem
              key={item.to}
              {...item}
              collapsed={collapsed}
              badge={
                item.to === "/admin" ? (
                  <>{pendingBadge}{pendingLabel}</>
                ) : item.to === "/admin/settings" ? twoFaBadge
                : undefined
              }
            />
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-3 border-t border-line shrink-0">
          <button
            type="button"
            onClick={handleLogout}
            className={cn(
              "flex w-full items-center gap-3 px-3 py-2.5 rounded-ui-sm text-small font-semibold",
              "text-ink-secondary hover:text-feedback-danger hover:bg-feedback-danger/10",
              "transition-colors duration-micro focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
              collapsed && "justify-center",
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
            {!collapsed && <span>{t("navigation.logout")}</span>}
          </button>
        </div>
      </AppSidebar>
      </div>

      {/* ── Topbar ──────────────────────────────────────────────────────── */}
      <AppTopbar sidebarCollapsed={collapsed}>
        {/* Mobile: hamburger */}
        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setSidebarOpen(true)}
          aria-label={t("aria_labels.open_menu")}
          aria-expanded={sidebarOpen}
          aria-controls="sidebar-panel"
          className="lg:hidden p-2 -ml-1 rounded-ui-sm text-ink-tertiary hover:text-ink hover:bg-surface-muted transition-colors duration-micro focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>

        {/* Mobile: logo */}
        <div className="lg:hidden flex items-center gap-2 mx-auto">
          <LogoMark />
          <span className="font-semibold text-title text-ink">Spanish Class</span>
        </div>

        <div className="flex-1" />

        {/* Right: notification bell only — no duplicate avatar */}
        <NotificationBell />
      </AppTopbar>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <AppMain sidebarCollapsed={collapsed}>
        <EmailVerificationBanner />
        <div className="p-6 sm:p-8">
          {/*
           * Nested Suspense boundary — keeps the sidebar/topbar mounted while
           * the lazy-loaded page chunk downloads on first navigation after
           * login. Without this, App.tsx's outer Suspense unmounts the whole
           * shell and shows a generic 3-card fallback that looks like an
           * empty dashboard until the user hits refresh.
           */}
          <Suspense fallback={isAdmin ? <AdminShellSkeleton /> : <StudentDashboardSkeleton />}>
            <Outlet />
          </Suspense>
        </div>
      </AppMain>
    </div>
  );
}
