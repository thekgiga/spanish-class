import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';

type MeshVariant = 'fiesta' | 'sol' | 'mediterraneo' | 'noche';

interface Props {
  variant?: MeshVariant;
  animate?: boolean;
  className?: string;
  children?: ReactNode;
  as?: 'div' | 'section' | 'header';
}

/**
 * Full-bleed mesh gradient background.
 * Pure CSS: 3–4 stacked radial-gradient stops — no canvas, no WebGL.
 * Drift animation disabled <768px and under reduced motion.
 */
export function MeshGradientBackground({
  variant = 'noche',
  animate = false,
  className,
  children,
  as: Tag = 'div',
}: Props) {
  const prefersReduced = useReducedMotion();
  const shouldAnimate = animate && !prefersReduced;

  return (
    <Tag
      className={cn(
        `mkt-mesh-${variant}`,
        shouldAnimate && 'mkt-mesh-animate md:mkt-mesh-animate',
        className,
      )}
    >
      {children}
    </Tag>
  );
}
