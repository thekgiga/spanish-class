/**
 * AvailableTimeOption — one selectable time slot in the student booking flow.
 *
 * BOOK-001: Student chooses date then available time.
 *
 * Contract (docs/ui-system/07-calendar-booking-domain.md §Time option):
 * - 44–48px minimum height
 * - Start–end time in tabular numerals
 * - Duration as secondary text only if options vary
 * - Selecting a slot opens the review drawer immediately; no persistent local selection state.
 * - Pending bookings (awaiting professor approval) surface with the
 *   `requested` tone (amber "Approval needed") — never green — so a student
 *   never mistakes a request for an approved lesson.
 */
import { CheckCircle2, Clock3, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { formatTime } from '@/lib/utils';
import type { AvailabilitySlot } from '@spanish-class/shared';

export interface AvailableTimeOptionProps {
  slot: AvailabilitySlot & {
    isBookedByMe?: boolean;
    /** null when the student has no active booking for this slot */
    myBookingStatus?: 'pending' | 'confirmed' | null;
  };
  onSelect: (slot: AvailabilitySlot) => void;
  /** Show duration label when options have varying lengths */
  showDuration?: boolean;
  /** Slot start time is in the past — rendered dimmed and non-interactive */
  isPast?: boolean;
}

function getDurationLabel(startTime: Date | string, endTime: Date | string): string {
  const start = new Date(startTime);
  const end   = new Date(endTime);
  const mins  = Math.round((end.getTime() - start.getTime()) / 60_000);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

export function AvailableTimeOption({
  slot,
  onSelect,
  showDuration = false,
  isPast = false,
}: AvailableTimeOptionProps) {
  const { t } = useTranslation('booking');
  const isBookedByMe = slot.isBookedByMe ?? false;
  const myStatus     = slot.myBookingStatus ?? null;
  const isPending    = isBookedByMe && myStatus === 'pending';
  const isConfirmed  = isBookedByMe && myStatus === 'confirmed';
  const isDisabled   = isBookedByMe || isPast;
  const duration     = getDurationLabel(slot.startTime, slot.endTime);

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={() => !isDisabled && onSelect(slot)}
      className={cn(
        'group relative w-full flex items-center gap-3 pl-4 pr-4 py-3.5 rounded-ui-md border overflow-hidden',
        'text-left transition-colors duration-micro',
        isPast
          ? 'border-line bg-canvas text-ink-tertiary cursor-not-allowed opacity-50'
          : isPending
          ? 'border-status-requested-border bg-status-requested-surface text-status-requested-foreground cursor-not-allowed'
          : isConfirmed
          ? 'border-status-confirmed-border bg-status-confirmed-surface text-status-confirmed-foreground cursor-not-allowed'
          : 'cursor-pointer border-line bg-surface text-ink hover:border-brand hover:bg-surface-raised',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1',
      )}
    >
      {/* Coloured left-accent bar for booked states */}
      {(isPending || isConfirmed) && (
        <span
          aria-hidden="true"
          className={cn(
            'absolute left-0 top-0 bottom-0 w-1 rounded-l-ui-md',
            isPending ? 'bg-status-requested-border' : 'bg-status-confirmed-border',
          )}
        />
      )}

      {/* Leading icon — bare glyph, no container */}
      <span
        aria-hidden="true"
        className={cn(
          'flex-shrink-0 w-5 h-5 flex items-center justify-center',
          isPending || isConfirmed ? 'ml-2' : '',
          isPast
            ? 'text-ink-tertiary'
            : isPending
            ? 'text-status-requested-foreground'
            : isConfirmed
            ? 'text-status-confirmed-foreground'
            : 'text-ink-tertiary group-hover:text-brand transition-colors duration-micro',
        )}
      >
        {isConfirmed ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <Clock3 className="h-4 w-4" />
        )}
      </span>

      {/* Time and label */}
      <div className="flex-1 min-w-0">
        <span className={cn(
          'block text-title ui-tabular',
          !isDisabled && 'group-hover:text-brand transition-colors duration-micro',
        )}>
          {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
        </span>
        {isPast && (
          <span className="block text-caption text-ink-tertiary mt-0.5">
            {duration} · {t('slot.past_slot')}
          </span>
        )}
        {!isPast && showDuration && !isBookedByMe && (
          <span className="block text-caption text-ink-tertiary mt-0.5">{duration}</span>
        )}
        {!isPast && isPending && (
          <span className="block text-caption text-status-requested-foreground mt-0.5">
            {duration} · {t('slot.approval_needed')}
          </span>
        )}
        {!isPast && isConfirmed && (
          <span className="block text-caption text-status-confirmed-foreground mt-0.5">
            {duration} · {t('slot.already_booked')}
          </span>
        )}
      </div>

      {/* Chevron — only on interactive slots */}
      {!isDisabled && (
        <ChevronRight
          aria-hidden="true"
          className="flex-shrink-0 h-4 w-4 text-ink-tertiary group-hover:text-brand group-hover:translate-x-0.5 transition-all duration-micro"
        />
      )}
    </button>
  );
}
