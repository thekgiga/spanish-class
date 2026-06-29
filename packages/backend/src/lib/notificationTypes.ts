/**
 * Canonical list of notification type slugs used across the application.
 * The `label` is the human-readable name shown in notification preferences UI.
 */
export const NOTIFICATION_TYPES = [
  { type: "booking_pending",           label: "Booking awaiting confirmation" },
  { type: "booking_request",           label: "New booking request" },
  { type: "booking_confirmed",         label: "Booking confirmed" },
  { type: "booking_rejected",          label: "Booking declined" },
  { type: "booking_expired",           label: "Booking request expired" },
  { type: "booking_expired_professor", label: "Student booking expired" },
  { type: "class_reminder_24h",        label: "Class starts in 24 hours" },
  { type: "class_reminder_1h",         label: "Class starts in 1 hour" },
  { type: "feedback_pending",          label: "Rate your last session" },
] as const;

export type NotificationType = typeof NOTIFICATION_TYPES[number]["type"];
