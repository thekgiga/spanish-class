/**
 * SlotEventDrawer — contextual detail panel for a calendar event.
 *
 * Desktop: right Drawer (420px). Mobile: inherits bottom-sheet behavior
 * from the Drawer primitive (max-h-sheet, rounded top).
 *
 * Action sets per lifecycle state:
 *   Open slot        → Edit, Schedule for student(s), Cancel
 *   Pending approval → Approve, Reject (requires reason)
 *   Confirmed lesson → Join meeting (if link), Mark no-show, Cancel
 *   Personal block   → Remove
 *   Completed        → read-only
 *   Cancelled        → Remove
 *
 * Group scheduling:
 *   For an available GROUP slot the professor can pre-enroll 1–N specific
 *   students while leaving remaining seats open for self-booking. Each
 *   confirmed add stays in the panel; the professor presses "Done" to finish.
 */
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Video, ExternalLink, AlertCircle, Clock, Users, Lock, Globe, User, Search, Check, NotebookPen, FileText, BookOpen, Eye } from 'lucide-react';
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
import { slotDisplayStatus, isBookingPending, isBookingConfirmed, bookingStatusToUi } from '@/lib/ui-system/status';
import { professorApi, getSlotParticipants } from '@/lib/api';
import type { AvailabilitySlotWithBookings } from '@spanish-class/shared';
import { SlotType } from '@spanish-class/shared';
import { getInitials, formatTime } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface StudentOption {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

// ── Prop types ─────────────────────────────────────────────────────────────

export interface SlotEventDrawerProps {
  open: boolean;
  onClose: () => void;
  slot: AvailabilitySlotWithBookings | null;
  onEdit?: (slotId: string) => void;
  /** For Storybook / test fixtures: start with the schedule panel pre-opened. */
  initialScheduleOpen?: boolean;
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

export function SlotEventDrawer({ open, onClose, slot, onEdit, initialScheduleOpen }: SlotEventDrawerProps) {
  const { t } = useTranslation('admin');
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [rejectOpen, setRejectOpen] = React.useState(false);
  const [rejectReason, setRejectReason] = React.useState('');
  const [rejectError, setRejectError] = React.useState('');
  // CANCEL-002: professor provides an optional reason when cancelling a slot
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const [cancelReason, setCancelReason] = React.useState('');
  // Schedule-for-student panel (available slots — individual and group)
  const [scheduleOpen, setScheduleOpen] = React.useState(() => initialScheduleOpen ?? false);
  const [scheduleStudentId, setScheduleStudentId] = React.useState('');
  const [scheduleSearch, setScheduleSearch] = React.useState('');
  const [scheduleError, setScheduleError] = React.useState('');
  // Group-mode: track students added this session without closing the panel
  const [locallyAddedStudentIds, setLocallyAddedStudentIds] = React.useState<Set<string>>(new Set());
  const [lastAddedStudentName, setLastAddedStudentName] = React.useState('');

  const scheduleSearchRef = React.useRef<HTMLInputElement>(null);
  const scheduleTriggerRef = React.useRef<HTMLButtonElement>(null);

  // Auto-focus search input when panel opens; return focus to trigger when it closes
  React.useEffect(() => {
    if (scheduleOpen) {
      requestAnimationFrame(() => scheduleSearchRef.current?.focus());
    } else {
      requestAnimationFrame(() => scheduleTriggerRef.current?.focus());
    }
  }, [scheduleOpen]);

  // Re-focus search input when selected student is cleared (Change pressed)
  const handleClearSelectedStudent = () => {
    setScheduleStudentId('');
    setScheduleSearch('');
    requestAnimationFrame(() => scheduleSearchRef.current?.focus());
  };

  // Reset schedule panel when drawer closes
  React.useEffect(() => {
    if (!open) {
      setScheduleOpen(false);
      setScheduleStudentId('');
      setScheduleSearch('');
      setScheduleError('');
      setLocallyAddedStudentIds(new Set());
      setLastAddedStudentName('');
    }
  }, [open]);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['professor-slots'] });
    qc.invalidateQueries({ queryKey: ['pending-bookings'] });
    qc.invalidateQueries({ queryKey: ['professor-dashboard'] });
    // Refresh participant list for group slots
    if (slot) qc.invalidateQueries({ queryKey: ['slot-participants', slot.id] });
  };

  // Auto-focus the reject textarea when the panel opens
  const rejectTextareaRef = React.useRef<HTMLTextAreaElement>(null);
  React.useEffect(() => {
    if (rejectOpen) {
      requestAnimationFrame(() => rejectTextareaRef.current?.focus());
    }
  }, [rejectOpen]);

  // Participants for GROUP slots — used for the alreadyEnrolledIds filter during scheduling
  const { data: participantsData } = useQuery({
    queryKey: ['slot-participants', slot?.id],
    queryFn: () => getSlotParticipants(slot!.id),
    enabled: open && !!slot && slot.slotType === SlotType.GROUP && scheduleOpen,
  });

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

  const handleOpenNotes = () => {
    onClose();
    navigate(`/admin/session/${slot!.id}`);
  };

  // Fetch session notes when a completed slot is open
  const { data: sessionData } = useQuery({
    queryKey: ['session', slot?.id],
    queryFn: () => professorApi.getSession(slot!.id),
    enabled: open && !!slot && slotDisplayStatus(slot) === 'completed',
    staleTime: 5 * 60 * 1000,
  });

  // Students for the schedule panel (only loaded when the panel is open)
  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ['professor-students'],
    queryFn: () => professorApi.getStudents({ limit: 100 }),
    enabled: scheduleOpen,
  });

  const allStudents = React.useMemo<StudentOption[]>(() => {
    return ((studentsData?.data ?? []) as any[])
      .map(s => ({ id: s.id, firstName: s.firstName, lastName: s.lastName, email: s.email }))
      .sort((a: StudentOption, b: StudentOption) =>
        `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
      );
  }, [studentsData]);

  // For group slots: IDs already enrolled (server-confirmed) plus locally added this session
  const alreadyEnrolledIds = React.useMemo<Set<string>>(() => {
    if (slot?.slotType !== SlotType.GROUP) return new Set<string>();
    const ids = new Set<string>(locallyAddedStudentIds);
    (participantsData?.participants ?? []).forEach((p: any) => ids.add(p.student.id));
    return ids;
  }, [slot?.slotType, participantsData, locallyAddedStudentIds]);

  const filteredStudents = React.useMemo<StudentOption[]>(() => {
    // Exclude already-enrolled students from the picker in group mode
    const list = slot?.slotType === SlotType.GROUP
      ? allStudents.filter(s => !alreadyEnrolledIds.has(s.id))
      : allStudents;
    if (!scheduleSearch) return list;
    const q = scheduleSearch.toLowerCase();
    return list.filter(s =>
      s.firstName.toLowerCase().includes(q) ||
      s.lastName.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q)
    );
  }, [allStudents, scheduleSearch, slot?.slotType, alreadyEnrolledIds]);

  const selectedStudent = allStudents.find(s => s.id === scheduleStudentId);

  const scheduleForStudentMutation = useMutation({
    mutationFn: () => professorApi.bookStudent({ slotId: slot!.id, studentId: scheduleStudentId, sendInvitation: true }),
    onSuccess: () => {
      invalidate();
      if (slot?.slotType === SlotType.GROUP) {
        // Group mode: stay in the panel to allow adding more students
        const added = allStudents.find(s => s.id === scheduleStudentId);
        setLocallyAddedStudentIds(prev => {
          const next = new Set(prev);
          next.add(scheduleStudentId);
          return next;
        });
        setLastAddedStudentName(added ? `${added.firstName} ${added.lastName}` : '');
        setScheduleStudentId('');
        setScheduleSearch('');
        setScheduleError('');
        requestAnimationFrame(() => scheduleSearchRef.current?.focus());
      } else {
        // Individual: close and toast
        onClose();
        uiToast.success(t('calendar.schedule_for_student_success'));
      }
    },
    onError: () => {
      uiToast.error(t('calendar.error_generic'));
      setScheduleError(t('calendar.schedule_for_student_error'));
    },
  });

  const handleScheduleForStudent = () => {
    if (!scheduleStudentId) { setScheduleError(t('calendar.schedule_for_student_required')); return; }
    scheduleForStudentMutation.mutate();
  };

  if (!slot) return null;

  const isGroup = slot.slotType === SlotType.GROUP;

  // Local capacity tracking during a group scheduling session
  const localCurrentParticipants = slot.currentParticipants + locallyAddedStudentIds.size;
  const isSlotNowFull = isGroup && localCurrentParticipants >= slot.maxParticipants;

  // Determine effective status via the single central authority in status.ts
  const pendingBooking   = slot.bookings.find(isBookingPending);
  const confirmedBooking = slot.bookings.find(isBookingConfirmed);
  const displayStatus = slotDisplayStatus(slot);

  const slotStart = new Date(slot.startTime);
  const timeLabel = `${formatTime(slot.startTime)} – ${formatTime(slot.endTime)}`;
  const dateLabel = format(slotStart, 'EEEE, MMMM d, yyyy');
  const displayTitle = slot.title || (slot.slotType === SlotType.BLOCKED ? t('calendar.blocked_title') : t('calendar.lesson'));

  const handleReject = () => {
    if (!rejectReason.trim()) { setRejectError(t('calendar.reject_reason_required')); return; }
    if (!pendingBooking) return;
    rejectMutation.mutate({ id: pendingBooking.id, reason: rejectReason.trim() });
  };

  // Handlers for the group schedule Done/Back buttons
  const handleGroupScheduleDone = () => {
    const added = locallyAddedStudentIds.size;
    setScheduleOpen(false);
    setLocallyAddedStudentIds(new Set());
    setLastAddedStudentName('');
    onClose();
    uiToast.success(
      added === 1
        ? t('calendar.schedule_for_student_success')
        : t('calendar.schedule_group_done', { count: added })
    );
  };

  const handleGroupScheduleBack = () => {
    const added = locallyAddedStudentIds.size;
    setScheduleOpen(false);
    setScheduleStudentId('');
    setScheduleSearch('');
    setScheduleError('');
    setLocallyAddedStudentIds(new Set());
    setLastAddedStudentName('');
    if (added > 0) {
      uiToast.success(
        added === 1
          ? t('calendar.schedule_for_student_success')
          : t('calendar.schedule_group_done', { count: added })
      );
    }
  };

  return (
    <Drawer open={open} onOpenChange={(v) => !v && onClose()}>
      <DrawerContent busy={approveMutation.isPending || rejectMutation.isPending || cancelMutation.isPending || deleteMutation.isPending || scheduleForStudentMutation.isPending}>
        <DrawerHeader>
          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={displayStatus} variant="tag" />
            </div>
            <DrawerTitle className="text-h3">
              {displayTitle}
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

          {/* Slot configuration — session type + visibility */}
          {slot.slotType !== SlotType.BLOCKED && (
            <div className="space-y-1.5">
              <SlotMetaRow icon={slot.slotType === SlotType.GROUP ? Users : User}>
                {slot.slotType === SlotType.GROUP
                  ? t('slot_form.session_type_group')
                  : t('slot_form.session_type_individual')}
              </SlotMetaRow>
              {slot.isPrivate ? (
                <SlotMetaRow icon={Lock}>
                  {(slot.allowedStudents && slot.allowedStudents.length > 0)
                    ? t('slot_event.visible_to', {
                        names: slot.allowedStudents
                          .map(s => s.student
                            ? `${s.student.firstName} ${s.student.lastName}`
                            : '…')
                          .join(', '),
                      })
                    : t('slot_event.private_no_students')}
                </SlotMetaRow>
              ) : (
                <SlotMetaRow icon={Globe}>
                  {t('slot_event.visible_to_everyone')}
                </SlotMetaRow>
              )}
            </div>
          )}

          {/* Participants — shown for all non-blocked slots with at least one active booking */}
          {slot.slotType !== SlotType.BLOCKED && (() => {
            const activeBookings = slot.bookings.filter(
              b => bookingStatusToUi(b.status) !== 'cancelled'
            );
            if (activeBookings.length === 0) return null;
            return (
              <div className="divide-y divide-line rounded-ui-sm border border-line overflow-hidden">
                {activeBookings.map(b => (
                  <div key={b.id} className="flex items-center gap-3 px-3 py-2.5 bg-surface">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="bg-brand/10 text-brand text-caption font-semibold">
                        {getInitials(b.student.firstName, b.student.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-small font-medium text-ink truncate">
                        {b.student.firstName} {b.student.lastName}
                      </p>
                      <p className="text-caption text-ink-tertiary truncate">{b.student.email}</p>
                    </div>
                    <StatusBadge status={bookingStatusToUi(b.status)} variant="tag" />
                  </div>
                ))}
              </div>
            );
          })()}

          {/* GROUP slot: capacity counter + lazy-loaded participant detail (enriched data from API) */}
          {isGroup && (
            <div className="space-y-2">
              <SlotMetaRow icon={Users}>
                {t('slot_form.participants_count', {
                  current: localCurrentParticipants,
                  max: slot.maxParticipants,
                })}
              </SlotMetaRow>
            </div>
          )}

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

          {/* Schedule-for-student panel — available slots (individual and group) */}
          {scheduleOpen && (
            <div className="space-y-3">
              <p className="text-small text-ink-secondary">
                {isGroup
                  ? t('calendar.schedule_for_group_hint')
                  : t('calendar.schedule_for_student_hint')}
              </p>

              {/* Group mode: inline success chip after each confirmed add */}
              {isGroup && lastAddedStudentName && (
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-ui-sm bg-status-confirmed-surface border border-status-confirmed-border text-status-confirmed-foreground text-small"
                  role="status"
                  aria-live="polite"
                >
                  <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{t('calendar.schedule_for_student_added', { name: lastAddedStudentName })}</span>
                </div>
              )}

              {/* Group mode: slot now full — no more picks */}
              {isSlotNowFull ? (
                <InlineAlert variant="info" className="text-small">
                  {t('calendar.schedule_group_now_full')}
                </InlineAlert>
              ) : selectedStudent ? (
                /* Selected student chip */
                <div className="flex items-center gap-3 p-3 rounded-ui-sm bg-status-confirmed-surface border border-status-confirmed-border">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-brand text-brand-contrast text-caption font-semibold">
                      {getInitials(selectedStudent.firstName, selectedStudent.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-small font-semibold text-ink truncate">
                      {selectedStudent.firstName} {selectedStudent.lastName}
                    </p>
                    <p className="text-caption text-ink-tertiary truncate">{selectedStudent.email}</p>
                  </div>
                  <button
                    type="button"
                    className="text-caption text-ink-secondary underline underline-offset-2 shrink-0 hover:text-ink transition-colors"
                    onClick={handleClearSelectedStudent}
                    aria-label={t('calendar.schedule_change_student')}
                  >
                    {t('calendar.schedule_change_student')}
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-tertiary pointer-events-none" aria-hidden="true" />
                    <input
                      ref={scheduleSearchRef}
                      type="search"
                      value={scheduleSearch}
                      onChange={e => { setScheduleSearch(e.target.value); setScheduleError(''); }}
                      placeholder={t('calendar.schedule_search_placeholder')}
                      className="w-full pl-9 pr-3 py-2 rounded-ui-sm border border-line bg-surface text-small text-ink placeholder:text-ink-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:border-transparent transition-colors duration-micro"
                      aria-label={t('calendar.schedule_search_placeholder')}
                      aria-controls="schedule-student-list"
                    />
                  </div>
                  <ul
                    id="schedule-student-list"
                    role="listbox"
                    aria-label={t('calendar.schedule_student_list_label')}
                    className="max-h-48 overflow-y-auto rounded-ui-sm border border-line divide-y divide-line bg-surface"
                  >
                    {studentsLoading ? (
                      <li className="px-3 py-3 text-caption text-ink-tertiary text-center">
                        {t('calendar.schedule_loading_students')}
                      </li>
                    ) : filteredStudents.length === 0 && scheduleSearch ? (
                      <li className="px-3 py-3 text-caption text-ink-tertiary text-center">
                        {t('calendar.schedule_no_results')}
                      </li>
                    ) : filteredStudents.length === 0 ? (
                      <li className="px-3 py-3 text-caption text-ink-tertiary text-center">
                        {t('calendar.schedule_no_students')}
                      </li>
                    ) : filteredStudents.map(s => (
                      <li
                        key={s.id}
                        role="option"
                        aria-selected={scheduleStudentId === s.id}
                      >
                        <button
                          type="button"
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-surface-raised transition-colors duration-micro focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-inset"
                          onClick={() => { setScheduleStudentId(s.id); setScheduleError(''); }}
                        >
                          <Avatar className="h-7 w-7 shrink-0">
                            <AvatarFallback className="bg-brand/10 text-brand text-caption font-semibold">
                              {getInitials(s.firstName, s.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-small font-medium text-ink truncate">{s.firstName} {s.lastName}</p>
                            <p className="text-caption text-ink-tertiary truncate">{s.email}</p>
                          </div>
                          {scheduleStudentId === s.id && (
                            <Check className="h-4 w-4 text-brand shrink-0" aria-hidden="true" />
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {scheduleError && (
                <p className="text-caption text-feedback-danger" role="alert">{scheduleError}</p>
              )}
            </div>
          )}

          {/* COMPLETED — show session notes read-only */}
          {displayStatus === 'completed' && (() => {
            const note = sessionData?.note;
            const hasAny = note && (note.sessionNotes || note.homeworkNotes || note.agendaNotes || note.studentObservation);
            if (!hasAny) return null;
            return (
              <div className="space-y-3">
                <p className="text-caption text-ink-tertiary uppercase tracking-wider font-medium">
                  {t('session.session_notes_label')}
                </p>
                {note.sessionNotes && (
                  <div className="rounded-ui-sm border border-line bg-surface-raised p-3 space-y-1">
                    <div className="flex items-center gap-1.5 text-caption text-ink-secondary font-medium">
                      <FileText className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      {t('session.notes_general')}
                    </div>
                    <p className="text-small text-ink whitespace-pre-wrap">{note.sessionNotes}</p>
                  </div>
                )}
                {note.homeworkNotes && (
                  <div className="rounded-ui-sm border border-line bg-surface-raised p-3 space-y-1">
                    <div className="flex items-center gap-1.5 text-caption text-ink-secondary font-medium">
                      <BookOpen className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      {t('session.notes_homework')}
                    </div>
                    <p className="text-small text-ink whitespace-pre-wrap">{note.homeworkNotes}</p>
                  </div>
                )}
                {note.studentObservation && (
                  <div className="rounded-ui-sm border border-line bg-surface-raised p-3 space-y-1">
                    <div className="flex items-center gap-1.5 text-caption text-ink-secondary font-medium">
                      <Eye className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      {t('session.notes_observation')}
                    </div>
                    <p className="text-small text-ink whitespace-pre-wrap">{note.studentObservation}</p>
                  </div>
                )}
              </div>
            );
          })()}
        </DrawerBody>

        {/* Footer actions — vary by status */}
        <DrawerFooter className="flex-wrap gap-2">
          {/* GROUP schedule mode — overrides status-based footer while the panel is open.
              This ensures the Done/Confirm buttons remain stable even if the slot
              reaches capacity and its display status becomes 'blocked' mid-session. */}
          {scheduleOpen && isGroup && (
            isSlotNowFull ? (
              <Button variant="primary" onClick={handleGroupScheduleDone}>
                {t('calendar.schedule_done')}
              </Button>
            ) : (
              <>
                <Button
                  variant="secondary"
                  onClick={locallyAddedStudentIds.size > 0 ? handleGroupScheduleDone : handleGroupScheduleBack}
                >
                  {locallyAddedStudentIds.size > 0 ? t('calendar.schedule_done') : t('calendar.back')}
                </Button>
                <Button
                  variant="primary"
                  isLoading={scheduleForStudentMutation.isPending}
                  onClick={handleScheduleForStudent}
                >
                  {t('calendar.schedule_for_student_confirm')}
                </Button>
              </>
            )
          )}

          {/* AVAILABLE — individual slot schedule mode and default actions */}
          {displayStatus === 'available' && !(scheduleOpen && isGroup) && (
            scheduleOpen ? (
              <>
                <Button variant="secondary" onClick={() => { setScheduleOpen(false); setScheduleStudentId(''); setScheduleSearch(''); setScheduleError(''); }}>
                  {t('calendar.back')}
                </Button>
                <Button
                  variant="primary"
                  isLoading={scheduleForStudentMutation.isPending}
                  onClick={handleScheduleForStudent}
                >
                  {t('calendar.schedule_for_student_confirm')}
                </Button>
              </>
            ) : cancelOpen ? (
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
                <Button variant="secondary" onClick={handleOpenNotes}>
                  <NotebookPen className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                  {t('session.open_notes')}
                </Button>
                <Button ref={scheduleTriggerRef} variant="primary" onClick={() => setScheduleOpen(true)}>
                  {t('calendar.schedule_for_student')}
                </Button>
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
          {displayStatus === 'confirmed' && confirmedBooking && !(scheduleOpen && isGroup) && (
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
                {/* GROUP slot with open seats: allow adding more students */}
                {isGroup && slot.currentParticipants < slot.maxParticipants && (
                  <Button ref={scheduleTriggerRef} variant="secondary" onClick={() => setScheduleOpen(true)}>
                    {t('calendar.add_student_to_class')}
                  </Button>
                )}
                {slotStart <= new Date() && (
                  <Button
                    variant="quiet"
                    isLoading={noShowMutation.isPending}
                    onClick={() => noShowMutation.mutate(confirmedBooking.id)}
                  >
                    {t('calendar.mark_no_show')}
                  </Button>
                )}
                <Button
                  variant="primary"
                  onClick={handleOpenNotes}
                >
                  <NotebookPen className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                  {t('session.open_notes')}
                </Button>
                <Button variant="danger" onClick={() => setCancelOpen(true)}>
                  {t('calendar.cancel_slot')}
                </Button>
              </>
            )
          )}

          {/* BLOCKED — professor's own blocking slot: just remove it */}
          {slot.slotType === SlotType.BLOCKED && (
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

          {/* COMPLETED — open notes to review / edit */}
          {displayStatus === 'completed' && (
            <Button variant="secondary" onClick={handleOpenNotes}>
              <NotebookPen className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
              {t('session.open_notes')}
            </Button>
          )}

          {/* FULLY BOOKED group slot — professor can cancel or open notes */}
          {displayStatus === 'blocked' && slot.slotType !== SlotType.BLOCKED && !(scheduleOpen && isGroup) && (
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
                <Button variant="secondary" onClick={handleOpenNotes}>
                  <NotebookPen className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                  {t('session.open_notes')}
                </Button>
                <Button variant="danger" onClick={() => setCancelOpen(true)}>
                  {t('calendar.cancel_slot')}
                </Button>
              </>
            )
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
