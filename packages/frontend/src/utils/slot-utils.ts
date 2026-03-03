import { addMinutes, format } from "date-fns";
import type { AvailabilitySlot } from "@spanish-class/shared";

/**
 * Detect conflicts between a new slot and existing slots
 */
export function detectSlotConflicts(
  newSlot: { startTime: Date; endTime: Date },
  existingSlots: AvailabilitySlot[],
): AvailabilitySlot[] {
  return existingSlots.filter((slot) => {
    // Skip cancelled and completed slots
    if (slot.status === "CANCELLED" || slot.status === "COMPLETED") {
      return false;
    }

    const slotStart = new Date(slot.startTime);
    const slotEnd = new Date(slot.endTime);

    // Check if time ranges overlap
    return newSlot.startTime < slotEnd && newSlot.endTime > slotStart;
  });
}

/**
 * Calculate end time based on start time and duration in minutes
 */
export function calculateEndTime(
  startTime: Date,
  durationMinutes: number,
): Date {
  return addMinutes(startTime, durationMinutes);
}

/**
 * Duration presets in minutes
 */
export const DURATION_PRESETS = [
  { label: "30 min", value: 30 },
  { label: "45 min", value: 45 },
  { label: "60 min", value: 60, recommended: true },
  { label: "90 min", value: 90 },
  { label: "120 min", value: 120 },
] as const;

/**
 * Time slots for week view (6 AM - 11 PM)
 */
export const WEEK_START_HOUR = 6;
export const WEEK_END_HOUR = 23;

/**
 * Get color for slot status
 * Returns background color for calendar events
 */
export function getStatusColor(status: AvailabilitySlot["status"]): string {
  switch (status) {
    case "AVAILABLE":
      // Bright teal gradient for available slots
      return "linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)"; // Teal gradient
    case "FULLY_BOOKED":
      // Amber/orange gradient for booked slots
      return "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)"; // Amber gradient
    case "IN_PROGRESS":
      return "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)"; // Blue gradient
    case "COMPLETED":
      return "#94A3B8"; // Gray
    case "CANCELLED":
      return "#EF4444"; // Red
    default:
      return "#64748B"; // Slate
  }
}

/**
 * Get text color for slot status
 * All slots now use white text for better contrast
 */
export function getStatusTextColor(status: AvailabilitySlot["status"]): string {
  switch (status) {
    case "COMPLETED":
      return "#1E293B"; // Dark text for gray background
    default:
      return "#FFFFFF"; // White text for all colored backgrounds
  }
}

/**
 * Get border color for private slots
 */
export function getBorderColor(isPrivate: boolean): string {
  return isPrivate ? "#F59E0B" : "#14B8A6"; // Amber for private, Teal for public
}

/**
 * Format time range for display
 */
export function formatTimeRange(start: Date, end: Date): string {
  return `${format(start, "h:mm a")} - ${format(end, "h:mm a")}`;
}

/**
 * Generate time slots for time picker (30-minute increments)
 */
export function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute of [0, 30]) {
      const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
      slots.push(time);
    }
  }
  return slots;
}
