import { AnimatePresence, motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  Lock,
  User,
  Users,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getDuration } from '@/lib/utils';
import { studentApi } from '@/lib/api';
import type { CalendarSlot } from './EventCard';

export interface SlotDetailDrawerProps {
  slot: (CalendarSlot & { isBookedByMe?: boolean; waitlistPosition?: number }) | null;
  open: boolean;
  onClose: () => void;
  onBooked?: () => void;
}

export function SlotDetailDrawer({
  slot,
  open,
  onClose,
  onBooked,
}: SlotDetailDrawerProps) {
  const { t } = useTranslation('student');
  const queryClient = useQueryClient();

  const bookMutation = useMutation({
    mutationFn: () => {
      if (!slot) throw new Error('No slot');
      return studentApi.bookSlot(slot.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-slots'] });
      queryClient.invalidateQueries({ queryKey: ['slots'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      onBooked?.();
      onClose();
    },
  });

  const cancelBookingMutation = useMutation({
    mutationFn: () => {
      if (!slot?.bookings?.[0]) throw new Error('No booking to cancel');
      return studentApi.cancelBooking(slot.bookings[0].id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-slots'] });
      queryClient.invalidateQueries({ queryKey: ['slots'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      onClose();
    },
  });

  const startDate = slot ? new Date(slot.startTime) : null;
  const endDate = slot ? new Date(slot.endTime) : null;
  const duration = startDate && endDate ? getDuration(startDate, endDate) : null;

  const isFull =
    slot?.status === 'FULLY_BOOKED' ||
    (slot?.currentParticipants ?? 0) >= (slot?.maxParticipants ?? 1);

  const isGroup = slot?.slotType === 'GROUP';

  return (
    <AnimatePresence>
      {open && slot && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed right-0 top-0 bottom-0 w-[400px] z-50 bg-white shadow-xl border-l border-slate-200 flex flex-col overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label={t('drawer.title', 'Class Details')}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
            <h2 className="text-base font-semibold text-slate-800 truncate pr-4">
              {slot.title ?? t('drawer.default_title', 'Spanish Class')}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 flex-shrink-0"
              aria-label={t('drawer.close', 'Close')}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 px-5 py-5 space-y-4">
            {/* Date / time */}
            <div className="space-y-2">
              {startDate && (
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <Calendar className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  <span>
                    {format(startDate, 'EEE, MMM d')}
                    {startDate && endDate && (
                      <span className="ml-1">
                        · {format(startDate, 'HH:mm')} – {format(endDate, 'HH:mm')}
                      </span>
                    )}
                  </span>
                </div>
              )}

              {duration && (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Clock className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  <span>{duration}</span>
                </div>
              )}

              {/* Slot type */}
              <div className="flex items-center gap-2 text-sm text-slate-700">
                {isGroup ? (
                  <Users className="h-4 w-4 text-slate-400 flex-shrink-0" />
                ) : (
                  <User className="h-4 w-4 text-slate-400 flex-shrink-0" />
                )}
                <span>
                  {isGroup
                    ? t('drawer.group', 'Group')
                    : t('drawer.individual', 'Individual')}
                </span>
                {isGroup && (
                  <span className="text-slate-400">
                    ({slot.currentParticipants}/{slot.maxParticipants}{' '}
                    {t('drawer.spots', 'spots')})
                  </span>
                )}
              </div>

              {/* Private badge */}
              {slot.isPrivate && (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Lock className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  <span>{t('drawer.private', 'Private session')}</span>
                </div>
              )}
            </div>

            {/* Already booked */}
            {slot.isBookedByMe && (
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <div className="flex items-center gap-2 text-edu-emerald-700 bg-edu-emerald-50 rounded-xl px-4 py-3">
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm font-semibold">
                    {t('drawer.already_booked', 'Already Booked')}
                  </span>
                </div>

                <button
                  onClick={() => cancelBookingMutation.mutate()}
                  disabled={cancelBookingMutation.isPending}
                  className={cn(
                    'w-full py-2 px-4 rounded-xl text-sm font-medium border border-slate-200 text-slate-600',
                    'hover:bg-slate-50 transition-colors',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  {cancelBookingMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                  ) : (
                    t('drawer.cancel_booking', 'Cancel Booking')
                  )}
                </button>

                {cancelBookingMutation.isError && (
                  <p className="text-xs text-red-500 text-center">
                    {t('drawer.error', 'Something went wrong. Try again.')}
                  </p>
                )}
              </div>
            )}

            {/* Book Now (available) */}
            {!slot.isBookedByMe && !isFull && (
              <div className="border-t border-slate-100 pt-4">
                <button
                  onClick={() => bookMutation.mutate()}
                  disabled={bookMutation.isPending}
                  className={cn(
                    'w-full py-3 px-4 rounded-xl text-sm font-semibold transition-colors',
                    'bg-edu-blue-600 hover:bg-edu-blue-700 text-white',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  {bookMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                  ) : (
                    t('drawer.book_now', 'Book Now')
                  )}
                </button>

                {bookMutation.isError && (
                  <p className="text-xs text-red-500 text-center mt-2">
                    {t('drawer.error', 'Something went wrong. Try again.')}
                  </p>
                )}
              </div>
            )}

            {/* Waitlist (full + not booked) */}
            {!slot.isBookedByMe && isFull && (
              <div className="border-t border-slate-100 pt-4 space-y-2">
                {slot.waitlistPosition != null ? (
                  <div className="rounded-xl bg-edu-amber-50 border border-edu-amber-200 px-4 py-3">
                    <p className="text-sm font-semibold text-edu-amber-800">
                      {t('drawer.waitlist_position', 'You are #{{position}} on the waitlist', {
                        position: slot.waitlistPosition,
                      })}
                    </p>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => bookMutation.mutate()}
                      disabled={bookMutation.isPending}
                      className={cn(
                        'w-full py-3 px-4 rounded-xl text-sm font-semibold transition-colors',
                        'bg-edu-amber-500 hover:bg-edu-amber-600 text-white',
                        'disabled:opacity-50 disabled:cursor-not-allowed'
                      )}
                    >
                      {bookMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                      ) : (
                        t('drawer.join_waitlist', 'Join Waitlist')
                      )}
                    </button>

                    {bookMutation.isError && (
                      <p className="text-xs text-red-500 text-center">
                        {t('drawer.error', 'Something went wrong. Try again.')}
                      </p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
