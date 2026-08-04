/**
 * DateStrip — horizontal scrollable date selector.
 *
 * Used in CalendarPage (professor) and BookPage (student booking).
 * Shows a window of days centred on `centerDate`; highlights today and the
 * selected date; auto-scrolls the selected day into view.
 *
 * Optional availability indicator: pass `slotCounts` (keyed by "yyyy-MM-dd")
 * to render a small dot below each date. Used by BookPage so students
 * can see which days have openings without clicking through every day.
 */
import { useMemo, useEffect, useRef } from 'react';
import { format, startOfDay, addDays, subDays, eachDayOfInterval } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
   * a small dot below the date number when slots > 0.
   * CalendarPage omits this → no change.
   */
  slotCounts?: Record<string, number>;
  /**
   * Produces the accessible label suffix for a day that has slots, e.g.
   * "3 available". Required when `slotCounts` is passed so screen readers
   * announce slot availability alongside the date.
   */
  getSlotLabel?: (count: number) => string;
  /** When provided, renders a pinned "Today" button at the left of the strip. */
  todayLabel?: string;
  /** Called when the Today button is clicked. Required when todayLabel is set. */
  onTodayClick?: () => void;
  /**
   * Called with the new centerDate when the user clicks the prev/next arrows.
   * Pass the same handler as onSelect — BookPage uses setCenterDate.
   */
  onPageBack?: () => void;
  onPageForward?: () => void;
}

export function DateStrip({
  centerDate,
  selectedDate,
  radius = 3,
  onSelect,
  className,
  slotCounts,
  getSlotLabel,
  todayLabel,
  onTodayClick,
  onPageBack,
  onPageForward,
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
  }, [selectedDate]);

  // Today button is only inactive when BOTH the selection and the strip centre are already on today.
  const todayKey = format(today, 'yyyy-MM-dd');
  const isTodayActiveState =
    format(selectedDate, 'yyyy-MM-dd') !== todayKey ||
    format(centerDate,  'yyyy-MM-dd') !== todayKey;

  const arrowCls = cn(
    'flex-shrink-0 flex items-center justify-center w-8 h-full cursor-pointer',
    'text-ink-secondary hover:text-ink transition-colors duration-micro',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-inset',
  );

  return (
    <div className={cn('flex flex-col border-b border-line bg-canvas', className)}>
      {/* Month / year label + Today */}
      <div className="flex items-center justify-between px-4 pt-2 pb-1">
        <span className="text-small font-semibold text-ink">
          {format(centerDate, 'MMMM yyyy')}
        </span>
        {todayLabel && onTodayClick && (
          <button
            type="button"
            onClick={onTodayClick}
            className={cn(
              'text-small font-medium cursor-pointer px-2 py-0.5 rounded-ui-xs',
              'transition-colors duration-micro focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
              isTodayActiveState
                ? 'text-brand hover:text-brand-hover'
                : 'text-ink-tertiary pointer-events-none',
            )}
          >
            {todayLabel}
          </button>
        )}
      </div>

      {/* Arrows + scrollable day buttons */}
      <div className="flex items-stretch pb-2">
        {/* Left arrow */}
        {onPageBack && (
          <button type="button" onClick={onPageBack} aria-label="Previous" className={arrowCls}>
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
        )}

        {/* Scrollable days */}
        <div
          ref={scrollRef}
          className="flex flex-1 gap-1 overflow-x-auto px-1 scrollbar-hide"
          role="radiogroup"
          aria-label={format(centerDate, 'MMMM yyyy')}
        >
          {days.map((day) => {
            const key        = format(day, 'yyyy-MM-dd');
            const isSelected = key === format(selectedDate, 'yyyy-MM-dd');
            const isToday    = key === format(today, 'yyyy-MM-dd');
            const count      = slotCounts?.[key] ?? 0;
            const hasCount   = slotCounts !== undefined;
            const hasSlots   = count > 0;
            const countLabel = hasCount && hasSlots && getSlotLabel ? getSlotLabel(count) : undefined;
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
                  'relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-ui-md min-w-touch cursor-pointer',
                  'transition-colors duration-micro focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                  isSelected
                    ? 'bg-brand text-brand-contrast'
                    : isToday
                    ? 'bg-surface-raised text-ink ring-1 ring-line'
                    : 'text-ink-secondary hover:bg-surface-raised hover:text-ink',
                )}
              >
                <span className={cn(
                  'text-micro uppercase tracking-widest',
                  isSelected ? 'text-brand-contrast/70' : 'text-ink-tertiary',
                )}>
                  {format(day, 'EEE')}
                </span>
                <span className={cn(
                  'text-title leading-none',
                  isToday && !isSelected && 'font-bold',
                )}>
                  {format(day, 'd')}
                </span>
                {/* Availability dot */}
                {hasCount && (
                  <span aria-hidden="true" className="h-1.5 flex items-center justify-center mt-0.5">
                    {hasSlots ? (
                      <span className={cn(
                        'w-1.5 h-1.5 rounded-full',
                        isSelected ? 'bg-brand-contrast/60' : 'bg-brand',
                      )} />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full opacity-0" />
                    )}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right arrow */}
        {onPageForward && (
          <button type="button" onClick={onPageForward} aria-label="Next" className={arrowCls}>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
