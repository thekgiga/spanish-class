/** Canonical semantic status model. Wire translation keys and backend enums here only. */
export type UiLifecycleStatus =
  | 'available'
  | 'requested'
  | 'confirmed'
  | 'blocked'
  | 'completed'
  | 'cancelled'
  | 'rejected'
  | 'expired';

export const uiStatusDefinition = {
  available: { labelKey: 'status.available', icon: 'CalendarPlus', tone: 'available' },
  requested: { labelKey: 'status.approvalNeeded', icon: 'Clock3', tone: 'requested' },
  confirmed: { labelKey: 'status.confirmed', icon: 'CalendarCheck2', tone: 'confirmed' },
  blocked: { labelKey: 'status.blocked', icon: 'Lock', tone: 'blocked' },
  completed: { labelKey: 'status.completed', icon: 'CircleCheck', tone: 'completed' },
  cancelled: { labelKey: 'status.cancelled', icon: 'CircleX', tone: 'cancelled' },
  rejected: { labelKey: 'status.rejected', icon: 'Ban', tone: 'cancelled' },
  expired: { labelKey: 'status.expired', icon: 'TimerOff', tone: 'cancelled' },
} as const satisfies Record<UiLifecycleStatus, {
  labelKey: string;
  icon: string;
  tone: 'available' | 'requested' | 'confirmed' | 'blocked' | 'completed' | 'cancelled';
}>;

// Claude must adapt these keys to the repository's exact backend enum/type names during foundation work.
// No page may create a second mapping.
