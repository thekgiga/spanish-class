/**
 * SlotEventDrawer — contextual detail panel for a calendar event.
 *
 * Desktop: right Drawer (420px). Mobile: inherits bottom-sheet behavior
 * from the Drawer primitive (max-h-sheet, rounded top).
 *
 * Action sets per status (docs/ui-system/07-calendar-booking-domain.md):
 *   available  → Edit, Cancel
 *   requested  → Approve, Reject (requires reason), Cancel
 *   confirmed  → Join meeting (if link), Mark no-show, Cancel
 *   blocked    → Remove (hard delete)
 *   completed  → read-only
 *   cancelled  → Remove (hard delete)
 */
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Video, ExternalLink, AlertCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle,
  DrawerBody, DrawerFooter, DrawerCloseButton,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { InlineAlert, uiToast } from '@/components/ui/inline-alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { bookingStatusToUi, slotStatusToUi, isBookingPending, isBookingConfirmed } from '@/lib/ui-system/status';
import { professorApi } from '@/lib/api';
import type { AvailabilitySlotWithBookings } from '@spanish-class/shared';
import { SlotType } from '@spanish-class/shared';
import { getInitials, formatTime } from '@/lib/utils';

// ── Prop types ─────────────────────────────────────────────────────────────

export interface SlotEventDrawerProps {
  open: boolean;
  onClose: () => void;
  slot: AvailabilitySlotWithBookings | null;
  onEdit?: (slotId: string) => void;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function SlotMetaRow({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 text-small text-ink-secondary">
      <Icon className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export function SlotEventDrawer({ open, onClose, slot, onEdit }: SlotEventDrawerProps) {
  const { t } = useTranslation('admin');
  const qc = useQueryClient();
  const [rejectOpen, setRejectOpen] = React.useState(false);
  const [rejectReason, setRejectReason] = React.useState('');
  const [rejectError, setRejectError] = React.useState('');
  // CANCEL-002: professor provides an optional reason when cancelling a slot
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const [cancelReason, setCancelReason] = React.useState('');

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['professor-slots'] });
    qc.invalidateQueries({ queryKey: ['pending-bookings'] });
    qc.invalidateQueries({ queryKey: ['professor-dashboard'] });
  };

  // Auto-focus the reject textarea when the panel opens
  const rejectTextareaRef = React.useRef<HTMLTextAreaElement>(null);
  React.useEffect(() => {
    if (rejectOpen) {
      requestAnimationFrame(() => rejectTextareaRef.current?.focus());
    }
  }, [rejectOpen]);

  const approveMutation = useMutation({
    mutationFn: (bookingId: string) => professorApi.confirmBooking(bookingId),
    onSuccess: () => { invalidate(); onClose(); uiToast.success(t('calendar.approved')); },
    onError:   () => uiToast.error(t('calendar.error_approve')),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      professorApi.rejectBooking(id, reason),
    onSuccess: () => { invalidate(); onClose(); uiToast.success(t('calendar.rejected')); },
    onError:   () => uiToast.error(t('calendar.error_reject')),
  });

  const cancelMutation = useMutation({
    mutationFn: (slotId: string) =>
      professorApi.cancelSlotWithBookings(slotId, cancelReason.trim() || undefined),
    onSuccess: () => { invalidate(); onClose(); setCancelOpen(false); setCancelReason(''); uiToast.success(t('calendar.cancelled')); },
    onError:   () => uiToast.error(t('calendar.error_cancel')),
  });

  const deleteMutation = useMutation({
    mutationFn: (slotId: string) => professorApi.deleteSlot(slotId),
    onSuccess: () => { invalidate(); onClose(); uiToast.success(t('calendar.removed')); },
    onError:   () => uiToast.error(t('calendar.error_remove')),
  });

  const noShowMutation = useMutation({
    mutationFn: (bookingId: string) => professorApi.markNoShow(bookingId),
    onSuccess: () => { invalidate(); onClose(); uiToast.success(t('calendar.no_show_marked')); },
    onError:   () => uiToast.error(t('calendar.error_generic')),
  });

  if (!slot) return null;

  // Determine effective status using central predicates (no raw enum comparisons)
  // BLOCKED slotType always renders as 'blocked' regardless of SlotStatus
  const pendingBooking   = slot.bookings.find(isBookingPending);
  const confirmedBooking = slot.bookings.find(isBookingConfirmed);
  const displayStatus = slot.slotType === SlotType.BLOCKED
    ? 'blocked' as const
    : pendingBooking
    ? bookingStatusToUi(pendingBooking.status)
    : confirmedBooking
    ? bookingStatusToUi(confirmedBooking.status)
    : slotStatusToUi(slot.status);

  const slotStart = new Date(slot.startTime);
  const timeLabel = `${formatTime(slot.startTime)} – ${formatTime(slot.endTime)}`;
  const dateLabel = format(slotStart, 'EEEE, MMMM d, yyyy');

  const handleReject = () => {
    if (!rejectReason.trim()) { setRejectError(t('calendar.reject_reason_required')); return; }
    if (!pendingBooking) return;
    rejectMutation.mutate({ id: pendingBooking.id, reason: rejectReason.trim() });
  };

  return (
    <Drawer open={open} onOpenChange={(v) => !v && onClose()}>
      <DrawerContent busy={approveMutation.isPending || rejectMutation.isPending || cancelMutation.isPending || deleteMutation.isPending}>
        <DrawerHeader>
          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={displayStatus} variant="tag" />
            </div>
            <DrawerTitle className="text-h3">
              {slot.title || t('calendar.lesson')}
            </DrawerTitle>
          </div>
          <DrawerCloseButton />
        </DrawerHeader>

        <DrawerBody className="space-y-5">
          {/* Date / time */}
          <div className="space-y-1.5">
            <SlotMetaRow icon={Clock}>{dateLabel}</SlotMetaRow>
            <SlotMetaRow icon={Clock}>{timeLabel}</SlotMetaRow>
          </div>

          {/* Student info for pending / confirmed */}
          {(pendingBooking || confirmedBooking) && (() => {
            const booking = pendingBooking ?? confirmedBooking!;
            const student = booking.student;
            return (
              <div className="flex items-center gap-3 p-3 rounded-ui-sm bg-surface-raised border border-line">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className="bg-brand text-brand-contrast text-caption font-semibold">
                    {getInitials(student.firstName, student.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-small font-semibold text-ink truncate">
                    {student.firstName} {student.lastName}
                  </p>
                  <p className="text-caption text-ink-tertiary truncate">{student.email}</p>
                </div>
              </div>
            );
          })()}

          {/* Expiry for pending */}
          {pendingBooking?.confirmationExpiresAt && (
            <InlineAlert variant="warning" className="text-caption">
              <span className="flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                {t('calendar.expires_in', {
                  time: formatDistanceToNow(new Date(pendingBooking.confirmationExpiresAt)),
                })}
              </span>
            </InlineAlert>
          )}

          {/* Meeting link for confirmed */}
          {confirmedBooking && slot.meetLink && (
            <a
              href={slot.meetLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-ui-sm bg-status-confirmed-surface border border-status-confirmed-border text-status-confirmed-foreground text-small font-medium hover:opacity-90 transition-opacity"
            >
              <Video className="h-4 w-4 shrink-0" aria-hidden="true" />
              {t('calendar.join_meeting')}
              <ExternalLink className="h-3.5 w-3.5 ml-auto shrink-0 opacity-60" aria-hidden="true" />
            </a>
          )}

          {/* Reject reason input */}
          {rejectOpen && (
            <div className="space-y-2">
              <label htmlFor="reject-reason" className="text-small font-medium text-ink">
                {t('calendar.reject_reason')}
              </label>
              <textarea
                id="reject-reason"
                ref={rejectTextareaRef}
                rows={3}
                value={rejectReason}
                onChange={e => { setRejectReason(e.target.value); setRejectError(''); }}
                placeholder={t('calendar.reject_reason_placeholder')}
                className={cn(
                  'w-full rounded-ui-sm border px-3 py-2 text-small bg-surface text-ink resize-none',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:border-transparent',
                  'transition-colors duration-micro',
                  rejectError ? 'border-feedback-danger' : 'border-line',
                )}
                aria-invalid={!!rejectError}
                aria-describedby={rejectError ? 'reject-error' : undefined}
              />
              {rejectError && (
                <p id="reject-error" className="text-caption text-feedback-danger">{rejectError}</p>
              )}
            </div>
          )}

          {/* CANCEL-002: professor cancellation reason (optional, student-facing) */}
          {cancelOpen && (
            <div className="space-y-2">
              <label htmlFor="cancel-reason" className="text-small font-medium text-ink">
                {t('calendar.cancel_slot_reason')}
              </label>
              <p className="text-caption text-ink-tertiary">{t('calendar.cancel_slot_reason_hint')}</p>
              <textarea
                id="cancel-reason"
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder={t('calendar.cancel_slot_placeholder')}
                className="w-full rounded-ui-sm border border-line px-3 py-2 text-small bg-surface text-ink resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:border-transparent transition-colors duration-micro"
              />
            </div>
          )}
        </DrawerBody>

        {/* Footer actions — vary by status */}
        <DrawerFooter className="flex-wrap gap-2">
          {/* AVAILABLE */}
          {displayStatus === 'available' && (
            cancelOpen ? (
              <>
                <Button variant="secondary" onClick={() => { setCancelOpen(false); setCancelReason(''); }}>
                  {t('calendar.back')}
                </Button>
                <Button variant="danger" isLoading={cancelMutation.isPending} onClick={() => cancelMutation.mutate(slot.id)}>
                  {t('calendar.cancel_slot')}
                </Button>
              </>
            ) : (
              <>
                {onEdit && (
                  <Button variant="secondary" onClick={() => { onClose(); onEdit(slot.id); }}>
                    {t('calendar.edit_slot')}
                  </Button>
                )}
                <Button variant="danger" onClick={() => setCancelOpen(true)}>
                  {t('calendar.cancel_slot')}
                </Button>
              </>
            )
          )}

          {/* REQUESTED / PENDING */}
          {displayStatus === 'requested' && pendingBooking && (
            rejectOpen ? (
              <>
                <Button variant="secondary" onClick={() => { setRejectOpen(false); setRejectReason(''); setRejectError(''); }}>
                  {t('calendar.back')}
                </Button>
                <Button
                  variant="danger"
                  isLoading={rejectMutation.isPending}
                  onClick={handleReject}
                >
                  {t('calendar.confirm_reject')}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="secondary"
                  onClick={() => setRejectOpen(true)}
                >
                  {t('calendar.reject')}
                </Button>
                <Button
                  variant="primary"
                  isLoading={approveMutation.isPending}
                  onClick={() => approveMutation.mutate(pendingBooking.id)}
                >
                  {t('calendar.approve')}
                </Button>
              </>
            )
          )}

          {/* CONFIRMED */}
          {displayStatus === 'confirmed' && confirmedBooking && (
            cancelOpen ? (
              <>
                <Button variant="secondary" onClick={() => { setCancelOpen(false); setCancelReason(''); }}>
                  {t('calendar.back')}
                </Button>
                <Button variant="danger" isLoading={cancelMutation.isPending} onClick={() => cancelMutation.mutate(slot.id)}>
                  {t('calendar.cancel_slot')}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="quiet"
                  isLoading={noShowMutation.isPending}
                  onClick={() => noShowMutation.mutate(confirmedBooking.id)}
                >
                  {t('calendar.mark_no_show')}
                </Button>
                <Button variant="danger" onClick={() => setCancelOpen(true)}>
                  {t('calendar.cancel_slot')}
                </Button>
              </>
            )
          )}

          {/* BLOCKED — professor's own blocking slot: just remove it */}
          {displayStatus === 'blocked' && (
            <Button
              variant="danger"
              isLoading={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate(slot.id)}
            >
              {t('calendar.remove_slot')}
            </Button>
          )}

          {/* CANCELLED — slot already cancelled, professor can remove it entirely */}
          {displayStatus === 'cancelled' && (
            <Button
              variant="danger"
              isLoading={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate(slot.id)}
            >
              {t('calendar.remove_slot')}
            </Button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
