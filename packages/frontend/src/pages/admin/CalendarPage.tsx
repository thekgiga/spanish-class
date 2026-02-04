import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Clock, Users, User, Video } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn, formatTime } from '@/lib/utils';
import { professorApi } from '@/lib/api';
import type { AvailabilitySlot } from '@spanish-class/shared';

export function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const { data } = useQuery({
    queryKey: ['professor-slots', format(currentMonth, 'yyyy-MM')],
    queryFn: () =>
      professorApi.getSlots({
        startDate: calendarStart.toISOString(),
        endDate: calendarEnd.toISOString(),
        limit: 100,
      }),
  });

  const days = useMemo(() => {
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [calendarStart, calendarEnd]);

  const getSlotsByDate = (date: Date): AvailabilitySlot[] => {
    return (
      data?.data?.filter((slot) => isSameDay(new Date(slot.startTime), date)) || []
    );
  };

  const selectedDateSlots = selectedDate ? getSlotsByDate(selectedDate) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-navy-800">Calendar</h1>
          <p className="text-muted-foreground">View and manage your schedule</p>
        </div>
        <Button variant="primary" asChild>
          <Link to="/admin/slots/new">
            <Plus className="mr-2 h-4 w-4" />
            New Slot
          </Link>
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{format(currentMonth, 'MMMM yyyy')}</CardTitle>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(new Date())}>
                Today
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day) => {
                const daySlots = getSlotsByDate(day);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const hasSlots = daySlots.length > 0;

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      'aspect-square p-1 rounded-lg text-sm transition-colors relative',
                      !isSameMonth(day, currentMonth) && 'text-muted-foreground/50',
                      isToday(day) && 'font-bold',
                      isSelected
                        ? 'bg-navy-800 text-white'
                        : 'hover:bg-gray-100',
                      hasSlots && !isSelected && 'bg-gold-50'
                    )}
                  >
                    <span className="block">{format(day, 'd')}</span>
                    {hasSlots && (
                      <span
                        className={cn(
                          'absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full',
                          isSelected ? 'bg-gold-400' : 'bg-gold-500'
                        )}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selected day slots */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDate ? format(selectedDate, 'EEEE, MMM d') : 'Select a date'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDate ? (
              selectedDateSlots.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateSlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                          </span>
                        </div>
                        <Badge
                          variant={
                            slot.status === 'AVAILABLE'
                              ? 'success'
                              : slot.status === 'FULLY_BOOKED'
                              ? 'warning'
                              : 'secondary'
                          }
                          className="text-xs"
                        >
                          {slot.status === 'FULLY_BOOKED' ? 'Full' : slot.status}
                        </Badge>
                      </div>
                      <Link to={`/admin/slots/${slot.id}`}>
                        <p className="text-sm text-navy-800 mt-1 hover:underline">
                          {slot.title || 'Spanish Class'}
                        </p>
                      </Link>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {slot.slotType === 'GROUP' ? (
                            <Users className="h-3 w-3" />
                          ) : (
                            <User className="h-3 w-3" />
                          )}
                          {slot.currentParticipants}/{slot.maxParticipants} booked
                        </div>
                        {slot.googleMeetLink && new Date(slot.startTime) > new Date() && slot.status !== 'CANCELLED' && (
                          <Button size="sm" variant="primary" className="h-7 text-xs" asChild>
                            <a href={slot.googleMeetLink} target="_blank" rel="noopener noreferrer">
                              <Video className="mr-1 h-3 w-3" />
                              Join
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No slots on this day</p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/admin/slots/new">Create Slot</Link>
                  </Button>
                </div>
              )
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Click on a date to see slots
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
