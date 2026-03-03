import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Users,
  Calendar,
  BookOpen,
  Clock,
  ArrowRight,
  Video,
  TrendingUp,
  Plus,
  Bell,
  Lock,
  Unlock,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { professorApi } from "@/lib/api";
import { formatTime, getDuration, cn } from "@/lib/utils";
import { usePendingBookingsCount } from "@/hooks/usePendingBookingsCount";

export function AdminDashboard() {
  const { t } = useTranslation("admin");
  const { data, isLoading } = useQuery({
    queryKey: ["professor-dashboard"],
    queryFn: professorApi.getDashboard,
  });

  const { data: pendingData } = usePendingBookingsCount();

  const stats = [
    {
      labelKey: "dashboard.stats.total_students",
      value: data?.stats.totalStudents || 0,
      icon: Users,
      gradient: "from-spanish-teal-500 to-spanish-teal-600",
      bg: "bg-spanish-teal-50",
      text: "text-spanish-teal-700",
      trend: "+12%",
      trendUp: true,
    },
    {
      labelKey: "dashboard.stats.active_bookings",
      value: data?.stats.totalBookings || 0,
      icon: BookOpen,
      gradient: "from-spanish-olive-500 to-spanish-olive-600",
      bg: "bg-spanish-olive-50",
      text: "text-spanish-olive-700",
      trend: "+8%",
      trendUp: true,
    },
    {
      labelKey: "dashboard.stats.pending_approvals",
      value: data?.stats.pendingApprovals || 0,
      icon: Calendar,
      gradient: "from-spanish-sunshine-500 to-spanish-sunshine-600",
      bg: "bg-spanish-sunshine-50",
      text: "text-spanish-sunshine-700",
      trend: "+5%",
      trendUp: true,
    },
    {
      labelKey: "dashboard.stats.revenue_month",
      value: data?.stats.todaySessions || 0,
      icon: Clock,
      gradient: "from-spanish-coral-500 to-spanish-coral-600",
      bg: "bg-spanish-coral-50",
      text: "text-spanish-coral-700",
      trend: "3 hrs",
      trendUp: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-spanish-teal-50/30 via-white to-spanish-olive-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              {t("dashboard.title")} 👋
            </h1>
            <p className="text-slate-600 text-lg">{t("dashboard.subtitle")}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="lg"
              className="bg-white hover:bg-slate-50 border-slate-200"
            >
              <Bell className="mr-2 h-5 w-5" />
              {t("dashboard.quick_actions.view_analytics")}
            </Button>
            <Button size="lg" variant="primary" asChild>
              <Link to="/admin/calendar">
                <Plus className="mr-2 h-5 w-5" />
                {t("dashboard.quick_actions.create_slot")}
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid - Modern Card Design */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.labelKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="group relative bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 hover:shadow-xl hover:border-slate-300/60 transition-all duration-300 overflow-hidden">
                {/* Background Gradient */}
                <div
                  className={cn(
                    "absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-10 rounded-full blur-2xl transition-opacity group-hover:opacity-20",
                    stat.gradient,
                  )}
                />

                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn("p-3 rounded-xl", stat.bg)}>
                      <stat.icon className={cn("h-6 w-6", stat.text)} />
                    </div>
                    {stat.trendUp !== undefined && (
                      <div
                        className={cn(
                          "flex items-center gap-1 text-sm font-medium",
                          stat.trendUp ? "text-emerald-600" : "text-slate-500",
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
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pending Approvals - Alert Card */}
        {pendingData && pendingData.count > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl shadow-lg shadow-amber-500/30"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                    <Bell className="h-8 w-8 text-white animate-pulse" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-amber-100 uppercase tracking-wide">
                      {t("approvals.title")}
                    </p>
                    <p className="text-4xl font-bold text-white mt-1">
                      {pendingData.count}
                    </p>
                    <p className="text-white/90 mt-1">
                      {t("approvals.subtitle")}
                    </p>
                  </div>
                </div>
                <Button
                  size="lg"
                  className="bg-white text-amber-600 hover:bg-amber-50 shadow-xl"
                  asChild
                >
                  <Link to="/admin/pending-approvals">
                    {t("approvals.approve_button")}{" "}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Today's Sessions - Modern List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200/60 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Today's Sessions
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Manage your scheduled classes
              </p>
            </div>
            <Button
              variant="outline"
              className="bg-slate-50 hover:bg-slate-100 border-slate-200"
              asChild
            >
              <Link to="/admin/calendar">
                View Calendar <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-xl" />
                ))}
              </div>
            ) : data?.todaysSlots &&
              data.todaysSlots.filter(
                (slot: any) => slot.bookings && slot.bookings.length > 0,
              ).length > 0 ? (
              <div className="space-y-3">
                {data.todaysSlots
                  .filter(
                    (slot: any) => slot.bookings && slot.bookings.length > 0,
                  )
                  .map((slot: any, index: number) => (
                    <motion.div
                      key={slot.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group p-5 rounded-xl bg-white border border-slate-200/60 hover:bg-slate-50 hover:shadow-md hover:border-spanish-teal-200/60 transition-all duration-200"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        {/* Left side - Time and Title */}
                        <div className="flex items-start sm:items-center gap-4">
                          <div className="h-14 w-14 flex-shrink-0 rounded-xl bg-gradient-to-br from-spanish-teal-500 to-spanish-teal-600 flex items-center justify-center shadow-lg shadow-spanish-teal-500/30">
                            <Clock className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-slate-900 text-lg truncate">
                                {slot.title || "Spanish Class"}
                              </p>
                              {slot.isPrivate ? (
                                <div title="Private">
                                  <Lock className="h-4 w-4 text-amber-600 flex-shrink-0" />
                                </div>
                              ) : (
                                <div title="Public">
                                  <Unlock className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                                </div>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                              <p className="text-sm text-slate-600 font-medium">
                                {formatTime(slot.startTime)} -{" "}
                                {formatTime(slot.endTime)}
                              </p>
                              <span className="text-slate-300 hidden sm:inline">
                                •
                              </span>
                              <p className="text-sm text-slate-500">
                                {getDuration(slot.startTime, slot.endTime)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Right side - Details and Actions */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                          {/* Slot Type & Booking Info */}
                          <div className="flex items-center gap-3 sm:text-right">
                            <Badge
                              className={cn(
                                slot.slotType === "GROUP"
                                  ? "bg-clay-100 text-clay-700 border-clay-200"
                                  : "bg-spanish-olive-100 text-spanish-olive-700 border-spanish-olive-200",
                              )}
                            >
                              {slot.slotType === "GROUP" ? (
                                <>
                                  <Users className="h-3 w-3 mr-1" />
                                  Group
                                </>
                              ) : (
                                <>
                                  <User className="h-3 w-3 mr-1" />
                                  Individual
                                </>
                              )}
                            </Badge>
                            <p className="text-sm text-slate-600">
                              <span className="font-semibold">
                                {slot.currentParticipants}
                              </span>
                              <span className="text-slate-400">
                                /{slot.maxParticipants}
                              </span>{" "}
                              booked
                            </p>
                          </div>

                          {/* Join Button */}
                          {slot.meetLink && (
                            <Button
                              size="lg"
                              className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white shadow-lg shadow-emerald-500/30"
                              asChild
                            >
                              <a
                                href={slot.meetLink}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Video className="mr-2 h-5 w-5" />
                                Join Now
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Student Details - Show who booked */}
                      {slot.bookings && slot.bookings.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-200/60">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                            Booked By
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {slot.bookings.map((booking: any) => (
                              <div
                                key={booking.id}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-200/60"
                              >
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-spanish-teal-500 to-spanish-teal-600 flex items-center justify-center text-white text-xs font-bold">
                                  {booking.student.firstName[0]}
                                  {booking.student.lastName[0]}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-slate-900 truncate">
                                    {booking.student.firstName}{" "}
                                    {booking.student.lastName}
                                  </p>
                                  <p className="text-xs text-slate-500 truncate">
                                    {booking.student.email}
                                  </p>
                                </div>
                                {booking.status === "PENDING_CONFIRMATION" && (
                                  <Badge
                                    variant="warning"
                                    className="ml-2 text-xs"
                                  >
                                    Pending
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 mb-4">
                  <Calendar className="h-10 w-10 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  No sessions today
                </h3>
                <p className="text-slate-600 mb-6">
                  Create a new slot to schedule your first class
                </p>
                <Button size="lg" variant="primary" asChild>
                  <Link to="/admin/calendar">
                    <Plus className="mr-2 h-5 w-5" />
                    Create a Slot
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions - Grid Cards */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Link to="/admin/students">
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              className="group relative bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 hover:shadow-xl hover:border-spanish-teal-200/60 transition-all duration-300 cursor-pointer overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-spanish-teal-500 to-spanish-teal-600 opacity-0 group-hover:opacity-10 rounded-full blur-2xl transition-opacity" />

              <div className="relative flex items-start gap-4">
                <div className="p-3 rounded-xl bg-spanish-teal-50 group-hover:bg-spanish-teal-100 transition-colors">
                  <Users className="h-7 w-7 text-spanish-teal-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 mb-1 group-hover:text-spanish-teal-600 transition-colors">
                    View Students
                  </h3>
                  <p className="text-sm text-slate-600">
                    Manage student profiles and progress
                  </p>
                  <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-spanish-teal-600 group-hover:translate-x-1 transition-all mt-3" />
                </div>
              </div>
            </motion.div>
          </Link>

          <Link to="/admin/calendar">
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              className="group relative bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 hover:shadow-xl hover:border-spanish-olive-200/60 transition-all duration-300 cursor-pointer overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-spanish-olive-500 to-spanish-olive-600 opacity-0 group-hover:opacity-10 rounded-full blur-2xl transition-opacity" />

              <div className="relative flex items-start gap-4">
                <div className="p-3 rounded-xl bg-spanish-olive-50 group-hover:bg-spanish-olive-100 transition-colors">
                  <Calendar className="h-7 w-7 text-spanish-olive-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 mb-1 group-hover:text-spanish-olive-600 transition-colors">
                    Manage Availability
                  </h3>
                  <p className="text-sm text-slate-600">
                    Edit your schedule and time slots
                  </p>
                  <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-spanish-olive-600 group-hover:translate-x-1 transition-all mt-3" />
                </div>
              </div>
            </motion.div>
          </Link>

          <Link to="/admin/settings">
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              className="group relative bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 hover:shadow-xl hover:border-clay-200/60 transition-all duration-300 cursor-pointer overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-clay-500 to-clay-600 opacity-0 group-hover:opacity-10 rounded-full blur-2xl transition-opacity" />

              <div className="relative flex items-start gap-4">
                <div className="p-3 rounded-xl bg-clay-50 group-hover:bg-clay-100 transition-colors">
                  <BookOpen className="h-7 w-7 text-clay-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 mb-1 group-hover:text-clay-600 transition-colors">
                    Account Settings
                  </h3>
                  <p className="text-sm text-slate-600">
                    Update your profile and preferences
                  </p>
                  <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-clay-600 group-hover:translate-x-1 transition-all mt-3" />
                </div>
              </div>
            </motion.div>
          </Link>
        </div>
      </div>
    </div>
  );
}
