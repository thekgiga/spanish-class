import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-spanish-teal-500 focus:ring-offset-2",
  {
    variants: {
      variant: {
        // Earthy palette semantic badges
        default:
          "border-spanish-teal-200 bg-spanish-teal-100 text-spanish-teal-700",
        success:
          "border-spanish-olive-200 bg-spanish-olive-100 text-spanish-olive-700",
        warning:
          "border-spanish-sunshine-200 bg-spanish-sunshine-100 text-spanish-sunshine-700",
        destructive:
          "border-spanish-coral-200 bg-spanish-coral-100 text-spanish-coral-700",
        neutral: "border-slate-200 bg-slate-100 text-slate-700",
        outline: "border-slate-300 text-slate-700 bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
