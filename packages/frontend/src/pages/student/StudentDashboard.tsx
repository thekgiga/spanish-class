import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, BookOpen, Clock, ArrowRight, Video, User, Sparkles, GraduationCap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { studentApi } from '@/lib/api';
import { formatDate, formatTime, getDuration, getRelativeTime } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth';

export function StudentDashboard() {
  const { user } = useAuthStore();
  const { data, isLoading } = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: studentApi.getDashboard,
  });

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-display font-bold text-navy-800">
              ¡Hola, {user?.firstName}!
            </h1>
            <Badge variant="spanish" className="text-xs">
              <GraduationCap className="h-3 w-3 mr-1" />
              Student
            </Badge>
          </div>
          <p className="text-navy-500">Continue your Spanish learning journey.</p>
        </div>
        <Button variant="primary" className="shadow-glow-red" asChild>
          <Link to="/dashboard/book">
            <Calendar className="mr-2 h-4 w-4" />
            Book a Class
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-5 sm:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card variant="elevated" className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-6 bg-gradient-to-br from-spanish-red-50 to-gold-50">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-spanish-red-500 to-spanish-red-600 flex items-center justify-center shadow-lg">
                    <Calendar className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-navy-600">Upcoming Sessions</p>
                    {isLoading ? (
                      <Skeleton className="h-10 w-20 mt-1" />
                    ) : (
                      <p className="text-4xl font-bold text-spanish-red-600">
                        {data?.stats.upcomingBookings || 0}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card variant="elevated" className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-6 bg-gradient-to-br from-spanish-olive-50 to-spanish-terracotta-50">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-spanish-olive-500 to-spanish-olive-600 flex items-center justify-center shadow-lg">
                    <BookOpen className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-navy-600">Completed Sessions</p>
                    {isLoading ? (
                      <Skeleton className="h-10 w-20 mt-1" />
                    ) : (
                      <p className="text-4xl font-bold text-spanish-olive-600">
                        {data?.stats.completedSessions || 0}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Next Session */}
      <Card variant="elevated">
        <CardHeader className="flex flex-row items-center justify-between border-b border-spanish-cream-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-500 flex items-center justify-center shadow-md">
              <Sparkles className="h-5 w-5 text-navy-800" />
            </div>
            <CardTitle className="text-xl">Next Session</CardTitle>
          </div>
          <Button variant="ghost" size="sm" className="text-spanish-red-600 hover:text-spanish-red-700 hover:bg-spanish-red-50" asChild>
            <Link to="/dashboard/bookings">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          {isLoading ? (
            <Skeleton className="h-40 w-full rounded-2xl" />
          ) : data?.nextSession ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative overflow-hidden rounded-2xl border-2 border-gold-300 bg-gradient-to-br from-gold-50 via-white to-spanish-cream-50"
            >
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gold-200/50 to-transparent rounded-bl-full" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-spanish-red-100/30 to-transparent rounded-tr-full" />

              <div className="relative p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-500 flex items-center justify-center shadow-lg flex-shrink-0">
                    <Clock className="h-8 w-8 text-navy-800" />
                  </div>
                  <div>
                    <Badge variant="gold-solid" className="mb-2 shadow-sm">
                      {getRelativeTime(data.nextSession.slot.startTime)}
                    </Badge>
                    <p className="font-display font-bold text-xl text-navy-800">
                      {data.nextSession.slot.title || 'Spanish Class'}
                    </p>
                    <p className="text-navy-500 mt-1">
                      {formatDate(data.nextSession.slot.startTime)} at{' '}
                      <span className="font-semibold text-navy-700">{formatTime(data.nextSession.slot.startTime)}</span>
                    </p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="flex items-center gap-1.5 text-sm text-navy-500 bg-white/80 px-3 py-1.5 rounded-full border border-spanish-cream-200">
                        <Clock className="h-4 w-4 text-gold-500" />
                        {getDuration(data.nextSession.slot.startTime, data.nextSession.slot.endTime)}
                      </span>
                      <span className="flex items-center gap-1.5 text-sm text-navy-500 bg-white/80 px-3 py-1.5 rounded-full border border-spanish-cream-200">
                        <User className="h-4 w-4 text-spanish-red-500" />
                        {data.nextSession.slot.professor?.firstName}{' '}
                        {data.nextSession.slot.professor?.lastName}
                      </span>
                    </div>
                  </div>
                </div>
                {data.nextSession.slot.meetLink && (
                  <Button variant="primary" size="lg" className="shadow-glow-red flex-shrink-0" asChild>
                    <a
                      href={data.nextSession.slot.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Video className="mr-2 h-5 w-5" />
                      Join Session
                    </a>
                  </Button>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="text-center py-12">
              <div className="h-20 w-20 mx-auto mb-6 rounded-2xl bg-spanish-cream-100 flex items-center justify-center">
                <Calendar className="h-10 w-10 text-spanish-cream-400" />
              </div>
              <p className="text-navy-600 font-medium mb-2">No upcoming sessions</p>
              <p className="text-navy-400 text-sm mb-6">Book your first class to start learning</p>
              <Button variant="primary" className="shadow-glow-red" asChild>
                <Link to="/dashboard/book">Book Your First Class</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-5 sm:grid-cols-2">
        <Link to="/dashboard/book">
          <Card hover variant="elevated" className="cursor-pointer h-full group">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-500 flex items-center justify-center shadow-lg group-hover:shadow-glow-gold transition-shadow">
                <Calendar className="h-7 w-7 text-navy-800" />
              </div>
              <div>
                <p className="font-semibold text-lg text-navy-800 group-hover:text-gold-600 transition-colors">Browse Available Classes</p>
                <p className="text-sm text-navy-500">Find and book your next session</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/dashboard/bookings">
          <Card hover variant="elevated" className="cursor-pointer h-full group">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-spanish-olive-500 to-spanish-olive-600 flex items-center justify-center shadow-lg transition-shadow">
                <BookOpen className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="font-semibold text-lg text-navy-800 group-hover:text-spanish-olive-600 transition-colors">My Bookings</p>
                <p className="text-sm text-navy-500">View and manage your sessions</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
