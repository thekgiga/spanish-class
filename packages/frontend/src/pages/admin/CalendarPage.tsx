import React, { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  addDays,
  addWeeks,
  subWeeks,
  startOfWeek,
  endOfWeek,
  format,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  LayoutList,
  Plus,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { professorApi } from "@/lib/api";
import {
  WeeklyCalendar,
  SlotDrawer,
  CreateSlotPopover,
} from "@/components/calendar";
import type { CalendarSlot } from "@/components/calendar/EventCard";

export function CalendarPage() {
  const { t } = useTranslation("admin");
  const queryClient = useQueryClient();

  // ── View state ────────────────────────────────────────────────────────────
  const [view, setView] = useState<"week" | "day">("week");
  const [weekStart, setWeekStart] = useState<Date>(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

  // ── Slot drawer ───────────────────────────────────────────────────────────
  const [drawerSlot, setDrawerSlot] = useState<CalendarSlot | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // ── Create-slot popover ───────────────────────────────────────────────────
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverStart, setPopoverStart] = useState<Date | null>(null);
  const [popoverEnd, setPopoverEnd] = useState<Date | null>(null);
  const [popoverAnchor, setPopoverAnchor] = useState<React.CSSProperties>({});

  // ── Data ──────────────────────────────────────────────────────────────────
  const { data: slotsData, isLoading } = useQuery({
    queryKey: ["professor-slots", weekStart.toISOString()],
    queryFn: () =>
      professorApi.getSlots({
        startDate: weekStart.toISOString(),
        endDate: addDays(weekEnd, 1).toISOString(),
        limit: 100,
      }),
    staleTime: 30_000,
  });

  const slots: CalendarSlot[] = (slotsData?.data ?? []).map((s: any) => ({
    ...s,
    startTime: typeof s.startTime === 'string' ? s.startTime : s.startTime.toISOString(),
    endTime: typeof s.endTime === 'string' ? s.endTime : s.endTime.toISOString(),
  })) as CalendarSlot[];

  // ── Handlers ──────────────────────────────────────────────────────────────
  const goToToday = () => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const goPrev = () => setWeekStart((w) => subWeeks(w, 1));
  const goNext = () => setWeekStart((w) => addWeeks(w, 1));

  const handleSlotClick = useCallback((slot: CalendarSlot) => {
    setDrawerSlot(slot);
    setDrawerOpen(true);
  }, []);

  const handleDragComplete = useCallback(
    (start: Date, end: Date, _dayDate: Date) => {
      setPopoverStart(start);
      setPopoverEnd(end);
      setPopoverAnchor({
        top: window.innerHeight * 0.35,
        left: "50%",
        transform: "translateX(-50%)",
      });
      setPopoverOpen(true);
    },
    []
  );

  const handleCreated = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["professor-slots"] });
  }, [queryClient]);

  const handleDrawerMutation = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["professor-slots"] });
    queryClient.invalidateQueries({ queryKey: ["professor-pending-bookings-count"] });
    setDrawerOpen(false);
  }, [queryClient]);

  // ── Week title ────────────────────────────────────────────────────────────
  const weekTitle = `${format(weekStart, "MMM d")} – ${format(weekEnd, "MMM d, yyyy")}`;

  const openNewSlotPopover = () => {
    // Default to tomorrow at 9am–10am to avoid overlapping today's slots
    const tomorrow = addDays(new Date(), 1);
    tomorrow.setHours(9, 0, 0, 0);
    const end = new Date(tomorrow);
    end.setHours(10, 0, 0, 0);
    setPopoverStart(tomorrow);
    setPopoverEnd(end);
    setPopoverAnchor({ top: 80, right: 20 });
    setPopoverOpen(true);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-[#FAFAFA]">
      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Toolbar */}
        <header className="flex-none flex items-center gap-3 px-4 py-3 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-1">
            <button
              onClick={goPrev}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500"
              aria-label={t("calendar.toolbar.prev", "Previous week")}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1.5 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {t("calendar.toolbar.today", "Today")}
            </button>
            <button
              onClick={goNext}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500"
              aria-label={t("calendar.toolbar.next", "Next week")}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <h1 className="text-lg font-semibold text-slate-900 flex-none">
            {weekTitle}
          </h1>

          <div className="flex-1" />

          <div className="flex items-center gap-0.5 bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setView("week")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                view === "week"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              {t("calendar.toolbar.view_week", "Week")}
            </button>
            <button
              onClick={() => setView("day")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                view === "day"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              <LayoutList className="h-3.5 w-3.5" />
              {t("calendar.toolbar.view_day", "Day")}
            </button>
          </div>

          <button
            onClick={openNewSlotPopover}
            className="flex items-center gap-2 px-4 py-2 bg-edu-blue-600 hover:bg-edu-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            {t("calendar.toolbar.new", "New")}
          </button>
        </header>

        {/* Calendar */}
        <div className="flex-1 overflow-hidden relative">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-2 border-edu-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : slots.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <span className="text-5xl">📅</span>
              <div>
                <p className="text-lg font-semibold text-slate-700">
                  {t("calendar.empty.title", "No lessons scheduled for this week.")}
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  {t("calendar.empty.subtitle", "Drag on the calendar or click New to add a slot.")}
                </p>
              </div>
              <button
                onClick={openNewSlotPopover}
                className="flex items-center gap-2 px-5 py-2.5 bg-edu-blue-600 hover:bg-edu-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
              >
                <Plus className="h-4 w-4" />
                {t("calendar.empty.cta", "Create Available Slot")}
              </button>
            </div>
          ) : (
            <WeeklyCalendar
              slots={slots}
              view={view}
              weekStart={weekStart}
              onSlotClick={handleSlotClick}
              onDragComplete={handleDragComplete}
              className="h-full"
            />
          )}
        </div>
      </div>

      {/* ── Slot Drawer ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {drawerOpen && (
          <SlotDrawer
            key="slot-drawer"
            slot={drawerSlot}
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            onApproved={handleDrawerMutation}
            onRejected={handleDrawerMutation}
            onCancelled={handleDrawerMutation}
            onDeleted={handleDrawerMutation}
            onUpdated={() => queryClient.invalidateQueries({ queryKey: ["professor-slots"] })}
          />
        )}
      </AnimatePresence>

      {/* ── Create Popover ────────────────────────────────────────────────── */}
      <CreateSlotPopover
        open={popoverOpen}
        onClose={() => setPopoverOpen(false)}
        startTime={popoverStart}
        endTime={popoverEnd}
        anchorStyle={popoverAnchor}
        onCreated={handleCreated}
      />
    </div>
  );
}
