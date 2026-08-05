import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";
import { buttonVariants, type ButtonProps } from "./button";

type IconButtonVariant = "primary" | "secondary" | "quiet" | "destructive" | "ghost" | "danger";

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Accessible name — mandatory. Shown as tooltip on desktop. */
  label: string;
  /** Use `danger` variant for irreversible actions. */
  variant?: IconButtonVariant;
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

// Map IconButton variant names to Button variant names
const VARIANT_MAP: Record<IconButtonVariant, ButtonProps["variant"]> = {
  primary:     "primary",
  secondary:   "secondary",
  quiet:       "quiet",
  destructive: "danger",
  ghost:       "ghost",
  danger:      "danger",
};

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ label, variant = "quiet", size = "md", isLoading, className, children, disabled, ...props }, ref) => {
    const sizeMap = { sm: "icon-sm", md: "icon", lg: "icon" } as const;
    const btn = (
      <button
        ref={ref}
        type="button"
        aria-label={label}
        aria-busy={isLoading || undefined}
        disabled={disabled || isLoading}
        className={cn(
          buttonVariants({ variant: VARIANT_MAP[variant], size: sizeMap[size] }),
          "rounded-ui-sm",
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );

    return (
      <TooltipPrimitive.Provider delayDuration={600}>
        <TooltipPrimitive.Root>
          <TooltipPrimitive.Trigger asChild>{btn}</TooltipPrimitive.Trigger>
          <TooltipPrimitive.Portal>
            <TooltipPrimitive.Content
              sideOffset={6}
              className="z-50 rounded-ui-xs bg-surface-inverse px-2 py-1 text-xs text-ink-inverse shadow-ui-2 animate-in fade-in-0 zoom-in-95"
            >
              {label}
              <TooltipPrimitive.Arrow className="fill-surface-inverse" />
            </TooltipPrimitive.Content>
          </TooltipPrimitive.Portal>
        </TooltipPrimitive.Root>
      </TooltipPrimitive.Provider>
    );
  },
);
IconButton.displayName = "IconButton";

export { IconButton };
