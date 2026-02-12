import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Calendar, Clock, Video, X, User, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { studentApi } from '@/lib/api';
import { formatDate, formatTime, getRelativeTime } from '@/lib/utils';
import type { BookingWithSlot } from '@spanish-class/shared';

export function BookingsPage() {
  const [cancelBooking, setCancelBooking] = useState<BookingWithSlot | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const queryClient = useQueryClient();

  const { data: upcomingData, isLoading: upcomingLoading } = useQuery({
    queryKey: ['student-bookings', 'upcoming'],
    queryFn: () => studentApi.getBookings({ upcoming: true, limit: 50 }),
  });

  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['student-bookings', 'history'],
    queryFn: () => studentApi.getBookings({ limit: 50 }),
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      studentApi.cancelBooking(id, reason),
    onSuccess: () => {
      toast.success('Booking cancelled successfully');
      queryClient.invalidateQueries({ queryKey: ['student-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['student-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['available-slots'] });
      setCancelBooking(null);
      setCancelReason('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to cancel booking');
    },
  });

  const pastBookings = historyData?.data?.filter(
    (b) => b.status !== 'CONFIRMED' || new Date(b.slot.startTime) < new Date()
  );

  const renderBookingCard = (booking: BookingWithSlot, showCancel = false) => {
    const isUpcoming = new Date(booking.slot.startTime) > new Date();
    const canCancel =
      booking.status === 'CONFIRMED' &&
      isUpcoming &&
      (new Date(booking.slot.startTime).getTime() - Date.now()) / (1000 * 60 * 60) > 24;

    return (
      <motion.div
        key={booking.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-navy-100 flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-5 w-5 text-navy-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-navy-800">
                      {booking.slot.title || 'Spanish Class'}
                    </p>
                    <Badge
                      variant={
                        booking.status === 'CONFIRMED'
                          ? 'success'
                          : booking.status === 'COMPLETED'
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {booking.status.replace(/_/g, ' ')}
                    </Badge>
                    {isUpcoming && (
                      <Badge variant="gold">{getRelativeTime(booking.slot.startTime)}</Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground mt-1">
                    {formatDate(booking.slot.startTime)}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatTime(booking.slot.startTime)} - {formatTime(booking.slot.endTime)}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {booking.slot.professor?.firstName} {booking.slot.professor?.lastName}
                    </span>
                  </div>
                  {booking.cancelReason && (
                    <p className="text-sm text-destructive mt-2">
                      Reason: {booking.cancelReason}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                {booking.slot.meetLink && booking.status === 'CONFIRMED' && isUpcoming && (
                  <Button variant="primary" size="sm" asChild>
                    <a
                      href={booking.slot.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Video className="mr-1 h-4 w-4" />
                      Join
                    </a>
                  </Button>
                )}
                {showCancel && canCancel && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCancelBooking(booking)}
                  >
                    <X className="mr-1 h-4 w-4" />
                    Cancel
                  </Button>
                )}
                {showCancel && !canCancel && booking.status === 'CONFIRMED' && isUpcoming && (
                  <p className="text-xs text-muted-foreground">
                    Can't cancel within 24 hours
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-navy-800">My Bookings</h1>
          <p className="text-muted-foreground">Manage your upcoming and past sessions</p>
        </div>
        <Button variant="primary" asChild>
          <Link to="/dashboard/book">Book New Class</Link>
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingData?.data?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="history">History ({pastBookings?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6 space-y-4">
          {upcomingLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : upcomingData?.data && upcomingData.data.length > 0 ? (
            upcomingData.data.map((booking) => renderBookingCard(booking, true))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground mb-4">No upcoming sessions</p>
                <Button variant="primary" asChild>
                  <Link to="/dashboard/book">Book a Class</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-6 space-y-4">
          {historyLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : pastBookings && pastBookings.length > 0 ? (
            pastBookings.map((booking) => renderBookingCard(booking))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No past sessions</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Cancel Dialog */}
      <Dialog open={!!cancelBooking} onOpenChange={() => setCancelBooking(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this session?
            </DialogDescription>
          </DialogHeader>

          {cancelBooking && (
            <div className="p-4 rounded-lg bg-gray-50 space-y-2">
              <p className="font-semibold">{cancelBooking.slot.title || 'Spanish Class'}</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(cancelBooking.slot.startTime)} at{' '}
                {formatTime(cancelBooking.slot.startTime)}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Reason (optional)</label>
            <Textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Let us know why you're cancelling..."
              rows={3}
            />
          </div>

          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 text-amber-800 text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <p>
              Please note that cancellations must be made at least 24 hours before the session.
            </p>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setCancelBooking(null)}>
              Keep Booking
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                cancelBooking &&
                cancelMutation.mutate({ id: cancelBooking.id, reason: cancelReason })
              }
              isLoading={cancelMutation.isPending}
            >
              Cancel Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
