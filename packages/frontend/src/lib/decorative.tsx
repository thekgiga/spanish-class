/**
 * Spanish Cultural Decorative Elements
 * 
 * Reusable decorative components inspired by Spanish design
 * Adds cultural authenticity to the premium experience
 */

import { cn } from '@/lib/utils';

// Decorative dot - inspired by Spanish tile patterns
export function DecorativeDot({ className }: { className?: string }) {
  return (
    <span
      className={cn('absolute w-2 h-2 rounded-full bg-gold-400', className)}
      aria-hidden="true"
    />
  );
}

// Decorative line - Spanish accent line
export function DecorativeLine({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'h-1 w-12 rounded-full bg-gradient-to-r from-spanish-red-500 to-gold-500',
        className
      )}
      aria-hidden="true"
    />
  );
}

// Decorative corner pattern
export function DecorativeCorner({ className, position = 'top-right' }: { 
  className?: string;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}) {
  const positionStyles = {
    'top-right': 'top-0 right-0',
    'top-left': 'top-0 left-0 -scale-x-100',
    'bottom-right': 'bottom-0 right-0 -scale-y-100',
    'bottom-left': 'bottom-0 left-0 -scale-x-100 -scale-y-100',
  };

  return (
    <svg
      className={cn('absolute w-16 h-16 text-gold-200 opacity-30', positionStyles[position], className)}
      viewBox="0 0 64 64"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M0 0 Q32 0 32 32 L32 0 L0 0 Z" />
      <circle cx="48" cy="16" r="3" />
      <circle cx="56" cy="8" r="2" />
    </svg>
  );
}

// Tile pattern background
export function TilePattern({ className }: { className?: string }) {
  return (
    <div
      className={cn('absolute inset-0 opacity-[0.02]', className)}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23B91C1C' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }}
      aria-hidden="true"
    />
  );
}

// Gradient mesh overlay
export function GradientMesh({ className, variant = 'warm' }: { 
  className?: string;
  variant?: 'warm' | 'cool' | 'spanish';
}) {
  const gradients = {
    warm: 'from-gold-500/10 via-spanish-terracotta-500/10 to-spanish-cream-500/10',
    cool: 'from-navy-500/10 via-spanish-olive-500/10 to-spanish-cream-500/10',
    spanish: 'from-spanish-red-500/10 via-gold-500/10 to-spanish-terracotta-500/10',
  };

  return (
    <div
      className={cn(
        'absolute inset-0 bg-gradient-to-br opacity-50 blur-3xl',
        gradients[variant],
        className
      )}
      aria-hidden="true"
    />
  );
}
