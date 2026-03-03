import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { AlertTriangle, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { professorApi } from "@/lib/api";
import type { AvailabilitySlot } from "@spanish-class/shared";

interface CancelSlotModalProps {
  slot: AvailabilitySlot;
  open: boolean;
  onClose: () => void;
}

/**
 * Modal for canceling a slot that has active bookings
 * Bug Fix #5: Provides UI for cancelSlotWithBookings API
 */
export function CancelSlotModal({ slot, open, onClose }: CancelSlotModalProps) {
  const [reason, setReason] = useState("");
  const queryClient = useQueryClient();

  const cancelMutation = useMutation({
    mutationFn: async () => {
      return professorApi.cancelSlotWithBookings(
        slot.id,
        reason.trim() || undefined,
      );
    },
    onSuccess: (data) => {
      toast.success(
        `Slot cancelled. ${data.cancelledBookingsCount} student(s) notified.`,
      );
      queryClient.refetchQueries({
        predicate: (query) => query.queryKey[0] === "professor-slots",
      });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to cancel slot");
    },
  });

  const handleSubmit = () => {
    cancelMutation.mutate();
  };

  const handleClose = () => {
    if (!cancelMutation.isPending) {
      setReason("");
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Cancel Slot with Bookings</DialogTitle>
          <DialogDescription>
            This slot has active bookings. Cancelling will notify all students.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Warning Alert */}
          <Alert variant="warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Impact</AlertTitle>
            <AlertDescription>
              This will cancel the slot and{" "}
              <strong>{slot.currentParticipants} student(s)</strong> will
              receive cancellation emails.
            </AlertDescription>
          </Alert>

          {/* Slot Details */}
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Date:</span>{" "}
                {new Date(slot.startTime).toLocaleString()}
              </div>
              <div>
                <span className="font-medium">Type:</span> {slot.slotType}
              </div>
              <div>
                <span className="font-medium">Bookings:</span>{" "}
                {slot.currentParticipants} / {slot.maxParticipants}
              </div>
            </div>
          </div>

          {/* Cancellation Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">
              Cancellation Reason{" "}
              <span className="text-xs text-muted-foreground">(Optional)</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="e.g., Emergency, Schedule conflict, etc."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              disabled={cancelMutation.isPending}
            />
            <p className="text-xs text-muted-foreground">
              This reason will be included in the notification emails sent to
              students.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={cancelMutation.isPending}
          >
            <X className="h-4 w-4 mr-2" />
            Keep Slot
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleSubmit}
            isLoading={cancelMutation.isPending}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Cancel Slot
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
