import { Calendar, Phone, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface PersonalDetailsCardProps {
  dateOfBirth?: string | null;
  phoneNumber?: string | null;
  aboutMe?: string | null;
}

export function PersonalDetailsCard({
  dateOfBirth,
  phoneNumber,
  aboutMe,
}: PersonalDetailsCardProps) {
  const { t } = useTranslation("admin");

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-semibold text-navy-800 mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          {t("students.detail.personal_details.title")}
        </h3>
        <div className="space-y-3">
          {dateOfBirth && (
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <span className="text-muted-foreground">
                  {t("students.detail.personal_details.dob")}{" "}
                </span>
                {formatDate(dateOfBirth)}
              </span>
            </div>
          )}
          {phoneNumber && (
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{phoneNumber}</span>
            </div>
          )}
          {aboutMe ? (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-1">
                {t("students.detail.personal_details.about")}
              </p>
              <p className="text-sm bg-gray-50 p-3 rounded-lg">{aboutMe}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              {t("students.detail.personal_details.no_details")}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
