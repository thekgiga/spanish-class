import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Mail,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle,
  XCircle,
  Filter,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { professorApi, type EmailLog } from "@/lib/api";

const EMAIL_TYPE_LABELS: Record<string, string> = {
  booking_confirmation_simple: "Booking Confirmation (Direct)",
  booking_confirmation_student: "Booking Confirmation (Student)",
  booking_notification_professor: "Booking Notification (Professor)",
  cancellation_student: "Cancellation (Student)",
  cancellation_professor: "Cancellation (Professor)",
};

const EMAIL_TYPE_COLORS: Record<
  string,
  "success" | "warning" | "destructive" | "neutral"
> = {
  booking_confirmation_simple: "success",
  booking_confirmation_student: "success",
  booking_notification_professor: "neutral",
  cancellation_student: "destructive",
  cancellation_professor: "warning",
};

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
}

export function EmailLogsPage() {
  const { t } = useTranslation("admin");
  const [page, setPage] = useState(1);
  const [emailTypeFilter, setEmailTypeFilter] = useState<string>("all");
  const [selectedLog, setSelectedLog] = useState<EmailLog | null>(null);
  const limit = 15;

  const { data, isLoading } = useQuery({
    queryKey: ["email-logs", page, emailTypeFilter],
    queryFn: () =>
      professorApi.getEmailLogs({
        page,
        limit,
        emailType: emailTypeFilter === "all" ? undefined : emailTypeFilter,
      }),
  });

  const logs = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-navy-800">
            {t("email_logs.title")}
          </h1>
          <p className="text-muted-foreground">{t("email_logs.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={emailTypeFilter} onValueChange={setEmailTypeFilter}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder={t("email_logs.table.status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("slots.filters.all")}</SelectItem>
              {Object.entries(EMAIL_TYPE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Email List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : logs.length > 0 ? (
        <div className="space-y-3">
          {logs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="h-10 w-10 rounded-lg bg-navy-100 flex items-center justify-center flex-shrink-0">
                        <Mail className="h-5 w-5 text-navy-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant={
                              EMAIL_TYPE_COLORS[log.emailType] || "neutral"
                            }
                          >
                            {EMAIL_TYPE_LABELS[log.emailType] || log.emailType}
                          </Badge>
                          {log.status === "sent" ? (
                            <Badge
                              variant="outline"
                              className="text-green-600 border-green-200"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Sent
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <XCircle className="h-3 w-3 mr-1" />
                              Failed
                            </Badge>
                          )}
                        </div>
                        <p className="font-medium text-navy-800 mt-1 truncate">
                          {log.subject}
                        </p>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {log.toAddress}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(log.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedLog(log)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      {t("email_logs.view")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Mail className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">{t("email_logs.no_logs")}</p>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {t("email_logs.pagination.showing", {
              start: (page - 1) * limit + 1,
              end: Math.min(page * limit, pagination.total),
              total: pagination.total,
            })}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              {t("email_logs.pagination.page", {
                current: page,
                total: pagination.totalPages,
              })}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPage((p) => Math.min(pagination.totalPages, p + 1))
              }
              disabled={page === pagination.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Email Detail Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {t("email_logs.detail.title")}
            </DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4 overflow-y-auto flex-1">
              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">
                    {t("email_logs.detail.from")}
                  </p>
                  <p className="font-medium">{selectedLog.fromAddress}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">
                    {t("email_logs.detail.to")}
                  </p>
                  <p className="font-medium">{selectedLog.toAddress}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">
                    {t("email_logs.detail.type")}
                  </p>
                  <Badge
                    variant={
                      EMAIL_TYPE_COLORS[selectedLog.emailType] || "neutral"
                    }
                  >
                    {EMAIL_TYPE_LABELS[selectedLog.emailType] ||
                      selectedLog.emailType}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">
                    {t("email_logs.detail.status")}
                  </p>
                  {selectedLog.status === "sent" ? (
                    <Badge
                      variant="outline"
                      className="text-green-600 border-green-200"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {t("email_logs.status.sent")}
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" />
                      {t("email_logs.status.failed")}
                    </Badge>
                  )}
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">
                    {t("email_logs.detail.subject")}
                  </p>
                  <p className="font-medium">{selectedLog.subject}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">
                    {t("email_logs.detail.sent_at")}
                  </p>
                  <p className="font-medium">
                    {formatDate(selectedLog.createdAt)}
                  </p>
                </div>
                {selectedLog.error && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground">
                      {t("email_logs.detail.error")}
                    </p>
                    <p className="font-medium text-destructive">
                      {selectedLog.error}
                    </p>
                  </div>
                )}
              </div>

              {/* Email Content Preview */}
              <div>
                <p className="text-muted-foreground text-sm mb-2">
                  {t("email_logs.detail.email_content")}
                </p>
                <div className="border rounded-lg overflow-hidden bg-white">
                  <iframe
                    srcDoc={selectedLog.htmlContent}
                    className="w-full h-[400px] border-0"
                    title={t("common:aria_labels.email_preview")}
                    sandbox="allow-same-origin"
                  />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
