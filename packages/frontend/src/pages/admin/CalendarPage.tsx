/**
 * CalendarPage — Professor schedule workspace.
 *
 * CAL-001: Select a calendar range to define start, end, and duration.
 * CAL-002: Range selection opens CalendarSelectionComposer.
 * CAL-003: Calendar snaps to 15 minutes and shows live duration.
 * CAL-004: Event details use Drawer on desktop and sheet on mobile.
 * CAL-005: Mobile uses day agenda; tablet uses 3-day view; no compressed week.
 */
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  format, startOfWeek, endOfWeek,
  addWeeks, subWeeks, addDays, subDays, startOfDay,
  eachDayOfInterval,
} from "date-fns";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { DateSelectArg, EventClickArg, EventContentArg, EventInput } from "@fullcalendar/core";
import { ChevronLeft, ChevronRight, Plus, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { CalendarEventTile } from "@/components/ui/calendar-event";
import { CalendarSelectionComposer, type SelectionRange } from "@/components/ui/calendar-selection-composer";
import { SlotEventDrawer } from "@/components/ui/slot-event-drawer";
import { uiToast } from "@/components/ui/inline-alert";
import { cn } from "@/lib/utils";
import { professorApi } from "@/lib/api";
import { bookingStatusToUi, slotStatusToUi, isBookingPending, uiStatusDefinition } from "@/lib/ui-system/status";
import type { AvailabilitySlot, AvailabilitySlotWithBookings } from "@spanish-class/shared";
import { PrivateInvitationModal } from "@/components/professor/PrivateInvitationModal";
import { usePendingBookingsCount } from "@/hooks/usePendingBookingsCount";
import { useIsMobile, useMediaQuery } from "@/hooks/useMediaQuery";

// ── Helpers ────────────────────────────────────────────────────────────────

function slotDisplayStatus(slot: AvailabilitySlot & { bookings?: { status: string }[] }) {
  const bookings = (slot as AvailabilitySlotWithBookings).bookings ?? [];
  const pending = bookings.find(isBookingPending as (b: { status: string }) => boolean);
  if (pending) return bookingStatusToUi((pending as { status: string }).status as any);
  return slotStatusToUi(slot.status as any);
}

function slotToEvent(slot: AvailabilitySlot): EventInput {
  const uiStatus = slotDisplayStatus(slot);
  const def = uiStatusDefinition[uiStatus];
  return {
    id: slot.id,
    start: new Date(slot.startTime),
    end:   new Date(slot.endTime),
    extendedProps: { slot, uiStatus, iconName: def.icon, title: slot.title ?? '' },
    backgroundColor: 'transparent',
    borderColor:     'transparent',
    textColor:       'inherit',
  };
}

// ── Mobile date strip ──────────────────────────────────────────────────────
// Horizontal scrollable 7-day strip for day-by-day navigation on mobile.

interface MobileDateStripProps {
  centerDate: Date;
  selectedDate: Date;
  onSelect: (d: Date) => void;
}

function MobileDateStrip({ centerDate, selectedDate, onSelect }: MobileDateStripProps) {
  // Show the 7 days centred on centerDate (3 before, 3 after)
  const days = useMemo(
    () => eachDayOfInterval({ start: subDays(centerDate, 3), end: addDays(centerDate, 3) }),
    [centerDate],
  );
  const today = startOfDay(new Date());
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep the selected date centred on initial render
  useEffect(() => {
    const el = scrollRef.current?.querySelector('[data-selected="true"]') as HTMLElement | null;
    el?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [selectedDate]);

  return (
    <div
      ref={scrollRef}
      className="flex gap-1 overflow-x-auto px-4 py-2 border-b border-line bg-canvas scrollbar-hide"
      role="listbox"
      aria-label={format(centerDate, 'MMMM yyyy')}
    >
      {days.map((day) => {
        const isSelected = format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
        const isToday    = format(day, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
        return (
          <button
            key={day.toISOString()}
            type="button"
            role="option"
            aria-selected={isSelected}
            data-selected={isSelected}
            onClick={() => onSelect(day)}
            className={cn(
              'flex flex-col items-center gap-0.5 px-3 py-2 rounded-ui-sm min-w-touch-min',
              'transition-colors duration-micro focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
              isSelected
                ? 'bg-brand text-brand-contrast'
                : isToday
                ? 'bg-surface-raised text-ink font-semibold'
                : 'text-ink-secondary hover:bg-surface-muted',
            )}
          >
            <span className="text-micro uppercase tracking-wide">{format(day, 'EEE')}</span>
            <span className="text-small font-semibold">{format(day, 'd')}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── CalendarPage ───────────────────────────────────────────────────────────

type FCView = 'timeGridWeek' | 'timeGrid3Day' | 'timeGridDay';

export function CalendarPage() {
  const { t } = useTranslation("admin");
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fcRef = useRef<FullCalendar>(null);

  const isMobile = useIsMobile();                             // < 768px → day view
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1199px)'); // 3-day view

  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [manualView, setManualView] = useState<FCView | null>(null); // null = follow breakpoint
  const [selectedRange, setSelectedRange] = useState<SelectionRange | null>(null);
  const [composerStyle, setComposerStyle] = useState<React.CSSProperties>({});
  const [openSlot, setOpenSlot] = useState<AvailabilitySlotWithBookings | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showPrivateModal, setShowPrivateModal] = useState(false);

  // Derive the active FullCalendar view from breakpoint (unless manually overridden)
  const activeView: FCView = manualView ?? (isMobile ? 'timeGridDay' : isTablet ? 'timeGrid3Day' : 'timeGridWeek');

  // Sync FullCalendar when the active view changes
  useEffect(() => {
    const api = fcRef.current?.getApi();
    if (!api) return;
    const fcViewName = activeView === 'timeGrid3Day' ? 'timeGridDay' : activeView; // FC has no built-in 3-day; simulate
    api.changeView(fcViewName, currentDate);
  }, [activeView, currentDate]);

  // Query window = full week (enough for any view)
  const weekStart = useMemo(() => startOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate]);
  const weekEnd   = useMemo(() => endOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate]);
  const weekKey   = format(weekStart, 'yyyy-ww');

  const { data: slotsData } = useQuery({
    queryKey: ['professor-slots', weekKey],
    queryFn: () => professorApi.getSlots({
      startDate: weekStart.toISOString(),
      endDate:   weekEnd.toISOString(),
      limit: 200,
    }),
  });

  const { data: pendingData } = usePendingBookingsCount(true);

  const events: EventInput[] = useMemo(
    () => (slotsData?.data ?? []).map(slotToEvent),
    [slotsData],
  );

  // Mutation to create a blocked slot
  const blockMutation = useMutation({
    mutationFn: (range: SelectionRange) =>
      professorApi.createSlot({
        startTime: range.start.toISOString(),
        endTime:   range.end.toISOString(),
        slotType: 'INDIVIDUAL',
        maxParticipants: 1,
        isPrivate: false,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['professor-slots'] });
      uiToast.success(t('calendar.blocked_created'));
    },
    onError: () => uiToast.error(t('calendar.error_generic')),
  });

  // ── FullCalendar handlers ──────────────────────────────────────────────

  const handleSelect = useCallback((arg: DateSelectArg) => {
    const rect = (arg.jsEvent?.target as HTMLElement | null)?.getBoundingClientRect();
    setComposerStyle(rect
      ? { top: rect.bottom + 8, left: Math.min(rect.left, window.innerWidth - 240) }
      : { top: '40%', left: '50%', transform: 'translate(-50%, -50%)' }
    );
    setSelectedRange({ start: arg.start, end: arg.end });
  }, []);

  const handleEventClick = useCallback(async (arg: EventClickArg) => {
    const slot = arg.event.extendedProps.slot as AvailabilitySlot;
    try {
      const full = await professorApi.getSlot(slot.id);
      setOpenSlot(full);
      setDrawerOpen(true);
    } catch {
      uiToast.error(t('calendar.error_generic'));
    }
  }, [t]);

  const renderEventContent = useCallback((arg: EventContentArg) => {
    const { uiStatus, iconName, title } = arg.event.extendedProps as {
      uiStatus: string;
      iconName: string;
      title: string;
    };
    const durationMs = arg.event.end!.getTime() - arg.event.start!.getTime();
    const dense = durationMs < 45 * 60_000;
    const timeLabel = `${format(arg.event.start!, 'HH:mm')} – ${format(arg.event.end!, 'HH:mm')}`;
    return (
      <CalendarEventTile
        status={uiStatus as any}
        iconName={iconName}
        title={title || t('calendar.lesson')}
        time={timeLabel}
        dense={dense}
      />
    );
  }, [t]);

  // ── Navigation helpers (pure, no mutation of currentDate) ─────────────

  const goToPrev = useCallback(() => {
    let next: Date;
    if (activeView === 'timeGridWeek') {
      next = subWeeks(currentDate, 1);
    } else if (activeView === 'timeGrid3Day') {
      next = subDays(currentDate, 3);
    } else {
      next = subDays(currentDate, 1);
    }
    setCurrentDate(next);
    fcRef.current?.getApi().gotoDate(next);
  }, [activeView, currentDate]);

  const goToNext = useCallback(() => {
    let next: Date;
    if (activeView === 'timeGridWeek') {
      next = addWeeks(currentDate, 1);
    } else if (activeView === 'timeGrid3Day') {
      next = addDays(currentDate, 3);
    } else {
      next = addDays(currentDate, 1);
    }
    setCurrentDate(next);
    fcRef.current?.getApi().gotoDate(next);
  }, [activeView, currentDate]);

  const goToToday = useCallback(() => {
    const today = new Date();
    setCurrentDate(today);
    fcRef.current?.getApi().today();
  }, []);

  const goToDay = useCallback((day: Date) => {
    setCurrentDate(day);
    fcRef.current?.getApi().gotoDate(day);
  }, []);

  const switchView = (v: FCView) => {
    setManualView(v);
  };

  // Date range label for toolbar
  const dateRangeLabel = useMemo(() => {
    if (activeView === 'timeGridWeek') {
      return `${format(weekStart, 'MMM d')} – ${format(weekEnd, 'MMM d, yyyy')}`;
    }
    if (activeView === 'timeGrid3Day') {
      const end3 = addDays(currentDate, 2);
      return `${format(currentDate, 'MMM d')} – ${format(end3, 'MMM d')}`;
    }
    return format(currentDate, 'EEEE, MMMM d, yyyy');
  }, [activeView, weekStart, weekEnd, currentDate]);

  const pendingCount = pendingData?.count ?? 0;

  // Tablet: configure FullCalendar to show 3 days
  const fcDuration = activeView === 'timeGrid3Day' ? { days: 3 } : undefined;

  return (
    <div className="flex flex-col h-full">
      {/* Page header — hidden on mobile to save space; replaced by compact mobile toolbar */}
      {!isMobile && (
        <PageHeader
          title={t('calendar.title')}
          action={
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowPrivateModal(true)}
              >
                <UserPlus className="h-4 w-4 mr-1" aria-hidden="true" />
                {t('calendar.schedule_student')}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/admin/slots/new')}
              >
                <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
                {t('calendar.create_slot')}
              </Button>
            </div>
          }
        />
      )}

      {/* Mobile date strip (CAL-005) */}
      {isMobile && (
        <MobileDateStrip
          centerDate={currentDate}
          selectedDate={currentDate}
          onSelect={goToDay}
        />
      )}

      {/* Calendar toolbar */}
      <div className={cn(
        'flex items-center justify-between border-b border-line gap-3 flex-wrap',
        isMobile ? 'px-4 py-2' : 'px-6 py-3',
      )}>
        {/* Navigation */}
        <div className="flex items-center gap-1">
          <Button variant="quiet" size="sm" onClick={goToPrev} aria-label={t('calendar.prev')}>
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </Button>
          {!isMobile && (
            <Button variant="quiet" size="sm" onClick={goToToday}>{t('calendar.today')}</Button>
          )}
          <Button variant="quiet" size="sm" onClick={goToNext} aria-label={t('calendar.next')}>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Button>
          <span className={cn('font-semibold text-ink truncate', isMobile ? 'text-caption ml-1' : 'text-small ml-2')}>
            {dateRangeLabel}
          </span>
        </div>

        {/* Pending badge + view switch + mobile new-slot FAB */}
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <button
              type="button"
              onClick={() => navigate('/admin/pending-approvals')}
              aria-label={t('calendar.pending_approval_aria', { count: pendingCount })}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-ui-full bg-status-requested-surface border border-status-requested-border text-status-requested-foreground text-caption font-semibold hover:opacity-90 transition-opacity"
            >
              {pendingCount} {t('calendar.pending_approval_label')}
            </button>
          )}

          {/* View switcher — desktop/tablet only */}
          {!isMobile && (
            <div className="flex rounded-ui-sm border border-line overflow-hidden">
              {([
                ['timeGridDay',  t('calendar.day_view')],
                ...(isTablet ? [] : [['timeGridWeek', t('calendar.week_view')]]),
              ] as [FCView, string][]).map(([v, label]) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => switchView(v)}
                  className={cn(
                    'px-3 py-1.5 text-caption font-semibold transition-colors duration-micro',
                    activeView === v
                      ? 'bg-brand text-brand-contrast'
                      : 'text-ink-secondary hover:text-ink hover:bg-surface-muted',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Mobile: compact FAB to create slot */}
          {isMobile && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/admin/slots/new')}
              aria-label={t('calendar.create_slot')}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
            </Button>
          )}
        </div>
      </div>

      {/* Calendar grid */}
      <div className="flex-1 relative overflow-hidden px-1 pb-1">
        <FullCalendar
          ref={fcRef}
          plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
          initialView={isMobile ? 'timeGridDay' : 'timeGridWeek'}
          duration={fcDuration}
          selectable
          selectMirror
          selectMinDistance={2}
          snapDuration="00:15:00"
          slotDuration="00:15:00"
          slotLabelInterval="01:00:00"
          slotMinTime="07:00:00"
          slotMaxTime="22:00:00"
          allDaySlot={false}
          firstDay={1}
          nowIndicator
          expandRows
          height="100%"
          headerToolbar={false}
          events={events}
          select={handleSelect}
          eventClick={handleEventClick}
          eventContent={renderEventContent}
          eventMinHeight={24}
          slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
          dayHeaderFormat={activeView === 'timeGridDay'
            ? { weekday: 'long' }
            : { weekday: 'short', day: 'numeric' }
          }
          selectAllow={(selectInfo) => selectInfo.start >= new Date()}
          eventInteractive
          // Sync FC date with our controlled currentDate on navigation
          datesSet={(info) => {
            // Only update if FC navigated independently (shouldn't happen with headerToolbar=false)
            const fcDate = info.view.currentStart;
            if (format(fcDate, 'yyyy-MM-dd') !== format(currentDate, 'yyyy-MM-dd')) {
              setCurrentDate(fcDate);
            }
          }}
        />

        {/* Selection composer */}
        <CalendarSelectionComposer
          range={selectedRange ?? { start: new Date(), end: new Date() }}
          open={!!selectedRange}
          onClose={() => { setSelectedRange(null); fcRef.current?.getApi().unselect(); }}
          onOfferTime={(range) => navigate('/admin/slots/new', {
            state: { prefill: { startTime: range.start.toISOString(), endTime: range.end.toISOString() } },
          })}
          onScheduleStudent={(range) => navigate('/admin/slots/new', {
            state: { prefill: { startTime: range.start.toISOString(), endTime: range.end.toISOString(), scheduleStudent: true } },
          })}
          onBlockTime={(range) => { blockMutation.mutate(range); setSelectedRange(null); }}
          style={composerStyle}
        />
      </div>

      {/* Event detail drawer */}
      <SlotEventDrawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setOpenSlot(null); }}
        slot={openSlot}
        onEdit={(id) => navigate(`/admin/slots/${id}`)}
      />

      {/* Private invitation modal */}
      <PrivateInvitationModal
        isOpen={showPrivateModal}
        onClose={() => setShowPrivateModal(false)}
      />
    </div>
  );
}
