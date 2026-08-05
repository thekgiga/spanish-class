import * as React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Inline error message — shown below the input with icon */
  error?: string;
  /** Leading icon inside the input */
  icon?: React.ReactNode;
  /** Trailing decoration inside the input */
  trailing?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, icon, trailing, ...props }, ref) => {
    return (
      <div className="w-full">
        <div className="relative">
          {icon && (
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-tertiary">
              {icon}
            </div>
          )}
          <input
            type={type}
            ref={ref}
            className={cn(
              // Base layout
              "flex h-control-default w-full rounded-ui-sm px-3 py-2 text-sm",
              // Colours — semantic tokens only
              "border border-line bg-surface text-ink",
              "placeholder:text-ink-tertiary",
              // Focus ring
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:border-transparent",
              // States
              "hover:border-line-strong",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-muted",
              "read-only:bg-surface-muted read-only:border-line",
              // File input reset
              "file:border-0 file:bg-transparent file:text-sm file:font-semibold",
              "transition-colors duration-micro",
              // Error state
              error && "border-feedback-danger focus-visible:ring-feedback-danger",
              // Padding adjustment for icons
              icon    && "pl-9",
              trailing && "pr-9",
              className,
            )}
            aria-invalid={!!error || undefined}
            {...props}
          />
          {trailing && (
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-tertiary">
              {trailing}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-feedback-danger" role="alert">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
