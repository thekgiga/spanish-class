/**
 * BookingRequestCard — displays a pending (requested) booking for the student.
 *
 * BOOK-003: Post-booking state card.
 * BOOK-004: Explains what happens next + expiry deadline in plain language.
 * APP-004: Recovery actions for expired/rejected/cancelled bookings.
 *
 * Variants:
 *   'hero'    — large, used on the post-booking success screen and dashboard
 *   'compact' — used in BookingsPage upcoming list
 */
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { formatDistanceToNow } from 'date-fns';
import { Clock, Video, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/status-badge';
import { InlineAlert } from '@/components/ui/inline-alert';
import { Button } from '@/components/ui/button';
import { bookingStatusToUi, bookingRecoveryKey } from '@/lib/ui-system/status';
import { formatTime } from '@/lib/utils';
import type { BookingWithSlot } from '@spanish-class/shared';

export interface BookingRequestCardProps {
  booking: BookingWithSlot;
  variant?: 'hero' | 'compact';
  onCancel?: () => void;
  className?: string;
}

export function BookingRequestCard({
  booking,
  variant = 'compact',
  onCancel,
  className,
}: BookingRequestCardProps) {
  const { t } = useTranslation('booking');
  const uiStatus = bookingStatusToUi(booking.status);
  const slot = booking.slot;
  const isHero = variant === 'hero';

  // Expiry countdown
  const expiryDate = booking.confirmationExpiresAt ? new Date(booking.confirmationExpiresAt) : null;
  const expiryText = expiryDate && expiryDate > new Date()
    ? t('request.expiry_hint', { time: formatDistanceToNow(expiryDate, { addSuffix: true }) })
    : null;

  // Professor from slot
  const professor = (slot as any).professor as { firstName: string; lastName: string } | undefined;

  // Recovery scenario detection via centralized UI status
  const isPending   = uiStatus === 'requested';
  const isConfirmed = uiStatus === 'confirmed';

  // Recovery message — resolved centrally from status.ts, no raw enum comparisons here
  const recoveryI18nKey = bookingRecoveryKey(booking);
  const recoveryMessage = recoveryI18nKey ? t(recoveryI18nKey) : null;

  return (
    <div
      className={cn(
        'rounded-ui-md border bg-surface shadow-ui-1',
        isHero ? 'p-6 space-y-4' : 'p-4 space-y-3',
        className,
      )}
    >
      {/* Header row: status badge + expiry */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <StatusBadge status={uiStatus} variant={isHero ? 'tag' : 'pill'} />
        {isPending && expiryText && (
          <span className="text-caption text-ink-tertiary flex items-center gap-1">
            <Clock className="h-3 w-3" aria-hidden="true" />
            {expiryText}
          </span>
        )}
      </div>

      {/* Date / time */}
      <div className="space-y-0.5">
        <p className={cn('font-semibold text-ink', isHero ? 'text-h3' : 'text-title')}>
          {format(new Date(slot.startTime), 'EEEE, MMMM d, yyyy')}
        </p>
        <p className="text-small text-ink-secondary ui-tabular">
          {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
        </p>
      </div>

      {/* Professor */}
      {professor && (
        <div className="flex items-center gap-2 text-small text-ink-secondary">
          <User className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{professor.firstName} {professor.lastName}</span>
        </div>
      )}

      {/* Confirmed: meeting link */}
      {isConfirmed && (slot as any).meetLink && (
        <a
          href={(slot as any).meetLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-ui-sm bg-status-confirmed-surface border border-status-confirmed-border text-status-confirmed-foreground text-small font-medium hover:opacity-90 transition-opacity"
        >
          <Video className="h-4 w-4 shrink-0" aria-hidden="true" />
          {t('slot.join')}
        </a>
      )}

      {/* Pending explanation (BOOK-004) */}
      {isPending && isHero && (
        <InlineAlert variant="info">
          {t('request.pending_explanation')}
        </InlineAlert>
      )}

      {/* Recovery message (APP-004) */}
      {recoveryMessage && (
        <InlineAlert variant="warning">
          {recoveryMessage}
        </InlineAlert>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Re-book CTA for terminal non-completed states */}
        {recoveryMessage && (
          <Button variant="primary" size="sm" asChild>
            <Link to="/dashboard/book">{t('request.rebook')}</Link>
          </Button>
        )}
        {/* Cancel button for pending/confirmed bookings */}
        {(isPending || isConfirmed) && onCancel && (
          <Button variant="quiet" size="sm" onClick={onCancel}>
            {t('page.cancel')}
          </Button>
        )}
      </div>
    </div>
  );
}
