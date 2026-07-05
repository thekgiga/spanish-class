/**
 * AvailableTimeOption — one selectable time slot in the student booking flow.
 *
 * BOOK-001: Student chooses date then available time.
 *
 * Contract (docs/ui-system/07-calendar-booking-domain.md §Time option):
 * - 44–48px minimum height
 * - Start–end time in tabular numerals
 * - Duration as secondary text only if options vary
 * - Clear selected state with border, ring, and check icon
 * - Pending bookings (awaiting professor approval) surface with the
 *   `requested` tone (amber "Approval needed") — never green — so a student
 *   never mistakes a request for an approved lesson.
 */
import { CheckCircle2, Clock3 } from 'lucide-react';
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
  selected?: boolean;
  onSelect: (slot: AvailabilitySlot) => void;
  /** Show duration label when options have varying lengths */
  showDuration?: boolean;
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
  selected = false,
  onSelect,
  showDuration = false,
}: AvailableTimeOptionProps) {
  const { t } = useTranslation('booking');
  const isBookedByMe = slot.isBookedByMe ?? false;
  const myStatus     = slot.myBookingStatus ?? null;
  const isPending    = isBookedByMe && myStatus === 'pending';
  const isConfirmed  = isBookedByMe && myStatus === 'confirmed';
  const duration     = getDurationLabel(slot.startTime, slot.endTime);

  return (
    <button
      type="button"
      disabled={isBookedByMe}
      onClick={() => !isBookedByMe && onSelect(slot)}
      aria-pressed={selected}
      className={cn(
        'w-full flex items-center justify-between px-4 min-h-touch rounded-ui-sm border',
        'text-left transition-colors duration-micro',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1',
        selected
          ? 'border-brand bg-status-confirmed-surface text-status-confirmed-foreground ring-1 ring-brand'
          : isPending
          ? 'border-status-requested-border bg-status-requested-surface text-status-requested-foreground cursor-not-allowed'
          : isConfirmed
          ? 'border-status-confirmed-border bg-status-confirmed-surface text-status-confirmed-foreground cursor-not-allowed'
          : 'border-line bg-surface text-ink hover:border-brand hover:bg-surface-raised',
      )}
    >
      {/* Time range */}
      <div className="flex flex-col gap-0.5">
        <span className="text-small font-semibold ui-tabular">
          {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
        </span>
        {showDuration && !isBookedByMe && (
          <span className="text-caption text-ink-tertiary">{duration}</span>
        )}
        {isPending && (
          <span className="text-caption text-status-requested-foreground inline-flex items-center gap-1">
            <Clock3 className="h-3 w-3" aria-hidden="true" />
            {duration} · {t('slot.approval_needed')}
          </span>
        )}
        {isConfirmed && (
          <span className="text-caption text-status-confirmed-foreground inline-flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
            {duration} · {t('slot.already_booked')}
          </span>
        )}
      </div>

      {/* Selected indicator */}
      {selected && (
        <CheckCircle2 className="h-5 w-5 text-brand shrink-0" aria-hidden="true" />
      )}
    </button>
  );
}
