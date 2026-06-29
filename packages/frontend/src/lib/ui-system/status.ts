/**
 * Canonical UI lifecycle status model.
 * Path: packages/frontend/src/lib/ui-system/status.ts
 *
 * This is the ONLY module that may map backend enum values to visual status.
 * No page or component may create a second mapping.
 * Localization keys resolve through the 'booking' namespace.
 */

import { BookingStatus, SlotStatus } from '@spanish-class/shared';

// ─── UI status type ────────────────────────────────────────────────────────

export type UiLifecycleStatus =
  | 'available'
  | 'requested'
  | 'confirmed'
  | 'blocked'
  | 'completed'
  | 'cancelled';

// ─── Per-status visual definition ─────────────────────────────────────────

export interface StatusDefinition {
  /** i18n key under the 'booking' namespace, e.g. 'status.confirmed' */
  labelKey: string;
  /** Lucide icon name — component resolves the import */
  icon: string;
  /** Maps to the semantic Tailwind status tone (--ui-{tone}-*) */
  tone: UiLifecycleStatus;
}

export const uiStatusDefinition = {
  available:  { labelKey: 'status.available',    icon: 'CalendarPlus',    tone: 'available'  },
  requested:  { labelKey: 'status.approvalNeeded', icon: 'Clock3',         tone: 'requested'  },
  confirmed:  { labelKey: 'status.confirmed',    icon: 'CalendarCheck2',  tone: 'confirmed'  },
  blocked:    { labelKey: 'status.blocked',      icon: 'Lock',            tone: 'blocked'    },
  completed:  { labelKey: 'status.completed',    icon: 'CircleCheck',     tone: 'completed'  },
  cancelled:  { labelKey: 'status.cancelled',    icon: 'CircleX',         tone: 'cancelled'  },
} as const satisfies Record<UiLifecycleStatus, StatusDefinition>;

// ─── BookingStatus → UiLifecycleStatus ────────────────────────────────────

const bookingStatusMap: Record<BookingStatus, UiLifecycleStatus> = {
  [BookingStatus.PENDING_CONFIRMATION]: 'requested',
  [BookingStatus.CONFIRMED]:            'confirmed',
  [BookingStatus.COMPLETED]:            'completed',
  [BookingStatus.REJECTED]:             'cancelled',
  [BookingStatus.EXPIRED]:              'cancelled',
  [BookingStatus.CANCELLED_BY_STUDENT]: 'cancelled',
  [BookingStatus.CANCELLED_BY_PROFESSOR]: 'cancelled',
  [BookingStatus.NO_SHOW]:              'cancelled',
};

export function bookingStatusToUi(status: BookingStatus): UiLifecycleStatus {
  return bookingStatusMap[status] ?? 'blocked';
}

// ─── SlotStatus → UiLifecycleStatus ───────────────────────────────────────

const slotStatusMap: Record<SlotStatus, UiLifecycleStatus> = {
  [SlotStatus.AVAILABLE]:    'available',
  [SlotStatus.FULLY_BOOKED]: 'blocked',
  [SlotStatus.IN_PROGRESS]:  'confirmed',
  [SlotStatus.COMPLETED]:    'completed',
  [SlotStatus.CANCELLED]:    'cancelled',
};

// ─── Booking predicates (use instead of raw enum comparisons in components) ──

/** True when a booking is waiting for professor action. */
export function isBookingPending(booking: { status: BookingStatus }): boolean {
  return bookingStatusToUi(booking.status) === 'requested';
}

/** True when a booking is confirmed (lesson is scheduled). */
export function isBookingConfirmed(booking: { status: BookingStatus }): boolean {
  return bookingStatusToUi(booking.status) === 'confirmed';
}

// ─── Storybook / test fixture helpers ────────────────────────────────────
// Exported from this central file so that story files never contain raw enum literals.

/** Returns the raw backend string for a pending-confirmation booking — for use in stories/tests only. */
export function pendingConfirmationStatus(): BookingStatus {
  return BookingStatus.PENDING_CONFIRMATION;
}

/** Returns the raw backend string for a confirmed booking — for use in stories/tests only. */
export function confirmedBookingStatus(): BookingStatus {
  return BookingStatus.CONFIRMED;
}

/** Returns the raw backend string for a fully-booked slot — for use in stories/tests only. */
export function fullyBookedSlotStatus(): SlotStatus {
  return SlotStatus.FULLY_BOOKED;
}

export function slotStatusToUi(status: SlotStatus): UiLifecycleStatus {
  return slotStatusMap[status] ?? 'blocked';
}

// ─── Convenience: resolve definition directly from backend enum ───────────

export function bookingStatusDefinition(status: BookingStatus): StatusDefinition {
  return uiStatusDefinition[bookingStatusToUi(status)];
}

export function slotStatusDefinition(status: SlotStatus): StatusDefinition {
  return uiStatusDefinition[slotStatusToUi(status)];
}
