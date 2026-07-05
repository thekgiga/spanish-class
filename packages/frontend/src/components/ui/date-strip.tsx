/**
 * DateStrip — horizontal scrollable date selector.
 *
 * Used in CalendarPage (professor) and BookPage (student booking).
 * Shows a window of days centred on `centerDate`; highlights today and the
 * selected date; auto-scrolls the selected day into view.
 *
 * Optional availability indicator: pass `slotCounts` (keyed by "yyyy-MM-dd")
 * to render a small count badge below each date. Used by BookPage so students
 * can see which days have openings without clicking through every day.
 */
import { useMemo, useEffect, useRef } from 'react';
import { format, startOfDay, addDays, subDays, eachDayOfInterval } from 'date-fns';
import { cn } from '@/lib/utils';

export interface DateStripProps {
  centerDate: Date;
  selectedDate: Date;
  /** Number of days shown either side of centerDate (default 3 = 7 total) */
  radius?: number;
  onSelect: (day: Date) => void;
  className?: string;
  /**
   * Slot counts keyed by "yyyy-MM-dd". When provided, each day button shows
   * a small availability count. Days with 0 slots show an invisible spacer
   * so button heights stay uniform. CalendarPage omits this → no change.
   */
  slotCounts?: Record<string, number>;
  /**
   * Produces the accessible label suffix for a day that has slots, e.g.
   * "3 available". Required when `slotCounts` is passed so screen readers
   * announce slot availability alongside the date.
   */
  getSlotLabel?: (count: number) => string;
}

export function DateStrip({
  centerDate,
  selectedDate,
  radius = 3,
  onSelect,
  className,
  slotCounts,
  getSlotLabel,
}: DateStripProps) {
  const days = useMemo(
    () => eachDayOfInterval({
      start: subDays(centerDate, radius),
      end:   addDays(centerDate, radius),
    }),
    [centerDate, radius],
  );
  const today     = startOfDay(new Date());
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current?.querySelector('[data-selected="true"]') as HTMLElement | null;
    el?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [selectedDate]); // also fires on mount because selectedDate is in deps

  return (
    <div
      ref={scrollRef}
      className={cn(
        'flex gap-1 overflow-x-auto px-4 py-2 border-b border-line bg-canvas scrollbar-hide',
        className,
      )}
      role="radiogroup"
      aria-label={format(centerDate, 'MMMM yyyy')}
    >
      {days.map((day) => {
        const key        = format(day, 'yyyy-MM-dd');
        const isSelected = key === format(selectedDate, 'yyyy-MM-dd');
        const isToday    = key === format(today, 'yyyy-MM-dd');
        const count      = slotCounts?.[key] ?? 0;
        const hasCount   = slotCounts !== undefined;
        const countLabel = hasCount && count > 0 && getSlotLabel ? getSlotLabel(count) : undefined;
        const ariaLabel  = countLabel
          ? `${format(day, 'EEEE, MMMM d')} — ${countLabel}`
          : undefined;
        return (
          <button
            key={day.toISOString()}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={ariaLabel}
            data-selected={isSelected}
            onClick={() => onSelect(day)}
            className={cn(
              'flex flex-col items-center gap-0.5 px-3 py-2 rounded-ui-sm min-w-touch',
              'transition-colors duration-micro focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
              isSelected
                ? 'bg-brand text-brand-contrast'
                : isToday
                ? 'bg-surface-raised text-ink font-semibold'
                : 'text-ink-secondary hover:bg-surface-muted',
            )}
          >
            <span className="text-micro uppercase tracking-wide">{format(day, 'EEE')}</span>
            <span className="text-small font-semibold">{format(day, 'd')}</span>
            {hasCount && (
              <span
                aria-hidden="true"
                className={cn(
                  'text-micro ui-tabular font-medium leading-none',
                  count === 0
                    ? 'invisible'
                    : isSelected
                    ? 'text-brand-contrast'
                    : 'text-brand',
                )}
              >
                {count > 9 ? '9+' : count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
