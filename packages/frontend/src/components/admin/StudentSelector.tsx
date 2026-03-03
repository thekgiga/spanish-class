import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, X, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { professorApi } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface StudentSelectorProps {
  selectedStudents: Student[];
  onStudentsChange: (students: Student[]) => void;
  multiSelect?: boolean;
  placeholder?: string;
}

export function StudentSelector({
  selectedStudents,
  onStudentsChange,
  multiSelect = true,
  placeholder = "Search students...",
}: StudentSelectorProps) {
  const [search, setSearch] = useState("");

  const { data: studentsData } = useQuery({
    queryKey: ["professor-students"],
    queryFn: () => professorApi.getStudents({ all: true }),
  });

  // Filter and sort students
  const students = useMemo(() => {
    const list = studentsData?.data || [];

    // Sort alphabetically
    const sorted = [...list].sort((a, b) => {
      const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
      const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
      return nameA.localeCompare(nameB);
    });

    // Filter by search
    if (!search) return sorted;
    const searchLower = search.toLowerCase();
    return sorted.filter(
      (s) =>
        s.firstName.toLowerCase().includes(searchLower) ||
        s.lastName.toLowerCase().includes(searchLower) ||
        s.email.toLowerCase().includes(searchLower),
    );
  }, [studentsData?.data, search]);

  const toggleStudent = (student: Student) => {
    if (multiSelect) {
      const isSelected = selectedStudents.find((s) => s.id === student.id);
      if (isSelected) {
        onStudentsChange(selectedStudents.filter((s) => s.id !== student.id));
      } else {
        onStudentsChange([...selectedStudents, student]);
      }
    } else {
      // Single select
      onStudentsChange([student]);
    }
  };

  const isSelected = (studentId: string) =>
    selectedStudents.some((s) => s.id === studentId);

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Selected Students */}
      {selectedStudents.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedStudents.map((student) => (
            <Badge
              key={student.id}
              variant="neutral"
              className="flex items-center gap-1 pr-1"
            >
              {student.firstName} {student.lastName}
              <button
                onClick={() => toggleStudent(student)}
                className="ml-1 p-0.5 hover:bg-gray-300 rounded"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Student List */}
      <div className="max-h-48 overflow-y-auto space-y-1 border rounded-lg p-2">
        {students.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No students found
          </p>
        ) : (
          students.map((student) => (
            <button
              key={student.id}
              onClick={() => toggleStudent(student)}
              className={cn(
                "w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors",
                isSelected(student.id)
                  ? "bg-spanish-teal-50 border border-spanish-teal-200"
                  : "hover:bg-muted",
              )}
            >
              <div>
                <p className="font-medium text-sm">
                  {student.firstName} {student.lastName}
                </p>
                <p className="text-xs text-muted-foreground">{student.email}</p>
              </div>
              {isSelected(student.id) && (
                <Check className="h-4 w-4 text-spanish-teal-600" />
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
