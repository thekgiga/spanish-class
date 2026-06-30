/**
 * BookingStatusBadge — thin adapter that delegates to the central StatusBadge.
 *
 * Kept for backward compat with GroupClassParticipantsList and any other
 * legacy callers. New code should use StatusBadge directly.
 */
import { StatusBadge } from "@/components/ui/status-badge";
import { bookingStatusToUi } from "@/lib/ui-system/status";
import { BookingStatus } from "@spanish-class/shared";

interface BookingStatusBadgeProps {
  status: BookingStatus;
  className?: string;
}

export default function BookingStatusBadge({ status, className }: BookingStatusBadgeProps) {
  const uiStatus = bookingStatusToUi(status);
  return <StatusBadge status={uiStatus} variant="pill" className={className} />;
}
