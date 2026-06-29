import React, { useEffect, useRef, useState } from 'react';
import { addDays, isSameDay, format } from 'date-fns';
import { cn } from '@/lib/utils';
import { EventCard, CalendarSlot } from './EventCard';
import { useCalendarDrag } from '../../hooks/useCalendarDrag';

// ─── Constants (exported for consumers) ────────────────────────────────────
export const HOUR_HEIGHT = 64;  // px per hour
export const START_HOUR = 7;    // 7 AM
export const END_HOUR = 22;     // 10 PM

const TOTAL_HEIGHT = (END_HOUR - START_HOUR) * HOUR_HEIGHT;
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

// ─── Types ──────────────────────────────────────────────────────────────────
export interface WeeklyCalendarProps {
  slots: CalendarSlot[];
  view: 'week' | 'day';
  weekStart: Date;
  selectedDay?: Date;
  onSlotClick: (slot: CalendarSlot) => void;
  onDragComplete?: (start: Date, end: Date, dayDate: Date) => void;
  className?: string;
  isStudent?: boolean;
}

// ─── Overlap detection ──────────────────────────────────────────────────────
interface SlotWithLayout {
  slot: CalendarSlot;
  colIndex: number;
  totalCols: number;
}

function getStartMinutes(slot: CalendarSlot): number {
  const d = new Date(slot.startTime);
  return d.getHours() * 60 + d.getMinutes();
}

function getEndMinutes(slot: CalendarSlot): number {
  const d = new Date(slot.endTime);
  return d.getHours() * 60 + d.getMinutes();
}

function layoutSlots(slots: CalendarSlot[]): SlotWithLayout[] {
  if (slots.length === 0) return [];

  // Sort by start time
  const sorted = [...slots].sort((a, b) => getStartMinutes(a) - getStartMinutes(b));

  const groups: CalendarSlot[][] = [];

  for (const slot of sorted) {
    const slotStart = getStartMinutes(slot);
    const slotEnd = getEndMinutes(slot);

    let placed = false;
    for (const group of groups) {
      // Check if this slot overlaps with any slot in the group
      const overlaps = group.some((s) => {
        const sStart = getStartMinutes(s);
        const sEnd = getEndMinutes(s);
        return slotStart < sEnd && slotEnd > sStart;
      });

      if (overlaps) {
        group.push(slot);
        placed = true;
        break;
      }
    }

    if (!placed) {
      groups.push([slot]);
    }
  }

  const result: SlotWithLayout[] = [];

  for (const group of groups) {
    const totalCols = group.length;
    group.forEach((slot, colIndex) => {
      result.push({ slot, colIndex, totalCols });
    });
  }

  return result;
}

function slotToStyle(
  slot: CalendarSlot,
  colIndex: number,
  totalCols: number
): React.CSSProperties {
  const start = new Date(slot.startTime);
  const end = new Date(slot.endTime);
  const startMins = start.getHours() * 60 + start.getMinutes();
  const endMins = end.getHours() * 60 + end.getMinutes();
  const top = ((startMins - START_HOUR * 60) / 60) * HOUR_HEIGHT;
  const height = Math.max(24, ((endMins - startMins) / 60) * HOUR_HEIGHT - 2);
  const width = 100 / totalCols;
  const left = (colIndex / totalCols) * 100;
  return {
    top,
    height,
    left: `${left}%`,
    width: `${width - 1}%`,
    position: 'absolute',
  };
}

// ─── Current time indicator ─────────────────────────────────────────────────
function CurrentTimeIndicator() {
  const [top, setTop] = useState(() => computeTop());

  function computeTop() {
    const now = new Date();
    const mins = now.getHours() * 60 + now.getMinutes();
    return ((mins - START_HOUR * 60) / 60) * HOUR_HEIGHT;
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setTop(computeTop());
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="absolute left-0 right-0 pointer-events-none z-20"
      style={{ top }}
    >
      <div className="relative flex items-center">
        <div className="w-2 h-2 rounded-full bg-red-500 -translate-x-1" />
        <div className="flex-1 border-t-2 border-red-500" />
      </div>
    </div>
  );
}

// ─── Day column ──────────────────────────────────────────────────────────────
interface DayColumnProps {
  date: Date;
  slots: CalendarSlot[];
  isToday: boolean;
  onSlotClick: (slot: CalendarSlot) => void;
  onDragComplete?: (start: Date, end: Date, dayDate: Date) => void;
  isStudent?: boolean;
}

function DayColumn({
  date,
  slots,
  isToday,
  onSlotClick,
  onDragComplete,
  isStudent,
}: DayColumnProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragEnabled = !!onDragComplete;

  const { isDragging, dragDayDate, selectionStyle, handlers } = useCalendarDrag({
    containerRef,
    hourHeight: HOUR_HEIGHT,
    startHour: START_HOUR,
    onComplete: onDragComplete ?? (() => undefined),
  });

  const isDragActive =
    isDragging && dragDayDate !== null && isSameDay(dragDayDate, date);

  const layouted = layoutSlots(slots);

  return (
    <div className="flex flex-col flex-1 min-w-0 border-r border-slate-100 last:border-r-0">
      {/* Header */}
      <div
        className={cn(
          'sticky top-0 z-10 h-10 flex flex-col items-center justify-center border-b border-slate-100',
          isToday ? 'bg-edu-blue-50/40' : 'bg-white'
        )}
      >
        <span className="text-xs text-slate-500 uppercase tracking-wide">
          {format(date, 'EEE')}
        </span>
        <span
          className={cn(
            'w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold leading-none',
            isToday
              ? 'bg-edu-blue-600 text-white'
              : 'text-slate-700'
          )}
        >
          {format(date, 'd')}
        </span>
      </div>

      {/* Grid */}
      <div
        ref={containerRef}
        className={cn(
          'relative flex-1',
          isToday ? 'bg-edu-blue-50/10' : 'bg-white',
          dragEnabled ? 'cursor-crosshair' : 'cursor-default'
        )}
        style={{ height: TOTAL_HEIGHT }}
        onMouseDown={
          dragEnabled
            ? (e) => {
                // Only start drag if clicking on the background (not on an event card)
                if ((e.target as HTMLElement).closest('[role="button"]')) return;
                handlers.onMouseDown(e, date);
              }
            : undefined
        }
      >
        {/* Hour grid lines */}
        {HOURS.map((hour) => (
          <React.Fragment key={hour}>
            <div
              className="absolute left-0 right-0 border-t border-slate-100"
              style={{ top: (hour - START_HOUR) * HOUR_HEIGHT }}
            />
            {/* Half-hour */}
            <div
              className="absolute left-0 right-0 border-t border-slate-50"
              style={{ top: (hour - START_HOUR) * HOUR_HEIGHT + HOUR_HEIGHT / 2 }}
            />
          </React.Fragment>
        ))}

        {/* Current time indicator */}
        {isToday && <CurrentTimeIndicator />}

        {/* Events */}
        {layouted.map(({ slot, colIndex, totalCols }) => (
          <EventCard
            key={slot.id}
            slot={slot}
            style={slotToStyle(slot, colIndex, totalCols)}
            onClick={onSlotClick}
            isStudent={isStudent}
          />
        ))}

        {/* Drag selection overlay */}
        {isDragActive && selectionStyle && (
          <div
            className="absolute left-1 right-1 bg-edu-blue-100/60 border border-edu-blue-400 rounded-lg pointer-events-none z-30"
            style={{
              top: selectionStyle.top,
              height: selectionStyle.height,
            }}
          />
        )}
      </div>
    </div>
  );
}

// ─── WeeklyCalendar ──────────────────────────────────────────────────────────
export function WeeklyCalendar({
  slots,
  view,
  weekStart,
  selectedDay,
  onSlotClick,
  onDragComplete,
  className,
  isStudent = false,
}: WeeklyCalendarProps) {
  // Compute days array
  const days =
    view === 'week'
      ? Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
      : [selectedDay ?? weekStart];

  // Filter slots per day
  function slotsForDay(day: Date): CalendarSlot[] {
    return slots.filter((slot) => isSameDay(new Date(slot.startTime), day));
  }

  return (
    <div className={cn('flex h-full overflow-hidden', className)}>
      {/* Time gutter */}
      <div className="w-14 flex-none border-r border-slate-100">
        {/* Spacer to align with sticky header */}
        <div className="h-10 border-b border-slate-100" />
        <div className="relative" style={{ height: TOTAL_HEIGHT }}>
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="absolute right-0 pr-2"
              style={{ top: (hour - START_HOUR) * HOUR_HEIGHT - 8 }}
            >
              <span className="text-xs text-slate-400 tabular-nums">
                {hour === 12
                  ? '12pm'
                  : hour < 12
                  ? `${hour}am`
                  : `${hour - 12}pm`}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Day columns */}
      <div className="flex flex-1 min-w-0 overflow-y-auto overflow-x-hidden">
        {days.map((day) => (
          <DayColumn
            key={day.toISOString()}
            date={day}
            slots={slotsForDay(day)}
            isToday={isSameDay(day, new Date())}
            onSlotClick={onSlotClick}
            onDragComplete={onDragComplete}
            isStudent={isStudent}
          />
        ))}
      </div>
    </div>
  );
}
