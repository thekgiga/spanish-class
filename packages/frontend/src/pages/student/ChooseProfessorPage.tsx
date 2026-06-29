import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { UserCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getPublicProfessors, studentApi } from "@/lib/api";

export function ChooseProfessorPage() {
  const { t } = useTranslation("student");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selecting, setSelecting] = useState<string | null>(null);

  const { data: professors, isLoading } = useQuery({
    queryKey: ["public-professors"],
    queryFn: getPublicProfessors,
  });

  const handleSelect = async (professorId: string) => {
    setSelecting(professorId);
    try {
      await studentApi.selectProfessor(professorId);
      await queryClient.invalidateQueries({ queryKey: ["student-professor"] });
      toast.success(t("professor.selected_success"));
      navigate("/dashboard", { replace: true });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err.response?.data?.error || "Failed to select professor");
    } finally {
      setSelecting(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900">
          {t("professor.choose_page_title")}
        </h1>
        <p className="text-slate-500 mt-1">{t("professor.choose_page_subtitle")}</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-spanish-teal-500" />
        </div>
      ) : (
        <div className="space-y-3">
          {professors?.map((professor, i) => (
            <motion.div
              key={professor.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="border-2 border-slate-100 hover:border-spanish-teal-200 transition-colors">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-spanish-teal-100 to-spanish-coral-100 flex items-center justify-center">
                      <UserCircle className="h-5 w-5 text-spanish-teal-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {professor.firstName} {professor.lastName}
                      </p>
                      <p className="text-xs text-slate-500">{t("professor.spanish_teacher_label")}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleSelect(professor.id)}
                    disabled={!!selecting}
                    className="bg-spanish-teal-600 hover:bg-spanish-teal-700"
                  >
                    {selecting === professor.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        {t("professor.select_button")}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {professors?.length === 0 && (
            <p className="text-center text-slate-500 py-8">{t("professor.no_professors_yet")}</p>
          )}
        </div>
      )}
    </div>
  );
}
