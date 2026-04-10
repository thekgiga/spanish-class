import { Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

interface LearningGoalsCardProps {
  learningGoals?: string | null;
}

export function LearningGoalsCard({ learningGoals }: LearningGoalsCardProps) {
  const { t } = useTranslation("admin");

  if (!learningGoals) return null;

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-semibold text-navy-800 mb-4 flex items-center gap-2">
          <Target className="h-5 w-5" />
          {t("students.detail.learning_goals.title")}
        </h3>
        <p className="text-sm bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
          {learningGoals}
        </p>
      </CardContent>
    </Card>
  );
}
