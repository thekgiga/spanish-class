/**
 * DateStrip — horizontal scrollable date selector.
 *
 * Used in CalendarPage (professor) and BookPage (student booking).
 * Shows a window of days centred on `centerDate`; highlights today and the
 * selected date; auto-scrolls the selected day into view.
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
}

export function DateStrip({
  centerDate,
  selectedDate,
  radius = 3,
  onSelect,
  className,
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
        return (
          <button
            key={day.toISOString()}
            type="button"
            role="radio"
            aria-checked={isSelected}
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
          </button>
        );
      })}
    </div>
  );
}
