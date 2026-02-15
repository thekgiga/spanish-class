import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users } from "lucide-react";
import { getSlotParticipants } from "@/lib/api";
import BookingStatusBadge from "./BookingStatusBadge";
import { getInitials } from "@/lib/utils";
import type { BookingStatus } from "@spanish-class/shared";

interface Participant {
  bookingId: string;
  status: BookingStatus;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  bookedAt: Date;
}

interface GroupClassParticipantsListProps {
  slotId: string;
}

export default function GroupClassParticipantsList({
  slotId,
}: GroupClassParticipantsListProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [maxParticipants, setMaxParticipants] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadParticipants = async () => {
      try {
        const data = await getSlotParticipants(slotId);
        setParticipants(data.participants);
        setMaxParticipants(data.maxParticipants);
      } catch (error) {
        console.error("Failed to load participants:", error);
      } finally {
        setLoading(false);
      }
    };

    loadParticipants();
  }, [slotId]);

  if (loading) {
    return (
      <div className="text-center text-gray-500">Loading participants...</div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Participants ({participants.length}/{maxParticipants})
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {participants.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No participants yet</p>
        ) : (
          <div className="space-y-3">
            {participants.map((participant) => (
              <div
                key={participant.bookingId}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {getInitials(
                        participant.student.firstName,
                        participant.student.lastName,
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {participant.student.firstName}{" "}
                      {participant.student.lastName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {participant.student.email}
                    </p>
                  </div>
                </div>
                <BookingStatusBadge status={participant.status} />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
