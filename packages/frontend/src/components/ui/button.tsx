import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spanish-teal-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        // Spanish Teal Primary Color System
        default:
          "bg-gradient-to-r from-spanish-teal-500 to-spanish-teal-600 text-white hover:from-spanish-teal-600 hover:to-spanish-teal-700 shadow-lg",
        primary:
          "bg-gradient-to-r from-spanish-teal-500 to-spanish-teal-600 text-white hover:from-spanish-teal-600 hover:to-spanish-teal-700 shadow-lg",
        secondary:
          "border-2 border-spanish-teal-500 bg-transparent text-spanish-teal-700 hover:bg-spanish-teal-50",
        // CTA variant for high-conversion actions only (Sign Up, Book Now homepage)
        cta: "bg-gradient-to-r from-spanish-coral-500 to-spanish-orange-500 text-white hover:from-spanish-coral-600 hover:to-spanish-orange-600 shadow-lg font-semibold",
        destructive: "bg-red-500 text-white hover:bg-red-600 shadow-lg",
        outline:
          "border-2 border-spanish-teal-500 bg-transparent text-spanish-teal-700 hover:bg-spanish-teal-50",
        ghost:
          "bg-transparent text-slate-600 hover:bg-spanish-teal-50 hover:text-spanish-teal-700",
        link: "text-spanish-teal-600 underline-offset-4 hover:text-spanish-teal-700 hover:underline",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-2xl px-10 text-lg",
        icon: "h-10 w-10 rounded-lg",
        "icon-sm": "h-8 w-8 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg
              className="h-4 w-4 animate-spin"
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
            <span>Loading...</span>
          </span>
        ) : (
          children
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
