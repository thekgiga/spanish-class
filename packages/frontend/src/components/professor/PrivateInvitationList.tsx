import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, User, Video, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { listPrivateInvitations } from "@/services/api/private-invitations";
import { useCancelPrivateInvitation } from "@/hooks/usePrivateInvitations";
import { formatDate, formatTime } from "@/lib/utils";
import { PrivateInvitationBadge } from "./PrivateInvitationBadge";

interface PrivateInvitationListProps {
  professorId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

// T030: List component to display private invitations in professor schedule
export function PrivateInvitationList({
  startDate,
  endDate,
  limit = 20,
}: PrivateInvitationListProps) {
  const [cancelInvitation, setCancelInvitation] = useState<any>(null);
  const [cancelReason, setCancelReason] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["privateInvitations", { startDate, endDate, limit }],
    queryFn: () => listPrivateInvitations({ startDate, endDate, limit }),
  });

  const cancelMutation = useCancelPrivateInvitation();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  const invitations = data?.data || [];

  if (invitations.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground text-sm">
            No private invitations in this period
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {invitations.map((invitation: any) => {
        const booking = invitation.bookings[0];
        const student =
          booking?.student || invitation.allowedStudents[0]?.student;

        if (!student) return null;

        return (
          <Card key={invitation.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-navy-800">
                        {invitation.title || "Private Spanish Class"}
                      </p>
                      <PrivateInvitationBadge size="sm" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {formatDate(invitation.startTime)}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {formatTime(invitation.startTime)} -{" "}
                        {formatTime(invitation.endTime)}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        {student.firstName} {student.lastName}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {invitation.meetLink &&
                    new Date(invitation.startTime) > new Date() && (
                      <Button variant="primary" size="sm" asChild>
                        <a
                          href={invitation.meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Video className="mr-1 h-3 w-3" />
                          Join
                        </a>
                      </Button>
                    )}
                  {new Date(invitation.startTime) > new Date() && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCancelInvitation(invitation)}
                    >
                      <X className="mr-1 h-3 w-3" />
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* T038: Cancel Dialog */}
      <Dialog
        open={!!cancelInvitation}
        onOpenChange={() => setCancelInvitation(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Private Invitation</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this private session?
            </DialogDescription>
          </DialogHeader>

          {cancelInvitation && (
            <div className="p-4 rounded-lg bg-gray-50 space-y-2">
              <p className="font-semibold">
                {cancelInvitation.title || "Private Spanish Class"}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatDate(cancelInvitation.startTime)} at{" "}
                {formatTime(cancelInvitation.startTime)}
              </p>
              {(cancelInvitation.bookings[0]?.student ||
                cancelInvitation.allowedStudents[0]?.student) && (
                <p className="text-sm text-muted-foreground">
                  Student:{" "}
                  {
                    (
                      cancelInvitation.bookings[0]?.student ||
                      cancelInvitation.allowedStudents[0]?.student
                    ).firstName
                  }{" "}
                  {
                    (
                      cancelInvitation.bookings[0]?.student ||
                      cancelInvitation.allowedStudents[0]?.student
                    ).lastName
                  }
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Reason (optional)</label>
            <Textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Let the student know why you're cancelling..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setCancelInvitation(null)}>
              Keep Invitation
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (cancelInvitation) {
                  cancelMutation.mutate(
                    { id: cancelInvitation.id, data: { reason: cancelReason } },
                    {
                      onSuccess: () => {
                        setCancelInvitation(null);
                        setCancelReason("");
                      },
                    },
                  );
                }
              }}
              isLoading={cancelMutation.isPending}
            >
              Cancel Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
