import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { professorApi } from "@/lib/api";
import {
  StudentInfoHeader,
  StudentProfileTab,
  StudentBookingsTab,
  StudentNotesTab,
} from "@/components/student";

export function StudentDetailPage() {
  const { t } = useTranslation("admin");
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: student, isLoading } = useQuery({
    queryKey: ["student", id],
    queryFn: () => professorApi.getStudent(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Student not found</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate("/admin/students")}
        >
          Back to Students
        </Button>
      </div>
    );
  }

  const confirmedBookings = student.bookings.filter(
    (b) => b.status === "CONFIRMED",
  );
  const pastBookings = student.bookings.filter((b) => b.status !== "CONFIRMED");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-display font-bold text-navy-800">
            {t("students.detail.title")}
          </h1>
        </div>
      </div>

      {/* Student Info Card */}
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
            {t("students.detail.tabs.notes")} ({student.notes?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <StudentProfileTab student={student} />
        </TabsContent>

        <TabsContent value="bookings" className="mt-6">
          <StudentBookingsTab bookings={student.bookings} />
        </TabsContent>

        <TabsContent value="notes" className="mt-6">
          <StudentNotesTab studentId={id!} notes={student.notes || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
