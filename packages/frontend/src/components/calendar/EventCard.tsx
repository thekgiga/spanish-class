import React from 'react';
import { Clock, Lock, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatTime } from '@/lib/utils';

// Local slot shape used by the calendar components
export interface CalendarSlot {
  id: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  slotType: 'INDIVIDUAL' | 'GROUP' | 'BLOCKED';
  status: 'AVAILABLE' | 'FULLY_BOOKED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  title?: string | null;
  isPrivate: boolean;
  currentParticipants: number;
  maxParticipants: number;
  isBookedByMe?: boolean;
  waitlistPosition?: number;
  bookings?: Array<{
    id: string;
    status: string;
    student: { id: string; firstName: string; lastName: string; email: string };
  }>;
}

type EventVariant = 'AVAILABLE' | 'PENDING' | 'BOOKED' | 'BLOCKED' | 'CANCELLED';

function resolveVariant(slot: CalendarSlot, isStudent: boolean): EventVariant {
  if (slot.slotType === 'BLOCKED') return 'BLOCKED';
  if (slot.status === 'CANCELLED') return 'CANCELLED';

  if (!isStudent) {
    if (slot.bookings?.some((b) => b.status === 'PENDING_CONFIRMATION')) return 'PENDING';
    if (slot.bookings?.some((b) => b.status === 'CONFIRMED')) return 'BOOKED';
    return 'AVAILABLE';
  }

  // Student side
  if (slot.isBookedByMe) return 'BOOKED';
  return 'AVAILABLE';
}

const variantClasses: Record<EventVariant, string> = {
  AVAILABLE:
    'bg-green-50 border border-dashed border-green-400 text-green-800 hover:bg-green-100',
  PENDING:
    'bg-amber-50 border border-amber-300 text-amber-800 hover:bg-amber-100',
  BOOKED:
    'bg-edu-blue-600 text-white border-none hover:bg-edu-blue-700',
  BLOCKED:
    'bg-slate-100 border border-slate-200 text-slate-400 hover:bg-slate-200',
  CANCELLED:
    'bg-red-50 border border-red-200 text-red-400 line-through opacity-60',
};

export interface EventCardProps {
  slot: CalendarSlot;
  style: React.CSSProperties;
  onClick: (slot: CalendarSlot) => void;
  isStudent?: boolean;
}

export function EventCard({ slot, style, onClick, isStudent = false }: EventCardProps) {
  const variant = resolveVariant(slot, isStudent);
  const height = typeof style.height === 'number' ? style.height : 0;
  const isCompact = height < 40;

  const startDate = new Date(slot.startTime);
  const endDate = new Date(slot.endTime);
  const timeRange = `${formatTime(startDate)} – ${formatTime(endDate)}`;

  const pendingBooking = slot.bookings?.find((b) => b.status === 'PENDING_CONFIRMATION');
  const confirmedBooking = slot.bookings?.find((b) => b.status === 'CONFIRMED');
  const activeBooking = pendingBooking ?? confirmedBooking;
  const studentName = activeBooking
    ? `${activeBooking.student.firstName} ${activeBooking.student.lastName}`
    : null;

  return (
    <div
      className={cn(
        'absolute overflow-hidden cursor-pointer select-none transition-all duration-100',
        'rounded-xl shadow-sm px-2 py-1',
        variantClasses[variant]
      )}
      style={style}
      onClick={(e) => {
        e.stopPropagation();
        onClick(slot);
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(slot);
        }
      }}
      aria-label={`${slot.title ?? 'Slot'} ${timeRange}`}
    >
      {isCompact ? (
        <p className="text-xs font-medium truncate leading-tight">{timeRange}</p>
      ) : (
        <div className="flex flex-col gap-0.5 h-full overflow-hidden">
          {/* Time */}
          <p className="text-xs font-semibold truncate leading-tight">{timeRange}</p>

          {/* Title */}
          {slot.title && (
            <p className="text-xs truncate leading-tight opacity-90">{slot.title}</p>
          )}

          {/* Student name (professor side) */}
          {!isStudent && studentName && (
            <p className="text-xs truncate leading-tight font-medium opacity-80">
              {studentName}
            </p>
          )}

          {/* Group info */}
          {slot.slotType === 'GROUP' && (
            <div className="flex items-center gap-1 mt-auto">
              <Users className="h-3 w-3 opacity-70" />
              <span className="text-xs opacity-70">
                {slot.currentParticipants}/{slot.maxParticipants}
              </span>
            </div>
          )}

          {/* Status icons */}
          <div className="flex items-center gap-1 mt-auto">
            {variant === 'PENDING' && <Clock className="h-3 w-3 opacity-70" />}
            {variant === 'BLOCKED' && <Lock className="h-3 w-3 opacity-70" />}
            {slot.isPrivate && variant !== 'BLOCKED' && (
              <Lock className="h-3 w-3 opacity-60" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
