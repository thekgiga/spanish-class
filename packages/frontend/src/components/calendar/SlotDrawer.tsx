import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import {
  Calendar,
  Check,
  ChevronDown,
  Clock,
  Edit2,
  FileText,
  Loader2,
  Trash2,
  User,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getDuration } from '@/lib/utils';
import { professorApi } from '@/lib/api';
import { MeetingNotesEditor } from '../professor/MeetingNotesEditor';
import type { CalendarSlot } from './EventCard';

export interface SlotDrawerProps {
  slot: CalendarSlot | null;
  open: boolean;
  onClose: () => void;
  onApproved?: () => void;
  onRejected?: () => void;
  onCancelled?: () => void;
  onDeleted?: () => void;
  onUpdated?: () => void;
}

// ── tiny helpers ────────────────────────────────────────────────────────────
function toLocalInput(iso: string): string {
  // "2026-06-30T09:00:00.000Z" → "2026-06-30T09:00" (datetime-local value)
  return iso.slice(0, 16);
}

function localInputToISO(local: string): string {
  return new Date(local).toISOString();
}

function SlotTypeIcon({ slotType }: { slotType: string }) {
  if (slotType === 'GROUP') return <Users className="h-4 w-4" />;
  return <User className="h-4 w-4" />;
}

export function SlotDrawer({
  slot,
  open,
  onClose,
  onApproved,
  onRejected,
  onCancelled,
  onDeleted,
  onUpdated,
}: SlotDrawerProps) {
  const { t } = useTranslation('admin');
  const queryClient = useQueryClient();

  // ── panel states ──────────────────────────────────────────────────────────
  type Panel = 'view' | 'edit' | 'reject' | 'cancel-lesson' | 'delete' | 'cancel-booking';
  const [panel, setPanel] = useState<Panel>('view');

  // ── edit form state ───────────────────────────────────────────────────────
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');
  const [editTitle, setEditTitle] = useState('');

  const [rejectReason, setRejectReason] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [notesOpen, setNotesOpen] = useState(false);

  const pendingBooking = slot?.bookings?.find((b) => b.status === 'PENDING_CONFIRMATION');
  const confirmedBooking = slot?.bookings?.find((b) => b.status === 'CONFIRMED');
  const activeBooking = pendingBooking ?? confirmedBooking;

  const isCancelled = slot?.status === 'CANCELLED';
  const hasNoBookings = !activeBooking;

  function openEdit() {
    if (!slot) return;
    setEditStart(toLocalInput(slot.startTime));
    setEditEnd(toLocalInput(slot.endTime));
    setEditTitle(slot.title ?? '');
    setPanel('edit');
  }

  // ── mutations ─────────────────────────────────────────────────────────────
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['professor-slots'] });
    queryClient.invalidateQueries({ queryKey: ['professor-pending-bookings-count'] });
  };

  const approveMutation = useMutation({
    mutationFn: () => {
      if (!pendingBooking) throw new Error('No pending booking');
      return professorApi.confirmBooking(pendingBooking.id);
    },
    onSuccess: () => { invalidate(); onApproved?.(); onClose(); },
  });

  const rejectMutation = useMutation({
    mutationFn: () => {
      if (!pendingBooking) throw new Error('No pending booking');
      return professorApi.rejectBooking(pendingBooking.id, rejectReason);
    },
    onSuccess: () => { invalidate(); onRejected?.(); onClose(); },
  });

  const cancelBookingMutation = useMutation({
    mutationFn: () => {
      if (!slot) throw new Error('No slot');
      return professorApi.cancelSlotWithBookings(slot.id, cancelReason || undefined);
    },
    onSuccess: () => { invalidate(); onCancelled?.(); onClose(); },
  });

  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!slot) throw new Error('No slot');
      return professorApi.deleteSlot(slot.id);
    },
    onSuccess: () => { invalidate(); onDeleted?.(); onClose(); },
  });

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!slot) throw new Error('No slot');
      return professorApi.updateSlot(slot.id, {
        startTime: localInputToISO(editStart),
        endTime: localInputToISO(editEnd),
        title: editTitle.trim() || null,
      });
    },
    onSuccess: () => { invalidate(); onUpdated?.(); setPanel('view'); },
  });

  const startDate = slot ? parseISO(slot.startTime) : null;
  const endDate = slot ? parseISO(slot.endTime) : null;
  const duration = startDate && endDate ? getDuration(startDate, endDate) : null;

  // ── sections ──────────────────────────────────────────────────────────────
  const renderSlotInfo = () => (
    <div className="space-y-2">
      {startDate && (
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <Calendar className="h-4 w-4 text-slate-400 flex-shrink-0" />
          <span>{format(startDate, 'EEE, MMM d')}</span>
        </div>
      )}
      {startDate && endDate && (
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <Clock className="h-4 w-4 text-slate-400 flex-shrink-0" />
          <span>
            {format(startDate, 'HH:mm')} – {format(endDate, 'HH:mm')}
            {duration && <span className="text-slate-400 ml-1">({duration})</span>}
          </span>
        </div>
      )}
      {slot && (
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <SlotTypeIcon slotType={slot.slotType} />
          <span>
            {slot.slotType === 'GROUP'
              ? t('calendar.drawer.group', 'Group')
              : slot.slotType === 'BLOCKED'
              ? t('calendar.drawer.blocked', 'Blocked')
              : t('calendar.drawer.individual', 'Individual')}
          </span>
          {slot.slotType === 'GROUP' && (
            <span className="text-slate-400">
              ({slot.currentParticipants}/{slot.maxParticipants})
            </span>
          )}
        </div>
      )}
      {slot?.title && (
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span className="w-4 flex-shrink-0" />
          <span className="italic">{slot.title}</span>
        </div>
      )}
    </div>
  );

  const renderStudentInfo = () => activeBooking && (
    <div className="border-t border-slate-100 pt-4">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
        {t('calendar.drawer.student_section', 'Student')}
      </h3>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-edu-blue-100 flex items-center justify-center text-edu-blue-700 font-semibold text-sm flex-shrink-0">
          {activeBooking.student.firstName.charAt(0)}{activeBooking.student.lastName.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-800">
            {activeBooking.student.firstName} {activeBooking.student.lastName}
          </p>
          <p className="text-xs text-slate-500">{activeBooking.student.email}</p>
        </div>
      </div>
    </div>
  );

  // ── render panels ─────────────────────────────────────────────────────────
  const renderPanel = () => {
    if (!slot) return null;

    // EDIT panel
    if (panel === 'edit') {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              {t('calendar.drawer.edit_title', 'Title')}
            </label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder={t('calendar.drawer.edit_title_placeholder', 'e.g. Conversation Practice')}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-edu-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              {t('calendar.drawer.edit_start', 'Start time')}
            </label>
            <input
              type="datetime-local"
              value={editStart}
              onChange={(e) => setEditStart(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-edu-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              {t('calendar.drawer.edit_end', 'End time')}
            </label>
            <input
              type="datetime-local"
              value={editEnd}
              onChange={(e) => setEditEnd(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-edu-blue-500"
            />
          </div>
          {updateMutation.isError && (
            <p className="text-xs text-red-500">
              {(updateMutation.error as any)?.response?.data?.error
                ?? t('calendar.drawer.error', 'An error occurred. Try again.')}
            </p>
          )}
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setPanel('view')}
              className="flex-1 py-2 px-3 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            >
              {t('calendar.drawer.cancel_edit', 'Cancel')}
            </button>
            <button
              onClick={() => updateMutation.mutate()}
              disabled={updateMutation.isPending || !editStart || !editEnd}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-sm font-semibold transition-colors',
                'bg-edu-blue-600 hover:bg-edu-blue-700 text-white',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {updateMutation.isPending
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : t('calendar.drawer.save_changes', 'Save Changes')}
            </button>
          </div>
        </div>
      );
    }

    // REJECT panel
    if (panel === 'reject') {
      return (
        <div className="space-y-2">
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder={t('calendar.drawer.reject_reason_placeholder', 'Reason (optional)')}
            rows={3}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
          />
          {rejectMutation.isError && (
            <p className="text-xs text-red-500">{t('calendar.drawer.error', 'An error occurred.')}</p>
          )}
          <div className="flex gap-2">
            <button onClick={() => setPanel('view')} className="flex-1 py-2 px-3 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
              {t('calendar.drawer.cancel_reject', 'Back')}
            </button>
            <button
              onClick={() => rejectMutation.mutate()}
              disabled={rejectMutation.isPending}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-sm font-semibold transition-colors',
                'bg-red-600 hover:bg-red-700 text-white disabled:opacity-50'
              )}
            >
              {rejectMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {t('calendar.drawer.confirm_reject', 'Confirm Reject')}
            </button>
          </div>
        </div>
      );
    }

    // CANCEL BOOKING panel (booked slot — notify student)
    if (panel === 'cancel-booking') {
      return (
        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            {t('calendar.drawer.cancel_booking_desc', 'The student will be notified by email.')}
          </p>
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder={t('calendar.drawer.cancel_reason_placeholder', 'Reason (optional)')}
            rows={3}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
          />
          {cancelBookingMutation.isError && (
            <p className="text-xs text-red-500">
              {(cancelBookingMutation.error as any)?.response?.data?.error
                ?? t('calendar.drawer.error', 'An error occurred.')}
            </p>
          )}
          <div className="flex gap-2">
            <button onClick={() => setPanel('view')} className="flex-1 py-2 px-3 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
              {t('calendar.drawer.no', 'Back')}
            </button>
            <button
              onClick={() => cancelBookingMutation.mutate()}
              disabled={cancelBookingMutation.isPending}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 transition-colors"
            >
              {cancelBookingMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {t('calendar.drawer.confirm_cancel_booking', 'Cancel & Notify')}
            </button>
          </div>
        </div>
      );
    }

    // CANCEL LESSON (no booking) panel
    if (panel === 'cancel-lesson') {
      return (
        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            {t('calendar.drawer.cancel_lesson_confirm', 'This will cancel the slot permanently.')}
          </p>
          {cancelBookingMutation.isError && (
            <p className="text-xs text-red-500">{t('calendar.drawer.error', 'An error occurred.')}</p>
          )}
          <div className="flex gap-2">
            <button onClick={() => setPanel('view')} className="flex-1 py-2 px-3 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
              {t('calendar.drawer.no', 'Back')}
            </button>
            <button
              onClick={() => cancelBookingMutation.mutate()}
              disabled={cancelBookingMutation.isPending}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 transition-colors"
            >
              {cancelBookingMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {t('calendar.drawer.yes_cancel', 'Yes, Cancel')}
            </button>
          </div>
        </div>
      );
    }

    // DELETE panel
    if (panel === 'delete') {
      return (
        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            {t('calendar.drawer.delete_confirm', 'Permanently delete this slot? This cannot be undone.')}
          </p>
          {deleteMutation.isError && (
            <p className="text-xs text-red-500">
              {(deleteMutation.error as any)?.response?.data?.error
                ?? t('calendar.drawer.error', 'An error occurred.')}
            </p>
          )}
          <div className="flex gap-2">
            <button onClick={() => setPanel('view')} className="flex-1 py-2 px-3 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
              {t('calendar.drawer.no', 'Back')}
            </button>
            <button
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 transition-colors"
            >
              {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {t('calendar.drawer.confirm_delete', 'Delete')}
            </button>
          </div>
        </div>
      );
    }

    // VIEW panel (default)
    return (
      <div className="space-y-5">
        {/* Date / time / type */}
        {renderSlotInfo()}

        {/* Student info */}
        {renderStudentInfo()}

        {/* Pending: Approve / Reject */}
        {pendingBooking && (
          <div className="border-t border-slate-100 pt-4 space-y-2">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              {t('calendar.drawer.actions', 'Actions')}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => approveMutation.mutate()}
                disabled={approveMutation.isPending}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-colors',
                  'bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50'
                )}
              >
                {approveMutation.isPending
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <Check className="h-4 w-4" />}
                {t('calendar.drawer.approve', 'Approve')}
              </button>
              <button
                onClick={() => setPanel('reject')}
                disabled={approveMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-colors bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 disabled:opacity-50"
              >
                <XCircle className="h-4 w-4" />
                {t('calendar.drawer.reject', 'Reject')}
              </button>
            </div>
            {approveMutation.isError && (
              <p className="text-xs text-red-500">{t('calendar.drawer.error', 'An error occurred.')}</p>
            )}
          </div>
        )}

        {/* Meeting notes (only when there's a booking) */}
        {activeBooking && (
          <div className="border-t border-slate-100 pt-4">
            <button
              onClick={() => setNotesOpen(true)}
              className="flex items-center gap-2 text-sm text-edu-blue-600 hover:text-edu-blue-700 font-medium transition-colors"
            >
              <FileText className="h-4 w-4" />
              {t('calendar.drawer.notes', 'Meeting Notes')}
              <ChevronDown className="h-3 w-3 ml-auto" />
            </button>
          </div>
        )}
      </div>
    );
  };

  // ── footer actions ────────────────────────────────────────────────────────
  const renderFooter = () => {
    if (!slot || panel !== 'view') return null;

    return (
      <div className="px-5 py-4 border-t border-slate-100 space-y-2">
        {/* Edit button — available unless cancelled */}
        {!isCancelled && (
          <button
            onClick={openEdit}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Edit2 className="h-4 w-4" />
            {t('calendar.drawer.edit_slot', 'Edit Slot')}
          </button>
        )}

        {/* Cancel booking (booked slot) */}
        {confirmedBooking && !isCancelled && (
          <button
            onClick={() => setPanel('cancel-booking')}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors border border-red-200"
          >
            <XCircle className="h-4 w-4" />
            {t('calendar.drawer.cancel_booking_btn', 'Cancel Booking & Notify Student')}
          </button>
        )}

        {/* Cancel slot (no booking, not yet cancelled) */}
        {!activeBooking && !isCancelled && (
          <button
            onClick={() => setPanel('cancel-lesson')}
            className="w-full text-sm text-red-500 hover:text-red-600 font-medium py-1 transition-colors"
          >
            {t('calendar.drawer.cancel_lesson', 'Cancel Slot')}
          </button>
        )}

        {/* Delete — only when no active booking (cancelled slots or empty available slots) */}
        {hasNoBookings && (
          <button
            onClick={() => setPanel('delete')}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            {t('calendar.drawer.delete_slot', 'Delete Slot')}
          </button>
        )}
      </div>
    );
  };

  // ── panel title ───────────────────────────────────────────────────────────
  const panelTitle = () => {
    if (panel === 'edit') return t('calendar.drawer.editing', 'Edit Slot');
    if (panel === 'reject') return t('calendar.drawer.rejecting', 'Reject Booking');
    if (panel === 'cancel-booking') return t('calendar.drawer.cancelling_booking', 'Cancel Booking');
    if (panel === 'cancel-lesson') return t('calendar.drawer.cancelling', 'Cancel Slot');
    if (panel === 'delete') return t('calendar.drawer.deleting', 'Delete Slot');
    return t('calendar.drawer.title', 'Slot Details');
  };

  return (
    <AnimatePresence>
      {open && slot && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed right-0 top-0 bottom-0 w-[400px] z-50 bg-white shadow-xl border-l border-slate-200 flex flex-col"
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 sticky top-0 bg-white z-10 flex-none">
            <div className="flex items-center gap-2">
              {panel !== 'view' && (
                <button
                  onClick={() => setPanel('view')}
                  className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <h2 className="text-base font-semibold text-slate-800">{panelTitle()}</h2>
            </div>
            <button
              onClick={() => { setPanel('view'); onClose(); }}
              className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400"
              aria-label={t('calendar.drawer.close', 'Close')}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {renderPanel()}
          </div>

          {/* Footer */}
          {renderFooter()}

          {/* Meeting notes modal */}
          {activeBooking && (
            <MeetingNotesEditor
              open={notesOpen}
              onOpenChange={setNotesOpen}
              bookingId={activeBooking.id}
              sessionTitle={slot.title ?? undefined}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
