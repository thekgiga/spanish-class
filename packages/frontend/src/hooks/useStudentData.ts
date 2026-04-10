import { useQuery } from "@tanstack/react-query";
import { professorApi } from "@/lib/api";

interface UseStudentDataOptions {
  studentId: string | null;
  enabled: boolean;
}

export function useStudentData({ studentId, enabled }: UseStudentDataOptions) {
  return useQuery({
    queryKey: ["student", studentId],
    queryFn: () => professorApi.getStudent(studentId!),
    enabled: enabled && !!studentId,
  });
}
