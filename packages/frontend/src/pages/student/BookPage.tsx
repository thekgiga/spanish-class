import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  Calendar,
  Clock,
  User,
  Users,
  CheckCircle2,
  Filter,
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
import { formatDate, formatTime, getDuration } from '@/lib/utils';
import type { AvailabilitySlot } from '@spanish-class/shared';

export function BookPage() {
  const [filter, setFilter] = useState<string>('all');
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['available-slots', filter],
    queryFn: () =>
      studentApi.getSlots({
        limit: 50,
        slotType: filter !== 'all' ? filter : undefined,
      }),
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

  // Group slots by date
  const slotsByDate = data?.data?.reduce((acc, slot) => {
    const dateKey = formatDate(slot.startTime);
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(slot);
    return acc;
  }, {} as Record<string, typeof data.data>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-navy-800">Book a Class</h1>
          <p className="text-muted-foreground">Browse and book available sessions</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="INDIVIDUAL">Individual</SelectItem>
              <SelectItem value="GROUP">Group</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Slots */}
      {isLoading ? (
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
      ) : slotsByDate && Object.keys(slotsByDate).length > 0 ? (
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
                  <motion.div
                    key={slot.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: slotIndex * 0.05 }}
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
                          {slot.isBookedByMe && (
                            <Badge variant="success">
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Booked
                            </Badge>
                          )}
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
                            onClick={() => setSelectedSlot(slot)}
                          >
                            {slot.isBookedByMe ? 'Already Booked' : 'Book Now'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              No available slots at the moment. Check back later!
            </p>
          </CardContent>
        </Card>
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
              <Badge variant="secondary" className="mt-2">
                {selectedSlot.slotType === 'GROUP' ? 'Group Session' : 'Individual Session'}
              </Badge>
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
