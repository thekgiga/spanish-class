import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  addDays,
  addWeeks,
  subWeeks,
  startOfWeek,
  endOfWeek,
  format,
  isSameDay,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { studentApi } from "@/lib/api";
import { WeeklyCalendar, SlotDetailDrawer } from "@/components/calendar";
import type { CalendarSlot } from "@/components/calendar/EventCard";
import { SEOMeta } from "@/components/shared/SEOMeta";

type SlotFilter = "all" | "INDIVIDUAL" | "GROUP";

type SlotWithBookedFlag = CalendarSlot & { isBookedByMe: boolean };

export function BookPage() {
  const { t: ts } = useTranslation("student");
  const { t: tb } = useTranslation("booking");
  const queryClient = useQueryClient();

  // ── View state ────────────────────────────────────────────────────────────
  const [weekStart, setWeekStart] = useState<Date>(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const [filter, setFilter] = useState<SlotFilter>("all");
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // ── Slot drawer ───────────────────────────────────────────────────────────
  const [drawerSlot, setDrawerSlot] = useState<SlotWithBookedFlag | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // ── Data ──────────────────────────────────────────────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: [
      "available-slots",
      weekStart.toISOString(),
      filter,
    ],
    queryFn: () =>
      studentApi.getSlots({
        startDate: weekStart.toISOString(),
        endDate: addDays(weekEnd, 1).toISOString(),
        slotType: filter !== "all" ? filter : undefined,
        limit: 100,
      }),
    staleTime: 30_000,
  });

  const { data: professorAssignment } = useQuery({
    queryKey: ["student-professor"],
    queryFn: studentApi.getProfessor,
    staleTime: 5 * 60_000,
  });

  const slots: SlotWithBookedFlag[] = (data?.data ?? []).map((s: any) => ({
    ...s,
    startTime: typeof s.startTime === 'string' ? s.startTime : s.startTime.toISOString(),
    endTime: typeof s.endTime === 'string' ? s.endTime : s.endTime.toISOString(),
    isBookedByMe: s.isBookedByMe ?? false,
  })) as SlotWithBookedFlag[];

  // ── Handlers ──────────────────────────────────────────────────────────────
  const goToToday = () => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const goPrev = () => setWeekStart((w) => subWeeks(w, 1));
  const goNext = () => setWeekStart((w) => addWeeks(w, 1));

  const handleSlotClick = useCallback((slot: CalendarSlot) => {
    setDrawerSlot(slot as SlotWithBookedFlag);
    setDrawerOpen(true);
  }, []);

  const handleBooked = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["available-slots"] });
    setDrawerOpen(false);
  }, [queryClient]);

  // ── Week title ────────────────────────────────────────────────────────────
  const weekTitle = `${format(weekStart, "MMM d")} – ${format(weekEnd, "MMM d, yyyy")}`;

  // ── Mobile agenda view ────────────────────────────────────────────────────
  const agendaDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const getAgendaSlots = (day: Date) =>
    slots.filter((s) => isSameDay(new Date(s.startTime), day));

  return (
    <>
      <SEOMeta
        title={tb("page.seo_title", "Book a Class")}
        description={tb("page.seo_description", "Browse and book available Spanish lessons")}
        canonical="/book"
        noindex={true}
      />

      <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-[#FAFAFA]">
        {/* ── Unassigned guard ──────────────────────────────────────────── */}
        {professorAssignment && !professorAssignment.professor && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 flex items-center justify-between gap-4 flex-none">
            <p className="text-amber-800 text-sm font-medium">
              {ts("professor.choose_before_booking")}
            </p>
            <a
              href="/dashboard/choose-professor"
              className="shrink-0 text-sm font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              {ts("professor.choose_professor_link")}
            </a>
          </div>
        )}

        {/* ── Toolbar ───────────────────────────────────────────────────── */}
        <header className="flex-none flex items-center gap-3 px-4 py-3 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-1">
            <button
              onClick={goPrev}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500"
              aria-label={ts("calendar.toolbar.prev", "Previous week")}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1.5 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {ts("calendar.toolbar.today", "Today")}
            </button>
            <button
              onClick={goNext}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500"
              aria-label={ts("calendar.toolbar.next", "Next week")}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <h1 className="text-lg font-semibold text-slate-900 flex-none">
            {weekTitle}
          </h1>

          <div className="flex-1" />

          {/* Filter button */}
          <div className="relative">
            <button
              onClick={() => setShowFilterMenu((v) => !v)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-medium transition-colors",
                filter !== "all"
                  ? "border-edu-blue-400 bg-edu-blue-50 text-edu-blue-700"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              )}
            >
              <SlidersHorizontal className="h-4 w-4" />
              {ts("calendar.toolbar.filter", "Filter")}
              {filter !== "all" && (
                <span className="w-1.5 h-1.5 rounded-full bg-edu-blue-500" />
              )}
            </button>

            {showFilterMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowFilterMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 bg-white rounded-xl border border-slate-200 shadow-lg z-20 min-w-[160px] py-1">
                  {(["all", "INDIVIDUAL", "GROUP"] as SlotFilter[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => {
                        setFilter(f);
                        setShowFilterMenu(false);
                      }}
                      className={cn(
                        "w-full text-left px-4 py-2 text-sm transition-colors hover:bg-slate-50",
                        filter === f ? "text-edu-blue-700 font-semibold" : "text-slate-700"
                      )}
                    >
                      {f === "all"
                        ? ts("calendar.filter.all", "All Classes")
                        : f === "INDIVIDUAL"
                        ? ts("calendar.filter.individual", "Individual")
                        : ts("calendar.filter.group", "Group")}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </header>

        {/* ── Calendar (desktop) ────────────────────────────────────────── */}
        <div className="flex-1 overflow-hidden hidden md:block">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-2 border-edu-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : slots.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <span className="text-5xl">📅</span>
              <div>
                <p className="text-lg font-semibold text-slate-700">
                  {ts("calendar.empty.title", "No available lessons this week.")}
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  {ts("calendar.empty.subtitle", "Check back soon or contact your professor.")}
                </p>
              </div>
            </div>
          ) : (
            <WeeklyCalendar
              slots={slots}
              view="week"
              weekStart={weekStart}
              onSlotClick={handleSlotClick}
              isStudent={true}
              className="h-full"
            />
          )}
        </div>

        {/* ── Agenda (mobile) ───────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto md:hidden divide-y divide-slate-100">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-edu-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            agendaDays.map((day) => {
              const daySlots = getAgendaSlots(day);
              return (
                <div key={day.toISOString()} className="px-4 py-3">
                  <p className="text-xs font-semibold text-slate-400 uppercase mb-2">
                    {format(day, "EEE, MMM d")}
                  </p>
                  {daySlots.length === 0 ? (
                    <p className="text-xs text-slate-300 py-1">
                      {ts("calendar.empty.no_slots_day", "No available slots")}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {daySlots.map((slot) => (
                        <button
                          key={slot.id}
                          onClick={() => handleSlotClick(slot)}
                          className={cn(
                            "w-full text-left px-4 py-3 rounded-xl border transition-colors",
                            slot.isBookedByMe
                              ? "bg-edu-blue-50 border-edu-blue-200"
                              : "bg-white border-slate-200 hover:border-edu-blue-300 hover:bg-slate-50"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-slate-800">
                              {slot.title ?? ts("calendar.slot_title_default", "Spanish Class")}
                            </p>
                            {slot.isBookedByMe && (
                              <span className="text-xs font-medium text-edu-blue-600 bg-edu-blue-50 px-2 py-0.5 rounded-full border border-edu-blue-200">
                                {ts("calendar.drawer.already_booked", "Booked")}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {format(new Date(slot.startTime), "HH:mm")} –{" "}
                            {format(new Date(slot.endTime), "HH:mm")}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* ── Slot Detail Drawer ────────────────────────────────────────── */}
        <AnimatePresence>
          {drawerOpen && (
            <SlotDetailDrawer
              key="slot-detail-drawer"
              slot={drawerSlot}
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
              onBooked={handleBooked}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
