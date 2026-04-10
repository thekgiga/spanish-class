import { Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatTime } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface Booking {
  id: string;
  status: string;
  slot?: {
    id: string;
    title?: string | null;
    startTime: string | Date;
    endTime: string | Date;
    slotType: string;
  };
}

interface StudentBookingsTabProps {
  bookings: Booking[];
}

export function StudentBookingsTab({ bookings }: StudentBookingsTabProps) {
  const { t } = useTranslation("admin");

  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          {t("students.detail.bookings_tab.no_bookings")}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <Card key={booking.id}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-navy-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-navy-600" />
              </div>
              <div>
                <p className="font-medium text-navy-800">
                  {booking.slot?.title ||
                    t("students.detail.bookings_tab.spanish_class")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {booking.slot?.startTime && (
                    <>
                      {formatDate(booking.slot.startTime)} at{" "}
                      {formatTime(booking.slot.startTime)}
                    </>
                  )}
                </p>
              </div>
            </div>
            <Badge
              variant={
                booking.status === "CONFIRMED"
                  ? "success"
                  : booking.status === "COMPLETED"
                    ? "neutral"
                    : "destructive"
              }
            >
              {booking.status}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
