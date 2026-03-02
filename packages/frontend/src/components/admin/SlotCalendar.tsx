import { useMemo } from "react";
import { Calendar, dateFnsLocalizer, View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import { Lock, Users, User, CalendarDays } from "lucide-react";
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
    const backgroundColor = getStatusColor(slot.status);
    const borderColor = getBorderColor(slot.isPrivate);
    const textColor = getStatusTextColor(slot.status);

    // Glassy effect for available slots
    const isAvailable = slot.status === "AVAILABLE";

    return {
      style: {
        backgroundColor,
        borderLeft: `4px solid ${borderColor}`,
        opacity: slot.status === "CANCELLED" ? 0.5 : 1,
        color: textColor,
        fontSize: "0.875rem",
        padding: "4px 8px",
        borderRadius: "8px",
        backdropFilter: isAvailable ? "blur(8px)" : "none",
        border: isAvailable ? `1px solid rgba(20, 184, 166, 0.3)` : "none",
        boxShadow: isAvailable
          ? "0 2px 8px rgba(20, 184, 166, 0.1)"
          : "0 2px 4px rgba(0, 0, 0, 0.1)",
      },
    };
  };

  // Custom event component with icons
  const EventComponent = ({ event }: { event: CalendarEvent }) => {
    const slot = event.resource;
    const isAvailable = slot.status === "AVAILABLE";
    const isBooked =
      slot.status === "FULLY_BOOKED" || slot.currentParticipants > 0;

    return (
      <div className="flex flex-col gap-0.5 overflow-hidden">
        {/* Main row */}
        <div className="flex items-center gap-1">
          {slot.isPrivate && <Lock className="h-3 w-3 flex-shrink-0" />}
          {slot.slotType === "GROUP" ? (
            <Users className="h-3 w-3 flex-shrink-0" />
          ) : (
            <User className="h-3 w-3 flex-shrink-0" />
          )}
          <span className="truncate font-medium text-xs">{event.title}</span>
          {slot.maxParticipants > 1 && (
            <span className="text-xs opacity-90 flex-shrink-0">
              ({slot.currentParticipants}/{slot.maxParticipants})
            </span>
          )}
        </div>

        {/* Booking details for booked slots */}
        {isBooked &&
          "bookings" in slot &&
          slot.bookings &&
          slot.bookings.length > 0 && (
            <div className="text-xs opacity-80 truncate">
              {slot.bookings
                .map(
                  (b: any) =>
                    `${b.student?.firstName || ""} ${b.student?.lastName || ""}`,
                )
                .join(", ")}
            </div>
          )}

        {/* Available indicator */}
        {isAvailable && (
          <div className="text-xs opacity-70 flex items-center gap-1">
            <CalendarDays className="h-2.5 w-2.5" />
            <span>Available</span>
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
        style={{ height: 700 }}
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
