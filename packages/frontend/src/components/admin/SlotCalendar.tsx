import { useMemo } from "react";
import { Calendar, dateFnsLocalizer, View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import { Lock, Unlock, Users, User, Repeat } from "lucide-react";
import {
  getStatusColor,
  getStatusTextColor,
  getBorderColor,
  WEEK_START_HOUR,
  WEEK_END_HOUR,
} from "@/utils/slot-utils";
import type {
  AvailabilitySlot,
  AvailabilitySlotWithBookings,
} from "@spanish-class/shared";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./slot-calendar.css";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: AvailabilitySlot | AvailabilitySlotWithBookings;
}

interface SlotCalendarProps {
  slots: (AvailabilitySlot | AvailabilitySlotWithBookings)[];
  view: View;
  date: Date;
  onNavigate: (date: Date) => void;
  onViewChange: (view: View) => void;
  onSelectSlot: (slotInfo: { start: Date; end: Date }) => void;
  onSelectEvent: (event: CalendarEvent) => void;
}

export function SlotCalendar({
  slots,
  view,
  date,
  onNavigate,
  onViewChange,
  onSelectSlot,
  onSelectEvent,
}: SlotCalendarProps) {
  // Transform slots to calendar events
  // Keep CANCELLED slots visible (in red) so professors can delete them
  const events: CalendarEvent[] = useMemo(() => {
    return slots.map((slot) => ({
      id: slot.id,
      title: slot.title || `${slot.slotType} Class`,
      start: new Date(slot.startTime),
      end: new Date(slot.endTime),
      resource: slot,
    }));
  }, [slots]);

  // Custom event styling
  const eventStyleGetter = (event: CalendarEvent) => {
    const slot = event.resource;

    // Check if slot has any pending approval bookings
    const hasPendingApprovals =
      "bookings" in slot &&
      Array.isArray(slot.bookings) &&
      slot.bookings.some((b) => b.status === "PENDING_CONFIRMATION");

    const backgroundGradient = getStatusColor(slot.status, hasPendingApprovals);
    const borderColor = getBorderColor(slot.isPrivate);
    const textColor = getStatusTextColor(slot.status, hasPendingApprovals);

    const isAvailable = slot.status === "AVAILABLE";
    const isCancelled = slot.status === "CANCELLED";
    const isCompleted = slot.status === "COMPLETED";

    // Enhanced box shadow based on status
    let boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
    if (hasPendingApprovals) {
      // Yellow glow for pending approvals - most important
      boxShadow =
        "0 2px 10px rgba(252, 211, 77, 0.5), inset 0 1px 1px rgba(255,255,255,0.4)";
    } else if (isCancelled) {
      // Red glow for cancelled - needs deletion
      boxShadow =
        "0 2px 10px rgba(239, 68, 68, 0.4), inset 0 1px 1px rgba(255,255,255,0.3)";
    } else if (isAvailable) {
      // Teal glow for available
      boxShadow =
        "0 2px 8px rgba(20, 184, 166, 0.3), inset 0 1px 1px rgba(255,255,255,0.3)";
    } else if (slot.status === "FULLY_BOOKED") {
      // Green glow for confirmed bookings
      boxShadow =
        "0 2px 8px rgba(16, 185, 129, 0.3), inset 0 1px 1px rgba(255,255,255,0.3)";
    }

    return {
      style: {
        background: backgroundGradient,
        borderLeft: `4px solid ${borderColor}`,
        color: textColor,
        fontSize: "0.875rem",
        padding: "2px",
        borderRadius: "6px",
        border: slot.isPrivate
          ? `2px solid ${borderColor}`
          : isCancelled
            ? "2px solid #DC2626"
            : hasPendingApprovals
              ? "2px solid #F59E0B"
              : `1px solid rgba(255, 255, 255, 0.2)`,
        boxShadow,
        opacity: isCancelled ? 0.9 : isCompleted ? 0.7 : 1,
      },
    };
  };

  // Custom event component with enhanced info - Mobile optimized
  const EventComponent = ({ event }: { event: CalendarEvent }) => {
    const slot = event.resource;
    const isAvailable = slot.status === "AVAILABLE";
    const isBooked =
      slot.status === "FULLY_BOOKED" || slot.currentParticipants > 0;
    const isGroup = slot.slotType === "GROUP";
    const isMobile = window.innerWidth < 640;

    return (
      <div className="flex flex-col gap-0.5 sm:gap-1 overflow-hidden h-full p-0.5 sm:p-1">
        {/* Top row: Privacy + Type + Status */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
          {/* Privacy icon - hide on very small screens */}
          {!isMobile && (
            <>
              {slot.isPrivate ? (
                <Lock className="h-2.5 sm:h-3.5 w-2.5 sm:w-3.5 flex-shrink-0 opacity-90" />
              ) : (
                <Unlock className="h-2.5 sm:h-3.5 w-2.5 sm:w-3.5 flex-shrink-0 opacity-60" />
              )}
            </>
          )}

          {/* Recurring pattern indicator */}
          {slot.recurringPatternId && (
            <div title="Part of recurring pattern">
              <Repeat className="h-2 sm:h-3 w-2 sm:w-3 flex-shrink-0 opacity-70" />
            </div>
          )}

          {/* Slot type with badge style */}
          <div
            className={`px-1 sm:px-1.5 py-0.5 rounded text-[8px] sm:text-[10px] font-semibold flex items-center gap-0.5 sm:gap-1 ${
              isGroup
                ? "bg-white/30 backdrop-blur-sm"
                : "bg-white/20 backdrop-blur-sm"
            }`}
          >
            {isGroup ? (
              <>
                <Users className="h-2 sm:h-2.5 w-2 sm:w-2.5" />
                <span className="hidden sm:inline">GROUP</span>
                <span className="sm:hidden">G</span>
              </>
            ) : (
              <>
                <User className="h-2 sm:h-2.5 w-2 sm:w-2.5" />
                <span className="hidden sm:inline">1:1</span>
              </>
            )}
          </div>

          {/* Availability badge */}
          <div
            className={`ml-auto px-1 sm:px-1.5 py-0.5 rounded text-[8px] sm:text-[10px] font-bold ${
              isAvailable
                ? "bg-emerald-500/90 text-white"
                : "bg-amber-500/90 text-white"
            }`}
          >
            {isMobile
              ? isAvailable
                ? "O"
                : "B"
              : isAvailable
                ? "OPEN"
                : "BOOKED"}
          </div>
        </div>

        {/* Title - hide on mobile in compact views */}
        {!isMobile && (
          <div className="truncate font-semibold text-[10px] sm:text-xs leading-tight">
            {event.title}
          </div>
        )}

        {/* Booking info - simplified on mobile */}
        {slot.maxParticipants > 1 && !isMobile && (
          <div className="text-[9px] sm:text-[11px] font-medium opacity-90">
            {slot.currentParticipants}/{slot.maxParticipants}
          </div>
        )}

        {/* Student names - hide on mobile */}
        {!isMobile &&
          isBooked &&
          "bookings" in slot &&
          slot.bookings &&
          slot.bookings.length > 0 && (
            <div className="text-[9px] sm:text-[10px] opacity-75 truncate">
              {slot.bookings
                .map(
                  (b: any) =>
                    `${b.student?.firstName || ""} ${b.student?.lastName || ""}`,
                )
                .join(", ")}
            </div>
          )}
      </div>
    );
  };

  return (
    <div className="calendar-wrapper">
      <Calendar
        localizer={localizer}
        events={events}
        view={view}
        date={date}
        onNavigate={onNavigate}
        onView={onViewChange}
        onSelectSlot={onSelectSlot}
        onSelectEvent={onSelectEvent}
        selectable
        startAccessor="start"
        endAccessor="end"
        style={{
          height: view === "agenda" ? 500 : window.innerWidth < 640 ? 500 : 700,
        }}
        eventPropGetter={eventStyleGetter}
        components={{
          event: EventComponent,
        }}
        min={new Date(0, 0, 0, WEEK_START_HOUR, 0, 0)}
        max={new Date(0, 0, 0, WEEK_END_HOUR, 0, 0)}
        step={30}
        timeslots={2}
        defaultView="week"
        views={["month", "week", "day", "agenda"]}
        messages={{
          today: "Today",
          previous: "Back",
          next: "Next",
          month: "Month",
          week: "Week",
          day: "Day",
          agenda: "Agenda",
          date: "Date",
          time: "Time",
          event: "Slot",
          noEventsInRange: "No slots in this date range",
          showMore: (total) => `+${total} more`,
        }}
      />
    </div>
  );
}
