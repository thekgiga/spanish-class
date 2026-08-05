/**
 * SessionPage — Notes workspace for a lesson slot.
 *
 * Notes are always editable — before, during, and after a class.
 * "Start Class" is an optional timer action, not a prerequisite.
 * Save is explicit (one button) with dirty-state tracking.
 *
 * Route: /admin/session/:slotId
 */
import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, differenceInMinutes } from 'date-fns';
import {
  Video, ArrowLeft, Clock, User, Users, BookOpen, FileText, Eye, Save, ChevronDown,
} from 'lucide-react';
import * as Accordion from '@radix-ui/react-accordion';
import { cn } from '@/lib/utils';
import { professorApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { InlineAlert, uiToast } from '@/components/ui/inline-alert';
import { getInitials, formatTime } from '@/lib/utils';
import { useInProgressSession } from '@/hooks/useInProgressSession';
import { bookingStatusToUi } from '@/lib/ui-system/status';
import { SlotType } from '@spanish-class/shared';
import type { MeetingNote, SessionData } from '@spanish-class/shared';
import { SessionNoteSection } from './SessionNoteSection';
import { EndSessionDialog } from './EndSessionDialog';

// ── Elapsed timer ──────────────────────────────────────────────────────────

function ElapsedTimer({ startedAt }: { startedAt: number }) {
  const [elapsed, setElapsed] = React.useState(0);
  React.useEffect(() => {
    setElapsed(Date.now() - startedAt);
    const id = setInterval(() => setElapsed(Date.now() - startedAt), 1000);
    return () => clearInterval(id);
  }, [startedAt]);
  const totalSeconds = Math.floor(elapsed / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return (
    <span className="font-mono text-body text-ink-secondary tabular-nums">
      {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
    </span>
  );
}

// ── Student panel (desktop left rail) ─────────────────────────────────────

function SessionStudentPanel({ session }: { session: SessionData }) {
  const { t } = useTranslation('admin');
  const navigate = useNavigate();
  const { slot } = session;
  const bookings = slot.bookings.filter(
    (b) => bookingStatusToUi(b.status) !== 'cancelled',
  );
  const isGroup = slot.slotType === SlotType.GROUP;
  const durationMin = differenceInMinutes(new Date(slot.endTime), new Date(slot.startTime));

  // Fetch full session notes history for the primary student
  const primaryStudentId = bookings[0]?.studentId;
  const { data: sessionHistory } = useQuery({
    queryKey: ['student-session-notes', primaryStudentId],
    queryFn: () => professorApi.getStudentSessionNotes(primaryStudentId!),
    enabled: !!primaryStudentId,
    staleTime: 60_000,
  });

  // Past sessions = all except the one currently open, newest first
  const pastSessions = React.useMemo(() => {
    if (!sessionHistory) return [];
    return sessionHistory
      .filter((sn: any) => sn.slotId !== slot.id)
      .sort((a: any, b: any) =>
        new Date(b.slot?.startTime ?? 0).getTime() - new Date(a.slot?.startTime ?? 0).getTime()
      );
  }, [sessionHistory, slot.id]);

  return (
    <aside
      className="hidden lg:flex flex-col w-64 shrink-0 bg-surface border-r border-line overflow-y-auto"
      aria-label={t('session.mobile_tab_student')}
    >
      {/* Lesson info */}
      <div className="px-4 py-3 border-b border-line">
        <p className="text-caption text-ink-tertiary uppercase tracking-wider font-medium mb-1">
          {t('session.mobile_tab_info')}
        </p>
        <p className="text-small text-ink">
          {isGroup
            ? t('session.slot_type_group', { duration: durationMin })
            : t('session.slot_type_individual', { duration: durationMin })}
        </p>
      </div>

      {/* Students */}
      <div className="px-4 py-3 border-b border-line space-y-2">
        <p className="text-caption text-ink-tertiary uppercase tracking-wider font-medium">
          {isGroup ? t('slot_form.session_type_group') : t('slot_form.session_type_individual')}
        </p>
        {bookings.length === 0 ? (
          <p className="text-caption text-ink-tertiary">{t('session.no_previous_notes')}</p>
        ) : bookings.map((booking) => (
          <button
            key={booking.id}
            type="button"
            onClick={() => navigate(`/admin/students/${booking.studentId}`)}
            className="flex items-center gap-2.5 w-full text-left hover:bg-surface-muted rounded-ui-xs px-1 py-1 -mx-1 transition-colors duration-micro focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="bg-brand/10 text-brand text-caption font-semibold">
                {getInitials(booking.student.firstName, booking.student.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-small font-semibold text-ink truncate">
                {booking.student.firstName} {booking.student.lastName}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Previous sessions — accordion, latest open */}
      <div className="flex-1 px-4 py-3 overflow-y-auto">
        <p className="text-caption text-ink-tertiary uppercase tracking-wider font-medium mb-3">
          {t('session.previous_notes')}
        </p>

        {pastSessions.length === 0 ? (
          <p className="text-caption text-ink-tertiary">{t('session.no_previous_notes')}</p>
        ) : (
          <Accordion.Root
            type="single"
            defaultValue={pastSessions[0]?.id}
            collapsible
            className="space-y-1.5"
          >
            {pastSessions.map((sn: any) => {
              const dateStr = sn.slot
                ? format(new Date(sn.slot.startTime), 'MMM d, yyyy')
                : '—';
              const hasClass = !!sn.sessionNotes;
              const hasHomework = !!sn.homeworkNotes;
              const hasObservation = !!sn.studentObservation;

              return (
                <Accordion.Item
                  key={sn.id}
                  value={sn.id}
                  className="rounded-ui-sm border border-line bg-surface-raised overflow-hidden"
                >
                  <Accordion.Header asChild>
                    <Accordion.Trigger
                      className={cn(
                        'flex w-full items-start justify-between gap-2 px-3 py-2.5 text-left',
                        'hover:bg-surface-muted transition-colors duration-micro',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-inset',
                        '[&[data-state=open]>svg]:rotate-180',
                      )}
                    >
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <p className="text-small font-semibold text-ink leading-tight">{dateStr}</p>
                        {sn.slot?.title && (
                          <p className="text-caption text-ink-tertiary truncate">{sn.slot.title}</p>
                        )}
                        {/* Icon row: shows what types of notes are inside */}
                        <div className="flex items-center gap-1.5 pt-0.5">
                          {hasClass && <FileText className="h-3 w-3 text-ink-tertiary" aria-hidden="true" />}
                          {hasHomework && <BookOpen className="h-3 w-3 text-ink-tertiary" aria-hidden="true" />}
                          {hasObservation && <Eye className="h-3 w-3 text-ink-tertiary" aria-hidden="true" />}
                        </div>
                      </div>
                      <ChevronDown
                        className="h-3.5 w-3.5 mt-0.5 shrink-0 text-ink-tertiary transition-transform duration-standard"
                        aria-hidden="true"
                      />
                    </Accordion.Trigger>
                  </Accordion.Header>

                  <Accordion.Content className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up"> {/* uiux-allow-arbitrary: Radix data-state variant */}
                    <div className="px-3 pb-3 pt-2 space-y-2.5 border-t border-line">
                      {hasClass && (
                        <div>
                          <div className="flex items-center gap-1 text-caption text-ink-secondary font-medium mb-0.5">
                            <FileText className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            {t('session.notes_general')}
                          </div>
                          <p className="text-small text-ink whitespace-pre-wrap pl-4 leading-relaxed">{sn.sessionNotes}</p>
                        </div>
                      )}
                      {hasHomework && (
                        <div>
                          <div className="flex items-center gap-1 text-caption text-ink-secondary font-medium mb-0.5">
                            <BookOpen className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            {t('session.notes_homework')}
                          </div>
                          <p className="text-small text-ink whitespace-pre-wrap pl-4 leading-relaxed">{sn.homeworkNotes}</p>
                        </div>
                      )}
                      {hasObservation && (
                        <div>
                          <div className="flex items-center gap-1 text-caption text-ink-secondary font-medium mb-0.5">
                            <Eye className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            {t('session.notes_observation')}
                          </div>
                          <p className="text-small text-ink whitespace-pre-wrap pl-4 leading-relaxed">{sn.studentObservation}</p>
                        </div>
                      )}
                    </div>
                  </Accordion.Content>
                </Accordion.Item>
              );
            })}
          </Accordion.Root>
        )}
      </div>
    </aside>
  );
}

// ── Notes area — always editable, explicit save ────────────────────────────

interface NotesAreaProps {
  slotId: string;
  initialNote: MeetingNote;
}

function NotesArea({ slotId, initialNote }: NotesAreaProps) {
  const { t } = useTranslation('admin');
  const [draft, setDraft] = React.useState<MeetingNote>(initialNote);
  const [isDirty, setIsDirty] = React.useState(false);

  const saveMutation = useMutation({
    mutationFn: () =>
      professorApi.saveSessionNotes(slotId, {
        agendaNotes: draft.agendaNotes ?? undefined,
        sessionNotes: draft.sessionNotes ?? undefined,
        homeworkNotes: draft.homeworkNotes ?? undefined,
        studentObservation: draft.studentObservation ?? undefined,
      }),
    onSuccess: (saved) => {
      setDraft(saved);
      setIsDirty(false);
      uiToast.success(t('session.saved'));
    },
    onError: () => uiToast.error(t('session.error_save')),
  });

  const handleChange = (field: keyof MeetingNote, value: string) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Notes list — scrollable */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <SessionNoteSection
          id="session-notes-general"
          label={t('session.notes_general')}
          hint={t('session.notes_general_hint')}
          icon={FileText}
          value={draft.sessionNotes ?? ''}
          onChange={(v) => handleChange('sessionNotes', v)}
        />
        <SessionNoteSection
          id="session-notes-homework"
          label={t('session.notes_homework')}
          hint={t('session.notes_homework_hint')}
          icon={BookOpen}
          value={draft.homeworkNotes ?? ''}
          onChange={(v) => handleChange('homeworkNotes', v)}
        />
        <SessionNoteSection
          id="session-notes-observation"
          label={t('session.notes_observation')}
          hint={t('session.notes_observation_hint')}
          icon={Eye}
          value={draft.studentObservation ?? ''}
          onChange={(v) => handleChange('studentObservation', v)}
        />
      </div>

      {/* Sticky save footer */}
      <div className="shrink-0 border-t border-line bg-surface px-6 py-3 flex items-center justify-between gap-4">
        <span
          className={cn(
            'text-caption transition-colors duration-standard',
            isDirty ? 'text-status-requested-foreground' : 'text-ink-tertiary',
          )}
          aria-live="polite"
        >
          {isDirty ? t('session.unsaved') : t('session.all_saved')}
        </span>
        <Button
          variant="primary"
          size="sm"
          isLoading={saveMutation.isPending}
          disabled={!isDirty}
          onClick={() => saveMutation.mutate()}
        >
          <Save className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
          {t('session.save_notes')}
        </Button>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────

export function SessionPage() {
  const { slotId } = useParams<{ slotId: string }>();
  const { t } = useTranslation('admin');
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { session: inProgressSession, startSession, clearSession } = useInProgressSession();
  const [endDialogOpen, setEndDialogOpen] = React.useState(false);
  const [mobileTab, setMobileTab] = React.useState<'notes' | 'student' | 'info'>('notes');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['session', slotId],
    queryFn: () => professorApi.getSession(slotId!),
    enabled: !!slotId,
    staleTime: 0,
  });

  const startMutation = useMutation({
    mutationFn: () => professorApi.startSession(slotId!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['professor-slots'] });
      qc.invalidateQueries({ queryKey: ['session', slotId] });
      const firstBooking = data?.slot.bookings?.[0];
      const studentName = firstBooking
        ? `${firstBooking.student.firstName} ${firstBooking.student.lastName}`
        : undefined;
      startSession({ slotId: slotId!, studentName, startedAt: Date.now() });
    },
    onError: () => uiToast.error(t('session.error_load')),
  });

  const endMutation = useMutation({
    mutationFn: (copy: boolean) => professorApi.endSession(slotId!, copy),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['professor-slots'] });
      clearSession();
      navigate('/admin');
      uiToast.success(t('session.end_class'));
    },
    onError: () => uiToast.error(t('session.error_load')),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin h-6 w-6 border-2 border-brand border-t-transparent rounded-full" aria-label={t('session.loading')} />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6">
        <InlineAlert variant="error">{t('session.error_load')}</InlineAlert>
      </div>
    );
  }

  const { slot, note } = data;
  const isInProgress = slot.status === 'IN_PROGRESS';
  const isCompleted = slot.status === 'COMPLETED';
  const startTime = formatTime(slot.startTime);
  const endTime = formatTime(slot.endTime);
  const dateLabel = format(new Date(slot.startTime), 'EEEE, MMMM d');
  const isGroup = slot.slotType === SlotType.GROUP;
  const firstStudent = slot.bookings[0];
  const displayName = isGroup
    ? (slot.title || t('slot_form.session_type_group'))
    : firstStudent
      ? `${firstStudent.student.firstName} ${firstStudent.student.lastName}`
      : (slot.title || t('calendar.lesson'));

  const MOBILE_TABS = [
    { key: 'notes' as const, label: t('session.mobile_tab_notes'), icon: FileText },
    { key: 'student' as const, label: t('session.mobile_tab_student'), icon: isGroup ? Users : User },
    { key: 'info' as const, label: t('session.mobile_tab_info'), icon: Clock },
  ];

  return (
    <div className="flex flex-col h-content bg-canvas -m-6 sm:-m-8">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="flex items-center gap-3 px-4 sm:px-6 h-14 shrink-0 bg-surface border-b border-line shadow-ui-1">
        <button
          type="button"
          onClick={() => navigate('/admin')}
          aria-label={t('calendar.back')}
          className="p-1.5 -ml-1.5 rounded-ui-xs text-ink-tertiary hover:text-ink hover:bg-surface-muted transition-colors duration-micro focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-title font-semibold text-ink truncate">{displayName}</p>
          <p className="text-caption text-ink-secondary hidden sm:block">
            {dateLabel} · {startTime} – {endTime}
          </p>
        </div>

        {/* Elapsed timer when in progress */}
        {isInProgress && inProgressSession && (
          <div className="hidden sm:flex items-center gap-1.5 text-ink-secondary" aria-live="polite">
            <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
            <ElapsedTimer startedAt={inProgressSession.startedAt} />
          </div>
        )}

        {/* Meet link — shown whenever available */}
        {slot.meetLink && (
          <a
            href={slot.meetLink}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'hidden sm:flex items-center gap-1.5 px-3 h-9 rounded-ui-sm text-small font-semibold',
              'bg-surface border border-line text-ink-secondary hover:text-ink hover:border-line-strong',
              'transition-colors duration-micro focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
            )}
          >
            <Video className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{t('session.open_meeting')}</span>
          </a>
        )}

        {/* Start / End — optional, not a prerequisite for notes */}
        {isInProgress ? (
          <Button variant="danger" size="sm" onClick={() => setEndDialogOpen(true)}>
            {t('session.end_class')}
          </Button>
        ) : !isCompleted ? (
          <Button
            variant="secondary"
            size="sm"
            isLoading={startMutation.isPending}
            onClick={() => startMutation.mutate()}
          >
            {t('session.start_class')}
          </Button>
        ) : null}
      </header>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop: student panel */}
        <SessionStudentPanel session={data} />

        {/* Desktop/tablet: notes — always shown */}
        <div className="hidden sm:flex flex-col flex-1 overflow-hidden bg-canvas">
          <NotesArea slotId={slotId!} initialNote={note} />
        </div>

        {/* Mobile: tab-based layout */}
        <div className="flex sm:hidden flex-col flex-1 overflow-hidden bg-canvas">
          <div
            role="tablist"
            aria-label={t('session.mobile_tablist_label')}
            className="flex border-b border-line shrink-0 bg-surface"
          >
            {MOBILE_TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                role="tab"
                type="button"
                aria-selected={mobileTab === key}
                id={`session-tab-${key}`}
                aria-controls={`session-panel-${key}`}
                onClick={() => setMobileTab(key)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-2.5 text-caption font-semibold',
                  'border-b-2 transition-colors duration-micro focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-inset',
                  mobileTab === key
                    ? 'border-brand text-brand'
                    : 'border-transparent text-ink-tertiary hover:text-ink',
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>

          <div
            role="tabpanel"
            id={`session-panel-${mobileTab}`}
            aria-labelledby={`session-tab-${mobileTab}`}
            className="flex-1 overflow-hidden flex flex-col"
          >
            {mobileTab === 'notes' && (
              <NotesArea slotId={slotId!} initialNote={note} />
            )}

            {mobileTab === 'student' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {slot.bookings.map((booking) => (
                  <div key={booking.id} className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback className="bg-brand/10 text-brand text-caption font-semibold">
                        {getInitials(booking.student.firstName, booking.student.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-small font-semibold text-ink">
                      {booking.student.firstName} {booking.student.lastName}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {mobileTab === 'info' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <div className="space-y-1">
                  <p className="text-caption text-ink-tertiary uppercase tracking-wider">
                    {t('session.mobile_tab_info')}
                  </p>
                  <p className="text-small text-ink">{dateLabel}</p>
                  <p className="text-small text-ink">{startTime} – {endTime}</p>
                </div>
                {slot.meetLink && (
                  <a
                    href={slot.meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-ui-sm bg-status-confirmed-surface border border-status-confirmed-border text-status-confirmed-foreground text-small font-medium"
                  >
                    <Video className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {t('session.open_meeting')}
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <EndSessionDialog
        open={endDialogOpen}
        onCancel={() => setEndDialogOpen(false)}
        onConfirm={(copy) => endMutation.mutate(copy)}
        isLoading={endMutation.isPending}
        hasObservation={!!(data.note.studentObservation?.trim())}
      />
    </div>
  );
}
