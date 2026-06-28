import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { Star, MessageSquare, ChevronDown, ChevronUp, Users, Download, Loader2, Reply } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { feedbackApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-4 w-4 ${s <= rating ? "text-yellow-400 fill-yellow-400" : "text-slate-200"}`}
        />
      ))}
    </span>
  );
}

function FeedbackEntry({ entry, canRespond }: { entry: any; canRespond?: boolean }) {
  const { t } = useTranslation("admin");
  const queryClient = useQueryClient();
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [responseText, setResponseText] = useState(entry.professorResponse ?? "");

  const responseMutation = useMutation({
    mutationFn: (response: string) => feedbackApi.respondToFeedback(entry.id, response),
    onSuccess: () => {
      toast.success(t("feedback.response_saved"));
      queryClient.invalidateQueries({ queryKey: ["professor-feedback"] });
      queryClient.invalidateQueries({ queryKey: ["admin-feedback-summary"] });
      queryClient.invalidateQueries({ queryKey: ["student-feedback"] });
      setShowResponseForm(false);
    },
    onError: (err: any) => toast.error(err?.response?.data?.error || "Failed to save response"),
  });

  return (
    <div className="border-b border-slate-100 last:border-0 py-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700">
            {entry.student?.firstName} {entry.student?.lastName}
          </span>
          <StarRating rating={entry.rating} />
        </div>
        <span className="text-xs text-slate-400">
          {entry.booking?.slot?.startTime ? formatDate(entry.booking.slot.startTime) : ""}
        </span>
      </div>
      {entry.booking?.slot?.title && (
        <p className="text-xs text-slate-500">{entry.booking.slot.title}</p>
      )}
      {entry.whatWasGood && (
        <div>
          <span className="text-xs font-medium text-green-700">{t("feedback.what_was_good")}: </span>
          <span className="text-xs text-slate-600">{entry.whatWasGood}</span>
        </div>
      )}
      {entry.whatCouldBeImproved && (
        <div>
          <span className="text-xs font-medium text-amber-700">{t("feedback.what_could_improve")}: </span>
          <span className="text-xs text-slate-600">{entry.whatCouldBeImproved}</span>
        </div>
      )}

      {/* SF5: Professor response display */}
      {entry.professorResponse && !showResponseForm && (
        <div className="bg-spanish-teal-50 border border-spanish-teal-200 rounded-lg px-3 py-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-spanish-teal-700">{t("feedback.professor_response_label")}</span>
            {canRespond && (
              <button
                type="button"
                onClick={() => { setResponseText(entry.professorResponse ?? ""); setShowResponseForm(true); }}
                className="text-xs text-spanish-teal-600 hover:text-spanish-teal-800 underline"
              >
                {t("feedback.edit_response_button")}
              </button>
            )}
          </div>
          <p className="text-xs text-slate-700">{entry.professorResponse}</p>
        </div>
      )}

      {/* SF5: Add/edit response form */}
      {canRespond && showResponseForm && (
        <div className="space-y-2 pt-1">
          <Textarea
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            placeholder={t("feedback.response_placeholder")}
            rows={3}
            className="text-sm"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              className="bg-spanish-teal-600 hover:bg-spanish-teal-700"
              disabled={!responseText.trim() || responseMutation.isPending}
              onClick={() => responseMutation.mutate(responseText.trim())}
            >
              {responseMutation.isPending
                ? <><Loader2 className="h-3 w-3 mr-1 animate-spin" />{t("feedback.submitting_response")}</>
                : t("feedback.submit_response")}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowResponseForm(false)} disabled={responseMutation.isPending}>
              {t("feedback.cancel")}
            </Button>
          </div>
        </div>
      )}

      {/* SF5: Add response button (when no response yet) */}
      {canRespond && !entry.professorResponse && !showResponseForm && (
        <button
          type="button"
          onClick={() => { setResponseText(""); setShowResponseForm(true); }}
          className="flex items-center gap-1 text-xs text-spanish-teal-600 hover:text-spanish-teal-800"
        >
          <Reply className="h-3 w-3" />
          {t("feedback.add_response_button")}
        </button>
      )}
    </div>
  );
}

function ProfessorFeedbackCard({ summary }: { summary: any }) {
  const [expanded, setExpanded] = useState(false);
  const { data: fullFeedback } = useQuery({
    queryKey: ["professor-feedback", summary.professorId],
    queryFn: () => feedbackApi.getProfessorFeedback(summary.professorId),
    enabled: expanded,
  });

  return (
    <Card className="border-2 border-slate-100">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-spanish-teal-100 to-spanish-coral-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-spanish-teal-600" />
            </div>
            <div>
              <CardTitle className="text-base">{summary.professorName}</CardTitle>
              <div className="flex items-center gap-3 mt-0.5">
                {summary.avgRating !== null ? (
                  <div className="flex items-center gap-1.5">
                    <StarRating rating={Math.round(summary.avgRating)} />
                    <span className="text-sm font-semibold text-slate-700">
                      {summary.avgRating.toFixed(1)}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-slate-400">No ratings yet</span>
                )}
                <Badge variant="neutral" className="text-xs">
                  {summary.totalFeedback} {summary.totalFeedback === 1 ? "review" : "reviews"}
                </Badge>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0">
          {fullFeedback?.data?.feedback?.length > 0 ? (
            <div>
              {fullFeedback.data.feedback.map((entry: any) => (
                <FeedbackEntry key={entry.id} entry={entry} canRespond />
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-4">No feedback yet</p>
          )}
        </CardContent>
      )}

      {!expanded && summary.recentFeedback?.length > 0 && (
        <CardContent className="pt-0">
          <div className="opacity-60">
            {summary.recentFeedback.slice(0, 1).map((entry: any) => (
              <FeedbackEntry key={entry.id} entry={entry} />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="text-xs text-spanish-teal-600 hover:text-spanish-teal-700 mt-1"
          >
            Show all {summary.totalFeedback} reviews →
          </button>
        </CardContent>
      )}
    </Card>
  );
}

export function FeedbackDashboard() {
  const { t } = useTranslation("admin");
  const [exporting, setExporting] = useState(false);

  const { data: summary, isLoading } = useQuery({
    queryKey: ["admin-feedback-summary"],
    queryFn: feedbackApi.getAdminSummary,
  });

  const totalFeedback = summary?.reduce((s: number, p: any) => s + p.totalFeedback, 0) ?? 0;
  const overallAvg =
    summary && summary.length > 0
      ? summary.reduce((s: number, p: any) => s + (p.avgRating ?? 0), 0) / summary.filter((p: any) => p.avgRating !== null).length
      : null;

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await feedbackApi.exportCsv();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "feedback-export.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-navy-800">
            {t("feedback.dashboard_title")}
          </h1>
          <p className="text-muted-foreground">{t("feedback.dashboard_subtitle")}</p>
        </div>
        {/* SF4: Export CSV button */}
        <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting || totalFeedback === 0}>
          {exporting
            ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t("feedback.exporting")}</>
            : <><Download className="h-4 w-4 mr-2" />{t("feedback.export_csv")}</>}
        </Button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card className="text-center">
          <CardContent className="py-4">
            <div className="text-3xl font-bold text-slate-900">{totalFeedback}</div>
            <div className="text-xs text-slate-500 mt-1">Total Feedback</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="py-4">
            <div className="text-3xl font-bold text-yellow-500">
              {overallAvg !== null && !isNaN(overallAvg) ? overallAvg.toFixed(1) : "—"}
            </div>
            <div className="text-xs text-slate-500 mt-1">Overall Avg Rating</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="py-4">
            <div className="text-3xl font-bold text-slate-900">
              {summary?.filter((p: any) => p.totalFeedback > 0).length ?? 0}
            </div>
            <div className="text-xs text-slate-500 mt-1">Professors Rated</div>
          </CardContent>
        </Card>
      </div>

      {/* Per-professor cards */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : summary && summary.length > 0 ? (
        <div className="space-y-4">
          {summary
            .sort((a: any, b: any) => b.totalFeedback - a.totalFeedback)
            .map((prof: any, i: number) => (
              <motion.div
                key={prof.professorId}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <ProfessorFeedbackCard summary={prof} />
              </motion.div>
            ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-slate-300" />
            <p className="text-slate-500">{t("feedback.no_feedback")}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
