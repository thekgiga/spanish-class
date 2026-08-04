/**
 * CalendarPage — Professor schedule workspace.
 *
 * CAL-001: Select a calendar range to define start, end, and duration.
 * CAL-002: Range selection opens CalendarSelectionComposer.
 * CAL-003: Calendar snaps to 15 minutes and shows live duration.
 * CAL-004: Event details use Drawer on desktop and sheet on mobile.
 * CAL-005: Mobile uses day agenda; tablet uses 3-day view; no compressed week.
 */
import { useMemo, useCallback, useRef, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  format, startOfWeek, endOfWeek,
  addWeeks, subWeeks, addDays, subDays,
} from "date-fns";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { DateClickArg } from "@fullcalendar/interaction";
import type { DateSelectArg, EventClickArg, EventContentArg, EventInput } from "@fullcalendar/core";
import { ChevronLeft, ChevronRight, ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { CalendarEventTile } from "@/components/ui/calendar-event";
import { CalendarSelectionComposer, type SelectionRange } from "@/components/ui/calendar-selection-composer";
import { SlotEventDrawer } from "@/components/ui/slot-event-drawer";
import { SlotFormDrawer, type SlotFormDrawerPrefill } from "@/components/ui/slot-form-drawer";
import { uiToast } from "@/components/ui/inline-alert";
import { DateStrip } from "@/components/ui/date-strip";
import { cn } from "@/lib/utils";
import { professorApi } from "@/lib/api";
import { slotDisplayStatus, uiStatusDefinition, type UiLifecycleStatus } from "@/lib/ui-system/status";
import type { AvailabilitySlot, AvailabilitySlotWithBookings } from "@spanish-class/shared";
import { SlotType, SlotStatus } from "@spanish-class/shared";
import { usePendingBookingsCount } from "@/hooks/usePendingBookingsCount";
import { useIsMobile, useMediaQuery } from "@/hooks/useMediaQuery";

// ── Helpers ────────────────────────────────────────────────────────────────

function slotToEvent(slot: AvailabilitySlot & { bookings?: { status: string; student?: { firstName?: string; lastName?: string } }[] }): EventInput {
  const uiStatus = slotDisplayStatus(slot as unknown as Parameters<typeof slotDisplayStatus>[0]);
  const def = uiStatusDefinition[uiStatus];

  // Collect student names from active bookings (confirmed or pending)
  const studentNames = (slot.bookings ?? [])
    .filter(b => b.student)
    .map(b => [b.student!.firstName, b.student!.lastName].filter(Boolean).join(' '))
    .filter(Boolean);

  return {
    id: slot.id,
    start: new Date(slot.startTime),
    end:   new Date(slot.endTime),
    extendedProps: {
      slot,
      uiStatus,
      iconName: def.icon,
      title: slot.title ?? '',
      isBlocked: slot.slotType === SlotType.BLOCKED,
      slotType: slot.slotType,
      studentNames,
    },
    backgroundColor: 'transparent',
    borderColor:     'transparent',
    textColor:       'inherit',
  };
}

// ── CalendarPage ───────────────────────────────────────────────────────────

type FCView = 'timeGridWeek' | 'timeGrid3Day' | 'timeGridDay';

export function CalendarPage() {
  const { t } = useTranslation("admin");
  const navigate = useNavigate();
  const fcRef = useRef<FullCalendar>(null);

  const isMobile = useIsMobile();                             // < 768px → day view
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1199px)'); // 3-day view

  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [manualView, setManualView] = useState<FCView | null>(null); // null = follow breakpoint
  const [selectedRange, setSelectedRange] = useState<SelectionRange | null>(null);
  const [composerStyle, setComposerStyle] = useState<React.CSSProperties>({});
  const [openSlot, setOpenSlot] = useState<AvailabilitySlotWithBookings | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [slotFormOpen, setSlotFormOpen] = useState(false);
  const [slotFormPrefill, setSlotFormPrefill] = useState<SlotFormDrawerPrefill | undefined>();
  const [editSlotId, setEditSlotId] = useState<string | undefined>();
  const [legendOpen, setLegendOpen] = useState(false);

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
    () => (slotsData?.data ?? [])
      .filter(s => s.status !== SlotStatus.CANCELLED)
      .map(slotToEvent),
    [slotsData],
  );

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

  // Single click on empty cell → open SlotFormDrawer pre-filled with snapped time.
  // Desktop/tablet only: mobile already has a FAB and small cells risk misfired taps.
  const handleDateClick = useCallback((arg: DateClickArg) => {
    if (isMobile) return;
    if (arg.date < new Date()) {
      uiToast.info(t('calendar.past_time_notice'));
      return;
    }
    const snapped = new Date(arg.date);
    const remainder = snapped.getMinutes() % 15;
    if (remainder !== 0) snapped.setMinutes(snapped.getMinutes() - remainder, 0, 0);
    setSlotFormPrefill({ startTime: snapped.toISOString() });
    setEditSlotId(undefined);
    setSlotFormOpen(true);
  }, [isMobile, t]);

  const renderEventContent = useCallback((arg: EventContentArg) => {
    const { uiStatus, iconName, title, isBlocked, slotType, studentNames } = arg.event.extendedProps as {
      uiStatus?: string;
      iconName?: string;
      title?: string;
      isBlocked?: boolean;
      slotType?: string;
      studentNames?: string[];
    };

    // selectMirror / background events have no extendedProps — show a quiet placeholder
    if (!uiStatus) {
      return (
        <div className="h-full w-full rounded-ui-xs bg-status-available-surface border border-dashed border-status-available-border opacity-50" />
      );
    }
    const durationMs = arg.event.end!.getTime() - arg.event.start!.getTime();
    const dense = durationMs < 45 * 60_000;
    const timeLabel = `${format(arg.event.start!, 'HH:mm')} – ${format(arg.event.end!, 'HH:mm')}`;

    // Status-aware title: use custom title if set, otherwise derive from status
    let displayTitle: string;
    if (title) {
      displayTitle = title;
    } else if (isBlocked) {
      displayTitle = t('calendar.blocked_title');
    } else if (uiStatus === 'confirmed') {
      displayTitle = t('calendar.status_title_confirmed');
    } else if (uiStatus === 'requested') {
      displayTitle = t('calendar.status_title_requested');
    } else if (uiStatus === 'completed') {
      displayTitle = t('calendar.status_title_completed');
    } else {
      // available
      displayTitle = t('calendar.status_title_available');
    }

    // Show student name(s) as subtitle for booked/pending slots
    const subtitle = !dense && (studentNames ?? []).length > 0
      ? (studentNames ?? []).join(', ')
      : undefined;

    return (
      <CalendarEventTile
        status={uiStatus as UiLifecycleStatus}
        iconName={iconName ?? 'CalendarCheck2'}
        title={displayTitle}
        subtitle={subtitle}
        time={timeLabel}
        dense={dense}
        slotType={isBlocked ? undefined : slotType as 'INDIVIDUAL' | 'GROUP'}
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

  // Scroll to 1 hour before current time on mount so the current time indicator is visible
  const scrollTime = useMemo(() => {
    const now = new Date();
    const hour = Math.max(7, now.getHours() - 1);
    return `${String(hour).padStart(2, '0')}:00:00`;
  }, []);

  return (
    <div className="flex flex-col -m-6 sm:-m-8" style={{ height: 'calc(100svh - var(--ui-topbar-height))' }}>
      {/* Page header — hidden on mobile to save space; replaced by compact mobile toolbar */}
      {!isMobile && (
        <PageHeader
          title={t('calendar.title')}
          action={
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => { setSlotFormPrefill(undefined); setEditSlotId(undefined); setSlotFormOpen(true); }}
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
        <DateStrip
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
              onClick={() => { setSlotFormPrefill(undefined); setEditSlotId(undefined); setSlotFormOpen(true); }}
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
          scrollTime={scrollTime}
          expandRows
          height="100%"
          headerToolbar={false}
          events={events}
          select={handleSelect}
          dateClick={handleDateClick}
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
          onOfferTime={(range) => {
            setSlotFormPrefill({ startTime: range.start.toISOString(), endTime: range.end.toISOString() });
            setEditSlotId(undefined);
            setSlotFormOpen(true);
            setSelectedRange(null);
          }}
          onScheduleStudent={(range) => {
            setSlotFormPrefill({ startTime: range.start.toISOString(), endTime: range.end.toISOString(), scheduleStudent: true });
            setEditSlotId(undefined);
            setSlotFormOpen(true);
            setSelectedRange(null);
          }}
          onBlockTime={(range) => {
            setSlotFormPrefill({ startTime: range.start.toISOString(), endTime: range.end.toISOString(), blockTime: true });
            setEditSlotId(undefined);
            setSlotFormOpen(true);
            setSelectedRange(null);
          }}
          style={composerStyle}
        />
      </div>

      {/* Event detail drawer */}
      <SlotEventDrawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setOpenSlot(null); }}
        slot={openSlot}
        onEdit={(id) => { setEditSlotId(id); setSlotFormPrefill(undefined); setSlotFormOpen(true); }}
      />

      {/* Slot form drawer — create, schedule, and edit */}
      <SlotFormDrawer
        open={slotFormOpen}
        onClose={() => { setSlotFormOpen(false); setEditSlotId(undefined); setSlotFormPrefill(undefined); }}
        prefill={slotFormPrefill}
        slotId={editSlotId}
      />

      {/* Calendar legend */}
      <div className="shrink-0 border-t border-line bg-surface">
          <button
            type="button"
            onClick={() => setLegendOpen(o => !o)}
            className="flex items-center gap-1.5 px-6 py-1.5 text-micro font-semibold text-ink-muted hover:text-ink transition-colors w-full"
          >
            <ChevronDown className={cn('h-3 w-3 transition-transform duration-micro', legendOpen && 'rotate-180')} aria-hidden="true" />
            {t('calendar.legend_toggle')}
          </button>
          {legendOpen && (
            <div className="px-6 pb-2.5 flex items-center gap-5 flex-wrap">
              {([
                ['available',  t('calendar.status_title_available'),  t('calendar.legend_available')],
                ['requested',  t('calendar.status_title_requested'),  t('calendar.legend_requested')],
                ['confirmed',  t('calendar.status_title_confirmed'),  t('calendar.legend_confirmed')],
                ['blocked',    t('calendar.blocked_title'),           t('calendar.legend_blocked')],
                ['completed',  t('calendar.status_title_completed'),  t('calendar.legend_completed')],
              ] as [string, string, string][]).map(([status, label, desc]) => (
                <div key={status} className="flex items-center gap-2">
                  <span className={cn(
                    'flex items-center overflow-hidden rounded-ui-xs shrink-0 h-5 w-20',
                    status === 'available' && 'bg-status-available-surface border border-dashed border-status-available-border',
                    status === 'requested' && 'bg-status-requested-surface border border-status-requested-border',
                    status === 'confirmed' && 'bg-brand border border-transparent',
                    status === 'blocked'   && 'bg-status-blocked-surface border border-status-blocked-border',
                    status === 'completed' && 'bg-status-completed-surface border border-status-completed-border',
                  )} aria-hidden="true">
                    <span className={cn(
                      'w-1 h-full shrink-0',
                      status === 'available' && 'bg-status-available-border',
                      status === 'requested' && 'bg-status-requested-border',
                      status === 'confirmed' && 'bg-brand-contrast/30',
                      status === 'blocked'   && 'bg-status-blocked-border',
                      status === 'completed' && 'bg-status-completed-border',
                    )} />
                  </span>
                  <span className="text-micro font-semibold text-ink">{label}</span>
                  <span className="text-micro text-ink-muted">{desc}</span>
                </div>
              ))}
            </div>
          )}
        </div>
    </div>
  );
}
