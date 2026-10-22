import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Vibrant España 2026 successors to editorial-helpers.
 *  editorial-helpers.tsx is left untouched — Tier B token overrides re-color it
 *  automatically. These new helpers are for explicitly vibrant marketing sections.
 */

/* ── SolRule — fiesta/sol gradient horizontal rule ── */
interface SolRuleProps {
  className?: string;
}
export function SolRule({ className }: SolRuleProps) {
  return (
    <hr
      className={cn(
        'h-px w-full border-0',
        'bg-gradient-to-r from-[hsl(var(--mkt-fiesta))] via-[hsl(var(--mkt-sol))] to-[hsl(var(--mkt-mediterraneo))]',
        className,
      )}
      aria-hidden="true"
    />
  );
}

/* ── VibrantSectionLabel — eyebrow label for marketing sections ── */
interface VibrantSectionLabelProps {
  children: ReactNode;
  tone?: 'sol' | 'fiesta' | 'mediterraneo';
  className?: string;
}
export function VibrantSectionLabel({ children, tone = 'sol', className }: VibrantSectionLabelProps) {
  const toneClass = {
    sol:          'text-[hsl(var(--mkt-sol))]',
    fiesta:       'text-[hsl(var(--mkt-fiesta))]',
    mediterraneo: 'text-[hsl(var(--mkt-mediterraneo))]',
  }[tone];

  return (
    <p
      className={cn(
        'font-sans text-xs font-bold uppercase tracking-[0.18em]',
        toneClass,
        className,
      )}
    >
      {children}
    </p>
  );
}

/* ── MarketingPageHeader — h1 + eyebrow + optional deck for marketing pages ── */
interface MarketingPageHeaderProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  deck?: ReactNode;
  align?: 'left' | 'center';
  tone?: 'light' | 'dark';
  className?: string;
}
export function MarketingPageHeader({
  eyebrow,
  title,
  deck,
  align = 'center',
  tone = 'dark',
  className,
}: MarketingPageHeaderProps) {
  const isLight = tone === 'light';
  return (
    <header
      className={cn(
        'flex flex-col gap-3',
        align === 'center' ? 'items-center text-center' : 'items-start text-left',
        className,
      )}
    >
      {eyebrow && (
        <VibrantSectionLabel tone="sol">{eyebrow}</VibrantSectionLabel>
      )}
      <h1
        className={cn(
          'mkt-display-xl font-mktdisplay',
          isLight ? 'text-[hsl(var(--mkt-noche))]' : 'text-[hsl(var(--mkt-azahar))]',
        )}
      >
        {title}
      </h1>
      {deck && (
        <p
          className={cn(
            'max-w-2xl text-lg leading-relaxed',
            isLight ? 'text-[hsl(var(--mkt-noche)/0.75)]' : 'text-[hsl(var(--mkt-azahar)/0.8)]',
          )}
        >
          {deck}
        </p>
      )}
    </header>
  );
}

/* ── VibrantFadeUp — reduced-motion-aware fade-up wrapper ── */
import { motion, useReducedMotion } from 'framer-motion';

interface VibrantFadeUpProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}
export function VibrantFadeUp({ children, delay = 0, className }: VibrantFadeUpProps) {
  const prefersReduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={prefersReduced ? {} : { opacity: 0, y: 24 }}
      whileInView={prefersReduced ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, ease: 'easeOut', delay }}
    >
      {children}
    </motion.div>
  );
}
