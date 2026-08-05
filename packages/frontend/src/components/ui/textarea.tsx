import * as React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  /** Show remaining / max character count when maxLength is set */
  showCount?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, showCount, maxLength, value, defaultValue, onChange, ...props }, ref) => {
    const [count, setCount] = React.useState<number>(() => {
      const initial = value ?? defaultValue ?? '';
      return typeof initial === 'string' ? initial.length : 0;
    });

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (showCount) setCount(e.target.value.length);
      onChange?.(e);
    };

    return (
      <div className="w-full">
        <textarea
          ref={ref}
          maxLength={maxLength}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          className={cn(
            'flex min-h-textarea w-full rounded-ui-sm px-3 py-2 text-sm',
            'border border-line bg-surface text-ink',
            'placeholder:text-ink-tertiary',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:border-transparent',
            'hover:border-line-strong',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-muted',
            'transition-colors duration-micro resize-none',
            error && 'border-feedback-danger focus-visible:ring-feedback-danger',
            className,
          )}
          aria-invalid={!!error || undefined}
          {...props}
        />
        <div className="mt-1 flex items-start justify-between gap-2">
          {error ? (
            <p className="flex items-center gap-1 text-xs text-feedback-danger" role="alert">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {error}
            </p>
          ) : (
            <span />
          )}
          {showCount && maxLength && (
            <span className="text-xs text-ink-tertiary tabular-nums">
              {count}/{maxLength}
            </span>
          )}
        </div>
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';

export { Textarea };
