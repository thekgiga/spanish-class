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
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { professorApi } from "@/lib/api";
import { SlotCalendar } from "@/components/admin/SlotCalendar";
import { SlotModal } from "@/components/admin/SlotModal";
import { CalendarToolbar } from "@/components/admin/CalendarToolbar";
import { PrivateInvitationModal } from "@/components/professor/PrivateInvitationModal";

export function CalendarPage() {
  const { t } = useTranslation("admin");

  // Calendar state
  const [view, setView] = useState<View>("week");
  const [date, setDate] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

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
  const [showPrivateInvitationModal, setShowPrivateInvitationModal] =
    useState(false);

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
    ],
    queryFn: () =>
      professorApi.getSlots({
        page: 1,
        limit: 100,
        startDate: calendarStart.toISOString(),
        endDate: calendarEnd.toISOString(),
        status: statusFilter || undefined,
        slotType: typeFilter || undefined,
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
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowPrivateInvitationModal(true)}
            className="text-xs sm:text-sm px-3 sm:px-4"
          >
            <UserPlus className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline ml-2">
              {t("calendar.private_invitation")}
            </span>
            <span className="sm:hidden ml-2">Invite</span>
          </Button>
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

      {/* Private Invitation Modal */}
      <PrivateInvitationModal
        isOpen={showPrivateInvitationModal}
        onClose={() => setShowPrivateInvitationModal(false)}
        defaultDate={selectedDate}
      />
    </div>
  );
}
