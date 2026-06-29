import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-ui-sm text-sm font-semibold ring-offset-background transition-all duration-standard ease-ui-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // primary: brand fill, brand-contrast text — contract §Buttons
        primary:
          "bg-brand text-brand-contrast hover:bg-brand-hover active:bg-brand-active",
        // secondary: surface + strong border + primary text
        secondary:
          "border border-line-strong bg-surface text-ink hover:bg-surface-muted",
        // quiet: transparent, primary text
        quiet:
          "bg-transparent text-ink hover:bg-surface-muted",
        // danger: confirmed destructive action only
        danger:
          "bg-feedback-danger text-ink-inverse hover:opacity-90",
        // link: inline navigation, no container
        link:
          "bg-transparent text-brand underline-offset-4 hover:text-brand-hover hover:underline p-0 h-auto",
        // Legacy aliases — kept while pages migrate to contract names above
        default:
          "bg-brand text-brand-contrast hover:bg-brand-hover active:bg-brand-active",
        cta:
          "bg-accent text-ink-inverse hover:bg-accent-hover shadow-ui-1",
        destructive:
          "bg-feedback-danger text-ink-inverse hover:opacity-90 shadow-ui-1",
        outline:
          "border border-line-strong bg-transparent text-ink hover:bg-surface-muted",
        ghost:
          "bg-transparent text-ink hover:bg-surface-muted",
      },
      size: {
        // sm = 32px compact desktop only
        sm:      "h-control-compact px-3 text-xs rounded-ui-xs",
        // md = 40px default
        md:      "h-control-default px-4",
        // lg = 48px booking and onboarding primary
        lg:      "h-control-comfortable px-6 text-base",
        // Legacy size names — mapped to nearest contract height
        default: "h-control-default px-4",
        xl:      "h-14 px-8 text-lg rounded-ui-md",
        icon:    "h-control-default w-control-default p-0",
        "icon-sm": "h-control-compact w-control-compact p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size:    "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            <span>{children}</span>
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
