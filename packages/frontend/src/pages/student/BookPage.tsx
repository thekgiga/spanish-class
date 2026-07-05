/**
 * BookPage — Student booking flow.
 *
 * BOOK-001: Date-first → time-options UX.
 * BOOK-002: Review drawer shows time, duration, professor, cancellation policy.
 * BOOK-003: After booking, BookingRequestCard hero shows the pending state.
 * BOOK-005: DateStrip availability indicators (slot count per day).
 *
 * Flow:
 *   1. DateStrip — choose a date (counts show which days have openings)
 *   2. AvailableTimeOption list — choose a time slot for that date
 *   3. Drawer review — confirm details including cancellation policy
 *   4. BookingRequestCard hero — post-booking pending state
 */
import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { format, startOfDay, addDays } from "date-fns";
import { Clock, User } from "lucide-react";
import { DateStrip } from "@/components/ui/date-strip";
import { AvailableTimeOption } from "@/components/ui/available-time-option";
import { BookingRequestCard } from "@/components/ui/booking-request-card";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerBody, DrawerFooter, DrawerCloseButton } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { InlineAlert, uiToast } from "@/components/ui/inline-alert";
import { Skeleton } from "@/components/ui/skeleton";
import { SEOMeta } from "@/components/shared/SEOMeta";
import { formatTime } from "@/lib/utils";
import { studentApi } from "@/lib/api";
import type { AvailabilitySlot, BookingWithSlot } from "@spanish-class/shared";

function getDurationLabel(start: Date | string, end: Date | string): string {
  const mins = Math.round(
    (new Date(end).getTime() - new Date(start).getTime()) / 60_000,
  );
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

export function BookPage() {
  const { t } = useTranslation("booking");
  const qc    = useQueryClient();

  const [centerDate, setCenterDate]     = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()));
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [drawerOpen, setDrawerOpen]     = useState(false);
  const [successBooking, setSuccessBooking] = useState<BookingWithSlot | null>(null);

  // Query available slots for the full DateStrip window (radius 7 = 15 visible days).
  // The window must match the strip radius so slotCounts covers every visible day.
  const windowStart = useMemo(() => addDays(centerDate, -7), [centerDate]);
  const windowEnd   = useMemo(() => addDays(centerDate, 8), [centerDate]);

  const { data: slotsData, isLoading } = useQuery({
    queryKey: ["student-available-slots", format(windowStart, "yyyy-MM-dd")],
    queryFn: () =>
      studentApi.getSlots({
        startDate: windowStart.toISOString(),
        endDate:   windowEnd.toISOString(),
        limit: 200,
      }),
  });

  const { data: professorSettings } = useQuery({
    queryKey: ["student-professor-settings"],
    queryFn: () => studentApi.getProfessorSettings(),
    staleTime: 10 * 60_000,
  });

  const { data: professorData } = useQuery({
    queryKey: ["student-professor"],
    queryFn:  () => studentApi.getProfessor(),
  });

  // Count available slots per day for the DateStrip availability indicator (BOOK-005)
  const slotCounts = useMemo<Record<string, number>>(() => {
    const all = slotsData?.data ?? [];
    const counts: Record<string, number> = {};
    for (const s of all) {
      const key = format(new Date(s.startTime), 'yyyy-MM-dd');
      counts[key] = (counts[key] ?? 0) + 1;
    }
    return counts;
  }, [slotsData]);

  const getSlotLabel = useCallback(
    (count: number) => t('date_strip.slots_available', { count }),
    [t],
  );

  // Filter slots to the selected date
  const slotsForDate = useMemo(() => {
    const all = slotsData?.data ?? [];
    const dateKey = format(selectedDate, "yyyy-MM-dd");
    return all.filter(
      (s) => format(new Date(s.startTime), "yyyy-MM-dd") === dateKey,
    );
  }, [slotsData, selectedDate]);

  // Are any slots varying in duration? (drives showDuration prop)
  const hasMixedDurations = useMemo(() => {
    if (slotsForDate.length < 2) return false;
    const durations = slotsForDate.map((s) =>
      new Date(s.endTime).getTime() - new Date(s.startTime).getTime(),
    );
    return new Set(durations).size > 1;
  }, [slotsForDate]);

  const bookMutation = useMutation({
    mutationFn: (slotId: string) => studentApi.bookSlot(slotId),
    onSuccess: (data: any) => {
      qc.invalidateQueries({ queryKey: ["student-available-slots"] });
      qc.invalidateQueries({ queryKey: ["student-bookings"] });
      qc.invalidateQueries({ queryKey: ["student-dashboard"] });
      setDrawerOpen(false);
      // The API now returns { bookingId, slot, booking } where `booking` is a
      // full BookingWithSlot record in the requested (awaiting-approval) UI
      // state. BookingRequestCard consumes this and, via the central status
      // map in lib/ui-system/status.ts, renders the amber "Approval needed"
      // hero, the expiry countdown, and the "what happens next" explanation.
      setSuccessBooking(data.booking as BookingWithSlot);
    },
    onError: () => uiToast.error(t("booking_modal.error_message")),
  });

  const handleDateSelect = useCallback((day: Date) => {
    setSelectedDate(startOfDay(day));
    setCenterDate(day);
    setSelectedSlot(null);
  }, []);

  const handleSlotSelect = useCallback((slot: AvailabilitySlot) => {
    setSelectedSlot(slot);
    setDrawerOpen(true);
  }, []);

  const professor = professorData?.professor;
  const cancellationHours = professorSettings?.cancellationWindowHours ?? 24;

  // Post-booking success screen
  if (successBooking) {
    return (
      <div className="max-w-lg mx-auto px-6 py-8 space-y-4">
        <PageHeader
          title={t("request.booking_sent_title")}
          description={t("request.booking_sent_body")}
        />
        <BookingRequestCard
          booking={successBooking as BookingWithSlot}
          variant="hero"
        />
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => setSuccessBooking(null)}
        >
          {t("request.select_date")}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <SEOMeta title={t("page.seo_title")} description={t("page.seo_description")} />

      <PageHeader title={t("page.book_title")} description={t("page.book_subtitle")} />

      {/* Date strip */}
      <DateStrip
        centerDate={centerDate}
        selectedDate={selectedDate}
        radius={7}
        onSelect={handleDateSelect}
        slotCounts={slotCounts}
        getSlotLabel={getSlotLabel}
      />

      {/* Time options */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
        <p className="text-caption text-ink-tertiary mb-3">
          {format(selectedDate, "EEEE, MMMM d")}
        </p>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : slotsForDate.length === 0 ? (
          <EmptyState
            title={t("request.no_slots_on_date")}
            description={t("request.select_date")}
          />
        ) : (
          <div className="space-y-2 max-w-lg">
            {slotsForDate.map((slot) => (
              <AvailableTimeOption
                key={slot.id}
                slot={slot}
                selected={selectedSlot?.id === slot.id}
                onSelect={handleSlotSelect}
                showDuration={hasMixedDurations}
              />
            ))}
          </div>
        )}
      </div>

      {/* Review drawer — BOOK-002 */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{t("request.review_title")}</DrawerTitle>
            <DrawerCloseButton />
          </DrawerHeader>
          {selectedSlot && (
            <DrawerBody className="space-y-4">
              {/* Date / time */}
              <div className="space-y-1">
                <p className="text-title font-semibold text-ink">
                  {format(new Date(selectedSlot.startTime), "EEEE, MMMM d, yyyy")}
                </p>
                <p className="text-small text-ink-secondary ui-tabular">
                  {formatTime(selectedSlot.startTime)} – {formatTime(selectedSlot.endTime)}
                  {" · "}
                  {getDurationLabel(selectedSlot.startTime, selectedSlot.endTime)}
                </p>
              </div>

              {/* Professor */}
              {professor && (
                <div className="flex items-center gap-2 text-small text-ink-secondary">
                  <User className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{professor.firstName} {professor.lastName}</span>
                </div>
              )}

              {/* Cancellation policy — BOOK-002 */}
              <div className="flex items-start gap-2 text-small text-ink-secondary">
                <Clock className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  {t("request.cancellation_policy", { hours: cancellationHours })}
                </span>
              </div>

              {/* What happens next */}
              <InlineAlert variant="info">
                {t("request.pending_explanation")}
              </InlineAlert>
            </DrawerBody>
          )}
          <DrawerFooter>
            <Button
              variant="secondary"
              onClick={() => setDrawerOpen(false)}
            >
              {t("booking_modal.cancel_button")}
            </Button>
            <Button
              variant="primary"
              size="lg"
              isLoading={bookMutation.isPending}
              onClick={() => selectedSlot && bookMutation.mutate(selectedSlot.id)}
            >
              {t("request.request_lesson")}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
