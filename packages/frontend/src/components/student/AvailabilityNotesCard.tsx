import { Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

interface AvailabilityNotesCardProps {
  availabilityNotes?: string | null;
}

export function AvailabilityNotesCard({
  availabilityNotes,
}: AvailabilityNotesCardProps) {
  const { t } = useTranslation("admin");

  if (!availabilityNotes) return null;

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-semibold text-navy-800 mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5" />
          {t("students.detail.availability_notes.title")}
        </h3>
        <p className="text-sm bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
          {availabilityNotes}
        </p>
      </CardContent>
    </Card>
  );
}
