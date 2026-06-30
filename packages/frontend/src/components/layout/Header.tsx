import { Link, useNavigate } from "react-router-dom";
import { motion, MotionConfig } from "framer-motion";
import { Menu, X, LogOut, User, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth";
import { getInitials } from "@/lib/utils";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";

const navLinks = [
  { labelKey: "navigation.about",   href: "/about" },
  { labelKey: "navigation.contact", href: "/contact" },
];

export function Header() {
  const { t } = useTranslation("common");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const dashboardPath = user?.isAdmin ? "/admin" : "/dashboard";

  return (
    <MotionConfig reducedMotion="user">
      <header className="sticky top-0 z-50 bg-surface/95 backdrop-blur-xl border-b border-line shadow-ui-1">
        <nav className="mx-auto max-w-settings px-4 sm:px-6 lg:px-8" aria-label="Top">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="h-9 w-9 rounded-ui-sm bg-brand flex items-center justify-center shrink-0 group-hover:opacity-90 transition-opacity">
                <span className="text-brand-contrast font-semibold text-title">S</span>
              </div>
              <span className="font-semibold text-title text-ink group-hover:text-brand transition-colors">
                Spanish Class
              </span>
            </Link>

            {/* Desktop navigation */}
            <div className="hidden md:flex md:items-center md:gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="px-4 py-2 text-small font-semibold text-ink-secondary hover:text-ink hover:bg-surface-muted rounded-ui-sm transition-colors duration-micro"
                >
                  {t(link.labelKey)}
                </Link>
              ))}
            </div>

            {/* Auth / user menu */}
            <div className="hidden md:flex md:items-center md:gap-3">
              <LanguageSwitcher />
              {isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2">
                      <Avatar className="h-9 w-9 border border-line">
                        <AvatarFallback className="bg-brand text-brand-contrast text-caption font-semibold">
                          {getInitials(user.firstName, user.lastName)}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-60 rounded-ui-md shadow-ui-2 border border-line bg-surface" align="end">
                    <div className="flex items-center gap-3 p-4">
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarFallback className="bg-brand text-brand-contrast text-caption font-semibold">
                          {getInitials(user.firstName, user.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-small font-semibold text-ink truncate">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-caption text-ink-tertiary truncate">{user.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator className="bg-line" />
                    <DropdownMenuItem asChild className="cursor-pointer hover:bg-surface-muted">
                      <Link to={dashboardPath} className="flex items-center text-ink">
                        <LayoutDashboard className="mr-3 h-4 w-4" aria-hidden="true" />
                        {t("navigation.dashboard")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer hover:bg-surface-muted">
                      <Link to={`${dashboardPath}/profile`} className="flex items-center text-ink">
                        <User className="mr-3 h-4 w-4" aria-hidden="true" />
                        {t("navigation.profile")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-line" />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer text-feedback-danger hover:bg-feedback-danger/10"
                    >
                      <LogOut className="mr-3 h-4 w-4" aria-hidden="true" />
                      {t("navigation.logout")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="primary" size="sm" asChild>
                  <Link to="/auth">{t("navigation.login")}</Link>
                </Button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden items-center gap-2">
              <LanguageSwitcher />
              <button
                type="button"
                aria-label={t("aria_labels.open_menu")}
                aria-expanded={mobileMenuOpen}
                className="inline-flex items-center justify-center rounded-ui-sm p-2 text-ink-tertiary hover:bg-surface-muted hover:text-ink transition-colors duration-micro focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Menu className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-line mt-1 pt-3 pb-3"
            >
              <div className="space-y-0.5 px-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="block rounded-ui-sm px-3 py-2.5 text-small font-semibold text-ink-secondary hover:bg-surface-muted hover:text-ink transition-colors duration-micro"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t(link.labelKey)}
                  </Link>
                ))}
                {isAuthenticated ? (
                  <>
                    <Link
                      to={dashboardPath}
                      className="block rounded-ui-sm px-3 py-2.5 text-small font-semibold text-ink-secondary hover:bg-surface-muted hover:text-ink transition-colors duration-micro"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t("navigation.dashboard")}
                    </Link>
                    <button
                      onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                      className="block w-full text-left rounded-ui-sm px-3 py-2.5 text-small font-semibold text-feedback-danger hover:bg-feedback-danger/10 transition-colors duration-micro"
                    >
                      {t("navigation.logout")}
                    </button>
                  </>
                ) : (
                  <Link
                    to="/auth"
                    className="block rounded-ui-sm px-3 py-2.5 text-small font-medium bg-brand text-brand-contrast hover:bg-brand-hover transition-colors duration-micro"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t("navigation.login")}
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </nav>
      </header>
    </MotionConfig>
  );
}
