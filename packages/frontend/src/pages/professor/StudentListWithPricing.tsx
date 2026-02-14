import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Edit } from "lucide-react";
import { getStudentsWithPricing } from "@/lib/api";
import { formatRSD } from "@/lib/utils";
import StudentPricingModal from "@/components/professor/StudentPricingModal";
import type { UserPublic, StudentPricing } from "@spanish-class/shared";

interface StudentWithPricing extends UserPublic {
  pricing?: StudentPricing | null;
}

export default function StudentListWithPricing() {
  const [students, setStudents] = useState<StudentWithPricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] =
    useState<StudentWithPricing | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const data = await getStudentsWithPricing();
      setStudents(data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleOpenPricingModal = (student: StudentWithPricing) => {
    setSelectedStudent(student);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedStudent(null);
  };

  const handlePricingSuccess = () => {
    loadStudents(); // Reload to get updated pricing
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Loading students...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-gray-500">
          No students have booked with you yet. Students will appear here once
          they make a booking.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Student Pricing Management</CardTitle>
          <CardDescription>
            Set custom prices for each student. This information is private and
            only visible to you.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {students.map((student) => (
          <Card key={student.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">
                    {student.firstName} {student.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">{student.email}</p>
                </div>
              </div>

              <div className="space-y-3">
                {student.pricing ? (
                  <>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-2xl font-bold text-green-600">
                        {formatRSD(student.pricing.priceRSD)}
                      </span>
                    </div>
                    {student.pricing.notes && (
                      <p className="text-sm text-gray-600 italic">
                        "{student.pricing.notes}"
                      </p>
                    )}
                  </>
                ) : (
                  <Badge variant="outline" className="bg-gray-50">
                    No pricing set
                  </Badge>
                )}

                <Button
                  onClick={() => handleOpenPricingModal(student)}
                  variant={student.pricing ? "outline" : "default"}
                  className="w-full"
                  size="sm"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {student.pricing ? "Update" : "Set"} Price
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedStudent && (
        <StudentPricingModal
          open={modalOpen}
          onClose={handleCloseModal}
          studentId={selectedStudent.id}
          studentName={`${selectedStudent.firstName} ${selectedStudent.lastName}`}
          existingPricing={selectedStudent.pricing}
          onSuccess={handlePricingSuccess}
        />
      )}
    </div>
  );
}
