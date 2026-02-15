/**
 * LoadingSkeleton Component
 * 
 * Loading placeholders for lazy-loaded content
 * Improves perceived performance and prevents layout shift
 */

import { cn } from '@/lib/utils';

export interface LoadingSkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  className?: string;
}

export function LoadingSkeleton({
  variant = 'rectangular',
  width,
  height,
  className,
}: LoadingSkeletonProps) {
  const variantStyles = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    card: 'rounded-2xl h-64',
  };

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      className={cn(
        'bg-spanish-cream-200 animate-pulse',
        variantStyles[variant],
        className
      )}
      style={style}
      aria-hidden="true"
    />
  );
}

// Pre-built skeleton patterns
export function CardSkeleton() {
  return (
    <div className="space-y-4 p-6 bg-white rounded-2xl border border-spanish-cream-200">
      <LoadingSkeleton variant="rectangular" height={200} />
      <LoadingSkeleton variant="text" width="60%" />
      <LoadingSkeleton variant="text" width="80%" />
      <LoadingSkeleton variant="text" width="40%" />
    </div>
  );
}

export function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <LoadingSkeleton
          key={i}
          variant="text"
          width={i === lines - 1 ? '60%' : '100%'}
        />
      ))}
    </div>
  );
}

export function AvatarSkeleton() {
  return <LoadingSkeleton variant="circular" width={40} height={40} />;
}

export function PageSkeleton() {
  return (
    <div className="space-y-8 p-8">
      <LoadingSkeleton variant="text" width={200} height={32} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
