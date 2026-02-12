import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-navy-800 text-white',
        primary:
          'border-transparent bg-spanish-red-500 text-white',
        secondary:
          'border-transparent bg-spanish-cream-200 text-navy-700',
        destructive:
          'border-transparent bg-red-500 text-white',
        success:
          'border-transparent bg-emerald-500 text-white',
        warning:
          'border-transparent bg-amber-500 text-white',
        outline:
          'border-navy-300 text-navy-700 bg-transparent',
        gold:
          'border-transparent bg-gradient-to-r from-gold-100 to-gold-200 text-gold-800',
        'gold-solid':
          'border-transparent bg-gold-500 text-navy-900',
        spanish:
          'border-transparent bg-gradient-to-r from-spanish-red-100 to-spanish-red-200 text-spanish-red-800',
        olive:
          'border-transparent bg-spanish-olive-100 text-spanish-olive-700',
        terracotta:
          'border-transparent bg-spanish-terracotta-100 text-spanish-terracotta-700',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
