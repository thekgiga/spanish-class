/**
 * EmptyState — explains an empty view and offers the next valid action.
 *
 * Contract (docs/ui-system/06-component-contracts.md §EmptyState):
 * - optional icon, specific title, one-sentence guidance, at most one primary action
 * - no oversized illustration art in operational views
 */
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action, className, ...props }: EmptyStateProps) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center gap-3 py-12 px-6 text-center', className)}
      {...props}
    >
      {icon && (
        <div className="text-ink-tertiary" aria-hidden="true">
          {icon}
        </div>
      )}
      <p className="text-title font-semibold text-ink">{title}</p>
      {description && (
        <p className="text-small text-ink-secondary max-w-sm">{description}</p>
      )}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
