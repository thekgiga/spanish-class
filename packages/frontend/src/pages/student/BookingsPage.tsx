/**
 * BookingsPage — student's lessons: upcoming + pending requests + history.
 *
 * BOOK-004: Pending state explains what happens next + expiry deadline.
 * APP-004: Expired/rejected recovery path with context.
 *
 * Three visual sections in "Upcoming" tab:
 *   1. Pending requests (BookingRequestCard compact, BOOK-004)
 *   2. Confirmed upcoming lessons (meet-link, join button, cancellation window)
 *   3. History tab: completed/cancelled/rejected/expired with recovery
 */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Video, User, Calendar, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { SkeletonCard } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/ui/status-badge";
import { InlineAlert, uiToast } from "@/components/ui/inline-alert";
import { EmptyState } from "@/components/ui/empty-state";
import { BookingRequestCard } from "@/components/ui/booking-request-card";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/dialog";
import { PageHeader } from "@/components/ui/page-header";
import { studentApi } from "@/lib/api";
import { bookingStatusToUi, isBookingPending, isBookingConfirmed, isBookingNeedsRecovery, bookingRecoveryKey } from "@/lib/ui-system/status";
import { formatTime } from "@/lib/utils";
import type { BookingWithSlot } from "@spanish-class/shared";

function ConfirmedLessonCard({
  booking,
  onCancel,
}: {
  booking: BookingWithSlot;
  onCancel: () => void;
}) {
  const { t } = useTranslation("booking");
  const slot  = booking.slot;

  return (
    <Card variant="plain">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <StatusBadge status="confirmed" variant="tag" />
        </div>
        <div>
          <p className="text-title font-semibold text-ink">
            {format(new Date(slot.startTime), "EEEE, MMMM d, yyyy")}
          </p>
          <p className="text-small text-ink-secondary ui-tabular">
            {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
          </p>
        </div>
        {(slot as any).professor && (
          <div className="flex items-center gap-2 text-small text-ink-secondary">
            <User className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              {(slot as any).professor.firstName} {(slot as any).professor.lastName}
            </span>
          </div>
        )}
        {(slot as any).meetLink && (
          <a
            href={(slot as any).meetLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-ui-sm bg-status-confirmed-surface border border-status-confirmed-border text-status-confirmed-foreground text-small font-medium hover:opacity-90 transition-opacity"
          >
            <Video className="h-4 w-4 shrink-0" aria-hidden="true" />
            {t("slot.join")}
          </a>
        )}
        <div className="flex items-center gap-2 pt-1 border-t border-line">
          <Button variant="quiet" size="sm" onClick={onCancel}>
            {t("page.cancel")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function HistoryCard({
  booking,
  onFeedback,
}: {
  booking: BookingWithSlot;
  onFeedback?: () => void;
}) {
  const { t }    = useTranslation("booking");
  const uiStatus = bookingStatusToUi(booking.status);
  const slot     = booking.slot;
  const recovery = isBookingNeedsRecovery(booking);
  const recoveryI18nKey = bookingRecoveryKey(booking);
  const recoveryMsg = recoveryI18nKey ? t(recoveryI18nKey) : null;
  const isCompleted = uiStatus === 'completed';

  // Fetch session notes (homework) only for completed lessons
  const { data: bookingNotes } = useQuery({
    queryKey: ['booking-notes', booking.id],
    queryFn:  () => studentApi.getBookingNotes(booking.id),
    enabled: isCompleted,
    staleTime: 10 * 60_000,
  });

  return (
    <Card variant="plain" className="opacity-80">
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <StatusBadge status={uiStatus} variant="pill" />
          <span className="text-caption text-ink-tertiary">
            {format(new Date(slot.startTime), "MMM d, yyyy")}
          </span>
        </div>
        <p className="text-small text-ink ui-tabular">
          {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
        </p>
        {booking.cancelReason && (
          <p className="text-caption text-ink-secondary italic">
            "{booking.cancelReason}"
          </p>
        )}
        {recovery && recoveryMsg && (
          <InlineAlert variant="warning" className="mt-2">
            <span>{recoveryMsg}</span>
          </InlineAlert>
        )}
        {recovery && (
          <Button variant="secondary" size="sm" asChild>
            <Link to="/dashboard/book">{t('request.rebook')}</Link>
          </Button>
        )}
        {/* Homework from session notes */}
        {isCompleted && bookingNotes?.homeworkNotes && (
          <div className="pt-2 border-t border-line space-y-1">
            <div className="flex items-center gap-1.5 text-caption text-ink-secondary font-medium">
              <BookOpen className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {t('session_notes.homework_label')}
            </div>
            <p className="text-small text-ink whitespace-pre-wrap pl-5">
              {bookingNotes.homeworkNotes}
            </p>
          </div>
        )}
        {/* FEED-001: contextual feedback for completed lessons */}
        {isCompleted && onFeedback && (
          <Button variant="quiet" size="sm" onClick={onFeedback}>
            {t("page.leave_feedback")}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function BookingsPage() {
  const { t } = useTranslation("booking");
  const qc    = useQueryClient();
  const navigate = useNavigate();
  const [cancelTarget, setCancelTarget] = useState<BookingWithSlot | null>(null);

  // Fetch cancellation policy for CANCEL-001
  const { data: profSettings } = useQuery({
    queryKey: ["student-professor-settings"],
    queryFn: () => studentApi.getProfessorSettings(),
    staleTime: 10 * 60_000,
  });
  const cancellationHours = profSettings?.cancellationWindowHours ?? 24;

  const { data, isLoading } = useQuery({
    queryKey: ["student-bookings"],
    queryFn: () => studentApi.getBookings(),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => studentApi.cancelBooking(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["student-bookings"] });
      qc.invalidateQueries({ queryKey: ["student-dashboard"] });
      setCancelTarget(null);
      uiToast.success(t("page.cancel_success"));
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error ?? t("cancel.error");
      uiToast.error(msg);
    },
  });

  const allBookings: BookingWithSlot[] = (data as any)?.data ?? [];
  const now = new Date();

  const pendingBookings   = allBookings.filter((b) => isBookingPending(b));
  const confirmedBookings = allBookings.filter(
    (b) => isBookingConfirmed(b) && new Date(b.slot.startTime) > now,
  );
  const historyBookings = allBookings.filter(
    (b) =>
      !isBookingPending(b) &&
      !(isBookingConfirmed(b) && new Date(b.slot.startTime) > now),
  );

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-6 space-y-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4">
      <PageHeader title={t("page.bookings_title")} description={t("page.bookings_subtitle")} />

      <Tabs defaultValue="upcoming" className="mt-4">
        <TabsList>
          <TabsTrigger value="upcoming">
            {t("page.upcoming")}
            {(pendingBookings.length + confirmedBookings.length) > 0 && (
              <span className="ml-1 text-caption text-ink-tertiary">
                ({pendingBookings.length + confirmedBookings.length})
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="history">{t("page.history")}</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4 space-y-6">
          {/* Pending section */}
          {pendingBookings.length > 0 && (
            <section>
              <p className="text-caption text-ink-tertiary uppercase tracking-wide font-semibold mb-2">
                {t("request.awaiting_approval_title")} · {pendingBookings.length}
              </p>
              <div className="space-y-3">
                {pendingBookings.map((b) => (
                  <BookingRequestCard
                    key={b.id}
                    booking={b}
                    variant="compact"
                    onCancel={() => setCancelTarget(b)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Confirmed section */}
          {confirmedBookings.length > 0 && (
            <section>
              <p className="text-caption text-ink-tertiary uppercase tracking-wide font-semibold mb-2">
                {t("page.upcoming")} · {confirmedBookings.length}
              </p>
              <div className="space-y-3">
                {confirmedBookings.map((b) => (
                  <ConfirmedLessonCard
                    key={b.id}
                    booking={b}
                    onCancel={() => setCancelTarget(b)}
                  />
                ))}
              </div>
            </section>
          )}

          {pendingBookings.length === 0 && confirmedBookings.length === 0 && (
            <EmptyState
              icon={<Calendar className="h-10 w-10" />}
              title={t("page.no_upcoming")}
              description={t("page.no_upcoming_description")}
              action={
                <Button variant="primary" asChild>
                  <Link to="/dashboard/book">{t("request.rebook")}</Link>
                </Button>
              }
            />
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-4 space-y-3">
          {historyBookings.length === 0 ? (
            <EmptyState
              icon={<Calendar className="h-10 w-10" />}
              title={t("page.no_history")}
            />
          ) : (
            historyBookings.map((b) => (
              <HistoryCard
                key={b.id}
                booking={b}
                onFeedback={
                  bookingStatusToUi(b.status) === 'completed'
                    ? () => navigate(`/dashboard/feedback/${b.id}`)
                    : undefined
                }
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Cancel confirmation dialog */}
      <AlertDialog open={!!cancelTarget} onOpenChange={(v) => !v && setCancelTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {cancelTarget && isBookingPending(cancelTarget)
                ? t("request.withdraw_title")
                : t("page.cancel_confirm_title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {cancelTarget && isBookingPending(cancelTarget)
                ? t("request.withdraw_description")
                : t("page.cancel_confirm_description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {/* CANCEL-001: show cancellation policy only for confirmed bookings */}
          {cancelTarget && !isBookingPending(cancelTarget) && (() => {
            const hoursUntil = (new Date(cancelTarget.slot.startTime).getTime() - Date.now()) / 3_600_000;
            const withinWindow = hoursUntil < cancellationHours && hoursUntil > 0;
            return withinWindow ? (
              <div className="px-6 pb-2">
                <InlineAlert variant="warning">
                  {t("cancel_outside_window", { hours: cancellationHours })}
                </InlineAlert>
              </div>
            ) : (
              <div className="px-6 pb-2">
                <p className="text-caption text-ink-tertiary">
                  {t("request.cancellation_policy", { hours: cancellationHours })}
                </p>
              </div>
            );
          })()}
          <AlertDialogFooter>
            <AlertDialogCancel>{t("booking_modal.cancel_button")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cancelTarget && cancelMutation.mutate(cancelTarget.id)}
            >
              {cancelTarget && isBookingPending(cancelTarget)
                ? t("request.withdraw_action")
                : t("page.cancel_confirm_action")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
