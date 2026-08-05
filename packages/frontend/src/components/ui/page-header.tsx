/**
 * PageHeader — canonical page title + context + primary action.
 *
 * Contract (docs/ui-system/06-component-contracts.md §PageHeader):
 * - title, optional context/description, optional primary action (max 1)
 * - optional breadcrumb slot
 */
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  breadcrumb?: React.ReactNode;
  /** Single primary action — keep to one dominant CTA */
  action?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  breadcrumb,
  action,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <div
      className={cn('flex items-start justify-between gap-4 px-6 py-5 border-b border-line', className)}
      {...props}
    >
      <div className="min-w-0 flex flex-col gap-0.5">
        {breadcrumb && (
          <div className="text-caption text-ink-tertiary">{breadcrumb}</div>
        )}
        <h1 className="text-h3 font-semibold text-ink truncate">{title}</h1>
        {description && (
          <p className="text-small text-ink-secondary">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
