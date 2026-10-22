import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type GlassTone = 'dark' | 'light';

interface Props {
  children: ReactNode;
  tone?: GlassTone;
  interactive?: boolean;
  className?: string;
  as?: 'div' | 'article' | 'section' | 'li';
}

/**
 * Glassmorphism card.
 * Uses backdrop-blur-md + mkt-glass tokens.
 * @supports not (backdrop-filter): falls back to solid noche/azahar scrim.
 * Tone "dark" → glass over dark mesh; tone "light" → glass over light canvas.
 */
export function GlassCard({ children, tone = 'dark', interactive = false, className, as: Tag = 'div' }: Props) {
  const isDark = tone === 'dark';

  return (
    <Tag
      className={cn(
        'rounded-2xl backdrop-blur-md',
        isDark
          ? [
              'bg-[hsl(var(--mkt-glass-bg)/0.08)]',
              'border border-[hsl(var(--mkt-glass-border)/0.15)]',
              'text-[hsl(var(--mkt-ink-on-vibrant))]',
            ]
          : [
              'bg-[hsl(0_0%_100%/0.75)]',
              'border border-[hsl(var(--mkt-glass-border)/0.2)]',
              'text-[hsl(var(--mkt-ink-on-light))]',
            ],
        interactive && [
          'cursor-pointer',
          'transition-all duration-200',
          isDark
            ? 'hover:bg-[hsl(var(--mkt-glass-bg)/0.14)] hover:border-[hsl(var(--mkt-glass-border)/0.25)]'
            : 'hover:bg-[hsl(0_0%_100%/0.9)] hover:border-[hsl(var(--mkt-glass-border)/0.3)]',
        ],
        // @supports fallback via CSS — solid background when no backdrop-filter
        '[&:not([supports-backdrop-filter])]:bg-[hsl(var(--mkt-noche)/0.92)]',
        className,
      )}
    >
      {children}
    </Tag>
  );
}
