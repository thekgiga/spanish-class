import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  BookOpen,
  Clock,
  ArrowRight,
  Video,
  User,
  GraduationCap,
  TrendingUp,
  Plus,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { toast } from "react-hot-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PrimaryButton } from "@/components/ui/premium";
import { studentApi } from "@/lib/api";
import {
  formatDate,
  formatTime,
  getDuration,
  getRelativeTime,
  cn,
} from "@/lib/utils";
import { useAuthStore } from "@/stores/auth";
import BookingStatusBadge from "@/components/booking/BookingStatusBadge";
import { ProfileCompletionCard } from "@/components/student/ProfileCompletionCard";
import { useNotifications } from "@/hooks/useNotifications";
import { MessageSquare } from "lucide-react";

export function StudentDashboard() {
  const { t } = useTranslation("student");
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("professor_assigned") === "1") {
      toast.success(t("professor.selected_success"));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const { data, isLoading } = useQuery({
    queryKey: ["student-dashboard"],
    queryFn: studentApi.getDashboard,
  });

  // Fetch profile completion data
  const { data: profileData } = useQuery({
    queryKey: ["student-profile"],
    queryFn: studentApi.getProfile,
  });

  // Fetch professor assignment
  const { data: professorData } = useQuery({
    queryKey: ["student-professor"],
    queryFn: studentApi.getProfessor,
    staleTime: 5 * 60 * 1000,
  });

  // Pending feedback notifications from the in-app feed
  const { notifications } = useNotifications();
  const pendingFeedback = notifications.filter(
    (n) => n.type === "feedback_pending" && !n.readAt,
  );

  // Vibrant Spanish Colors - Student Dashboard
  const stats = [
    {
      labelKey: "dashboard.stats.upcoming_sessions",
      value: data?.stats.upcomingBookings || 0,
      icon: Calendar,
      gradient: "from-spanish-teal-500 to-spanish-teal-600",
    },
    {
      labelKey: "dashboard.stats.classes_completed",
      value: data?.stats.completedSessions || 0,
      icon: BookOpen,
      gradient: "from-spanish-coral-500 to-spanish-coral-600",
      trend: "+3",
      trendUp: true,
    },

  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-spanish-teal-50 via-white to-spanish-coral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-slate-900">
              {t("dashboard.welcome_greeting", { name: user?.firstName })}
            </h1>
            <Badge className="bg-spanish-coral-500/20 text-spanish-coral-600 border-spanish-coral-500/30 px-3 py-1">
              <GraduationCap className="h-4 w-4 mr-1" />
              {t("dashboard.student_badge")}
            </Badge>
          </div>
          <p className="text-slate-700 text-lg">{t("dashboard.subtitle")}</p>
        </div>

        {/* Stats Grid - Modern Card Design */}
        {/* No-professor banner */}
        {professorData && !professorData.professor && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-amber-800 text-sm">{t("professor.no_professor_title")}</p>
              <p className="text-amber-700 text-xs mt-0.5">{t("professor.no_professor_subtitle")}</p>
            </div>
            <Link
              to="/dashboard/choose-professor"
              className="shrink-0 text-sm font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              {t("professor.choose_professor_link")}
            </Link>
          </div>
        )}

        {/* Pending feedback banner */}
        {pendingFeedback.length > 0 && (
          <div className="bg-spanish-teal-50 border border-spanish-teal-200 rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-spanish-teal-100 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="h-4 w-4 text-spanish-teal-600" />
              </div>
              <div>
                <p className="font-semibold text-spanish-teal-800 text-sm">
                  {pendingFeedback.length === 1
                    ? "1 session is waiting for your feedback"
                    : `${pendingFeedback.length} sessions are waiting for your feedback`}
                </p>
                <p className="text-spanish-teal-700 text-xs mt-0.5">
                  Share your thoughts — it only takes a minute.
                </p>
              </div>
            </div>
            <Link
              to={pendingFeedback[0].href ?? "/dashboard/bookings"}
              className="shrink-0 text-sm font-semibold text-spanish-teal-800 bg-spanish-teal-100 hover:bg-spanish-teal-200 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
            >
              Give Feedback
            </Link>
          </div>
        )}

        {/* Stats Grid - Modern Card Design */}
        <div className="grid gap-6 sm:grid-cols-3">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.labelKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-spanish-teal-100 hover:border-spanish-teal-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={cn(
                    "inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br shadow-lg",
                    stat.gradient,
                  )}
                >
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                {stat.trend && (
                  <div
                    className={cn(
                      "flex items-center gap-1 text-sm font-medium",
                      stat.trendUp
                        ? "text-spanish-coral-600"
                        : "text-slate-600",
                    )}
                  >
                    {stat.trendUp && <TrendingUp className="h-4 w-4" />}
                    {stat.trend}
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">
                  {t(stat.labelKey)}
                </p>
                {isLoading ? (
                  <Skeleton className="h-9 w-20" />
                ) : (
                  <p className="text-3xl font-bold text-slate-900">
                    {stat.value}
                  </p>
                )}
              </div>
            </motion.div>
          ))}

          <Link to="/dashboard/book">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: stats.length * 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-spanish-teal-200 hover:border-spanish-teal-400 h-full"
            >
              <div className="flex items-start gap-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-spanish-teal-500 to-spanish-teal-600 shadow-lg flex-shrink-0">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-600 mb-1">Browse Available Classes</p>
                  <p className="text-sm text-slate-500">Find and book your next session</p>
                  <ArrowRight className="h-5 w-5 text-spanish-teal-500 mt-3" />
                </div>
              </div>
            </motion.div>
          </Link>
        </div>

        {/* Profile Completion - Show if < 100% */}
        {profileData?.completion && profileData.completion.percentage < 100 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <ProfileCompletionCard completion={profileData.completion} />
          </motion.div>
        )}

        {/* Next Session */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-spanish-coral-200">
          <div className="px-6 py-5 border-b border-spanish-coral-100 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {t("dashboard.next_session.title")}
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                {t("dashboard.next_session.subtitle")}
              </p>
            </div>
            <Button
              variant="outline"
              className="bg-white hover:bg-spanish-coral-50 border-spanish-coral-300 text-spanish-coral-600 hover:text-spanish-coral-700"
              asChild
            >
              <Link to="/dashboard/bookings">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="p-6">
            {isLoading ? (
              <Skeleton className="h-40 w-full rounded-xl" />
            ) : data?.nextSession ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-5 rounded-xl bg-gradient-to-br from-spanish-teal-50 to-spanish-coral-50 border-2 border-spanish-teal-200"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-spanish-teal-600 to-spanish-teal-500 shadow-lg">
                      <Calendar className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <Badge className="bg-spanish-orange-500/20 text-spanish-orange-600 border-spanish-orange-500/30">
                          {getRelativeTime(data.nextSession.slot.startTime)}
                        </Badge>
                        <BookingStatusBadge status={data.nextSession.status} />
                      </div>
                      <p className="text-lg font-bold text-slate-900">
                        {data.nextSession.slot.title || "Spanish Class"}
                      </p>
                      <p className="mt-1 text-slate-600">
                        {formatDate(data.nextSession.slot.startTime)} at{" "}
                        <span className="font-semibold text-slate-900">
                          {formatTime(data.nextSession.slot.startTime)}
                        </span>
                      </p>
                      <div className="mt-3 flex items-center gap-3 flex-wrap">
                        <span className="flex items-center gap-1.5 rounded-full bg-white border border-spanish-teal-200 px-3 py-1.5 text-sm text-slate-700">
                          <Clock className="h-4 w-4 text-spanish-teal-500" />
                          {getDuration(
                            data.nextSession.slot.startTime,
                            data.nextSession.slot.endTime,
                          )}
                        </span>
                        <span className="flex items-center gap-1.5 rounded-full bg-white border border-spanish-coral-200 px-3 py-1.5 text-sm text-slate-700">
                          <User className="h-4 w-4 text-spanish-coral-500" />
                          {data.nextSession.slot.professor?.firstName}{" "}
                          {data.nextSession.slot.professor?.lastName}
                        </span>
                      </div>
                    </div>
                  </div>

                  {data.nextSession.status === "PENDING_CONFIRMATION" ? (
                    <div className="flex flex-col items-center gap-2 text-center flex-shrink-0 bg-spanish-orange-500/20 px-4 py-3 rounded-lg border border-spanish-orange-500/30">
                      <p className="text-sm text-spanish-orange-600 font-medium">
                        ⏳ Awaiting Approval
                      </p>
                      <p className="text-xs text-spanish-orange-500">
                        You'll be notified by email
                      </p>
                    </div>
                  ) : data.nextSession.slot.meetLink ? (
                    <a
                      href={data.nextSession.slot.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 bg-gradient-to-r from-spanish-teal-500 to-spanish-teal-600 hover:from-spanish-teal-600 hover:to-spanish-teal-700 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-spanish-teal-400 focus:ring-offset-2 px-8 py-4 text-lg flex-shrink-0"
                    >
                      <Video className="mr-2 h-5 w-5" />
                      Join Now
                    </a>
                  ) : null}
                </div>
              </motion.div>
            ) : (
              <div className="py-16 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-spanish-teal-100 mb-4">
                  <Calendar className="h-10 w-10 text-spanish-teal-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  No upcoming sessions
                </h3>
                <p className="text-slate-600 mb-6">
                  Book your first class to start learning
                </p>
                <PrimaryButton size="lg" asChild>
                  <Link to="/dashboard/book">
                    <Plus className="mr-2 h-5 w-5" />
                    Book Your First Class
                  </Link>
                </PrimaryButton>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
