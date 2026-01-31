import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, LogOut, User, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuthStore } from '@/stores/auth';
import { getInitials } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/offerings', label: 'Classes' },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const dashboardPath = user?.isAdmin ? '/admin' : '/dashboard';

  return (
    <header className="sticky top-0 z-50 glass border-b">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center"
          >
            <Link to="/" className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg gradient-navy flex items-center justify-center">
                <span className="text-gold-500 font-display text-xl font-bold">S</span>
              </div>
              <span className="font-display text-xl font-semibold text-navy-800">
                Spanish Class
              </span>
            </Link>
          </motion.div>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:gap-8">
            {navLinks.map((link, index) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={link.href}
                  className="text-sm font-medium text-navy-700 hover:text-navy-900 transition-colors"
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Auth buttons / User menu */}
          <div className="hidden md:flex md:items-center md:gap-4">
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar>
                      <AvatarFallback className="bg-navy-100 text-navy-700">
                        {getInitials(user.firstName, user.lastName)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.firstName} {user.lastName}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={dashboardPath}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={`${dashboardPath}/settings`}>
                      <User className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Button variant="ghost" asChild>
                    <Link to="/login">Sign in</Link>
                  </Button>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <Button variant="primary" asChild>
                    <Link to="/register">Get Started</Link>
                  </Button>
                </motion.div>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 space-y-3"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="block px-3 py-2 text-base font-medium text-navy-700 hover:bg-navy-50 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 space-y-2">
              {isAuthenticated ? (
                <>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to={dashboardPath} onClick={() => setMobileMenuOpen(false)}>
                      Dashboard
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full" onClick={handleLogout}>
                    Log out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      Sign in
                    </Link>
                  </Button>
                  <Button variant="primary" className="w-full" asChild>
                    <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                      Get Started
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </nav>
    </header>
  );
}
