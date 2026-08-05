/**
 * PendingApprovalsPage — professor reviews pending student booking requests.
 *
 * APP-002: Approve and reject happen in contextual request drawer.
 * APP-003: Approval result updates visible state without dead end.
 *
 * Migration: inline approve/reject replaced with SlotEventDrawer (Phase 3).
 * Each card has a "Review" button that loads the slot and opens the drawer.
 */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { motion, MotionConfig } from "framer-motion";
import { Clock, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SkeletonCard } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { SlotEventDrawer } from "@/components/ui/slot-event-drawer";
import { uiToast } from "@/components/ui/inline-alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { professorApi } from "@/lib/api";
import { formatTime, getInitials } from "@/lib/utils";
import type { AvailabilitySlotWithBookings } from "@spanish-class/shared";

export function PendingApprovalsPage() {
  const { t } = useTranslation("admin");
  const [openSlot, setOpenSlot] = useState<AvailabilitySlotWithBookings | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loadingSlotId, setLoadingSlotId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["pending-bookings"],
    queryFn: () => professorApi.getPendingBookings({ limit: 50 }),
  });

  // API returns extra student data even though the type says BookingWithSlot
  const pendingBookings: Array<{
    id: string; slotId: string;
    confirmationExpiresAt?: string | null;
    slot: { startTime: Date | string; endTime: Date | string };
    student: { firstName: string; lastName: string; email: string };
  }> = (data as any)?.data ?? [];

  const handleReview = async (booking: { slotId: string }) => {
    setLoadingSlotId(booking.slotId);
    try {
      const slot = await professorApi.getSlot(booking.slotId);
      setOpenSlot(slot);
      setDrawerOpen(true);
    } catch {
      uiToast.error(t("calendar.error_generic"));
    } finally {
      setLoadingSlotId(null);
    }
  };

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
      <PageHeader
        title={t("approvals.title")}
        description={t("approvals.subtitle")}
      />

      <div className="mt-4 space-y-3">
        {pendingBookings.length === 0 ? (
          <EmptyState
            icon={<CheckCircle2 className="h-10 w-10" />}
            title={t("approvals.no_pending")}
            description={t("approvals.no_pending_description")}
          />
        ) : (
          <MotionConfig reducedMotion="user">
            {pendingBookings.map((booking, i) => {
            const student = booking.student;
            const slot    = booking.slot;
            const expiry  = booking.confirmationExpiresAt
              ? new Date(booking.confirmationExpiresAt)
              : null;

            return (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card variant="plain">
                  <CardContent className="p-4 space-y-3">
                    {/* Status + expiry */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <StatusBadge status="requested" variant="tag" />
                      {expiry && expiry > new Date() && (
                        <span className="flex items-center gap-1 text-caption text-ink-tertiary">
                          <Clock className="h-3 w-3" aria-hidden="true" />
                          {formatDistanceToNow(expiry, { addSuffix: true })}
                        </span>
                      )}
                    </div>

                    {/* Student */}
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarFallback className="bg-brand text-brand-contrast text-caption font-semibold">
                          {getInitials(student.firstName, student.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-small font-semibold text-ink truncate">
                          {student.firstName} {student.lastName}
                        </p>
                        <p className="text-caption text-ink-tertiary truncate">{student.email}</p>
                      </div>
                    </div>

                    {/* Slot time */}
                    <div className="text-small text-ink-secondary ui-tabular">
                      {format(new Date(slot.startTime), "EEEE, MMMM d")} · {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                    </div>

                    {/* Review button → opens SlotEventDrawer */}
                    <div className="pt-1 border-t border-line">
                      <Button
                        variant="primary"
                        size="sm"
                        isLoading={loadingSlotId === booking.slotId}
                        onClick={() => handleReview(booking)}
                      >
                        {t("approvals.review")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
            })}
          </MotionConfig>
        )}
      </div>

      {/* SlotEventDrawer handles approve/reject — APP-002 + APP-003 */}
      <SlotEventDrawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setOpenSlot(null); }}
        slot={openSlot}
      />
    </div>
  );
}
