import { Calendar, Mail, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials, formatDate } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface StudentInfoHeaderProps {
  student: {
    firstName: string;
    lastName: string;
    email: string;
    timezone: string;
    createdAt: string | Date;
  };
  upcomingCount: number;
  completedCount: number;
}

export function StudentInfoHeader({
  student,
  upcomingCount,
  completedCount,
}: StudentInfoHeaderProps) {
  const { t } = useTranslation("admin");

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="bg-navy-100 text-navy-700 text-2xl">
              {getInitials(student.firstName, student.lastName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-navy-800">
              {student.firstName} {student.lastName}
            </h2>
            <div className="flex flex-wrap gap-4 mt-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                {student.email}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Globe className="h-4 w-4" />
                {student.timezone}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {t("students.detail.joined")}{" "}
                {formatDate(student.createdAt, {
                  month: "long",
                  year: "numeric",
                })}
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-navy-800">
                {upcomingCount}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("students.detail.upcoming")}
              </p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-navy-800">
                {completedCount}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("students.detail.completed")}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
