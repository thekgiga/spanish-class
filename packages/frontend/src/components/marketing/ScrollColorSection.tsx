import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useScrollPalette, JOURNEY_STOPS, type ScrollPaletteStop } from '@/hooks/useScrollPalette';

interface Props {
  children: ReactNode;
  className?: string;
  stops?: ScrollPaletteStop[];
}

/**
 * Wraps a page's scrollable content and drives the --mkt-journey-bg / --mkt-journey-tint
 * CSS variables on the container element as the user scrolls through it.
 * Zero React re-renders — motion values write directly via style.setProperty.
 * Reduced motion: the initial stop values are applied once and CSS handles any hop.
 */
export function ScrollColorSection({ children, className, stops = JOURNEY_STOPS }: Props) {
  const { containerRef, prefersReduced } = useScrollPalette(stops);

  return (
    <div
      ref={containerRef}
      className={cn('mkt-journey-canvas', className)}
      style={
        prefersReduced
          ? {
              '--mkt-journey-bg': stops[0].bg,
              '--mkt-journey-tint': stops[0].tint,
            } as React.CSSProperties
          : undefined
      }
    >
      {children}
    </div>
  );
}
