import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] hover:scale-[1.02]',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-colored-indigo hover:from-indigo-700 hover:to-violet-700 hover:shadow-xlarge',
        primary:
          'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-colored-indigo hover:from-indigo-700 hover:to-violet-700 hover:shadow-xlarge',
        emerald:
          'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-colored-emerald hover:from-emerald-700 hover:to-teal-700 hover:shadow-xlarge',
        destructive:
          'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-large hover:from-red-700 hover:to-rose-700 hover:shadow-xlarge',
        outline:
          'border-2 border-indigo-600 bg-transparent text-indigo-600 hover:bg-indigo-600 hover:text-white hover:shadow-colored-indigo',
        secondary:
          'bg-slate-100 text-slate-900 hover:bg-slate-200 shadow-soft hover:shadow-medium',
        ghost: 'hover:bg-indigo-50 hover:text-indigo-600',
        link: 'text-indigo-600 underline-offset-4 hover:underline hover:text-indigo-700',
      },
      size: {
        default: 'h-11 px-6 py-2.5',
        sm: 'h-9 rounded-lg px-4 text-xs',
        lg: 'h-13 rounded-xl px-8 text-base',
        xl: 'h-14 rounded-2xl px-10 text-lg',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="mr-2 h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Loading...
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
