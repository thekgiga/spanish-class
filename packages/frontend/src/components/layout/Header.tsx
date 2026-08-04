import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, MotionConfig } from "framer-motion";
import { Menu, X, LogOut, User, LayoutDashboard } from "lucide-react";
import { useState, useEffect } from "react";
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
import { cn } from "@/lib/utils";

const navLinks = [
  { labelKey: "navigation.contact", href: "/contact" },
];

/**
 * Landing page (route "/") renders a full-viewport video hero. There the header
 * is hidden while the hero is on screen and reappears — pinned to the bottom —
 * once the visitor scrolls past it. Every other route keeps the header pinned to
 * the top. We detect "scrolled past the hero" by observing the `#landing-hero-end`
 * sentinel that HomePage renders at the end of its hero section.
 */
function useLandingHeaderMode(): "top" | "landing-hidden" | "landing-top" {
  const { pathname } = useLocation();
  const isLanding = pathname === "/";
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    if (!isLanding) return;
    const sentinel = document.getElementById("landing-hero-end");
    if (!sentinel) return;

    // The sentinel sits at the end of the hero. Once its top scrolls above the
    // viewport top, the hero is out of view and the header should appear.
    const update = () => setPastHero(sentinel.getBoundingClientRect().top <= 0);
    update();

    const observer = new IntersectionObserver(update, {
      threshold: 0,
      rootMargin: "0px",
    });
    observer.observe(sentinel);
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", update);
    };
  }, [isLanding, pathname]);

  if (!isLanding) return "top";
  return pastHero ? "landing-top" : "landing-hidden";
}

export function Header() {
  const { t } = useTranslation("common");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const headerMode = useLandingHeaderMode();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const dashboardPath = user?.isAdmin ? "/admin" : "/dashboard";

  // Landing hero is on screen → don't render the header at all (it slides in
  // Landing hero is on screen → don't render the header at all (it slides in
  // from the top once the visitor scrolls past the hero).
  if (headerMode === "landing-hidden") {
    return null;
  }

  // On the landing page, once past the hero the header appears pinned to the
  // top of the viewport. We use `fixed` (not `sticky`) so it isn't in the
  // document flow — that avoids a reflow jump when it mounts mid-scroll.
  const isLandingTop = headerMode === "landing-top";

  return (
    <MotionConfig reducedMotion="user">
      <motion.header
        initial={isLandingTop ? { y: "-100%" } : false}
        animate={{ y: 0 }}
        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "z-50 border-b border-line bg-surface/95 backdrop-blur-xl shadow-ui-1",
          isLandingTop ? "fixed left-0 right-0 top-0" : "sticky top-0",
        )}
      >
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
      </motion.header>
    </MotionConfig>
  );
}
