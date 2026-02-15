import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { Clock, Check, X, Calendar, User, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { professorApi } from "@/lib/api";
import { formatDate, formatTime, getDuration } from "@/lib/utils";
import BookingStatusBadge from "@/components/booking/BookingStatusBadge";

export function PendingBookingsPage() {
  const [rejectBooking, setRejectBooking] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["professor-slots"],
    queryFn: () => professorApi.getSlots({ limit: 100 }),
  });

  // Extract pending bookings from slots
  const pendingBookings = useMemo(() => {
    if (!data?.data) return [];

    const bookings: any[] = [];
    data.data.forEach((slot: any) => {
      if (slot.bookings) {
        slot.bookings.forEach((booking: any) => {
          if (booking.status === "PENDING_CONFIRMATION") {
            bookings.push({
              ...booking,
              slot: {
                id: slot.id,
                title: slot.title,
                startTime: slot.startTime,
                endTime: slot.endTime,
                slotType: slot.slotType,
              },
            });
          }
        });
      }
    });

    // Sort by confirmation expiry (most urgent first)
    return bookings.sort((a, b) => {
      if (!a.confirmationExpiresAt) return 1;
      if (!b.confirmationExpiresAt) return -1;
      return (
        new Date(a.confirmationExpiresAt).getTime() -
        new Date(b.confirmationExpiresAt).getTime()
      );
    });
  }, [data]);

  const approveMutation = useMutation({
    mutationFn: (bookingId: string) => professorApi.confirmBooking(bookingId),
    onSuccess: () => {
      toast.success("Booking approved successfully");
      queryClient.invalidateQueries({ queryKey: ["professor-slots"] });
      queryClient.invalidateQueries({ queryKey: ["professor-dashboard"] });
      queryClient.invalidateQueries({
        queryKey: ["professor-pending-bookings-count"],
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to approve booking");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({
      bookingId,
      reason,
    }: {
      bookingId: string;
      reason: string;
    }) => professorApi.rejectBooking(bookingId, reason),
    onSuccess: () => {
      toast.success("Booking rejected");
      queryClient.invalidateQueries({ queryKey: ["professor-slots"] });
      queryClient.invalidateQueries({ queryKey: ["professor-dashboard"] });
      queryClient.invalidateQueries({
        queryKey: ["professor-pending-bookings-count"],
      });
      setRejectBooking(null);
      setRejectReason("");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to reject booking");
    },
  });

  const handleApprove = (bookingId: string) => {
    approveMutation.mutate(bookingId);
  };

  const handleRejectSubmit = () => {
    if (!rejectBooking || !rejectReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    rejectMutation.mutate({
      bookingId: rejectBooking.id,
      reason: rejectReason,
    });
  };

  const getTimeUntilExpiry = (expiresAt?: string) => {
    if (!expiresAt) return null;
    const now = new Date();
    const expiry = new Date(expiresAt);
    const hoursLeft = Math.floor(
      (expiry.getTime() - now.getTime()) / (1000 * 60 * 60),
    );

    if (hoursLeft < 0) return "Expired";
    if (hoursLeft < 1) return "Less than 1 hour";
    if (hoursLeft < 24) return `${hoursLeft} hours left`;
    return `${Math.floor(hoursLeft / 24)} days left`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-navy-800">
            Pending Approvals
          </h1>
          <p className="text-muted-foreground">
            Review and approve booking requests from students
          </p>
        </div>
        {pendingBookings.length > 0 && (
          <Badge variant="warning" className="text-base px-4 py-2">
            {pendingBookings.length} pending{" "}
            {pendingBookings.length === 1 ? "request" : "requests"}
          </Badge>
        )}
      </div>

      {/* Pending Bookings List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : pendingBookings.length > 0 ? (
        <div className="space-y-4">
          {pendingBookings.map((booking, index) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-l-4 border-l-amber-400">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">
                          {booking.student?.firstName}{" "}
                          {booking.student?.lastName}
                        </CardTitle>
                        <BookingStatusBadge status={booking.status} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {booking.student?.email}
                      </p>
                    </div>
                    {booking.confirmationExpiresAt && (
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Expires</p>
                        <p className="text-sm font-medium text-amber-600">
                          {getTimeUntilExpiry(booking.confirmationExpiresAt)}
                        </p>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Class Details */}
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-spanish-cream-50">
                      <div className="h-12 w-12 rounded-lg bg-navy-100 flex items-center justify-center flex-shrink-0">
                        <Calendar className="h-5 w-5 text-navy-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-navy-800">
                          {booking.slot.title || "Spanish Class"}
                        </p>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(booking.slot.startTime)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatTime(booking.slot.startTime)} -{" "}
                            {formatTime(booking.slot.endTime)}
                          </span>
                        </div>
                      </div>
                      <Badge
                        variant={
                          booking.slot.slotType === "GROUP"
                            ? "secondary"
                            : "default"
                        }
                      >
                        {booking.slot.slotType === "GROUP"
                          ? "Group"
                          : "Individual"}
                      </Badge>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 pt-2">
                      <Button
                        variant="default"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => handleApprove(booking.id)}
                        disabled={
                          approveMutation.isPending || rejectMutation.isPending
                        }
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Approve Booking
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => setRejectBooking(booking)}
                        disabled={
                          approveMutation.isPending || rejectMutation.isPending
                        }
                      >
                        <X className="mr-2 h-4 w-4" />
                        Reject Booking
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="h-20 w-20 rounded-full bg-spanish-cream-100 flex items-center justify-center mx-auto mb-4">
              <Check className="h-10 w-10 text-spanish-cream-400" />
            </div>
            <p className="text-navy-600 font-medium mb-2">All caught up!</p>
            <p className="text-muted-foreground text-sm">
              No pending booking requests at the moment
            </p>
          </CardContent>
        </Card>
      )}

      {/* Reject Dialog */}
      <Dialog
        open={!!rejectBooking}
        onOpenChange={() => setRejectBooking(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Reject Booking Request
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this booking. The student
              will be notified via email.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {rejectBooking && (
              <div className="p-3 rounded-lg bg-spanish-cream-50">
                <p className="text-sm font-medium">
                  {rejectBooking.student?.firstName}{" "}
                  {rejectBooking.student?.lastName}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDate(rejectBooking.slot.startTime)} at{" "}
                  {formatTime(rejectBooking.slot.startTime)}
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="reject-reason">Reason for rejection *</Label>
              <Textarea
                id="reject-reason"
                placeholder="E.g., This time slot is no longer available, I have a scheduling conflict, etc."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                This message will be sent to the student
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectBooking(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectSubmit}
              disabled={!rejectReason.trim() || rejectMutation.isPending}
            >
              Reject Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
