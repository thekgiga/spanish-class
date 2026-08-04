import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { BookOpen, User, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { SkeletonCard } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { InlineAlert } from "@/components/ui/inline-alert";
import { studentApi } from "@/lib/api";

export function HomeworkPage() {
  const { t } = useTranslation("student");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["student-homework"],
    queryFn: () => studentApi.getHomework(),
    staleTime: 5 * 60_000,
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 space-y-3">
        <PageHeader
          title={t("homework.page_title")}
          description={t("homework.page_subtitle")}
        />
        <div className="mt-6 space-y-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4">
      <PageHeader
        title={t("homework.page_title")}
        description={t("homework.page_subtitle")}
      />

      {isError && (
        <InlineAlert variant="error" className="mt-4">
          {t("homework.error")}
        </InlineAlert>
      )}

      {!isError && data?.length === 0 && (
        <EmptyState
          className="mt-6"
          icon={<BookOpen className="h-10 w-10" />}
          title={t("homework.empty_title")}
          description={t("homework.empty_description")}
        />
      )}

      {!isError && data && data.length > 0 && (
        <div className="mt-6 space-y-4">
          {data.map((item) => (
            <Card key={item.noteId} variant="plain">
              <CardContent className="p-4 space-y-3">
                {/* Lesson metadata */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-caption text-ink-secondary">
                  <span className="flex items-center gap-1.5 font-medium text-ink">
                    <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {t("homework.from_lesson_on", {
                      date: format(new Date(item.startTime), "EEEE, MMMM d, yyyy"),
                    })}
                  </span>
                  {item.professor && (
                    <span className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      {t("homework.with_professor", {
                        name: `${item.professor.firstName} ${item.professor.lastName}`,
                      })}
                    </span>
                  )}
                </div>

                {/* Homework body */}
                <div className="pt-2 border-t border-line space-y-1.5">
                  <div className="flex items-center gap-1.5 text-caption text-ink-secondary font-semibold uppercase tracking-wide">
                    <BookOpen className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {t("homework.section_label")}
                  </div>
                  <p className="text-small text-ink whitespace-pre-wrap leading-relaxed">
                    {item.homeworkNotes}
                  </p>
                </div>

                {/* Timestamp */}
                <p className="text-caption text-ink-tertiary">
                  {t("homework.updated", {
                    date: format(new Date(item.updatedAt), "MMM d, yyyy"),
                  })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
