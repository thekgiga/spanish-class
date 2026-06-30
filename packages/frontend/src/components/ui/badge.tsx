import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-ui-full border px-2.5 py-0.5 text-caption font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:     "border-transparent bg-brand text-brand-contrast",
        secondary:   "border-line bg-surface-muted text-ink-secondary",
        success:     "border-status-available-border bg-status-available-surface text-status-available-foreground",
        warning:     "border-status-requested-border bg-status-requested-surface text-status-requested-foreground",
        destructive: "border-transparent bg-feedback-danger text-ink-inverse",
        neutral:     "border-line bg-surface-muted text-ink-secondary",
        outline:     "border-line-strong text-ink bg-transparent",
        // Legacy aliases kept for backward compat while public pages migrate
        gold:        "border-line bg-surface-muted text-ink-secondary",
      },
    },
    defaultVariants: {
      variant: "secondary",
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
