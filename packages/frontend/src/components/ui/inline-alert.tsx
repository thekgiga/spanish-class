/**
 * InlineAlert — persistent inline feedback within a form or section.
 * For transient notifications use the `uiToast` helper (wraps react-hot-toast).
 *
 * Contract:
 * - error variant announces assertively; others announce politely
 * - dismiss button optional
 * - Toast skins live in ui-system.tokens.css as .toast-ui-* classes
 */
import * as React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

// ── InlineAlert ───────────────────────────────────────────────────────────

type AlertVariant = 'success' | 'error' | 'warning' | 'info';

const VARIANT_STYLES: Record<
  AlertVariant,
  { wrapper: string; icon: React.ComponentType<{ className?: string }> }
> = {
  success: {
    wrapper: 'bg-alert-success-surface border-alert-success-border text-alert-success-foreground',
    icon: CheckCircle2,
  },
  error: {
    wrapper: 'bg-alert-error-surface border-alert-error-border text-alert-error-foreground',
    icon: AlertCircle,
  },
  warning: {
    wrapper: 'bg-alert-warning-surface border-alert-warning-border text-alert-warning-foreground',
    icon: AlertTriangle,
  },
  info: {
    wrapper: 'bg-alert-info-surface border-alert-info-border text-alert-info-foreground',
    icon: Info,
  },
};

export interface InlineAlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  onDismiss?: () => void;
}

export function InlineAlert({
  variant = 'info',
  onDismiss,
  className,
  children,
  ...props
}: InlineAlertProps) {
  const { wrapper, icon: Icon } = VARIANT_STYLES[variant];
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
      className={cn(
        'flex items-start gap-3 rounded-ui-sm border px-4 py-3 text-small',
        wrapper,
        className,
      )}
      {...props}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div className="flex-1 min-w-0">{children}</div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="shrink-0 rounded-ui-xs p-0.5 opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

// ── uiToast — semantic toast helper wrapping react-hot-toast ──────────────
//
// Skin classes (.toast-ui-*) are declared in ui-system.tokens.css so
// raw CSS color functions stay in the token file and pass the guardrail.
//
// Contract: success auto-dismisses at 3.5 s; error persists until dismissed;
// never the sole evidence of a state change.

export const uiToast = {
  success: (msg: string) =>
    toast.success(msg, { duration: 3500, className: 'toast-ui-success' }),
  error: (msg: string) =>
    toast.error(msg, { duration: Infinity, className: 'toast-ui-error' }),
  info: (msg: string) =>
    toast(msg, { duration: 4000, className: 'toast-ui-info' }),
};
