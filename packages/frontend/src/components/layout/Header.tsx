import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X, LogOut, User, LayoutDashboard, Sparkles } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/auth";
import { getInitials } from "@/lib/utils";
import { PrimaryButton } from "@/components/ui/premium";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";

const navLinks = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const dashboardPath = user?.isAdmin ? "/admin" : "/dashboard";

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b-2 border-spanish-teal-100 shadow-lg">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center"
          >
            <Link to="/" className="flex items-center gap-3 group">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-spanish-teal-500 to-spanish-coral-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <span className="text-white font-display text-2xl font-bold">
                  S
                </span>
              </div>
              <span className="font-display text-2xl font-bold text-slate-900 group-hover:text-spanish-teal-600 transition-colors">
                Spanish Class
              </span>
            </Link>
          </motion.div>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:gap-2">
            {navLinks.map((link, index) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={link.href}
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-spanish-teal-600 hover:bg-spanish-teal-50 rounded-xl transition-all duration-200"
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Auth buttons / User menu */}
          <div className="hidden md:flex md:items-center md:gap-4">
            <LanguageSwitcher />
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative h-12 w-12 rounded-full hover:scale-110 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-spanish-teal-500 focus:ring-offset-2 focus:ring-offset-white">
                    <Avatar className="h-12 w-12 border-2 border-spanish-teal-300">
                      <AvatarFallback className="bg-gradient-to-br from-spanish-teal-500 to-spanish-coral-500 text-white font-semibold text-base">
                        {getInitials(user.firstName, user.lastName)}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-64 rounded-2xl shadow-2xl border-2 border-spanish-teal-100 bg-white"
                  align="end"
                >
                  <div className="flex items-center justify-start gap-3 p-4">
                    <Avatar className="h-12 w-12 border-2 border-spanish-teal-300">
                      <AvatarFallback className="bg-gradient-to-br from-spanish-teal-500 to-spanish-coral-500 text-white font-semibold">
                        {getInitials(user.firstName, user.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-semibold text-slate-900">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-slate-600">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator className="bg-spanish-teal-100" />
                  <DropdownMenuItem
                    asChild
                    className="cursor-pointer hover:bg-spanish-teal-50"
                  >
                    <Link
                      to={dashboardPath}
                      className="flex items-center text-slate-700"
                    >
                      <LayoutDashboard className="mr-3 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="cursor-pointer hover:bg-spanish-teal-50"
                  >
                    <Link
                      to={`${dashboardPath}/profile`}
                      className="flex items-center text-slate-700"
                    >
                      <User className="mr-3 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-spanish-teal-100" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-spanish-coral-600 hover:bg-spanish-coral-50"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <PrimaryButton
                size="sm"
                className="bg-gradient-to-r from-spanish-coral-500 to-spanish-orange-500 hover:from-spanish-coral-600 hover:to-spanish-orange-600 shadow-lg"
                asChild
              >
                <Link to="/auth">
                  <Sparkles className="h-4 w-4" />
                  Sign In
                </Link>
              </PrimaryButton>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <LanguageSwitcher />
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-xl p-2 text-slate-700 hover:bg-spanish-teal-50 hover:text-spanish-teal-600 transition-all"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open menu</span>
              {mobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
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
            className="md:hidden border-t-2 border-spanish-teal-100 mt-2 pt-4 pb-3"
          >
            <div className="space-y-1 px-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="block rounded-xl px-3 py-2 text-base font-medium text-slate-700 hover:bg-spanish-teal-50 hover:text-spanish-teal-600 transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated && user ? (
                <>
                  <Link
                    to={dashboardPath}
                    className="block rounded-xl px-3 py-2 text-base font-medium text-slate-700 hover:bg-spanish-teal-50 hover:text-spanish-teal-600 transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left rounded-xl px-3 py-2 text-base font-medium text-spanish-coral-600 hover:bg-spanish-coral-50 transition-all"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  className="block rounded-xl px-3 py-2 text-base font-medium text-white bg-gradient-to-r from-spanish-coral-500 to-spanish-orange-500 hover:from-spanish-coral-600 hover:to-spanish-orange-600 transition-all shadow-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Sign In
                  </span>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </nav>
    </header>
  );
}
