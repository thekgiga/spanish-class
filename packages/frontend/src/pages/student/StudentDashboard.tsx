/**
 * StudentDashboard — student home page.
 *
 * HOME-S-001: Prioritises next confirmed lesson, then pending request, then book action.
 * MEET-001: Join action explains availability window and lifecycle.
 *
 * Priority stack (docs/ui-system/08-page-blueprints.md §Student — Home):
 *   1. Next confirmed lesson hero card (with MeetingReadiness)
 *   2. Pending request card (when no confirmed lesson)
 *   3. Book next lesson CTA
 *   4. Recent activity (last 3 completed)
 */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { format, differenceInMinutes } from "date-fns";
import { Video, ExternalLink, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { BookingRequestCard } from "@/components/ui/booking-request-card";
import { SkeletonCard } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { SEOMeta } from "@/components/shared/SEOMeta";
import { studentApi } from "@/lib/api";
import { bookingStatusToUi, isBookingPending, isBookingConfirmed } from "@/lib/ui-system/status";
import { formatTime } from "@/lib/utils";
import type { BookingWithSlot, StudentDashboardStats } from "@spanish-class/shared";

// ── MeetingReadiness — MEET-001 ───────────────────────────────────────────

interface MeetingReadinessProps {
  startTime: Date | string;
  meetLink: string;
}

function MeetingReadiness({ startTime, meetLink }: MeetingReadinessProps) {
  const { t } = useTranslation("home");
  const [minutesUntil, setMinutesUntil] = useState(() =>
    differenceInMinutes(new Date(startTime), new Date()),
  );

  useEffect(() => {
    const id = setInterval(() => {
      setMinutesUntil(differenceInMinutes(new Date(startTime), new Date()));
    }, 30_000);
    return () => clearInterval(id);
  }, [startTime]);

  if (minutesUntil < 0) return null;

  const isOpen = minutesUntil <= 5;

  return (
    <div className="space-y-2">
      <p className="text-caption text-ink-tertiary">{t("dashboard.meeting_window_hint")}</p>
      <a
        href={isOpen ? meetLink : undefined}
        target={isOpen ? "_blank" : undefined}
        rel="noopener noreferrer"
        aria-disabled={!isOpen}
        tabIndex={isOpen ? undefined : -1}
        className={isOpen
          ? "inline-flex items-center gap-2 px-4 py-2 rounded-ui-sm bg-status-confirmed-surface border border-status-confirmed-border text-status-confirmed-foreground text-small font-medium hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          : "inline-flex items-center gap-2 px-4 py-2 rounded-ui-sm bg-surface-muted border border-line text-ink-tertiary text-small font-medium cursor-default select-none"
        }
      >
        <Video className="h-4 w-4 shrink-0" aria-hidden="true" />
        {isOpen
          ? <>{t("dashboard.meeting_open")}<ExternalLink className="h-3.5 w-3.5 opacity-60" aria-hidden="true" /></>
          : minutesUntil > 60
          ? t("dashboard.meeting_opens_in_hours", { count: Math.ceil(minutesUntil / 60) })
          : t("dashboard.meeting_opens_in_minutes", { count: minutesUntil })
        }
      </a>
    </div>
  );
}

// ── Confirmed lesson hero ─────────────────────────────────────────────────

function ConfirmedLessonHero({ booking }: { booking: BookingWithSlot }) {
  const slot      = booking.slot;
  const professor = (slot as any).professor as { firstName: string; lastName: string } | undefined;
  const meetLink  = (slot as any).meetLink as string | null;

  return (
    <Card variant="selected">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-2">
          <StatusBadge status="confirmed" variant="tag" />
          <span className="text-caption text-ink-tertiary">
            {format(new Date(slot.startTime), "EEEE, MMMM d")}
          </span>
        </div>
        <div>
          <p className="text-h3 font-semibold text-ink">
            {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
          </p>
          {professor && (
            <p className="text-small text-ink-secondary mt-0.5">
              {professor.firstName} {professor.lastName}
            </p>
          )}
        </div>
        {meetLink && (
          <MeetingReadiness startTime={new Date(slot.startTime)} meetLink={meetLink} />
        )}
      </CardContent>
    </Card>
  );
}

// ── Recent activity ───────────────────────────────────────────────────────

function RecentActivityRow({ booking }: { booking: BookingWithSlot }) {
  const uiStatus = bookingStatusToUi(booking.status);
  const slot     = booking.slot;
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <div className="min-w-0">
        <p className="text-small font-medium text-ink truncate">
          {format(new Date(slot.startTime), "MMM d, yyyy")}
        </p>
        <p className="text-caption text-ink-tertiary ui-tabular">
          {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
        </p>
      </div>
      <StatusBadge status={uiStatus} variant="pill" />
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────

export function StudentDashboard() {
  const { t } = useTranslation("home");

  const { data: dashData, isLoading: dashLoading } = useQuery({
    queryKey: ["student-dashboard"],
    queryFn: () => studentApi.getDashboard(),
  });

  const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
    queryKey: ["student-bookings-recent"],
    queryFn: () => studentApi.getBookings({ limit: 10 } as any),
  });

  const stats      = (dashData as any)?.data as StudentDashboardStats | undefined;
  const allBookings: BookingWithSlot[] = (bookingsData as any)?.data ?? [];
  const now        = new Date();

  const confirmedNext = allBookings.find(
    (b) => isBookingConfirmed(b) && new Date(b.slot.startTime) > now,
  ) ?? (stats?.nextSession && isBookingConfirmed(stats.nextSession) ? stats.nextSession : null);

  const pendingBookings = allBookings.filter(isBookingPending);

  const recentActivity = allBookings
    .filter((b) => bookingStatusToUi(b.status) === 'completed')
    .slice(0, 3);

  const isLoading = dashLoading || bookingsLoading;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 space-y-6">
      <SEOMeta title={t("dashboard.seo_title")} description={t("dashboard.seo_description")} />

      {isLoading ? (
        <div className="space-y-3">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : confirmedNext ? (
        /* ── Priority 1: next confirmed lesson ─────────────────── */
        <>
          <p className="text-caption text-ink-tertiary uppercase tracking-wide font-semibold">
            {t("dashboard.next_lesson_title")}
          </p>
          <ConfirmedLessonHero booking={confirmedNext} />
        </>
      ) : pendingBookings.length > 0 ? (
        /* ── Priority 2: pending request ───────────────────────── */
        <>
          <p className="text-caption text-ink-tertiary uppercase tracking-wide font-semibold">
            {t("dashboard.pending_title")}
          </p>
          <div className="space-y-3">
            {pendingBookings.map((b, i) => (
              <BookingRequestCard key={b.id} booking={b} variant={i === 0 ? "hero" : "compact"} />
            ))}
          </div>
        </>
      ) : (
        /* ── Priority 3: no upcoming ────────────────────────────── */
        <EmptyState
          icon={<Calendar className="h-10 w-10" />}
          title={t("dashboard.no_upcoming_title")}
          description={t("dashboard.no_upcoming_description")}
        />
      )}

      {/* Book CTA — always visible */}
      <Button variant="primary" size="lg" className="w-full" asChild>
        <Link to="/dashboard/book">{t("dashboard.book_action")}</Link>
      </Button>

      {/* ── Priority 4: recent activity ─────────────────────────── */}
      {recentActivity.length > 0 && (
        <section aria-label={t("dashboard.recent_activity")}>
          <p className="text-caption text-ink-tertiary uppercase tracking-wide font-semibold mb-2">
            {t("dashboard.recent_activity")}
          </p>
          <Card variant="plain">
            <CardContent className="px-4 py-0 divide-y divide-line">
              {recentActivity.map((b) => (
                <RecentActivityRow key={b.id} booking={b} />
              ))}
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
