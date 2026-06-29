import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ArrowLeft, CalendarPlus, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { professorApi } from '@/lib/api';
import { StudentSelector } from '../professor/StudentSelector';

export interface CreateSlotPopoverProps {
  open: boolean;
  onClose: () => void;
  startTime: Date | null;
  endTime: Date | null;
  anchorStyle?: React.CSSProperties;
  onCreated: () => void;
}

type Step = 'choose' | 'booking-request' | 'loading' | 'success';

export function CreateSlotPopover({
  open,
  onClose,
  startTime,
  endTime,
  anchorStyle,
  onCreated,
}: CreateSlotPopoverProps) {
  const { t } = useTranslation('admin');
  const queryClient = useQueryClient();

  const [step, setStep] = useState<Step>('choose');
  const [selectedStudentId, setSelectedStudentId] = useState<string | undefined>();
  const [approveLater, setApproveLater] = useState(true);

  // Reset on open
  useEffect(() => {
    if (open) {
      setStep('choose');
      setSelectedStudentId(undefined);
      setApproveLater(true);
    }
  }, [open]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const createMutation = useMutation({
    mutationFn: (type: 'available' | 'blocked' | 'booking-request') => {
      if (!startTime || !endTime) throw new Error('No time range');

      if (type === 'blocked') {
        return professorApi.createSlot({
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          slotType: 'BLOCKED',
          maxParticipants: 1,
          isPrivate: true,
          allowedStudentIds: [],
        });
      }

      if (type === 'booking-request') {
        return professorApi.createSlot({
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          slotType: 'INDIVIDUAL',
          maxParticipants: 1,
          isPrivate: true,
          allowedStudentIds: selectedStudentId ? [selectedStudentId] : [],
        });
      }

      // available
      return professorApi.createSlot({
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        slotType: 'INDIVIDUAL',
        maxParticipants: 1,
        isPrivate: false,
        allowedStudentIds: [],
      });
    },
    onSuccess: () => {
      setStep('success');
      queryClient.invalidateQueries({ queryKey: ['professor-slots'] });
      queryClient.invalidateQueries({ queryKey: ['slots'] });
      onCreated();
      setTimeout(() => {
        onClose();
      }, 700);
    },
    onError: () => {
      // stay on 'choose' step so user can see the error message
      setStep('choose');
    },
  });

  const timeLabel =
    startTime && endTime
      ? `${format(startTime, 'EEE MMM d')} · ${format(startTime, 'HH:mm')} – ${format(endTime, 'HH:mm')}`
      : '';

  // Default anchor position
  const defaultPosition: React.CSSProperties = {
    position: 'fixed',
    top: '40%',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 100,
  };

  const positionStyle: React.CSSProperties = anchorStyle
    ? { position: 'fixed', zIndex: 100, ...anchorStyle }
    : defaultPosition;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="z-[100] w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            style={positionStyle}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                {step === 'booking-request' && (
                  <button
                    onClick={() => setStep('choose')}
                    className="p-1 rounded-lg hover:bg-slate-100 transition-colors text-slate-500"
                    aria-label={t('calendar.popover.back', 'Back')}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                )}
                <span className="text-xs text-slate-500 font-medium">{timeLabel}</span>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-slate-100 transition-colors text-slate-400"
                aria-label={t('calendar.popover.close', 'Close')}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-3">
              {(step === 'loading' || createMutation.isPending) && step !== 'success' ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-edu-blue-600" />
                </div>
              ) : step === 'success' ? (
                <div className="flex flex-col items-center py-6 gap-2">
                  <div className="w-10 h-10 rounded-full bg-edu-emerald-100 flex items-center justify-center">
                    <CalendarPlus className="h-5 w-5 text-edu-emerald-600" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">
                    {t('calendar.popover.created', 'Slot created!')}
                  </p>
                </div>
              ) : step === 'choose' ? (
                <div className="space-y-2">
                  {/* Available Slot */}
                  <button
                    onClick={() => createMutation.mutate('available')}
                    disabled={createMutation.isPending}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all',
                      'border-green-300 bg-green-50 text-green-800 hover:bg-green-100 hover:border-green-400',
                      'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                  >
                    <span className="text-lg">📅</span>
                    <div className="text-left">
                      <p className="text-sm font-semibold">
                        {t('calendar.popover.available_slot', 'Available Slot')}
                      </p>
                      <p className="text-xs opacity-70">
                        {t('calendar.popover.available_slot_desc', 'Open for students to book')}
                      </p>
                    </div>
                  </button>

                  {/* Booking Request */}
                  <button
                    onClick={() => setStep('booking-request')}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all',
                      'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 hover:border-amber-400'
                    )}
                  >
                    <span className="text-lg">👤</span>
                    <div className="text-left">
                      <p className="text-sm font-semibold">
                        {t('calendar.popover.booking_request', 'Booking Request')}
                      </p>
                      <p className="text-xs opacity-70">
                        {t('calendar.popover.booking_request_desc', 'Assign to a specific student')}
                      </p>
                    </div>
                  </button>

                  {/* Blocked Time */}
                  <button
                    onClick={() => createMutation.mutate('blocked')}
                    disabled={createMutation.isPending}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all',
                      'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:border-slate-300',
                      'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                  >
                    <span className="text-lg">🚫</span>
                    <div className="text-left">
                      <p className="text-sm font-semibold">
                        {t('calendar.popover.blocked_time', 'Blocked Time')}
                      </p>
                      <p className="text-xs opacity-70">
                        {t('calendar.popover.blocked_time_desc', 'Unavailable / personal time')}
                      </p>
                    </div>
                  </button>

                  {createMutation.isError && (
                    <p className="text-xs text-red-500 text-center pt-1">
                      {(createMutation.error as any)?.response?.data?.error
                        ?? (createMutation.error as any)?.response?.data?.details?.[0]?.message
                        ?? t('calendar.popover.error', 'Failed to create slot. Try again.')}
                    </p>
                  )}
                </div>
              ) : (
                /* Booking request step */
                <div className="space-y-4">
                  <StudentSelector
                    value={selectedStudentId}
                    onChange={setSelectedStudentId}
                    disabled={createMutation.isPending}
                  />

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={approveLater}
                      onChange={(e) => setApproveLater(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-edu-blue-600 focus:ring-edu-blue-500"
                    />
                    <span className="text-sm text-slate-700">
                      {t('calendar.popover.approve_later', 'Approve later')}
                    </span>
                  </label>

                  {createMutation.isError && (
                    <p className="text-xs text-red-500">
                      {t('calendar.popover.error', 'Failed to create slot. Try again.')}
                    </p>
                  )}

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => setStep('choose')}
                      className="flex-1 py-2 px-3 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      {t('calendar.popover.back', 'Back')}
                    </button>
                    <button
                      onClick={() => createMutation.mutate('booking-request')}
                      disabled={!selectedStudentId || createMutation.isPending}
                      className={cn(
                        'flex-1 py-2 px-3 rounded-xl text-sm font-semibold transition-colors',
                        'bg-edu-blue-600 text-white hover:bg-edu-blue-700',
                        'disabled:opacity-50 disabled:cursor-not-allowed'
                      )}
                    >
                      {createMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                      ) : (
                        t('calendar.popover.save', 'Save')
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
