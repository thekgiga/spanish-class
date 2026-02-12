import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
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
import {
  Calendar,
  Clock,
  User,
  Users,
  CheckCircle2,
  Filter,
  List,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Star,
  Mail,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { studentApi } from '@/lib/api';
import { cn, formatDate, formatTime, getDuration } from '@/lib/utils';
import type { AvailabilitySlot } from '@spanish-class/shared';

type ViewMode = 'list' | 'calendar';

type SlotWithBookedFlag = AvailabilitySlot & { isBookedByMe: boolean };

export function BookPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filter, setFilter] = useState<string>('all');
  const [forMeOnly, setForMeOnly] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SlotWithBookedFlag | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const queryClient = useQueryClient();

  // Calculate calendar bounds - memoize with stable string keys
  const monthKey = format(currentMonth, 'yyyy-MM');
  const { calendarStart, calendarEnd } = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    return {
      calendarStart: startOfWeek(monthStart, { weekStartsOn: 1 }),
      calendarEnd: endOfWeek(monthEnd, { weekStartsOn: 1 }),
    };
  }, [monthKey]);

  // Stable date strings for API calls
  const calendarStartStr = calendarStart.toISOString();
  const calendarEndStr = calendarEnd.toISOString();

  const { data, isLoading } = useQuery({
    queryKey: ['available-slots', viewMode, filter, forMeOnly, viewMode === 'calendar' ? monthKey : 'list'],
    queryFn: () =>
      studentApi.getSlots({
        limit: viewMode === 'calendar' ? 200 : 50,
        slotType: filter !== 'all' ? filter : undefined,
        forMeOnly: forMeOnly || undefined,
        ...(viewMode === 'calendar' && {
          startDate: calendarStartStr,
          endDate: calendarEndStr,
        }),
      }),
  });

  // Fetch professor contact info for empty state message
  const { data: professor } = useQuery({
    queryKey: ['professor'],
    queryFn: studentApi.getProfessor,
  });

  const bookMutation = useMutation({
    mutationFn: studentApi.bookSlot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['available-slots'] });
      queryClient.invalidateQueries({ queryKey: ['student-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['student-bookings'] });
      setBookingSuccess(true);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to book slot');
      setSelectedSlot(null);
    },
  });

  const handleBook = () => {
    if (selectedSlot) {
      bookMutation.mutate(selectedSlot.id);
    }
  };

  const closeDialog = () => {
    setSelectedSlot(null);
    setBookingSuccess(false);
  };

  // Group slots by date for list view
  const slotsByDate = useMemo(() => {
    return data?.data?.reduce((acc, slot) => {
      const dateKey = formatDate(slot.startTime);
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(slot);
      return acc;
    }, {} as Record<string, SlotWithBookedFlag[]>);
  }, [data?.data]);

  // Get slots for calendar view - use monthKey for stable dependency
  const days = useMemo(() => {
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [monthKey]);

  const getSlotsByDate = (date: Date): SlotWithBookedFlag[] => {
    return data?.data?.filter((slot) => isSameDay(new Date(slot.startTime), date)) || [];
  };

  const selectedDateSlots = selectedDate ? getSlotsByDate(selectedDate) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-navy-800">Book a Class</h1>
          <p className="text-muted-foreground">Browse and book available sessions</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Slot Type Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                <SelectItem value="GROUP">Group</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* For Me Only Filter */}
          <Button
            variant={forMeOnly ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setForMeOnly(!forMeOnly)}
            className="gap-1"
          >
            <Star className={cn('h-4 w-4', forMeOnly && 'fill-current')} />
            For Me Only
          </Button>

          {/* View Toggle */}
          <div className="flex rounded-lg border bg-muted p-1">
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="gap-1"
            >
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">List</span>
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('calendar')}
              className="gap-1"
            >
              <CalendarDays className="h-4 w-4" />
              <span className="hidden sm:inline">Calendar</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'list' ? (
        <ListView
          isLoading={isLoading}
          slotsByDate={slotsByDate}
          onSelectSlot={setSelectedSlot}
          forMeOnly={forMeOnly}
          professor={professor}
        />
      ) : (
        <CalendarView
          isLoading={isLoading}
          currentMonth={currentMonth}
          setCurrentMonth={setCurrentMonth}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          days={days}
          getSlotsByDate={getSlotsByDate}
          selectedDateSlots={selectedDateSlots}
          onSelectSlot={setSelectedSlot}
          forMeOnly={forMeOnly}
          totalSlots={data?.data?.length || 0}
          professor={professor}
        />
      )}

      {/* Booking Confirmation Dialog */}
      <Dialog open={!!selectedSlot && !bookingSuccess} onOpenChange={() => setSelectedSlot(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Booking</DialogTitle>
            <DialogDescription>
              You're about to book the following session:
            </DialogDescription>
          </DialogHeader>
          {selectedSlot && (
            <div className="p-4 rounded-lg bg-gray-50 space-y-2">
              <p className="font-semibold">{selectedSlot.title || 'Spanish Class'}</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(selectedSlot.startTime)}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)} (
                {getDuration(selectedSlot.startTime, selectedSlot.endTime)})
              </p>
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary">
                  {selectedSlot.slotType === 'GROUP' ? 'Group Session' : 'Individual Session'}
                </Badge>
                {selectedSlot.isPrivate && (
                  <Badge variant="default">
                    <Star className="mr-1 h-3 w-3 fill-current" />
                    Reserved for you
                  </Badge>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSelectedSlot(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleBook}
              isLoading={bookMutation.isPending}
            >
              Confirm Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={bookingSuccess} onOpenChange={closeDialog}>
        <DialogContent>
          <div className="text-center py-4">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle className="text-xl mb-2">Booking Confirmed!</DialogTitle>
            <DialogDescription className="text-base">
              Your session has been booked successfully. Check your email for confirmation details
              and the Google Meet link.
            </DialogDescription>
          </div>
          <DialogFooter className="sm:justify-center">
            <Button variant="primary" onClick={closeDialog}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Professor info type
type ProfessorInfo = { id: string; firstName: string; lastName: string; email: string } | undefined;

// List View Component
function ListView({
  isLoading,
  slotsByDate,
  onSelectSlot,
  forMeOnly,
  professor,
}: {
  isLoading: boolean;
  slotsByDate: Record<string, SlotWithBookedFlag[]> | undefined;
  onSelectSlot: (slot: SlotWithBookedFlag) => void;
  forMeOnly: boolean;
  professor: ProfessorInfo;
}) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-6 w-48" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((j) => (
                <Skeleton key={j} className="h-48" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!slotsByDate || Object.keys(slotsByDate).length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          {forMeOnly ? (
            <>
              <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-lg font-medium text-navy-800 mb-2">
                No Private Sessions Available
              </p>
              <p className="text-muted-foreground max-w-md mx-auto mb-4">
                There are currently no private sessions scheduled for you.
                Please contact your professor to arrange a dedicated session
                at your earliest convenience.
              </p>
              {professor && (
                <div className="inline-flex items-center gap-3 px-4 py-3 bg-navy-50 rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-navy-800 text-white flex items-center justify-center font-medium">
                    {professor.firstName.charAt(0)}{professor.lastName.charAt(0)}
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-navy-800">
                      {professor.firstName} {professor.lastName}
                    </p>
                    <a
                      href={`mailto:${professor.email}`}
                      className="text-sm text-gold-600 hover:text-gold-700 flex items-center gap-1"
                    >
                      <Mail className="h-3 w-3" />
                      {professor.email}
                    </a>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">
                No available slots at the moment. Check back later!
              </p>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(slotsByDate).map(([date, slots], dateIndex) => (
        <motion.div
          key={date}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: dateIndex * 0.1 }}
        >
          <h2 className="text-lg font-semibold text-navy-800 mb-4">{date}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {slots?.map((slot, slotIndex) => (
              <SlotCard
                key={slot.id}
                slot={slot}
                delay={slotIndex * 0.05}
                onSelect={() => onSelectSlot(slot)}
              />
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Calendar View Component
function CalendarView({
  isLoading,
  currentMonth,
  setCurrentMonth,
  selectedDate,
  setSelectedDate,
  days,
  getSlotsByDate,
  selectedDateSlots,
  onSelectSlot,
  forMeOnly,
  totalSlots,
  professor,
}: {
  isLoading: boolean;
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  days: Date[];
  getSlotsByDate: (date: Date) => SlotWithBookedFlag[];
  selectedDateSlots: SlotWithBookedFlag[];
  onSelectSlot: (slot: SlotWithBookedFlag) => void;
  forMeOnly: boolean;
  totalSlots: number;
  professor: ProfessorInfo;
}) {
  // Show empty state for forMeOnly when no slots at all
  if (!isLoading && forMeOnly && totalSlots === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-lg font-medium text-navy-800 mb-2">
            No Private Sessions Available
          </p>
          <p className="text-muted-foreground max-w-md mx-auto mb-4">
            There are currently no private sessions scheduled for you.
            Please contact your professor to arrange a dedicated session
            at your earliest convenience.
          </p>
          {professor && (
            <div className="inline-flex items-center gap-3 px-4 py-3 bg-navy-50 rounded-lg">
              <div className="h-10 w-10 rounded-full bg-navy-800 text-white flex items-center justify-center font-medium">
                {professor.firstName.charAt(0)}{professor.lastName.charAt(0)}
              </div>
              <div className="text-left">
                <p className="font-medium text-navy-800">
                  {professor.firstName} {professor.lastName}
                </p>
                <a
                  href={`mailto:${professor.email}`}
                  className="text-sm text-gold-600 hover:text-gold-700 flex items-center gap-1"
                >
                  <Mail className="h-3 w-3" />
                  {professor.email}
                </a>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{format(currentMonth, 'MMMM yyyy')}</CardTitle>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => {
              setCurrentMonth(new Date());
              setSelectedDate(new Date());
            }}>
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
          {isLoading ? (
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {days.map((day) => {
                const daySlots = getSlotsByDate(day);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const hasSlots = daySlots.length > 0;
                const hasBookedSlots = daySlots.some(s => s.isBookedByMe);
                const hasPrivateSlots = daySlots.some(s => s.isPrivate);

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
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                        <span
                          className={cn(
                            'w-1.5 h-1.5 rounded-full',
                            isSelected ? 'bg-gold-400' : 'bg-gold-500'
                          )}
                        />
                        {hasPrivateSlots && (
                          <span
                            className={cn(
                              'w-1.5 h-1.5 rounded-full',
                              isSelected ? 'bg-blue-300' : 'bg-blue-500'
                            )}
                          />
                        )}
                        {hasBookedSlots && (
                          <span
                            className={cn(
                              'w-1.5 h-1.5 rounded-full',
                              isSelected ? 'bg-green-300' : 'bg-green-500'
                            )}
                          />
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-gold-500" />
              Available
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              For You
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Booked
            </div>
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
                    className={cn(
                      'p-3 rounded-lg border transition-colors',
                      slot.isBookedByMe
                        ? 'border-green-500 bg-green-50'
                        : 'hover:bg-gray-50 cursor-pointer'
                    )}
                    onClick={() => !slot.isBookedByMe && onSelectSlot(slot)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                        </span>
                      </div>
                      {slot.isBookedByMe ? (
                        <Badge variant="success" className="text-xs">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Booked
                        </Badge>
                      ) : slot.isPrivate ? (
                        <Badge variant="default" className="text-xs">
                          <Star className="mr-1 h-3 w-3 fill-current" />
                          For You
                        </Badge>
                      ) : null}
                    </div>
                    <p className="text-sm text-navy-800 mt-1">
                      {slot.title || 'Spanish Class'}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {slot.slotType === 'GROUP' ? (
                          <Users className="h-3 w-3" />
                        ) : (
                          <User className="h-3 w-3" />
                        )}
                        {slot.currentParticipants}/{slot.maxParticipants} spots
                      </div>
                      {!slot.isBookedByMe && (
                        <Button size="sm" variant="primary" onClick={(e) => {
                          e.stopPropagation();
                          onSelectSlot(slot);
                        }}>
                          Book
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No available slots on this day</p>
              </div>
            )
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Click on a date to see available slots
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Slot Card Component (for list view)
function SlotCard({
  slot,
  delay,
  onSelect,
}: {
  slot: SlotWithBookedFlag;
  delay: number;
  onSelect: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
    >
      <Card hover className={slot.isBookedByMe ? 'border-green-500' : ''}>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <Badge variant={slot.slotType === 'GROUP' ? 'secondary' : 'default'}>
              {slot.slotType === 'GROUP' ? (
                <Users className="mr-1 h-3 w-3" />
              ) : (
                <User className="mr-1 h-3 w-3" />
              )}
              {slot.slotType === 'GROUP' ? 'Group' : 'Individual'}
            </Badge>
            <div className="flex gap-1">
              {slot.isPrivate && !slot.isBookedByMe && (
                <Badge variant="default">
                  <Star className="mr-1 h-3 w-3 fill-current" />
                  For You
                </Badge>
              )}
              {slot.isBookedByMe && (
                <Badge variant="success">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Booked
                </Badge>
              )}
            </div>
          </div>

          <p className="font-semibold text-navy-800 mb-1">
            {slot.title || 'Spanish Class'}
          </p>

          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <Clock className="h-4 w-4" />
            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
            <span className="text-xs">
              ({getDuration(slot.startTime, slot.endTime)})
            </span>
          </div>

          {slot.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {slot.description}
            </p>
          )}

          <div className="flex items-center justify-between mt-auto pt-3 border-t">
            <span className="text-sm text-muted-foreground">
              {slot.currentParticipants}/{slot.maxParticipants} spots filled
            </span>
            <Button
              size="sm"
              variant={slot.isBookedByMe ? 'outline' : 'primary'}
              disabled={slot.isBookedByMe}
              onClick={onSelect}
            >
              {slot.isBookedByMe ? 'Already Booked' : 'Book Now'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
