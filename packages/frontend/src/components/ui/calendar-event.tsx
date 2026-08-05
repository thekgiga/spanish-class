/**
 * CalendarEventTile — rendered by FullCalendar's eventContent prop.
 *
 * Blueprint anatomy (docs/ui-system/07-calendar-booking-domain.md):
 *   4px left accent strip | icon | title | time (secondary)
 *
 * Status is NEVER communicated by color alone — icon + text always present.
 * Dense variant for events shorter than ~45 min (height ≤ 48px).
 *
 * Design notes:
 * - Confirmed events use bg-brand + text-brand-contrast (strongest emphasis).
 * - Available events render a dashed outer border (border-dashed + border-status-available-border).
 * - All other statuses use their surface/border/foreground semantic triple.
 */
import * as React from 'react';
import {
  CalendarPlus, Clock3, CalendarCheck2, Lock,
  CircleCheck, CircleX, Ban, TimerOff,
  User, Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UiLifecycleStatus } from '@/lib/ui-system/status';

// ── Icon map ──────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  CalendarPlus, Clock3, CalendarCheck2, Lock,
  CircleCheck, CircleX, Ban, TimerOff,
};

// Lookup icon component from the string stored in uiStatusDefinition
function getIcon(name: string) {
  return ICON_MAP[name] ?? CalendarCheck2;
}

// ── Tone → class sets ─────────────────────────────────────────────────────
// Confirmed uses solid brand fill (strongest emphasis per booking-calendar.md).
// Available uses dashed border to signal "open for booking" (blueprint §Available).

const TONE_CLASSES: Record<UiLifecycleStatus, {
  strip: string;
  container: string;
  text: string;
}> = {
  available:  { strip: 'bg-status-available-border',  container: 'bg-status-available-surface border border-dashed border-status-available-border',  text: 'text-status-available-foreground'  },
  requested:  { strip: 'bg-status-requested-border',  container: 'bg-status-requested-surface border border-status-requested-border',                 text: 'text-status-requested-foreground'  },
  confirmed:  { strip: 'bg-brand',                    container: 'bg-brand border border-transparent',                                                text: 'text-brand-contrast'               },
  blocked:    { strip: 'bg-status-blocked-border',    container: 'bg-status-blocked-surface border border-status-blocked-border',                    text: 'text-status-blocked-foreground'    },
  completed:  { strip: 'bg-status-completed-border',  container: 'bg-status-completed-surface border border-status-completed-border',                text: 'text-status-completed-foreground'  },
  cancelled:  { strip: 'bg-status-cancelled-border',  container: 'bg-status-cancelled-surface border border-status-cancelled-border',               text: 'text-status-cancelled-foreground'  },
};

// ── Component ─────────────────────────────────────────────────────────────

export interface CalendarEventTileProps {
  status: UiLifecycleStatus;
  /** Lucide icon name string from uiStatusDefinition */
  iconName: string;
  title: string;
  /** Optional secondary line — student name(s) for booked/pending/confirmed slots */
  subtitle?: string;
  time?: string;
  /** True when the event slot is < ~45 min and the tile is short */
  dense?: boolean;
  /** INDIVIDUAL = one-on-one, GROUP = group class. Omit for BLOCKED slots. */
  slotType?: 'INDIVIDUAL' | 'GROUP';
}

export function CalendarEventTile({
  status,
  iconName,
  title,
  subtitle,
  time,
  dense = false,
  slotType,
}: CalendarEventTileProps) {
  const Icon = getIcon(iconName);
  const { strip, container, text } = TONE_CLASSES[status];

  // Type icon: User = individual, Users = group. Hidden for BLOCKED (irrelevant).
  const TypeIcon = slotType === 'GROUP' ? Users : slotType === 'INDIVIDUAL' ? User : null;

  return (
    <div className={cn('flex h-full w-full overflow-hidden rounded-ui-xs', container)}>
      {/* 3px left accent strip */}
      <div className={cn('w-1 shrink-0', strip)} aria-hidden="true" />

      {/* Content */}
      <div className={cn('flex flex-1 min-w-0 gap-1 px-1.5', dense ? 'items-center py-0.5' : 'flex-col py-1')}>
        <div className={cn('flex items-center gap-1 min-w-0', text)}>
          {React.createElement(Icon, { className: 'h-3 w-3 shrink-0', role: 'presentation' } as React.ComponentProps<typeof Icon>)}
          <span className={cn('font-semibold truncate leading-tight text-caption flex-1')}>
            {title}
          </span>
          {TypeIcon && (
            <TypeIcon
              className="h-3 w-3 shrink-0 opacity-70"
              aria-hidden="true"
            />
          )}
        </div>
        {!dense && subtitle && (
          <span className={cn('text-micro truncate font-medium', text, 'opacity-90')}>
            {subtitle}
          </span>
        )}
        {!dense && time && (
          <span className={cn('text-micro truncate', text, 'opacity-80')}>
            {time}
          </span>
        )}
      </div>
    </div>
  );
}
