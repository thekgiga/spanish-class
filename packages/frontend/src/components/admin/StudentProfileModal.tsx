import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useStudentData } from "@/hooks/useStudentData";
import {
  StudentInfoHeader,
  StudentProfileTab,
  StudentBookingsTab,
  StudentNotesTab,
} from "@/components/student";

interface StudentProfileModalProps {
  open: boolean;
  onClose: () => void;
  studentId: string | null;
}

export function StudentProfileModal({
  open,
  onClose,
  studentId,
}: StudentProfileModalProps) {
  const { t } = useTranslation("admin");
  const {
    data: student,
    isLoading,
    error,
  } = useStudentData({
    studentId,
    enabled: open,
  });

  const confirmedBookings =
    student?.bookings.filter((b) => b.status === "CONFIRMED") || [];
  const pastBookings =
    student?.bookings.filter((b) => b.status !== "CONFIRMED") || [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("students.modal.title")}</DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {t("students.modal.not_found")}
            </p>
          </div>
        )}

        {student && !isLoading && (
          <div className="space-y-6">
            {/* Student Info Header */}
            <StudentInfoHeader
              student={student}
              upcomingCount={confirmedBookings.length}
              completedCount={pastBookings.length}
            />

            {/* Tabs */}
            <Tabs defaultValue="profile">
              <TabsList>
                <TabsTrigger value="profile">
                  {t("students.detail.tabs.profile")}
                </TabsTrigger>
                <TabsTrigger value="bookings">
                  {t("students.detail.tabs.bookings")}
                </TabsTrigger>
                <TabsTrigger value="notes">
                  {t("students.detail.tabs.notes")} (
                  {student.notes?.length || 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="mt-6">
                <StudentProfileTab student={student} />
              </TabsContent>

              <TabsContent value="bookings" className="mt-6">
                <StudentBookingsTab bookings={student.bookings} />
              </TabsContent>

              <TabsContent value="notes" className="mt-6">
                <StudentNotesTab
                  studentId={studentId!}
                  notes={student.notes || []}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
