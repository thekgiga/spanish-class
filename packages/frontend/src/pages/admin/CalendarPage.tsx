import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { View } from "react-big-calendar";
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  format,
} from "date-fns";
import { professorApi } from "@/lib/api";
import { SlotCalendar } from "@/components/admin/SlotCalendar";
import { SlotModal } from "@/components/admin/SlotModal";
import { CalendarToolbar } from "@/components/admin/CalendarToolbar";

export function CalendarPage() {
  const { t } = useTranslation("admin");

  // Calendar state
  const [view, setView] = useState<View>("week");
  const [date, setDate] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [showHidden, setShowHidden] = useState(false);

  // Modal state
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState<string | undefined>(
    undefined,
  );
  const [selectedEndTime, setSelectedEndTime] = useState<string | undefined>(
    undefined,
  );

  // Fetch slots data
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const { data, isLoading } = useQuery({
    queryKey: [
      "professor-slots",
      format(date, "yyyy-MM"),
      statusFilter,
      typeFilter,
      showHidden,
    ],
    queryFn: () =>
      professorApi.getSlots({
        page: 1,
        limit: 100,
        startDate: calendarStart.toISOString(),
        endDate: calendarEnd.toISOString(),
        status: statusFilter || undefined,
        slotType: typeFilter || undefined,
        includeHidden: showHidden,
      }),
  });

  const slots = data?.data || [];

  // Find selected slot for edit mode
  const selectedSlot = selectedSlotId
    ? slots.find((slot) => slot.id === selectedSlotId) || null
    : null;

  // Navigation handlers
  const handleNavigate = (action: "PREV" | "NEXT" | "TODAY") => {
    if (action === "TODAY") {
      setDate(new Date());
    } else if (action === "PREV") {
      if (view === "month") {
        setDate(subMonths(date, 1));
      } else if (view === "week") {
        setDate(new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000));
      } else if (view === "day") {
        setDate(new Date(date.getTime() - 24 * 60 * 60 * 1000));
      }
    } else if (action === "NEXT") {
      if (view === "month") {
        setDate(addMonths(date, 1));
      } else if (view === "week") {
        setDate(new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000));
      } else if (view === "day") {
        setDate(new Date(date.getTime() + 24 * 60 * 60 * 1000));
      }
    }
  };

  // Calendar interaction handlers
  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    // User clicked on empty calendar slot to create new slot
    setModalMode("create");
    setSelectedDate(slotInfo.start);
    setSelectedTime(format(slotInfo.start, "HH:mm"));
    setSelectedEndTime(format(slotInfo.end, "HH:mm"));
    setSelectedSlotId(null);
    setIsSlotModalOpen(true);
  };

  const handleSelectEvent = (event: any) => {
    // User clicked on existing slot to edit
    setModalMode("edit");
    setSelectedSlotId(event.id);
    setSelectedDate(event.start);
    setSelectedTime(undefined);
    setSelectedEndTime(undefined);
    setIsSlotModalOpen(true);
  };

  const handleCreateSlot = () => {
    // User clicked "Create Slot" button in toolbar
    setModalMode("create");
    setSelectedDate(new Date());
    setSelectedTime(undefined);
    setSelectedEndTime(undefined);
    setSelectedSlotId(null);
    setIsSlotModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsSlotModalOpen(false);
    setSelectedSlotId(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">
          {t("messages.loading", { ns: "common" })}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-navy-800">
            {t("calendar.title")}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {t("calendar.subtitle")}
          </p>
        </div>
      </div>

      {/* Calendar Toolbar */}
      <CalendarToolbar
        view={view}
        onViewChange={setView}
        date={date}
        onNavigate={handleNavigate}
        onCreateSlot={handleCreateSlot}
        statusFilter={statusFilter}
        typeFilter={typeFilter}
        onStatusFilterChange={setStatusFilter}
        onTypeFilterChange={setTypeFilter}
        showHidden={showHidden}
        onShowHiddenChange={setShowHidden}
      />

      {/* Calendar */}
      <SlotCalendar
        slots={slots}
        view={view}
        date={date}
        onNavigate={setDate}
        onViewChange={setView}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
      />

      {/* Slot Modal */}
      <SlotModal
        isOpen={isSlotModalOpen}
        onClose={handleCloseModal}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        selectedEndTime={selectedEndTime}
        existingSlot={selectedSlot}
        mode={modalMode}
      />
    </div>
  );
}
