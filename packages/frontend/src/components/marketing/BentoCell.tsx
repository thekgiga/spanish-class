import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type BentoCellSpan = 1 | 2 | 3;
type BentoCellTone = 'noche' | 'fiesta' | 'sol' | 'mediterraneo' | 'azahar' | 'glass-dark' | 'glass-light';

interface Props {
  children: ReactNode;
  colSpan?: BentoCellSpan;
  rowSpan?: BentoCellSpan;
  tone?: BentoCellTone;
  interactive?: boolean;
  className?: string;
}

const toneClasses: Record<BentoCellTone, string> = {
  noche:        'mkt-mesh-noche text-[hsl(var(--mkt-azahar))]',
  fiesta:       'mkt-mesh-fiesta text-[hsl(var(--mkt-azahar))]',
  sol:          'mkt-mesh-sol text-[hsl(var(--mkt-noche))]',
  mediterraneo: 'mkt-mesh-mediterraneo text-[hsl(var(--mkt-azahar))]',
  azahar:       'bg-[hsl(var(--mkt-azahar))] text-[hsl(var(--mkt-noche))]',
  'glass-dark':  'backdrop-blur-md bg-[hsl(var(--mkt-glass-bg)/0.08)] border border-[hsl(var(--mkt-glass-border)/0.15)] text-[hsl(var(--mkt-azahar))]',
  'glass-light': 'backdrop-blur-md bg-[hsl(0_0%_100%/0.75)] border border-[hsl(var(--mkt-glass-border)/0.2)] text-[hsl(var(--mkt-noche))]',
};

const colSpanClasses: Record<BentoCellSpan, string> = {
  1: 'col-span-1',
  2: 'col-span-2',
  3: 'col-span-3',
};

const rowSpanClasses: Record<BentoCellSpan, string> = {
  1: 'row-span-1',
  2: 'row-span-2',
  3: 'row-span-3',
};

/**
 * Asymmetric bento grid cell — shared by HomePage and ServicesPage.
 * Renders as a rounded card with configurable tone, col/row span.
 * Parent must supply a CSS grid container.
 */
export function BentoCell({
  children,
  colSpan = 1,
  rowSpan = 1,
  tone = 'glass-dark',
  interactive = false,
  className,
}: Props) {
  return (
    <div
      className={cn(
        'rounded-2xl overflow-hidden p-6',
        colSpanClasses[colSpan],
        rowSpanClasses[rowSpan],
        toneClasses[tone],
        interactive && 'cursor-pointer transition-transform duration-200 hover:scale-[1.02]',
        className,
      )}
    >
      {children}
    </div>
  );
}
