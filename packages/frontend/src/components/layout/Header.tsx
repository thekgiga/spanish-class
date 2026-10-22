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

/**
 * On the landing page ("/") the header is hidden while the video hero is
 * in the viewport and slides in from the top once the visitor scrolls past
 * the `#landing-hero-end` sentinel. Every other route shows the header
 * immediately as a sticky solid bar.
 */
function useLandingHeaderMode(): "top" | "landing-overlay" | "landing-solid" {
  const { pathname } = useLocation();
  const isLanding = pathname === "/";
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    if (!isLanding) {
      setPastHero(false);
      return;
    }
    const sentinel = document.getElementById("landing-hero-end");
    if (!sentinel) return;

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
  return pastHero ? "landing-solid" : "landing-overlay";
}

export function Header() {
  const { t } = useTranslation("common");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const headerMode = useLandingHeaderMode();

  // FloatingNav: becomes true once user scrolls past the hero sentinel or 80px
  const [isFloating, setIsFloating] = useState(false);

  useEffect(() => {
    const updateFloating = () => {
      const sentinel = document.getElementById("landing-hero-end");
      if (sentinel) {
        setIsFloating(sentinel.getBoundingClientRect().top <= 0);
      } else {
        setIsFloating(window.scrollY > 80);
      }
    };
    updateFloating();
    window.addEventListener("scroll", updateFloating, { passive: true });
    return () => window.removeEventListener("scroll", updateFloating);
  }, []);

  // Public marketing routes — FloatingNav only activates here
  const publicPaths = ["/", "/about", "/services", "/contact", "/faq", "/elite-guide"];
  const isPublicRoute = publicPaths.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const dashboardPath = user?.isAdmin ? "/admin" : "/dashboard";

  const isHidden = headerMode === "landing-overlay";
  const isFixed = headerMode === "landing-overlay" || headerMode === "landing-solid";

  const navLinks = [
    { labelKey: "navigation.home", href: "/" },
    { labelKey: "navigation.about", href: "/about" },
    { labelKey: "navigation.services", href: "/services" },
    { labelKey: "navigation.elite_guide", href: "/elite-guide" },
    { labelKey: "navigation.contact", href: "/contact" },
  ];

  // Condensed links shown inside the floating glass pill (3–4 main items)
  const floatingLinks = [
    { labelKey: "navigation.about", href: "/about" },
    { labelKey: "navigation.services", href: "/services" },
    { labelKey: "navigation.elite_guide", href: "/elite-guide" },
    { labelKey: "navigation.contact", href: "/contact" },
  ];

  // Whether the floating glass pill should be rendered (desktop only)
  const showFloatingPill = isFloating && isPublicRoute;

  return (
    <>
      <MotionConfig reducedMotion="user">
        <motion.header
          initial={false}
          animate={{ y: isHidden ? "-100%" : "0%" }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            "z-50",
            isFixed ? "fixed left-0 right-0 top-0" : "sticky top-0",
            "border-b border-line bg-surface/95 backdrop-blur-xl shadow-ui-1",
            // On desktop, when the glass pill is active, keep the element in the layout
            // (preserves height → no CLS) but make it invisible and non-interactive.
            // `visibility:hidden` also removes it from the accessibility tree so
            // screen readers reach the pill's nav links instead.
            showFloatingPill && "md:invisible md:pointer-events-none md:select-none",
          )}
          aria-hidden={isHidden || undefined}
        >
          <nav className="mx-auto max-w-settings px-4 sm:px-6 lg:px-8" aria-label="Top">
            <div className="flex h-16 items-center justify-between">
              {/* Logo */}
              <Link to="/" className="flex items-center group shrink-0" tabIndex={isHidden ? -1 : undefined}>
                <img
                  src="/imgs/brand/logo-transparent.webp"
                  alt="Elite Education"
                  className="h-9 w-auto group-hover:opacity-85 transition-opacity"
                />
              </Link>

              {/* Desktop navigation */}
              <div className="hidden md:flex md:items-center md:gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    tabIndex={isHidden ? -1 : undefined}
                    className="px-4 py-2 text-small font-semibold rounded-ui-sm transition-colors duration-micro text-ink-secondary hover:text-ink hover:bg-surface-muted"
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
                      <button
                        tabIndex={isHidden ? -1 : undefined}
                        className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
                      >
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
                    <Link to="/auth" tabIndex={isHidden ? -1 : undefined}>{t("navigation.login")}</Link>
                  </Button>
                )}
              </div>

              {/* Mobile menu button */}
              <div className="flex md:hidden items-center gap-2">
                <LanguageSwitcher />
                <button
                  type="button"
                  tabIndex={isHidden ? -1 : undefined}
                  aria-label={t("aria_labels.open_menu")}
                  aria-expanded={mobileMenuOpen}
                  className="inline-flex items-center justify-center rounded-ui-sm p-2 transition-colors duration-micro focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus text-ink-tertiary hover:bg-surface-muted hover:text-ink"
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

      {/* Floating glass pill — desktop only, shown when scrolled past hero on public routes */}
      {showFloatingPill && (
        <nav
          aria-label="Floating navigation"
          className="hidden md:flex fixed top-3 left-1/2 -translate-x-1/2 z-50 items-center gap-4 rounded-full px-6 py-2 backdrop-blur-md bg-[hsl(var(--mkt-glass-bg)/0.12)] border border-[hsl(var(--mkt-glass-border)/0.2)]"
        >
          {/* Compact logo */}
          <Link
            to="/"
            className="flex items-center shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--mkt-mediterraneo))] rounded-full"
          >
            <img
              src="/imgs/brand/logo-transparent.webp"
              alt="Elite Education"
              className="h-6 w-auto opacity-90 hover:opacity-100 transition-opacity"
            />
          </Link>

          {/* Condensed nav links */}
          {floatingLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-[hsl(var(--mkt-azahar)/0.9)] hover:text-mkt-sol text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--mkt-mediterraneo))] rounded"
            >
              {t(link.labelKey)}
            </Link>
          ))}

          {/* CTA button */}
          {isAuthenticated ? (
            <Link
              to={dashboardPath}
              className="bg-mkt-fiesta text-white rounded-full px-4 py-1.5 text-sm font-medium hover:bg-mkt-fiesta/90 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--mkt-mediterraneo))]"
            >
              {t("navigation.dashboard")}
            </Link>
          ) : (
            <Link
              to="/auth"
              className="bg-mkt-fiesta text-white rounded-full px-4 py-1.5 text-sm font-medium hover:bg-mkt-fiesta/90 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--mkt-mediterraneo))]"
            >
              {t("navigation.login")}
            </Link>
          )}
        </nav>
      )}
    </>
  );
}
