import * as React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Interactive adds hover/focus treatment */
  hover?: boolean;
  variant?: "plain" | "interactive" | "selected" | "status" | "default" | "elevated" | "outlined" | "filled";
  /** Status tone for variant="status"; maps to semantic token set */
  statusTone?: "available" | "requested" | "confirmed" | "blocked" | "completed" | "cancelled";
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = false, variant = "plain", statusTone, ...props }, ref) => {
    const base = "rounded-ui-md text-ink transition-all duration-standard ease-ui-standard";

    const variants: Record<string, string> = {
      // Canonical contract variants
      plain:       "bg-surface border border-line shadow-ui-1",
      interactive: "bg-surface border border-line shadow-ui-1 hover:shadow-ui-2 hover:-translate-y-px cursor-pointer",
      selected:    "bg-surface border-2 border-brand ring-1 ring-brand shadow-ui-1",
      // Status variant: tint based on tone using semantic token classes
      status:      statusTone
        ? `bg-status-${statusTone}-surface border border-status-${statusTone}-border`
        : "bg-surface border border-line shadow-ui-1",
      // Legacy aliases
      default:     "bg-surface border border-line shadow-ui-1",
      elevated:    "bg-surface shadow-ui-2",
      outlined:    "bg-transparent border-2 border-line-strong",
      filled:      "bg-surface-muted border border-line",
    };

    return (
      <div
        ref={ref}
        className={cn(
          base,
          variants[variant] ?? variants.plain,
          hover && "hover:shadow-ui-2 hover:-translate-y-px cursor-pointer",
          className,
        )}
        {...props}
      />
    );
  },
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6 pb-4", className)} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-title font-semibold leading-none tracking-tight text-ink", className)}
      {...props}
    />
  ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-small text-ink-secondary", className)} {...props} />
  ),
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  ),
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  ),
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
