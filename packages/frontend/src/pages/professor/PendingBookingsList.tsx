import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface PendingBooking {
  id: string;
  studentName: string;
  classTime: Date;
  confirmationExpiresAt: Date;
  slotTitle?: string;
}

interface PendingBookingsListProps {
  bookings: PendingBooking[];
}

export default function PendingBookingsList({ bookings }: PendingBookingsListProps) {
  const { t } = useTranslation(["booking", "common"]);

  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-gray-500">
          No pending booking confirmations
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <Card key={booking.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{booking.studentName}</CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  {booking.slotTitle || "Spanish Class"}
                </p>
              </div>
              <Badge variant="outline" className="bg-yellow-50">
                <Clock className="h-3 w-3 mr-1" />
                {t("bookingPending")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">{t("classTime")}:</span>
                <span className="font-medium">
                  {new Date(booking.classTime).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t("confirmationExpiry")}:</span>
                <span className="font-medium text-orange-600">
                  {formatDistanceToNow(new Date(booking.confirmationExpiresAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
