import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { View } from "react-big-calendar";
import { toast } from "react-hot-toast";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
} from "date-fns";
import { Clock, Star, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { studentApi } from "@/lib/api";
import { formatDate, formatTime, getDuration } from "@/lib/utils";
import { SEOMeta } from "@/components/shared/SEOMeta";
import { SlotCalendar } from "@/components/admin/SlotCalendar";
import { CalendarToolbar } from "@/components/admin/CalendarToolbar";
import type { AvailabilitySlot } from "@spanish-class/shared";

type SlotWithBookedFlag = AvailabilitySlot & { isBookedByMe: boolean };

export function BookPage() {
  const { t } = useTranslation("booking");
  const [view, setView] = useState<View>("week");
  const [date, setDate] = useState(new Date());
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [forMeOnly, setForMeOnly] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SlotWithBookedFlag | null>(
    null,
  );
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const queryClient = useQueryClient();

  // Calculate calendar bounds - memoize with stable string keys
  const monthKey = format(date, "yyyy-MM");
  const { calendarStart, calendarEnd } = useMemo(() => {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    return {
      calendarStart: startOfWeek(monthStart, { weekStartsOn: 1 }),
      calendarEnd: endOfWeek(monthEnd, { weekStartsOn: 1 }),
    };
  }, [monthKey]);

  // Stable date strings for API calls
  const calendarStartStr = calendarStart.toISOString();
  const calendarEndStr = calendarEnd.toISOString();

  const { data, isLoading } = useQuery({
    queryKey: ["available-slots", monthKey, typeFilter, forMeOnly],
    queryFn: () =>
      studentApi.getSlots({
        limit: 200,
        slotType: typeFilter || undefined,
        forMeOnly: forMeOnly || undefined,
        startDate: calendarStartStr,
        endDate: calendarEndStr,
      }),
  });

  // Fetch professor contact info for empty state message
  const { data: professor } = useQuery({
    queryKey: ["professor"],
    queryFn: studentApi.getProfessor,
  });

  const bookMutation = useMutation({
    mutationFn: studentApi.bookSlot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["available-slots"] });
      queryClient.invalidateQueries({ queryKey: ["student-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["student-bookings"] });
      setBookingSuccess(true);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.error || t("booking_modal.error_message"),
      );
      setSelectedSlot(null);
    },
  });

  const handleBook = () => {
    if (selectedSlot) {
      bookMutation.mutate(selectedSlot.id);
    }
  };

  const closeDialog = () => {
    setSelectedSlot(null);
    setBookingSuccess(false);
  };

  // Handle calendar navigation
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

  // Handle slot selection (clicking on calendar slot - not booking, just viewing details)
  const handleSelectSlot = () => {
    // Students don't create slots, so we can ignore this
  };

  // Handle event selection (clicking on existing slot)
  const handleSelectEvent = (event: any) => {
    const slot = data?.data?.find((s) => s.id === event.id);
    if (slot && !slot.isBookedByMe) {
      setSelectedSlot(slot);
    }
  };

  const slots = data?.data || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">
          {t("messages.loading", { ns: "common" })}
        </p>
      </div>
    );
  }

  // Show empty state for forMeOnly when no slots at all
  if (forMeOnly && slots.length === 0) {
    return (
      <>
        <SEOMeta
          title={t("page.seo_title")}
          description={t("page.seo_description")}
          canonical="/book"
          noindex={true}
        />
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-900">
              {t("page.book_title")}
            </h1>
            <p className="text-slate-600">{t("page.book_subtitle")}</p>
          </div>
          <Card>
            <CardContent className="py-12 text-center">
              <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-lg font-medium text-navy-800 mb-2">
                {t("empty_states.no_private_sessions")}
              </p>
              <p className="text-muted-foreground max-w-md mx-auto mb-4">
                {t("empty_states.no_private_sessions_description")}
              </p>
              {professor && (
                <div className="inline-flex items-center gap-3 px-4 py-3 bg-navy-50 rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-navy-800 text-white flex items-center justify-center font-medium">
                    {professor.firstName.charAt(0)}
                    {professor.lastName.charAt(0)}
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-navy-800">
                      {professor.firstName} {professor.lastName}
                    </p>
                    <a
                      href={`mailto:${professor.email}`}
                      className="text-sm text-gold-600 hover:text-gold-700 flex items-center gap-1"
                    >
                      <Mail className="h-3 w-3" />
                      {professor.email}
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOMeta
        title={t("page.seo_title")}
        description={t("page.seo_description")}
        canonical="/book"
        noindex={true}
      />
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-navy-800">
              {t("page.book_title")}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {t("page.book_subtitle")}
            </p>
          </div>
        </div>

        {/* Calendar Toolbar */}
        <CalendarToolbar
          view={view}
          onViewChange={setView}
          date={date}
          onNavigate={handleNavigate}
          statusFilter={null}
          typeFilter={typeFilter}
          onStatusFilterChange={() => {}}
          onTypeFilterChange={setTypeFilter}
          showForMeOnly
          forMeOnly={forMeOnly}
          onForMeOnlyChange={setForMeOnly}
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

        {/* Booking Confirmation Dialog */}
        <Dialog
          open={!!selectedSlot && !bookingSuccess}
          onOpenChange={() => setSelectedSlot(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("booking_modal.title")}</DialogTitle>
              <DialogDescription>
                {t("booking_modal.description")}
              </DialogDescription>
            </DialogHeader>
            {selectedSlot && (
              <div className="p-4 rounded-lg bg-gradient-to-r from-spanish-teal-50 to-spanish-coral-50 border-2 border-spanish-teal-200 space-y-2">
                <p className="font-semibold text-slate-900">
                  {selectedSlot.title || t("booking_modal.class_title")}
                </p>
                <p className="text-sm text-slate-600">
                  {formatDate(selectedSlot.startTime)}
                </p>
                <p className="text-sm text-slate-600">
                  {formatTime(selectedSlot.startTime)} -{" "}
                  {formatTime(selectedSlot.endTime)} (
                  {getDuration(selectedSlot.startTime, selectedSlot.endTime)})
                </p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="neutral">
                    {selectedSlot.slotType === "GROUP"
                      ? t("booking_modal.type_group")
                      : t("booking_modal.type_individual")}
                  </Badge>
                  {selectedSlot.isPrivate && (
                    <Badge variant="default">
                      <Star className="mr-1 h-3 w-3 fill-current" />
                      {t("booking_modal.reserved_for_you")}
                    </Badge>
                  )}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="ghost" onClick={() => setSelectedSlot(null)}>
                {t("booking_modal.cancel_button")}
              </Button>
              <Button
                variant="primary"
                onClick={handleBook}
                isLoading={bookMutation.isPending}
              >
                {t("booking_modal.confirm_button")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Success Dialog */}
        <Dialog open={bookingSuccess} onOpenChange={closeDialog}>
          <DialogContent>
            <div className="text-center py-4">
              <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-amber-600" />
              </div>
              <DialogTitle className="text-xl mb-2">
                {t("booking_modal.success_title")}
              </DialogTitle>
              <DialogDescription className="text-base">
                {t("booking_modal.success_description")}
              </DialogDescription>
            </div>
            <DialogFooter className="sm:justify-center">
              <Button variant="primary" onClick={closeDialog}>
                {t("booking_modal.success_button")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
