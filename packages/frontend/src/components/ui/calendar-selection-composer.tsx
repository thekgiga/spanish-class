/**
 * CalendarSelectionComposer — appears after a range drag-select on the calendar.
 *
 * Blueprint (docs/ui-system/07-calendar-booking-domain.md §Calendar selection):
 *   After release, open composer with:
 *   1. Offer this time
 *   2. Schedule a student
 *   3. Block time
 *
 * Desktop: anchored floating panel (224 px, focus-trapped, Escape closes).
 * Mobile (< md): renders as a bottom sheet via the Drawer primitive.
 * Focus moves to the first action on open.
 */
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarPlus, Users, Lock } from 'lucide-react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerBody,
} from '@/components/ui/drawer';
import { cn } from '@/lib/utils';

export interface SelectionRange {
  start: Date;
  end: Date;
}

export interface CalendarSelectionComposerProps {
  range: SelectionRange;
  open: boolean;
  onClose: () => void;
  onOfferTime: (range: SelectionRange) => void;
  onScheduleStudent: (range: SelectionRange) => void;
  onBlockTime: (range: SelectionRange) => void;
  /** Position hint for anchoring (desktop: near selection end) */
  style?: React.CSSProperties;
}

function formatDuration(start: Date, end: Date, t: (key: string, opts?: Record<string, number>) => string): string {
  const mins = Math.round((end.getTime() - start.getTime()) / 60_000);
  if (mins < 60) return t('calendar.duration_minutes', { count: mins });
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (m === 0) return t('calendar.duration_hours', { count: h });
  return t('calendar.duration_hours_minutes', { hours: h, minutes: m });
}

export function CalendarSelectionComposer({
  range,
  open,
  onClose,
  onOfferTime,
  onScheduleStudent,
  onBlockTime,
  style,
}: CalendarSelectionComposerProps) {
  const { t } = useTranslation('admin');
  const firstButtonRef = React.useRef<HTMLButtonElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  // Use Drawer sheet on mobile (< 768 px) to avoid composer floating off-screen
  const isMobile = useMediaQuery('(max-width: 767px)');

  // Move focus to first action on open
  React.useEffect(() => {
    if (open) {
      requestAnimationFrame(() => firstButtonRef.current?.focus());
    }
  }, [open]);

  // Escape dismisses + Tab traps focus within the panel
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose(); return; }
      if (e.key === 'Tab' && panelRef.current) {
        const focusable = Array.from(
          panelRef.current.querySelectorAll<HTMLElement>('button:not([disabled])'),
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last  = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      }
    };
    document.addEventListener('keydown', handler, { capture: true });
    return () => document.removeEventListener('keydown', handler, { capture: true });
  }, [open, onClose]);

  if (!open) return null;

  const duration = formatDuration(range.start, range.end, t as (key: string, opts?: Record<string, number>) => string);

  const actions: { label: string; sublabel: string; icon: React.ElementType; tone: string; onClick: () => void }[] = [
    {
      label: t('calendar.offer_time'),
      sublabel: duration,
      icon: CalendarPlus,
      tone: 'text-status-available-foreground bg-status-available-surface hover:bg-status-available-surface/80 border-status-available-border',
      onClick: () => { onClose(); onOfferTime(range); },
    },
    {
      label: t('calendar.schedule_student'),
      sublabel: duration,
      icon: Users,
      tone: 'text-status-confirmed-foreground bg-status-confirmed-surface hover:bg-status-confirmed-surface/80 border-status-confirmed-border',
      onClick: () => { onClose(); onScheduleStudent(range); },
    },
    {
      label: t('calendar.block_time'),
      sublabel: duration,
      icon: Lock,
      tone: 'text-status-blocked-foreground bg-status-blocked-surface hover:bg-status-blocked-surface/80 border-status-blocked-border',
      onClick: () => { onClose(); onBlockTime(range); },
    },
  ];

  // Action button content shared between desktop popover + mobile sheet
  const actionButtons = (
    <div className="flex flex-col">
      {actions.map((action, i) => (
        <button
          key={action.label}
          ref={i === 0 ? firstButtonRef : undefined}
          type="button"
          onClick={action.onClick}
          className={cn(
            'flex items-center gap-3 px-4 min-h-touch-min text-left border-b border-line last:border-0',
            'transition-colors duration-micro focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus',
            action.tone,
          )}
        >
          {React.createElement(action.icon, { className: 'h-4 w-4 shrink-0', role: 'presentation' } as React.ComponentProps<typeof action.icon>)}
          <span className="text-small font-semibold">{action.label}</span>
        </button>
      ))}
    </div>
  );

  // Mobile: render as a bottom sheet via the Drawer primitive
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={(v) => !v && onClose()}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{t('calendar.create_action_label')}</DrawerTitle>
          </DrawerHeader>
          <DrawerBody className="p-0">
            <p className="px-6 py-2 text-caption text-ink-secondary border-b border-line">{duration}</p>
            {actionButtons}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <>
      {/* Click-away backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Desktop panel — focus-trapped */}
      <div
        ref={panelRef}
        role="dialog"
        aria-label={t('calendar.create_action_label')}
        aria-modal="true"
        className="fixed z-50 w-56 bg-surface rounded-ui-md shadow-ui-2 border border-line overflow-hidden"
        style={style}
      >
        {/* Duration header */}
        <div className="px-3 py-2 border-b border-line bg-canvas">
          <p className="text-caption text-ink-secondary">{duration}</p>
        </div>
        {actionButtons}
      </div>
    </>
  );
}
