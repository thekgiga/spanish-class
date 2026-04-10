import { BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

interface LearningPreferencesCardProps {
  spanishLevel?: string | null;
  preferredClassTypes?: string[] | null;
}

export function LearningPreferencesCard({
  spanishLevel,
  preferredClassTypes,
}: LearningPreferencesCardProps) {
  const { t } = useTranslation(["admin", "student"]);

  // Helper function to get translated Spanish level
  const getSpanishLevelLabel = (level: string) => {
    const key = `student:profile.spanish_levels.${level}.label`;
    const translation = t(key);
    // Fallback to formatted version if translation missing
    return translation !== key ? translation : level.replace(/_/g, " ");
  };

  // Helper function to get translated class type
  const getClassTypeLabel = (type: string) => {
    const key = `student:profile.class_types.${type}`;
    const translation = t(key);
    // Fallback to formatted version if translation missing
    return translation !== key ? translation : type.replace(/_/g, " ");
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-semibold text-navy-800 mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          {t("admin:students.detail.learning_preferences.title")}
        </h3>
        <div className="space-y-3">
          {spanishLevel && (
            <div>
              <p className="text-sm text-muted-foreground">
                {t("admin:students.detail.learning_preferences.spanish_level")}
              </p>
              <Badge variant="outline" className="mt-1">
                {getSpanishLevelLabel(spanishLevel)}
              </Badge>
            </div>
          )}
          {preferredClassTypes && preferredClassTypes.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                {t(
                  "admin:students.detail.learning_preferences.preferred_class_types",
                )}
              </p>
              <div className="flex flex-wrap gap-1">
                {preferredClassTypes.map((type: string) => (
                  <Badge key={type} variant="neutral" className="text-xs">
                    {getClassTypeLabel(type)}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {!spanishLevel && !preferredClassTypes?.length && (
            <p className="text-sm text-muted-foreground italic">
              {t("admin:students.detail.learning_preferences.no_preferences")}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
