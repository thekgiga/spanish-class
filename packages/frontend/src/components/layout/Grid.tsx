/**
 * Grid Component
 * 
 * Responsive grid layouts with mobile-first approach
 * Automatically adjusts columns based on viewport
 */

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  gap?: number;
  children: React.ReactNode;
}

const Grid = forwardRef<HTMLDivElement, GridProps>(
  ({ cols = { default: 1, md: 2, lg: 3 }, gap = 6, className, children, ...props }, ref) => {
    // Generate grid column classes
    const colClasses = cn(
      cols.default && `grid-cols-${cols.default}`,
      cols.sm && `sm:grid-cols-${cols.sm}`,
      cols.md && `md:grid-cols-${cols.md}`,
      cols.lg && `lg:grid-cols-${cols.lg}`,
      cols.xl && `xl:grid-cols-${cols.xl}`,
      cols['2xl'] && `2xl:grid-cols-${cols['2xl']}`
    );

    return (
      <div
        ref={ref}
        className={cn('grid', colClasses, `gap-${gap}`, className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Grid.displayName = 'Grid';

export { Grid };
