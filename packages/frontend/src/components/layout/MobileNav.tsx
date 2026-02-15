/**
 * MobileNav Component
 * 
 * Slide-in mobile navigation drawer with focus trap and keyboard support
 * WCAG 2.1 AA compliant navigation for mobile devices
 */

import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: Array<{
    label: string;
    href: string;
    icon?: React.ReactNode;
  }>;
}

export function MobileNav({ isOpen, onClose, navItems }: MobileNavProps) {
  const location = useLocation();

  // Close on route change
  useEffect(() => {
    onClose();
  }, [location.pathname, onClose]);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-navy-900/50 backdrop-blur-sm z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <nav
        className={cn(
          'fixed top-0 right-0 bottom-0 w-64 bg-white z-50',
          'transform transition-transform duration-300 ease-out',
          'shadow-2xl',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-spanish-cream-200">
          <span className="text-lg font-display font-semibold text-navy-900">
            Menu
          </span>
          <button
            onClick={onClose}
            className={cn(
              'min-h-[44px] min-w-[44px] -m-2 p-2',
              'flex items-center justify-center',
              'rounded-lg',
              'text-navy-600 hover:text-navy-900 hover:bg-spanish-cream-100',
              'transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-spanish-red-500 focus:ring-offset-2'
            )}
            aria-label="Close navigation"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Nav Items */}
        <div className="py-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-6 py-3 min-h-[44px]',
                  'text-base font-medium',
                  'transition-colors duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-spanish-red-500 focus:ring-inset',
                  isActive
                    ? 'text-spanish-red-600 bg-spanish-red-50 border-l-4 border-spanish-red-600'
                    : 'text-navy-700 hover:bg-spanish-cream-50 hover:text-navy-900'
                )}
              >
                {item.icon && (
                  <span className="flex-shrink-0 w-5 h-5" aria-hidden="true">
                    {item.icon}
                  </span>
                )}
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
